'use client'

import { useState, useEffect } from 'react'
import { Database } from '@/lib/supabase'
import { createClient } from '@/lib/client'

type SceneLink = Database['morpheus']['Tables']['yscenelinks']['Row']

interface UseSceneLinks {
  scenelinks: SceneLink[]
  loading: boolean
  error: string | null
  createSceneLink: (scenelinkData: {
    id?: string
    sceneId: string
    targetId: string
    name: string
    yaw: number
    pitch: number
  }) => Promise<SceneLink | null>
  updateSceneLink: (id: string, updateData: {
    sceneId?: string
    targetId?: string
    name?: string
    yaw?: number
    pitch?: number
  }) => Promise<SceneLink | null>
  deleteSceneLink: (id: string) => Promise<boolean>
  refreshSceneLinks: (sceneId?: string) => Promise<void>
  getSceneLinksByScene: (sceneId: string) => SceneLink[]
}

export function useSceneLinks(initialSceneId?: string): UseSceneLinks {
  const [scenelinks, setSceneLinks] = useState<SceneLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSceneLinks = async (sceneId?: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const supabase = createClient()
      
      let query = supabase
        .schema('morpheus')
        .from('yscenelinks')
        .select('*')
      
      if (sceneId) {
        query = query.eq('ysceneid', sceneId)
      }
      
      const { data, error } = await query
      
      if (error) {
        throw new Error(error.message || 'Failed to fetch scene links')
      }
      
      setSceneLinks(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching scene links:', err)
    } finally {
      setLoading(false)
    }
  }

  const createSceneLink = async (scenelinkData: {
    id?: string
    sceneId: string
    targetId: string
    name: string
    yaw: number
    pitch: number
  }): Promise<SceneLink | null> => {
    try {
      setError(null)
      
      const supabase = createClient()
      
      const insertData = {
        yid: scenelinkData.id || crypto.randomUUID(),
        ysceneid: scenelinkData.sceneId,
        ytargetid: scenelinkData.targetId,
        yname: scenelinkData.name,
        yyaw: scenelinkData.yaw,
        ypitch: scenelinkData.pitch,
      }
      
      const { data, error } = await supabase
        .schema('morpheus')
        .from('yscenelinks')
        .insert(insertData)
        .select('*')
        .single()
      
      if (error) {
        throw new Error(error.message || 'Failed to create scene link')
      }
      
      const newSceneLink = data
      setSceneLinks(prev => [...prev, newSceneLink])
      return newSceneLink
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error creating scene link:', err)
      return null
    }
  }

  const updateSceneLink = async (id: string, updateData: {
    sceneId?: string
    targetId?: string
    name?: string
    yaw?: number
    pitch?: number
  }): Promise<SceneLink | null> => {
    try {
      setError(null)
      
      const supabase = createClient()
      
      const updateFields: any = {}
      if (updateData.sceneId !== undefined) updateFields.ysceneid = updateData.sceneId
      if (updateData.targetId !== undefined) updateFields.ytargetid = updateData.targetId
      if (updateData.name !== undefined) updateFields.yname = updateData.name
      if (updateData.yaw !== undefined) updateFields.yyaw = updateData.yaw
      if (updateData.pitch !== undefined) updateFields.ypitch = updateData.pitch
      
      const { data, error } = await supabase
        .schema('morpheus')
        .from('yscenelinks')
        .update(updateFields)
        .eq('yid', id)
        .select('*')
        .single()
      
      if (error) {
        throw new Error(error.message || 'Failed to update scene link')
      }
      
      const updatedSceneLink = data
      setSceneLinks(prev => prev.map(scenelink =>
        scenelink.yid === id ? updatedSceneLink : scenelink
      ))
      return updatedSceneLink
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error updating scene link:', err)
      return null
    }
  }

  const deleteSceneLink = async (id: string): Promise<boolean> => {
    try {
      setError(null)
      
      const supabase = createClient()
      
      const { error } = await supabase
        .schema('morpheus')
        .from('yscenelinks')
        .delete()
        .eq('yid', id)
      
      if (error) {
        throw new Error(error.message || 'Failed to delete scene link')
      }
      
      setSceneLinks(prev => prev.filter(scenelink => scenelink.yid !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error deleting scene link:', err)
      return false
    }
  }

  const refreshSceneLinks = async (sceneId?: string) => {
    await fetchSceneLinks(sceneId)
  }

  const getSceneLinksByScene = (sceneId: string): SceneLink[] => {
    return scenelinks.filter(scenelink => scenelink.ysceneid === sceneId)
  }

  useEffect(() => {
    fetchSceneLinks(initialSceneId)
  }, [initialSceneId])

  return {
    scenelinks,
    loading,
    error,
    createSceneLink,
    updateSceneLink,
    deleteSceneLink,
    refreshSceneLinks,
    getSceneLinksByScene,
  }
}