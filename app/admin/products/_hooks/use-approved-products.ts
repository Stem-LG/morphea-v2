"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase";
import type { ProductFilters, ProductPagination } from "./use-product-filters";

const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface ProductWithDetails {
    yprodid: number;
    yprodintitule: string;
    yprodcode: string;
    yprodstatut: string;
    yproddetailstech: string;
    yprodinfobulle: string;
    yestvisible: boolean;
    designer: {
        ydesignid: number;
        ydesignnom: string;
        ydesignmarque: string;
    } | null;
    category: {
        xcategprodid: number;
        xcategprodintitule: string;
    } | null;
    events: Array<{
        yeventid: number;
        yeventintitule: string;
        mall: {
            ymallid: number;
            ymallintitule: string;
        } | null;
        boutique: {
            yboutiqueid: number;
            yboutiqueintitule: string;
        } | null;
    }>;
}

export interface PaginationData {
    total: number;
    pages: number;
    currentPage: number;
    perPage: number;
}

export function useApprovedProducts(filters: ProductFilters, pagination: ProductPagination) {
    return useQuery({
        queryKey: ['approved-products', filters, pagination],
        queryFn: async (): Promise<{ data: ProductWithDetails[]; pagination: PaginationData }> => {
            // Build the main query for products using schema
            let query = supabase
                .schema('morpheus')
                .from('yprod')
                .select(`
                    yprodid,
                    yprodintitule,
                    yprodcode,
                    yprodstatut,
                    yproddetailstech,
                    yprodinfobulle,
                    yestvisible,
                    designer:ydesign!yprod_ydesignidfk_fkey(
                        ydesignid,
                        ydesignnom,
                        ydesignmarque
                    ),
                    category:xcategprod!yprod_xcategprodidfk_fkey(
                        xcategprodid,
                        xcategprodintitule
                    )
                `)
                .eq('yprodstatut', 'approved' as any);

            // Apply text search filter
            if (filters.search) {
                query = query.or(`yprodintitule.ilike.%${filters.search}%,yprodcode.ilike.%${filters.search}%`);
            }

            // Apply category filter
            if (filters.category) {
                query = query.eq('xcategprodidfk', parseInt(filters.category) as any);
            }

            // Get total count for pagination
            const { count } = await supabase
                .schema('morpheus')
                .from('yprod')
                .select('*', { count: 'exact', head: true })
                .eq('yprodstatut', 'approved' as any);

            // Apply pagination
            const from = (pagination.page - 1) * pagination.perPage;
            const to = from + pagination.perPage - 1;
            query = query.range(from, to);

            const { data: products, error } = await query;

            if (error) {
                throw new Error(`Failed to fetch products: ${error.message}`);
            }

            if (!products) {
                return {
                    data: [],
                    pagination: {
                        total: 0,
                        pages: 0,
                        currentPage: pagination.page,
                        perPage: pagination.perPage,
                    }
                };
            }

            // Now fetch event details for each product
            const productsWithEvents = await Promise.all(
                (products as any[]).map(async (product: any) => {
                    let eventQuery = supabase
                        .schema('morpheus')
                        .from('ydetailsevent')
                        .select(`
                            yevent!ydetailsevent_yeventidfk_fkey(
                                yeventid,
                                yeventintitule
                            ),
                            ymall!ydetailsevent_ymallidfk_fkey(
                                ymallid,
                                ymallintitule
                            ),
                            yboutique!ydetailsevent_yboutiqueidfk_fkey(
                                yboutiqueid,
                                yboutiqueintitule
                            )
                        `)
                        .eq('yprodidfk', product.yprodid as any);

                    // Apply event filter
                    if (filters.event) {
                        eventQuery = eventQuery.eq('yeventidfk', parseInt(filters.event) as any);
                    }

                    // Apply mall filter
                    if (filters.mall) {
                        eventQuery = eventQuery.eq('ymallidfk', parseInt(filters.mall) as any);
                    }

                    // Apply boutique filter
                    if (filters.boutique) {
                        eventQuery = eventQuery.eq('yboutiqueidfk', parseInt(filters.boutique) as any);
                    }

                    const { data: eventDetails } = await eventQuery;

                    return {
                        yprodid: product.yprodid,
                        yprodintitule: product.yprodintitule,
                        yprodcode: product.yprodcode,
                        yprodstatut: product.yprodstatut,
                        yproddetailstech: product.yproddetailstech,
                        yprodinfobulle: product.yprodinfobulle,
                        yestvisible: product.yestvisible,
                        designer: product.designer,
                        category: product.category,
                        events: (eventDetails || []).map((detail: any) => ({
                            yeventid: detail.yevent?.yeventid,
                            yeventintitule: detail.yevent?.yeventintitule,
                            mall: detail.ymall ? {
                                ymallid: detail.ymall.ymallid,
                                ymallintitule: detail.ymall.ymallintitule,
                            } : null,
                            boutique: detail.yboutique ? {
                                yboutiqueid: detail.yboutique.yboutiqueid,
                                yboutiqueintitule: detail.yboutique.yboutiqueintitule,
                            } : null,
                        })),
                    } as ProductWithDetails;
                })
            );

            // Filter products that don't match event/mall/boutique criteria
            let filteredProducts = productsWithEvents;
            if (filters.event || filters.mall || filters.boutique) {
                filteredProducts = productsWithEvents.filter(product => product.events.length > 0);
            }

            const totalPages = Math.ceil((count || 0) / pagination.perPage);

            return {
                data: filteredProducts,
                pagination: {
                    total: count || 0,
                    pages: totalPages,
                    currentPage: pagination.page,
                    perPage: pagination.perPage,
                }
            };
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}