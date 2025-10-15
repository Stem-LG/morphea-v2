"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
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

export function useProductsByStatus(
    status: "approved" | "not_approved" | "rejected",
    filters: ProductFilters,
    pagination: ProductPagination
) {
    return useQuery({
        queryKey: ['products-by-status', status, filters, pagination],
        queryFn: async (): Promise<{ data: ProductWithDetails[]; pagination: PaginationData }> => {
            // Debug logging
            console.log('Filters received:', filters);
            console.log('Visibility filter value:', filters.visibility, typeof filters.visibility);

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
                .eq('yprodstatut', status as any);

            // Apply text search filter
            if (filters.search) {
                query = query.or(`yprodintitule.ilike.%${filters.search}%,yprodcode.ilike.%${filters.search}%`);
            }

            // Apply category filter
            if (filters.category) {
                query = query.eq('xcategprodidfk', parseInt(filters.category) as any);
            }

            // Apply visibility filter
            if (filters.visibility) {
                console.log('Applying visibility filter:', filters.visibility, '-> boolean:', filters.visibility === 'true');
                query = query.eq('yestvisible', filters.visibility === 'true');
            }

            // Apply event/mall/boutique filters by getting matching product IDs first
            let eventFilteredProductIds: number[] | null = null;
            if (filters.event || filters.mall || filters.boutique) {
                let eventFilterQuery = supabase
                    .schema('morpheus')
                    .from('ydetailsevent')
                    .select('yprodidfk');

                if (filters.event) {
                    eventFilterQuery = eventFilterQuery.eq('yeventidfk', parseInt(filters.event) as any);
                }
                if (filters.mall) {
                    eventFilterQuery = eventFilterQuery.eq('ymallidfk', parseInt(filters.mall) as any);
                }
                if (filters.boutique) {
                    eventFilterQuery = eventFilterQuery.eq('yboutiqueidfk', parseInt(filters.boutique) as any);
                }

                const { data: eventFilteredProducts } = await eventFilterQuery;
                eventFilteredProductIds = eventFilteredProducts?.map((p: any) => p.yprodidfk).filter((id: any) => id !== null && id !== undefined) || [];

                // If event filter returns no products, return early
                if (eventFilteredProductIds.length === 0) {
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

                // Apply the product ID filter
                query = query.in('yprodid', eventFilteredProductIds as any);
            }

            // Get total count for pagination
            let countQuery = supabase
                .schema('morpheus')
                .from('yprod')
                .select('*', { count: 'exact', head: true })
                .eq('yprodstatut', status as any);

            // Apply same filters to count query
            if (filters.search) {
                countQuery = countQuery.or(`yprodintitule.ilike.%${filters.search}%,yprodcode.ilike.%${filters.search}%`);
            }
            if (filters.category) {
                countQuery = countQuery.eq('xcategprodidfk', parseInt(filters.category) as any);
            }
            if (filters.visibility) {
                countQuery = countQuery.eq('yestvisible', filters.visibility === 'true');
            }
            if (eventFilteredProductIds !== null) {
                countQuery = countQuery.in('yprodid', eventFilteredProductIds as any);
            }

            const { count } = await countQuery;

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

                    // Apply the same event/mall/boutique filters to get only matching events
                    if (filters.event) {
                        eventQuery = eventQuery.eq('yeventidfk', parseInt(filters.event) as any);
                    }
                    if (filters.mall) {
                        eventQuery = eventQuery.eq('ymallidfk', parseInt(filters.mall) as any);
                    }
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

            const totalPages = Math.ceil((count || 0) / pagination.perPage);

            return {
                data: productsWithEvents,
                pagination: {
                    total: count || 0,
                    pages: totalPages,
                    currentPage: pagination.page,
                    perPage: pagination.perPage,
                }
            };
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        placeholderData: keepPreviousData
    });
}