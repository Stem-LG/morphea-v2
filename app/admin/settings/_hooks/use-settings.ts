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
  'mellime_url',
  'delivery_fee',
  "delivery_fee_currency_id",
  // Homepage Hero Section
  'homepage_hero_video1_url',
  'homepage_hero_video1_top_text_en',
  'homepage_hero_video1_top_text_fr',
  'homepage_hero_video1_main_text_en',
  'homepage_hero_video1_main_text_fr',
  'homepage_hero_video1_discover_link',
  'homepage_hero_video2_url',
  'homepage_hero_video2_top_text_en',
  'homepage_hero_video2_top_text_fr',
  'homepage_hero_video2_main_text_en',
  'homepage_hero_video2_main_text_fr',
  'homepage_hero_video2_discover_link',
  // Homepage Collections Section
  'homepage_collections_title_en',
  'homepage_collections_title_fr',
  'homepage_collections_subtitle_en',
  'homepage_collections_subtitle_fr',
  'homepage_collections_image1_url',
  'homepage_collections_image2_url',
  // Homepage Categories Section
  'homepage_categories_title_en',
  'homepage_categories_title_fr',
  'homepage_categories_category1_id',
  'homepage_categories_category1_subtitle_en',
  'homepage_categories_category1_subtitle_fr',
  'homepage_categories_category1_link',
  'homepage_categories_category1_image_url',
  'homepage_categories_category2_id',
  'homepage_categories_category2_subtitle_en',
  'homepage_categories_category2_subtitle_fr',
  'homepage_categories_category2_link',
  'homepage_categories_category2_image_url',
  'homepage_categories_category3_id',
  'homepage_categories_category3_subtitle_en',
  'homepage_categories_category3_subtitle_fr',
  'homepage_categories_category3_link',
  'homepage_categories_category3_image_url',
  // Homepage Creators Section
  'homepage_creators_title_en',
  'homepage_creators_title_fr',
  'homepage_creators_subtitle_en',
  'homepage_creators_subtitle_fr',
  'homepage_creators_images', // JSON array of image URLs
  // Homepage Video Animation Section
  'homepage_video_animation_title_en',
  'homepage_video_animation_title_fr',
  'homepage_video_animation_description_en',
  'homepage_video_animation_description_fr',
  'homepage_video_animation_button_text_en',
  'homepage_video_animation_button_text_fr',
  'homepage_video_animation_button_link',
  // Footer Settings
  'footer_social_facebook_url',
  'footer_social_instagram_url',
  'footer_social_twitter_url',
  'footer_social_linkedin_url',
  'footer_categories_ids', // JSON array of category IDs to display
  'footer_link_origin',
  'footer_link_events',
  'footer_link_my_account',
  'footer_link_orders_delivery',
  'footer_link_cookies_privacy',
  'footer_link_terms'
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
      // Invalidate both settings queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      queryClient.invalidateQueries({ queryKey: ['home-settings'] })
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
      // Invalidate both settings queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      queryClient.invalidateQueries({ queryKey: ['home-settings'] })
      toast.success(t('admin.settings.settingDeletedSuccessfully'))
    },
    onError: (error: Error) => {
      toast.error(`${t('admin.settings.failedToDeleteSetting')}: ${error.message}`)
    },
  })
}