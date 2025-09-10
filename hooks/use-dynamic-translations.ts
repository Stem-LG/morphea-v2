'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/client'
import { Language } from './useLanguage'

interface DynamicTranslation {
    id: string
    language_code: Language
    namespace: string
    key_path: string
    translation_value: string
    is_active: boolean
    updated_at: string
}

interface DynamicTranslationsMap {
    [language: string]: {
        [namespace: string]: {
            [key: string]: string
        }
    }
}

/**
 * Hook to fetch dynamic translations from Supabase
 * Returns translations organized by language and namespace
 */
export function useDynamicTranslations() {
    const supabase = createClient()

    return useQuery({
        queryKey: ['dynamic-translations'],
        queryFn: async (): Promise<DynamicTranslationsMap> => {
            const { data, error } = await supabase
                .schema('morpheus')
                .from('dynamic_translations')
                .select('language_code, namespace, key_path, translation_value')
                .eq('is_active', true)
                .order('language_code')
                .order('namespace')
                .order('key_path')

            if (error) {
                console.error('Error fetching dynamic translations:', error)
                throw new Error(`Failed to fetch dynamic translations: ${error.message}`)
            }

            // Transform the flat data into nested structure
            const translationsMap: DynamicTranslationsMap = {}

            data?.forEach((translation: DynamicTranslation) => {
                const { language_code, namespace, key_path, translation_value } = translation

                // Initialize language if not exists
                if (!translationsMap[language_code]) {
                    translationsMap[language_code] = {}
                }

                // Initialize namespace if not exists
                if (!translationsMap[language_code][namespace]) {
                    translationsMap[language_code][namespace] = {}
                }

                // Set the translation value
                translationsMap[language_code][namespace][key_path] = translation_value
            })

            return translationsMap
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    })
}

/**
 * Hook to fetch dynamic translations for a specific language
 * Useful for components that only need translations for one language
 */
export function useDynamicTranslationsForLanguage(language: Language) {
    const { data: allTranslations, ...queryState } = useDynamicTranslations()

    const translationsForLanguage = allTranslations?.[language] || {}

    return {
        data: translationsForLanguage,
        ...queryState,
    }
}

/**
 * Utility function to merge static and dynamic translations
 * Static translations take precedence over dynamic ones
 */
export function mergeTranslations(
    staticTranslations: any,
    dynamicTranslations: { [namespace: string]: { [key: string]: string } }
): any {
    if (!dynamicTranslations || Object.keys(dynamicTranslations).length === 0) {
        return staticTranslations
    }

    // Deep clone the dynamic translations to avoid mutating the original
    const merged = JSON.parse(JSON.stringify(dynamicTranslations))

    // Process dynamic translations to expand dotted keys into nested objects
    Object.keys(merged).forEach(namespace => {
        const namespaceObj = merged[namespace];
        const expandedKeys: Record<string, any> = {};
        
        // Expand dotted keys in dynamic translations
        Object.keys(namespaceObj).forEach(key => {
            if (key.includes('.')) {
                // Split the key by dots and create nested structure
                const parts = key.split('.');
                let current = expandedKeys;
                
                for (let i = 0; i < parts.length - 1; i++) {
                    if (!current[parts[i]]) {
                        current[parts[i]] = {};
                    }
                    current = current[parts[i]];
                }
                
                // Set the final value
                current[parts[parts.length - 1]] = namespaceObj[key];
            } else {
                // Non-dotted key, just copy it
                expandedKeys[key] = namespaceObj[key];
            }
        });
        
        // Replace the original namespace object with the expanded one
        merged[namespace] = expandedKeys;
    });

    // Merge static translations on top of dynamic ones
    Object.keys(staticTranslations).forEach(namespace => {
        if (!merged[namespace]) {
            merged[namespace] = {}
        }

        // Recursively merge static translations
        const mergeNamespace = (target: any, source: any, path: string[] = []) => {
            Object.keys(source).forEach(key => {
                const currentPath = [...path, key]
                const fullPath = currentPath.join('.')

                if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                    // It's a nested object, recurse
                    if (!target[key] || typeof target[key] !== 'object') {
                        target[key] = {}
                    }
                    mergeNamespace(target[key], source[key], currentPath)
                } else {
                    // It's a leaf value, set it (static takes precedence)
                    target[key] = source[key]
                }
            })
        }

        mergeNamespace(merged[namespace], staticTranslations[namespace])
    })

    return merged
}

/**
 * Hook that provides merged translations (static + dynamic)
 * Static translations take precedence over dynamic ones
 * This is the main hook that components should use
 */
export function useMergedTranslations(language: Language) {
    const { data: dynamicTranslations, ...dynamicQueryState } = useDynamicTranslationsForLanguage(language)

    // Import static translations dynamically
    const staticTranslations = language === 'en'
        ? require('@/lib/translations/en').enTranslations
        : require('@/lib/translations/fr').frTranslations

    // Merge translations
    const mergedTranslations = mergeTranslations(staticTranslations, dynamicTranslations || {})

    return {
        data: mergedTranslations,
        isLoading: dynamicQueryState.isLoading,
        error: dynamicQueryState.error,
        isSuccess: dynamicQueryState.isSuccess,
        refetch: dynamicQueryState.refetch,
    }
}