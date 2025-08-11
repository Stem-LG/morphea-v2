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
    id: number
    name: string
    panorama: string
    yaw?: number
    pitch?: number
    fov?: number
    boutiqueId?: number | null
  }) => Promise<Scene | null>
  updateScene: (id: number, updateData: {
    name?: string
    panorama?: string
    yaw?: number
    pitch?: number
    fov?: number
    boutiqueId?: number | null
  }) => Promise<Scene | null>
  deleteScene: (id: number) => Promise<boolean>
  refreshScenes: () => Promise<void>
  getSceneById: (id: number) => Scene | null
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
        .order('yscenesname')
      
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
    id: number
    name: string
    panorama: string
    yaw?: number
    pitch?: number
    fov?: number
    boutiqueId?: number | null
  }): Promise<Scene | null> => {
    try {
      setError(null)
      
      const supabase = createClient()
      
      const insertData = {
        yscenesid: sceneData.id,
        yscenesname: sceneData.name,
        yscenespanorama: sceneData.panorama,
        yscenesaxexyaw: sceneData.yaw || 0,
        yscenesaxeypitch: sceneData.pitch || 0,
        ysceneszoomfov: sceneData.fov || 75,
        yboutiqueidfk: sceneData.boutiqueId || null,
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
      
      // Update local state optimistically
      setScenes(prev => [...prev, newScene])
      
      return newScene
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error creating scene:', err)
      return null
    }
  }

  const updateScene = async (id: number, updateData: {
    name?: string
    panorama?: string
    yaw?: number
    pitch?: number
    fov?: number
    boutiqueId?: number | null
  }): Promise<Scene | null> => {
    try {
      setError(null)
      
      const supabase = createClient()
      
      const updateFields: any = {}
      if (updateData.name !== undefined) updateFields.yscenesname = updateData.name
      if (updateData.panorama !== undefined) updateFields.yscenespanorama = updateData.panorama
      if (updateData.yaw !== undefined) updateFields.yscenesaxexyaw = updateData.yaw
      if (updateData.pitch !== undefined) updateFields.yscenesaxeypitch = updateData.pitch
      if (updateData.fov !== undefined) updateFields.ysceneszoomfov = updateData.fov
      if (updateData.boutiqueId !== undefined) updateFields.yboutiqueidfk = updateData.boutiqueId
      
      const { data, error } = await supabase
        .schema('morpheus')
        .from('yscenes')
        .update(updateFields)
        .eq('yscenesid', id)
        .select('*')
        .single()
      
      if (error) {
        throw new Error(error.message || 'Failed to update scene')
      }
      
      const updatedScene = data
      
      // Update local state optimistically to avoid disrupting the viewer
      setScenes(prev => prev.map(scene =>
        scene.yscenesid === id ? updatedScene : scene
      ))
      
      return updatedScene
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error updating scene:', err)
      return null
    }
  }

  const deleteScene = async (id: number): Promise<boolean> => {
    try {
      setError(null)
      
      const supabase = createClient()
      
      const { error } = await supabase
        .schema('morpheus')
        .from('yscenes')
        .delete()
        .eq('yscenesid', id)
      
      if (error) {
        throw new Error(error.message || 'Failed to delete scene')
      }
      
      // Update local state optimistically
      setScenes(prev => prev.filter(scene => scene.yscenesid !== id))
      
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

  const getSceneById = (id: number): Scene | null => {
    return scenes.find(scene => scene.yscenesid === id) || null
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
    getSceneById,
  }
}