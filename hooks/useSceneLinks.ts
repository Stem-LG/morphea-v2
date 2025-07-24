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
    id?: number
    sceneId: number
    targetId: number
    name: string
    yaw: number
    pitch: number
  }) => Promise<SceneLink | null>
  updateSceneLink: (id: number, updateData: {
    sceneId?: number
    targetId?: number
    name?: string
    yaw?: number
    pitch?: number
  }) => Promise<SceneLink | null>
  deleteSceneLink: (id: number) => Promise<boolean>
  refreshSceneLinks: (sceneId?: number) => Promise<void>
  getSceneLinksByScene: (sceneId: number) => SceneLink[]
}

export function useSceneLinks(initialSceneId?: number): UseSceneLinks {
  const [scenelinks, setSceneLinks] = useState<SceneLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSceneLinks = async (sceneId?: number) => {
    try {
      setLoading(true)
      setError(null)
      
      const supabase = createClient()
      
      let query = supabase
        .schema('morpheus')
        .from('yscenelinks')
        .select('*')
      
      if (sceneId) {
        query = query.eq('yscenesidfkactuelle', sceneId)
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
    id?: number
    sceneId: number
    targetId: number
    name: string
    yaw: number
    pitch: number
  }): Promise<SceneLink | null> => {
    try {
      setError(null)
      
      const supabase = createClient()
      
      const insertData = {
        yscenelinksid: scenelinkData.id || Date.now(),
        yscenesidfkactuelle: scenelinkData.sceneId,
        yscenesidfktarget: scenelinkData.targetId,
        yscenelinksname: scenelinkData.name,
        yscenelinksaxexyaw: scenelinkData.yaw,
        yscenelinksaxeypitch: scenelinkData.pitch,
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

  const updateSceneLink = async (id: number, updateData: {
    sceneId?: number
    targetId?: number
    name?: string
    yaw?: number
    pitch?: number
  }): Promise<SceneLink | null> => {
    try {
      setError(null)
      
      const supabase = createClient()
      
      const updateFields: any = {}
      if (updateData.sceneId !== undefined) updateFields.yscenesidfkactuelle = updateData.sceneId
      if (updateData.targetId !== undefined) updateFields.yscenesidfktarget = updateData.targetId
      if (updateData.name !== undefined) updateFields.yscenelinksname = updateData.name
      if (updateData.yaw !== undefined) updateFields.yscenelinksaxexyaw = updateData.yaw
      if (updateData.pitch !== undefined) updateFields.yscenelinksaxeypitch = updateData.pitch
      
      const { data, error } = await supabase
        .schema('morpheus')
        .from('yscenelinks')
        .update(updateFields)
        .eq('yscenelinksid', id)
        .select('*')
        .single()
      
      if (error) {
        throw new Error(error.message || 'Failed to update scene link')
      }
      
      const updatedSceneLink = data
      setSceneLinks(prev => prev.map(scenelink =>
        scenelink.yscenelinksid === id ? updatedSceneLink : scenelink
      ))
      return updatedSceneLink
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error updating scene link:', err)
      return null
    }
  }

  const deleteSceneLink = async (id: number): Promise<boolean> => {
    try {
      setError(null)
      
      const supabase = createClient()
      
      const { error } = await supabase
        .schema('morpheus')
        .from('yscenelinks')
        .delete()
        .eq('yscenelinksid', id)
      
      if (error) {
        throw new Error(error.message || 'Failed to delete scene link')
      }
      
      setSceneLinks(prev => prev.filter(scenelink => scenelink.yscenelinksid !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error deleting scene link:', err)
      return false
    }
  }

  const refreshSceneLinks = async (sceneId?: number) => {
    await fetchSceneLinks(sceneId)
  }

  const getSceneLinksByScene = (sceneId: number): SceneLink[] => {
    return scenelinks.filter(scenelink => scenelink.yscenesidfkactuelle === sceneId)
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