'use client'

import { createClient } from '@/lib/client'
import { useQuery } from '@tanstack/react-query'

interface ProductSearchResult {
    yprodid: number
    yprodintitule: string
    yprodcode: string
    yproddetailstech: string
    yprodinfobulle: string
    yestvisible: boolean
    ydesign?: {
        ydesignid: number
        ydesignnom: string
        ydesignmarque: string
    }
    yvarprod?: Array<{
        yvarprodid: number
        yvarprodintitule: string
        yvarprodprixcatalogue: number
        yvarprodprixpromotion: number | null
        yvarprodpromotiondatedeb: string | null
        yvarprodpromotiondatefin: string | null
        yvarprodnbrjourlivraison: number
        yvarprodstatut: string
        yestvisible: boolean
        xdeviseidfk: number | null
        xcouleur: {
            xcouleurid: number
            xcouleurintitule: string
            xcouleurhexa: string
        }
        xtaille: {
            xtailleid: number
            xtailleintitule: string
        }
        yvarprodmedia?: Array<{
            ymedia: {
                ymediaid: number
                ymediaintitule: string
                ymediaurl: string
                ymediaboolvideo: boolean
            }
        }>
        yobjet3d?: Array<{
            yobjet3did: number
            yobjet3durl: string
            ycouleurarriereplan?: string | null
        }>
    }>
}

interface UseProductSearchParams {
    query: string
    limit?: number
    enabled?: boolean
}

export function useProductSearch({
    query,
    limit = 5,
    enabled = true
}: UseProductSearchParams) {
    const supabase = createClient()

    return useQuery({
        queryKey: ['product-search', query, limit],
        queryFn: async (): Promise<ProductSearchResult[]> => {
            if (!query || query.trim().length < 2) {
                return []
            }

            // Get the current active event first
            const currentDate = new Date().toISOString().split('T')[0]

            const { data: currentEvent, error: eventError } = await supabase
                .schema('morpheus')
                .from('yevent')
                .select('*')
                .lte('yeventdatedeb', currentDate)
                .gte('yeventdatefin', currentDate)
                .order('yeventdatedeb', { ascending: false })
                .limit(1)
                .single()

            if (eventError || !currentEvent) {
                console.error('No active event found:', eventError)
                return []
            }

            // Search for products with the query in title or code
            const searchTerm = query.trim()

            let productQuery = supabase
                .schema('morpheus')
                .from('yprod')
                .select(`
                    yprodid,
                    yprodintitule,
                    yprodcode,
                    yproddetailstech,
                    yprodinfobulle,
                    yestvisible,
                    ydesign:ydesign!yprod_ydesignidfk_fkey(
                        ydesignid,
                        ydesignnom,
                        ydesignmarque
                    ),
                    yvarprod(
                        yvarprodid,
                        yvarprodintitule,
                        yvarprodprixcatalogue,
                        yvarprodprixpromotion,
                        yvarprodpromotiondatedeb,
                        yvarprodpromotiondatefin,
                        yvarprodnbrjourlivraison,
                        yvarprodstatut,
                        yestvisible,
                        xdeviseidfk,
                        xcouleur:xcouleuridfk(
                            xcouleurid,
                            xcouleurintitule,
                            xcouleurhexa
                        ),
                        xtaille:xtailleidfk(
                            xtailleid,
                            xtailleintitule
                        ),
                        yvarprodmedia(
                            ymedia:ymediaidfk(
                                ymediaid,
                                ymediaintitule,
                                ymediaurl,
                                ymediaboolvideo
                            )
                        ),
                        yobjet3d(
                            yobjet3did,
                            yobjet3durl,
                            ycouleurarriereplan
                        )
                    ),
                    ydetailsevent(
                        yeventidfk
                    )
                `)
                .eq('yestvisible', true)
                .or(`yprodintitule.ilike.%${searchTerm}%,yprodcode.ilike.%${searchTerm}%`)
                .limit(limit)

            const { data: products, error } = await productQuery

            if (error) {
                console.error('Error searching products:', error)
                return []
            }

            if (!products) {
                return []
            }

            // Filter products that are part of the current event and have visible variants
            const filteredProducts = products.filter(product => {
                // Check if product is part of current event
                const isInCurrentEvent = product.ydetailsevent?.some(
                    (detail: any) => detail.yeventidfk === currentEvent.yeventid
                )

                // Check if product has approved and visible variants
                const hasApprovedVariants = product.yvarprod?.some(
                    (variant: any) => {
                        const isApproved = variant.yvarprodstatut === 'approved'
                        const isVisible = variant.yestvisible === true
                        return isApproved && isVisible
                    }
                )

                return isInCurrentEvent && hasApprovedVariants
            })

            // Sort by relevance (exact matches first, then partial matches)
            const sortedProducts = filteredProducts.sort((a, b) => {
                const aTitle = a.yprodintitule.toLowerCase()
                const bTitle = b.yprodintitule.toLowerCase()
                const searchLower = searchTerm.toLowerCase()

                // Exact title match gets highest priority
                if (aTitle === searchLower && bTitle !== searchLower) return -1
                if (bTitle === searchLower && aTitle !== searchLower) return 1

                // Title starts with search term gets second priority
                if (aTitle.startsWith(searchLower) && !bTitle.startsWith(searchLower)) return -1
                if (bTitle.startsWith(searchLower) && !aTitle.startsWith(searchLower)) return 1

                // Alphabetical order for the rest
                return aTitle.localeCompare(bTitle)
            })

            return sortedProducts as ProductSearchResult[]
        },
        enabled: enabled && query.trim().length >= 2,
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 2 * 60 * 1000, // 2 minutes
    })
}
