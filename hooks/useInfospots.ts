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
    id?: number
    sceneId: number
    title: string
    text: string
    yaw: number
    pitch: number
    actionId?: number | null
  }) => Promise<InfoSpot | null>
  updateInfospot: (id: number, updateData: {
    sceneId?: number
    title?: string
    text?: string
    yaw?: number
    pitch?: number
    actionId?: number | null
  }) => Promise<InfoSpot | null>
  deleteInfospot: (id: number) => Promise<boolean>
  refreshInfospots: (sceneId?: number) => Promise<void>
  getInfospotsByScene: (sceneId: number) => InfoSpot[]
}

export function useInfospots(initialSceneId?: number): UseInfospots {
  const [infospots, setInfospots] = useState<InfoSpot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInfospots = async (sceneId?: number) => {
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
        query = query.eq('yscenesidfk', sceneId)
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
    id?: number
    sceneId: number
    title: string
    text: string
    yaw: number
    pitch: number
    actionId?: number | null
  }): Promise<InfoSpot | null> => {
    try {
      setError(null)
      
      const supabase = createClient()
      
      const insertData = {
        yinfospotsid: infospotData.id || Date.now(),
        yscenesidfk: infospotData.sceneId,
        yinfospotstitle: infospotData.title,
        yinfospotstext: infospotData.text,
        yinfospotsaxexyaw: infospotData.yaw.toString(),
        yinfospotsaxeypitch: infospotData.pitch.toString(),
        yinfospotactionidfk: infospotData.actionId,
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

  const updateInfospot = async (id: number, updateData: {
    sceneId?: number
    title?: string
    text?: string
    yaw?: number
    pitch?: number
    actionId?: number | null
  }): Promise<InfoSpot | null> => {
    try {
      setError(null)
      
      const supabase = createClient()
      
      const updateFields: any = {}
      if (updateData.sceneId !== undefined) updateFields.yscenesidfk = updateData.sceneId
      if (updateData.title !== undefined) updateFields.yinfospotstitle = updateData.title
      if (updateData.text !== undefined) updateFields.yinfospotstext = updateData.text
      if (updateData.yaw !== undefined) updateFields.yinfospotsaxexyaw = updateData.yaw.toString()
      if (updateData.pitch !== undefined) updateFields.yinfospotsaxeypitch = updateData.pitch.toString()
      if (updateData.actionId !== undefined) updateFields.yinfospotactionidfk = updateData.actionId
      
      const { data, error } = await supabase
        .schema('morpheus')
        .from('yinfospots')
        .update(updateFields)
        .eq('yinfospotsid', id)
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
        infospot.yinfospotsid === id ? updatedInfospot : infospot
      ))
      return updatedInfospot
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error updating infospot:', err)
      return null
    }
  }

  const deleteInfospot = async (id: number): Promise<boolean> => {
    try {
      setError(null)
      
      const supabase = createClient()
      
      const { error } = await supabase
        .schema('morpheus')
        .from('yinfospots')
        .delete()
        .eq('yinfospotsid', id)
      
      if (error) {
        throw new Error(error.message || 'Failed to delete infospot')
      }
      
      setInfospots(prev => prev.filter(infospot => infospot.yinfospotsid !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error deleting infospot:', err)
      return false
    }
  }

  const refreshInfospots = async (sceneId?: number) => {
    await fetchInfospots(sceneId)
  }

  const getInfospotsByScene = (sceneId: number): InfoSpot[] => {
    return infospots.filter(infospot => infospot.yscenesidfk === sceneId)
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