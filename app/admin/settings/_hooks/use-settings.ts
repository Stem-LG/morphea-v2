'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/client'
import { useLanguage } from '@/hooks/useLanguage'
import { toast } from 'sonner'

interface Setting {
  id: number
  key: string | null
  value: string | null
}

interface SettingInput {
  key: string
  value: string
}

export function useSettings() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('morpheus')
        .from('settings')
        .select('*')
        .order('key')

      if (error) {
        throw new Error(error.message)
      }

      return data as Setting[]
    },
  })
}

// Allowed setting keys - only these can be created/updated
const ALLOWED_SETTING_KEYS = [
  'website_url',
  'default_currency_id',
  'powered_by',
  'mellime_url'
]

export function useUpdateSetting() {
  const { t } = useLanguage()
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ key, value }: SettingInput) => {
      // Check if the setting key is allowed
      if (!ALLOWED_SETTING_KEYS.includes(key)) {
        throw new Error(`Setting key "${key}" is not allowed`)
      }

      // First, try to find existing setting
      const { data: existing } = await supabase
        .schema('morpheus')
        .from('settings')
        .select('*')
        .eq('key', key)
        .single()

      if (existing) {
        // Update existing setting
        const { data, error } = await supabase
          .schema('morpheus')
          .from('settings')
          .update({ value })
          .eq('key', key)
          .select()
          .single()

        if (error) throw new Error(error.message)
        return data
      } else {
        // Create new setting
        const { data, error } = await supabase
          .schema('morpheus')
          .from('settings')
          .insert({ key, value })
          .select()
          .single()

        if (error) throw new Error(error.message)
        return data
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast.success(t('admin.settings.settingUpdatedSuccessfully'))
    },
    onError: (error: Error) => {
      toast.error(`${t('admin.settings.failedToUpdateSetting')}: ${error.message}`)
    },
  })
}

export function useDeleteSetting() {
  const { t } = useLanguage()
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (key: string) => {
      // Check if the setting key is allowed to be deleted
      if (!ALLOWED_SETTING_KEYS.includes(key)) {
        throw new Error(t('admin.settings.settingNotAllowed'))
      }

      // Additional check for required settings
      const requiredSettings = ['website_url']
      if (requiredSettings.includes(key)) {
        throw new Error(t('admin.settings.settingRequired'))
      }

      const { error } = await supabase
        .schema('morpheus')
        .from('settings')
        .delete()
        .eq('key', key)

      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast.success(t('admin.settings.settingDeletedSuccessfully'))
    },
    onError: (error: Error) => {
      toast.error(`${t('admin.settings.failedToDeleteSetting')}: ${error.message}`)
    },
  })
}