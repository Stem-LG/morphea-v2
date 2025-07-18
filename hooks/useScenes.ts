'use client'

import { useState, useEffect } from 'react'
import { Database } from '@/lib/supabase'
import { createClient } from '@/lib/client'

type Scene = Database['morpheus']['Tables']['yscenes']['Row']

interface UseScenes {
  scenes: Scene[]
  loading: boolean
  error: string | null
  createScene: (sceneData: {
    id: string
    name: string
    panorama: string
    yaw?: number
    pitch?: number
    fov?: number
  }) => Promise<Scene | null>
  updateScene: (id: string, updateData: {
    name?: string
    panorama?: string
    yaw?: number
    pitch?: number
    fov?: number
  }) => Promise<Scene | null>
  deleteScene: (id: string) => Promise<boolean>
  refreshScenes: () => Promise<void>
}

export function useScenes(): UseScenes {
  const [scenes, setScenes] = useState<Scene[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchScenes = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const supabase = createClient()
      
      const { data, error } = await supabase
        .schema('morpheus')
        .from('yscenes')
        .select('*')
        .order('yname')
      
      if (error) {
        throw new Error(error.message || 'Failed to fetch scenes')
      }
      
      setScenes(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching scenes:', err)
    } finally {
      setLoading(false)
    }
  }

  const createScene = async (sceneData: {
    id: string
    name: string
    panorama: string
    yaw?: number
    pitch?: number
    fov?: number
  }): Promise<Scene | null> => {
    try {
      setError(null)
      
      const supabase = createClient()
      
      const insertData = {
        yid: sceneData.id,
        yname: sceneData.name,
        ypanorama: sceneData.panorama,
        yyaw: sceneData.yaw || 0,
        ypitch: sceneData.pitch || 0,
        yfov: sceneData.fov || 75,
      }
      
      const { data, error } = await supabase
        .schema('morpheus')
        .from('yscenes')
        .insert(insertData)
        .select('*')
        .single()
      
      if (error) {
        throw new Error(error.message || 'Failed to create scene')
      }
      
      const newScene = data
      setScenes(prev => [...prev, newScene])
      return newScene
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error creating scene:', err)
      return null
    }
  }

  const updateScene = async (id: string, updateData: {
    name?: string
    panorama?: string
    yaw?: number
    pitch?: number
    fov?: number
  }): Promise<Scene | null> => {
    try {
      setError(null)
      
      const supabase = createClient()
      
      const updateFields: any = {}
      if (updateData.name !== undefined) updateFields.yname = updateData.name
      if (updateData.panorama !== undefined) updateFields.ypanorama = updateData.panorama
      if (updateData.yaw !== undefined) updateFields.yyaw = updateData.yaw
      if (updateData.pitch !== undefined) updateFields.ypitch = updateData.pitch
      if (updateData.fov !== undefined) updateFields.yfov = updateData.fov
      
      const { data, error } = await supabase
        .schema('morpheus')
        .from('yscenes')
        .update(updateFields)
        .eq('yid', id)
        .select('*')
        .single()
      
      if (error) {
        throw new Error(error.message || 'Failed to update scene')
      }
      
      const updatedScene = data
      setScenes(prev => prev.map(scene =>
        scene.yid === id ? updatedScene : scene
      ))
      return updatedScene
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error updating scene:', err)
      return null
    }
  }

  const deleteScene = async (id: string): Promise<boolean> => {
    try {
      setError(null)
      
      const supabase = createClient()
      
      const { error } = await supabase
        .schema('morpheus')
        .from('yscenes')
        .delete()
        .eq('yid', id)
      
      if (error) {
        throw new Error(error.message || 'Failed to delete scene')
      }
      
      setScenes(prev => prev.filter(scene => scene.yid !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error deleting scene:', err)
      return false
    }
  }

  const refreshScenes = async () => {
    await fetchScenes()
  }

  useEffect(() => {
    fetchScenes()
  }, [])

  return {
    scenes,
    loading,
    error,
    createScene,
    updateScene,
    deleteScene,
    refreshScenes,
  }
}