import { createClient } from "@/lib/client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

interface Mall {
    ymallid: number;
    ymallintitule: string;
    ymallcode: string;
}

interface Boutique {
    yboutiqueid: number;
    yboutiqueintitule: string | null;
    yboutiquecode: string;
    ymallidfk: number;
}

interface Category {
    xcategprodid: number;
    xcategprodintitule: string;
    xcategprodcode: string;
    productCount?: number;
}

export function useShopMalls(eventId: number | null) {
    const supabase = createClient();

    return useQuery({
        queryKey: ['shop-malls', eventId],
        queryFn: async () => {
            if (!eventId) return [];

            // Get malls that have products in the current event
            const { data, error } = await supabase
                .schema("morpheus")
                .from("ydetailsevent")
                .select(`
                    ymallidfk,
                    ymall:ymall!ydetailsevent_ymallidfk_fkey (
                        ymallid,
                        ymallintitule,
                        ymallcode
                    )
                `)
                .eq("yeventidfk", eventId)
                .not("yprodidfk", "is", null)
                .not("ymallidfk", "is", null);

            if (error) {
                console.error("Error fetching malls:", error);
                return [];
            }

            // Remove duplicates and extract mall data
            const uniqueMalls = new Map<number, Mall>();
            data?.forEach(item => {
                const mall = Array.isArray(item.ymall) ? item.ymall[0] : item.ymall;
                if (mall && !uniqueMalls.has(item.ymallidfk)) {
                    uniqueMalls.set(item.ymallidfk, mall as Mall);
                }
            });

            return Array.from(uniqueMalls.values());
        },
        enabled: !!eventId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        placeholderData: keepPreviousData
    });
}

export function useShopBoutiques(eventId: number | null, mallId: number | null = null) {
    const supabase = createClient();

    return useQuery({
        queryKey: ['shop-boutiques', eventId, mallId],
        queryFn: async () => {
            if (!eventId) return [];

            let query = supabase
                .schema("morpheus")
                .from("ydetailsevent")
                .select(`
                    yboutiqueidfk,
                    yboutique:yboutique!ydetailsevent_yboutiqueidfk_fkey (
                        yboutiqueid,
                        yboutiqueintitule,
                        yboutiquecode,
                        ymallidfk
                    )
                `)
                .eq("yeventidfk", eventId)
                .not("yprodidfk", "is", null)
                .not("yboutiqueidfk", "is", null);

            if (mallId) {
                query = query.eq("ymallidfk", mallId);
            }

            const { data, error } = await query;

            if (error) {
                console.error("Error fetching boutiques:", error);
                return [];
            }

            // Remove duplicates and extract boutique data
            const uniqueBoutiques = new Map<number, Boutique>();
            data?.forEach(item => {
                const boutique = Array.isArray(item.yboutique) ? item.yboutique[0] : item.yboutique;
                if (boutique && item.yboutiqueidfk && !uniqueBoutiques.has(item.yboutiqueidfk)) {
                    uniqueBoutiques.set(item.yboutiqueidfk, boutique as Boutique);
                }
            });

            return Array.from(uniqueBoutiques.values());
        },
        enabled: !!eventId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        placeholderData: keepPreviousData,
    });
}

export function useShopCategories(eventId: number | null) {
    const supabase = createClient();

    return useQuery({
        queryKey: ['shop-categories', eventId],
        queryFn: async () => {
            if (!eventId) return [];

            // First get all product IDs in the current event
            const { data: eventDetails, error: detailsError } = await supabase
                .schema("morpheus")
                .from("ydetailsevent")
                .select("yprodidfk")
                .eq("yeventidfk", eventId)
                .not("yprodidfk", "is", null);

            if (detailsError) {
                console.error("Error fetching event details:", detailsError);
                return [];
            }

            if (!eventDetails || eventDetails.length === 0) {
                return [];
            }

            const productIds = [...new Set(eventDetails.map(d => d.yprodidfk))];

            // Get categories of approved products
            const { data: products, error: productsError } = await supabase
                .schema("morpheus")
                .from("yprod")
                .select(`
                    xcategprodidfk,
                    xcategprod:xcategprodidfk (
                        xcategprodid,
                        xcategprodintitule,
                        xcategprodcode
                    )
                `)
                .in("yprodid", productIds)
                .eq("yprodstatut", "approved")
                .not("xcategprodidfk", "is", null);

            if (productsError) {
                console.error("Error fetching categories:", productsError);
                return [];
            }

            // Count products per category and remove duplicates
            const categoryMap = new Map<number, Category & { count: number }>();
            products?.forEach(product => {
                const category = Array.isArray(product.xcategprod) ? product.xcategprod[0] : product.xcategprod;
                if (category && product.xcategprodidfk) {
                    const existing = categoryMap.get(product.xcategprodidfk);
                    if (existing) {
                        existing.count++;
                    } else {
                        categoryMap.set(product.xcategprodidfk, {
                            ...(category as Category),
                            count: 1
                        });
                    }
                }
            });

            return Array.from(categoryMap.values()).map(cat => ({
                ...cat,
                productCount: cat.count
            }));
        },
        enabled: !!eventId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        placeholderData: keepPreviousData,
    });
}