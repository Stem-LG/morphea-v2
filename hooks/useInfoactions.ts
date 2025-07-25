'use client'

import { useState, useEffect } from 'react'
import { Database } from '@/lib/supabase'
import { createClient } from '@/lib/client'

type InfoSpotAction = Database['morpheus']['Tables']['yinfospotactions']['Row']

interface UseInfoactions {
  actions: InfoSpotAction[]
  loading: boolean
  error: string | null
  createAction: (actionData: {
    id?: number
    type: string
    title?: string | null
    description?: string | null
    modalType?: string | null
    customHandler?: string | null
    boutiqueId?: number | null
  }) => Promise<InfoSpotAction | null>
  updateAction: (id: number, updateData: {
    type?: string
    title?: string | null
    description?: string | null
    modalType?: string | null
    customHandler?: string | null
    boutiqueId?: number | null
  }) => Promise<InfoSpotAction | null>
  deleteAction: (id: number) => Promise<boolean>
  refreshActions: () => Promise<void>
}

export function useInfoactions(): UseInfoactions {
  const [actions, setActions] = useState<InfoSpotAction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  const fetchActions = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: supabaseError } = await supabase
        .schema('morpheus')
        .from('yinfospotactions')
        .select('*')
        .order('yinfospotactionsid')
      
      if (supabaseError) {
        throw new Error(supabaseError.message)
      }
      
      setActions(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching infospot actions:', err)
    } finally {
      setLoading(false)
    }
  }

  const createAction = async (actionData: {
    id?: number
    type: string
    title?: string | null
    description?: string | null
    modalType?: string | null
    customHandler?: string | null
    boutiqueId?: number | null
  }): Promise<InfoSpotAction | null> => {
    try {
      setError(null)
      
      const { data, error: supabaseError } = await supabase
        .schema('morpheus')
        .from('yinfospotactions')
        .insert([{
          yinfospotactionsid: actionData.id || Date.now(),
          yinfospotactionstype: actionData.type,
          yinfospotactionstitle: actionData.title || '',
          yinfospotactionsdescription: actionData.description || '',
          yinfospotactionsmodaltype: actionData.modalType || '',
          yinfospotactionscustomhandler: actionData.customHandler || '',
          yboutiqueidfk: actionData.boutiqueId || 1, // Default to 1 if not provided
        }])
        .select()
        .single()
      
      if (supabaseError) {
        throw new Error(supabaseError.message)
      }
      
      const newAction = data
      setActions(prev => [...prev, newAction])
      return newAction
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error creating infospot action:', err)
      return null
    }
  }

  const updateAction = async (id: number, updateData: {
    type?: string
    title?: string | null
    description?: string | null
    modalType?: string | null
    customHandler?: string | null
    boutiqueId?: number | null
  }): Promise<InfoSpotAction | null> => {
    try {
      setError(null)
      
      const { data, error: supabaseError } = await supabase
        .schema('morpheus')
        .from('yinfospotactions')
        .update({
          ...(updateData.type !== undefined && { yinfospotactionstype: updateData.type }),
          ...(updateData.title !== undefined && { yinfospotactionstitle: updateData.title }),
          ...(updateData.description !== undefined && { yinfospotactionsdescription: updateData.description }),
          ...(updateData.modalType !== undefined && { yinfospotactionsmodaltype: updateData.modalType }),
          ...(updateData.customHandler !== undefined && { yinfospotactionscustomhandler: updateData.customHandler }),
          ...(updateData.boutiqueId !== undefined && { yboutiqueidfk: updateData.boutiqueId }),
        })
        .eq('yinfospotactionsid', id)
        .select()
        .single()
      
      if (supabaseError) {
        throw new Error(supabaseError.message)
      }
      
      const updatedAction = data
      setActions(prev => prev.map(action =>
        action.yinfospotactionsid === id ? updatedAction : action
      ))
      return updatedAction
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error updating infospot action:', err)
      return null
    }
  }

  const deleteAction = async (id: number): Promise<boolean> => {
    try {
      setError(null)
      
      const { error: supabaseError } = await supabase
        .schema('morpheus')
        .from('yinfospotactions')
        .delete()
        .eq('yinfospotactionsid', id)
      
      if (supabaseError) {
        throw new Error(supabaseError.message)
      }
      
      setActions(prev => prev.filter(action => action.yinfospotactionsid !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error deleting infospot action:', err)
      return false
    }
  }

  const refreshActions = async () => {
    await fetchActions()
  }

  useEffect(() => {
    fetchActions()
  }, [])

  return {
    actions,
    loading,
    error,
    createAction,
    updateAction,
    deleteAction,
    refreshActions,
  }
}