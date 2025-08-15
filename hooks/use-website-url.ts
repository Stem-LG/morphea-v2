'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/client'

export function useWebsiteUrl() {
    const supabase = createClient()

    return useQuery({
        queryKey: ['website-url'],
        queryFn: async () => {
            const { data, error } = await supabase
                .schema('morpheus')
                .from('settings')
                .select('value')
                .eq('key', 'website_url')
                .single()

            if (error) {
                // Return default if setting doesn't exist
                return 'http://localhost:3000'
            }

            return data?.value || 'http://localhost:3000'
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export function useDefaultCurrencyId() {
    const supabase = createClient()

    return useQuery({
        queryKey: ['default-currency-id'],
        queryFn: async () => {
            const { data, error } = await supabase
                .schema('morpheus')
                .from('settings')
                .select('value')
                .eq('key', 'default_currency_id')
                .single()

            if (error) {
                // Return null if setting doesn't exist
                return null
            }

            // Convert to number if it exists
            return data?.value ? parseInt(data.value, 10) : null
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export function usePoweredBy() {
    const supabase = createClient()

    return useQuery({
        queryKey: ['powered-by'],
        queryFn: async () => {
            const { data, error } = await supabase
                .schema('morpheus')
                .from('settings')
                .select('value')
                .eq('key', 'powered_by')
                .single()

            if (error) {
                // Return null if setting doesn't exist
                return null
            }

            return data?.value || null
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export function useMellimeUrl() {
    const supabase = createClient()

    return useQuery({
        queryKey: ['mellime-url'],
        queryFn: async () => {
            const { data, error } = await supabase
                .schema('morpheus')
                .from('settings')
                .select('value')
                .eq('key', 'mellime_url')
                .single()

            if (error) {
                // Return null if setting doesn't exist
                return null
            }

            return data?.value || null
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}