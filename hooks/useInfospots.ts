'use client'

import { useState, useEffect } from 'react'
import { Database } from '@/lib/supabase'
import { createClient } from '@/lib/client'

type InfoSpot = Database['morpheus']['Tables']['yinfospots']['Row'] & {
  yinfospotactions?: Database['morpheus']['Tables']['yinfospotactions']['Row'] | null
}

interface UseInfospots {
  infospots: InfoSpot[]
  loading: boolean
  error: string | null
  createInfospot: (infospotData: {
    id?: string
    sceneId: string
    title: string
    text: string
    yaw: number
    pitch: number
    actionId?: string | null
  }) => Promise<InfoSpot | null>
  updateInfospot: (id: string, updateData: {
    sceneId?: string
    title?: string
    text?: string
    yaw?: number
    pitch?: number
    actionId?: string | null
  }) => Promise<InfoSpot | null>
  deleteInfospot: (id: string) => Promise<boolean>
  refreshInfospots: (sceneId?: string) => Promise<void>
  getInfospotsByScene: (sceneId: string) => InfoSpot[]
}

export function useInfospots(initialSceneId?: string): UseInfospots {
  const [infospots, setInfospots] = useState<InfoSpot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInfospots = async (sceneId?: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const supabase = createClient()
      
      let query = supabase
        .schema('morpheus')
        .from('yinfospots')
        .select(`
          *,
          yinfospotactions (*)
        `)
      
      if (sceneId) {
        query = query.eq('ysceneid', sceneId)
      }
      
      const { data, error } = await query
      
      if (error) {
        throw new Error(error.message || 'Failed to fetch infospots')
      }
      
      setInfospots(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching infospots:', err)
    } finally {
      setLoading(false)
    }
  }

  const createInfospot = async (infospotData: {
    id?: string
    sceneId: string
    title: string
    text: string
    yaw: number
    pitch: number
    actionId?: string | null
  }): Promise<InfoSpot | null> => {
    try {
      setError(null)
      
      const supabase = createClient()
      
      const insertData = {
        yid: infospotData.id || crypto.randomUUID(),
        ysceneid: infospotData.sceneId,
        ytitle: infospotData.title,
        ytext: infospotData.text,
        yyaw: infospotData.yaw,
        ypitch: infospotData.pitch,
        yinfospotactionsidfk: infospotData.actionId,
      }
      
      const { data, error } = await supabase
        .schema('morpheus')
        .from('yinfospots')
        .insert(insertData)
        .select(`
          *,
          yinfospotactions (*)
        `)
        .single()
      
      if (error) {
        throw new Error(error.message || 'Failed to create infospot')
      }
      
      const newInfospot = data
      setInfospots(prev => [...prev, newInfospot])
      return newInfospot
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error creating infospot:', err)
      return null
    }
  }

  const updateInfospot = async (id: string, updateData: {
    sceneId?: string
    title?: string
    text?: string
    yaw?: number
    pitch?: number
    actionId?: string | null
  }): Promise<InfoSpot | null> => {
    try {
      setError(null)
      
      const supabase = createClient()
      
      const updateFields: any = {}
      if (updateData.sceneId !== undefined) updateFields.ysceneid = updateData.sceneId
      if (updateData.title !== undefined) updateFields.ytitle = updateData.title
      if (updateData.text !== undefined) updateFields.ytext = updateData.text
      if (updateData.yaw !== undefined) updateFields.yyaw = updateData.yaw
      if (updateData.pitch !== undefined) updateFields.ypitch = updateData.pitch
      if (updateData.actionId !== undefined) updateFields.yinfospotactionsidfk = updateData.actionId
      
      const { data, error } = await supabase
        .schema('morpheus')
        .from('yinfospots')
        .update(updateFields)
        .eq('yid', id)
        .select(`
          *,
          yinfospotactions (*)
        `)
        .single()
      
      if (error) {
        throw new Error(error.message || 'Failed to update infospot')
      }
      
      const updatedInfospot = data
      setInfospots(prev => prev.map(infospot =>
        infospot.yid === id ? updatedInfospot : infospot
      ))
      return updatedInfospot
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error updating infospot:', err)
      return null
    }
  }

  const deleteInfospot = async (id: string): Promise<boolean> => {
    try {
      setError(null)
      
      const supabase = createClient()
      
      const { error } = await supabase
        .schema('morpheus')
        .from('yinfospots')
        .delete()
        .eq('yid', id)
      
      if (error) {
        throw new Error(error.message || 'Failed to delete infospot')
      }
      
      setInfospots(prev => prev.filter(infospot => infospot.yid !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error deleting infospot:', err)
      return false
    }
  }

  const refreshInfospots = async (sceneId?: string) => {
    await fetchInfospots(sceneId)
  }

  const getInfospotsByScene = (sceneId: string): InfoSpot[] => {
    return infospots.filter(infospot => infospot.ysceneid === sceneId)
  }

  useEffect(() => {
    fetchInfospots(initialSceneId)
  }, [initialSceneId])

  return {
    infospots,
    loading,
    error,
    createInfospot,
    updateInfospot,
    deleteInfospot,
    refreshInfospots,
    getInfospotsByScene,
  }
}