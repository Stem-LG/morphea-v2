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

// Hook to get unique colors from current event products
export function useShopColors() {
    const supabase = createClient();

    return useQuery({
        queryKey: ['shop-colors'],
        queryFn: async () => {
            // Get current active event
            const currentDate = new Date().toISOString().split('T')[0];

            const { data: currentEvent, error: eventError } = await supabase
                .schema("morpheus")
                .from("yevent")
                .select("*")
                .lte("yeventdatedeb", currentDate)
                .gte("yeventdatefin", currentDate)
                .order("yeventdatedeb", { ascending: false })
                .limit(1)
                .single();

            if (eventError || !currentEvent) {
                console.error("No active event found:", eventError);
                return [];
            }

            // Get product IDs from current event
            const { data: eventDetails, error: detailsError } = await supabase
                .schema("morpheus")
                .from("ydetailsevent")
                .select("yprodidfk")
                .eq("yeventidfk", currentEvent.yeventid)
                .not("yprodidfk", "is", null);

            if (detailsError || !eventDetails) {
                console.error("Error fetching event details:", detailsError);
                return [];
            }

            const productIds = [...new Set(eventDetails.map(d => d.yprodidfk))];

            if (productIds.length === 0) {
                return [];
            }

            // Get unique colors from variants of these products
            const { data: variants, error: variantsError } = await supabase
                .schema("morpheus")
                .from("yvarprod")
                .select(`
                    xcouleur:xcouleuridfk (
                        xcouleurid,
                        xcouleurintitule,
                        xcouleurhexa
                    )
                `)
                .in("yprodidfk", productIds)
                .eq("yvarprodstatut", "approved");

            if (variantsError) {
                console.error("Error fetching colors:", variantsError);
                return [];
            }

            // Extract unique colors
            const uniqueColors = variants?.reduce((acc: any[], variant: any) => {
                const color = variant.xcouleur;
                if (color && !acc.some(c => c.xcouleurid === color.xcouleurid)) {
                    acc.push(color);
                }
                return acc;
            }, []) || [];

            return uniqueColors.sort((a, b) => a.xcouleurintitule.localeCompare(b.xcouleurintitule));
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
}

// Hook to get unique sizes from current event products
export function useShopSizes() {
    const supabase = createClient();

    return useQuery({
        queryKey: ['shop-sizes'],
        queryFn: async () => {
            // Get current active event
            const currentDate = new Date().toISOString().split('T')[0];

            const { data: currentEvent, error: eventError } = await supabase
                .schema("morpheus")
                .from("yevent")
                .select("*")
                .lte("yeventdatedeb", currentDate)
                .gte("yeventdatefin", currentDate)
                .order("yeventdatedeb", { ascending: false })
                .limit(1)
                .single();

            if (eventError || !currentEvent) {
                console.error("No active event found:", eventError);
                return [];
            }

            // Get product IDs from current event
            const { data: eventDetails, error: detailsError } = await supabase
                .schema("morpheus")
                .from("ydetailsevent")
                .select("yprodidfk")
                .eq("yeventidfk", currentEvent.yeventid)
                .not("yprodidfk", "is", null);

            if (detailsError || !eventDetails) {
                console.error("Error fetching event details:", detailsError);
                return [];
            }

            const productIds = [...new Set(eventDetails.map(d => d.yprodidfk))];

            if (productIds.length === 0) {
                return [];
            }

            // Get unique sizes from variants of these products
            const { data: variants, error: variantsError } = await supabase
                .schema("morpheus")
                .from("yvarprod")
                .select(`
                    xtaille:xtailleidfk (
                        xtailleid,
                        xtailleintitule
                    )
                `)
                .in("yprodidfk", productIds)
                .eq("yvarprodstatut", "approved");

            if (variantsError) {
                console.error("Error fetching sizes:", variantsError);
                return [];
            }

            // Extract unique sizes
            const uniqueSizes = variants?.reduce((acc: any[], variant: any) => {
                const size = variant.xtaille;
                if (size && !acc.some(s => s.xtailleid === size.xtailleid)) {
                    acc.push(size);
                }
                return acc;
            }, []) || [];

            return uniqueSizes.sort((a, b) => a.xtailleintitule.localeCompare(b.xtailleintitule));
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
}

// Hook to get price range from current event products
export function useShopPriceRange() {
    const supabase = createClient();

    return useQuery({
        queryKey: ['shop-price-range'],
        queryFn: async () => {
            // Get current active event
            const currentDate = new Date().toISOString().split('T')[0];

            const { data: currentEvent, error: eventError } = await supabase
                .schema("morpheus")
                .from("yevent")
                .select("*")
                .lte("yeventdatedeb", currentDate)
                .gte("yeventdatefin", currentDate)
                .order("yeventdatedeb", { ascending: false })
                .limit(1)
                .single();

            if (eventError || !currentEvent) {
                console.error("No active event found:", eventError);
                return { min: 0, max: 1000 };
            }

            // Get product IDs from current event
            const { data: eventDetails, error: detailsError } = await supabase
                .schema("morpheus")
                .from("ydetailsevent")
                .select("yprodidfk")
                .eq("yeventidfk", currentEvent.yeventid)
                .not("yprodidfk", "is", null);

            if (detailsError || !eventDetails) {
                console.error("Error fetching event details:", detailsError);
                return { min: 0, max: 1000 };
            }

            const productIds = [...new Set(eventDetails.map(d => d.yprodidfk))];

            if (productIds.length === 0) {
                return { min: 0, max: 1000 };
            }

            // Get variants with prices and currency info for these products
            const { data: variants, error: variantsError } = await supabase
                .schema("morpheus")
                .from("yvarprod")
                .select(`
                    yvarprodprixcatalogue,
                    yvarprodprixpromotion,
                    xdeviseidfk,
                    xdevise:xdeviseidfk (
                        xdeviseid,
                        xdevisecodealpha,
                        xdevisenbrdec,
                        xtauxechange,
                        xispivot
                    )
                `)
                .in("yprodidfk", productIds)
                .eq("yvarprodstatut", "approved");

            if (variantsError || !variants || variants.length === 0) {
                console.error("Error fetching variants:", variantsError);
                return { min: 0, max: 1000 };
            }

            // Get all currencies for conversion
            const { data: currencies, error: currenciesError } = await supabase
                .schema("morpheus")
                .from("xdevise")
                .select("*");

            if (currenciesError || !currencies) {
                console.error("Error fetching currencies:", currenciesError);
                return { min: 0, max: 1000 };
            }

            // Find pivot currency
            const pivotCurrency = currencies.find(c => c.xispivot);
            if (!pivotCurrency) {
                console.error("No pivot currency found");
                return { min: 0, max: 1000 };
            }

            // Convert all prices to pivot currency for comparison
            const convertedPrices = variants.map(variant => {
                const price = variant.yvarprodprixpromotion || variant.yvarprodprixcatalogue;
                if (!price || price <= 0) return 0;

                const variantCurrency = variant.xdevise;
                if (!variantCurrency) return price; // Fallback to original price

                // Convert to pivot currency
                if (variantCurrency.xispivot) {
                    return price;
                } else if (variantCurrency.xtauxechange > 0) {
                    return price / variantCurrency.xtauxechange;
                }
                return price;
            }).filter(price => price > 0);

            if (convertedPrices.length === 0) {
                return { min: 0, max: 1000 };
            }

            const min = Math.floor(Math.min(...convertedPrices));
            const max = Math.ceil(Math.max(...convertedPrices));

            return { min, max };
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
}

// Hook to get unique jewelry types from current event products
export function useShopTypeBijoux() {
    const supabase = createClient();

    return useQuery({
        queryKey: ['shop-typebijoux'],
        queryFn: async () => {
            // Get current active event
            const currentDate = new Date().toISOString().split('T')[0];

            const { data: currentEvent, error: eventError } = await supabase
                .schema("morpheus")
                .from("yevent")
                .select("*")
                .lte("yeventdatedeb", currentDate)
                .gte("yeventdatefin", currentDate)
                .order("yeventdatedeb", { ascending: false })
                .limit(1)
                .single();

            if (eventError || !currentEvent) {
                console.error("No active event found:", eventError);
                return [];
            }

            // Get jewelry types with product counts
            const { data: typeData, error: typeError } = await supabase
                .schema("morpheus")
                .from("xtypebijoux")
                .select(`
                    xtypebijouxid,
                    xtypebijouxintitule,
                    xtypebijouxcode
                `)
                .order("xtypebijouxintitule");

            if (typeError) {
                console.error("Error fetching jewelry types:", typeError);
                return [];
            }

            return typeData || [];
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        placeholderData: keepPreviousData,
    });
}

// Hook to get unique materials from current event products
export function useShopMateriaux() {
    const supabase = createClient();

    return useQuery({
        queryKey: ['shop-materiaux'],
        queryFn: async () => {
            // Get current active event
            const currentDate = new Date().toISOString().split('T')[0];

            const { data: currentEvent, error: eventError } = await supabase
                .schema("morpheus")
                .from("yevent")
                .select("*")
                .lte("yeventdatedeb", currentDate)
                .gte("yeventdatefin", currentDate)
                .order("yeventdatedeb", { ascending: false })
                .limit(1)
                .single();

            if (eventError || !currentEvent) {
                console.error("No active event found:", eventError);
                return [];
            }

            // Get materials with product counts
            const { data: materialData, error: materialError } = await supabase
                .schema("morpheus")
                .from("xmateriaux")
                .select(`
                    xmateriauxid,
                    xmateriauxintitule,
                    xmateriauxcode
                `)
                .order("xmateriauxintitule");

            if (materialError) {
                console.error("Error fetching materials:", materialError);
                return [];
            }

            return materialData || [];
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        placeholderData: keepPreviousData,
    });
}