import { createClient } from "@/lib/client";
import { useQuery, useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";

interface UseShopProductsParams {
    page?: number;
    perPage?: number;
    mallId?: number | null;
    boutiqueId?: number | null;
    categoryId?: number | null;
    searchQuery?: string;
    sortBy?: string;
    colorId?: number | null;
    sizeId?: number | null;
    minPrice?: number | null;
    maxPrice?: number | null;
}

interface ProductWithDetails {
    yprodid: number;
    yprodcode: string;
    yprodintitule: string;
    yproddetailstech: string;
    yprodinfobulle: string;
    yprodstatut: string;
    xcategprod?: {
        xcategprodid: number;
        xcategprodintitule: string;
        xcategprodcode: string;
    };
    ydesign?: {
        ydesignid: number;
        ydesignnom: string;
        ydesignmarque: string;
    };
    yvarprod?: Array<{
        yvarprodid: number;
        yvarprodintitule: string;
        yvarprodcode: string;
        yvarprodprixcatalogue: number;
        yvarprodprixpromotion: number | null;
        yvarprodpromotiondatedeb: string | null;
        yvarprodpromotiondatefin: string | null;
        yvarprodnbrjourlivraison: number;
        yvarprodstatut: string;
        xdeviseidfk: number | null;
        xcouleur: {
            xcouleurid: number;
            xcouleurintitule: string;
            xcouleurhexa: string;
        };
        xtaille: {
            xtailleid: number;
            xtailleintitule: string;
        };
        yvarprodmedia?: Array<{
            ymedia: {
                ymediaid: number;
                ymediaintitule: string;
                ymediaurl: string;
                ymediaboolvideo: boolean;
            };
        }>;
        yobjet3d?: Array<{
            yobjet3did: number;
            yobjet3durl: string;
        }>;
    }>;
    ydetailsevent?: Array<{
        ymallidfk: number;
        yboutiqueidfk: number | null;
        ydesignidfk: number | null;
        ymall?: {
            ymallid: number;
            ymallintitule: string;
        };
        yboutique?: {
            yboutiqueid: number;
            yboutiqueintitule: string | null;
            yboutiquecode: string;
        };
    }>;
}

export function useShopProducts({
    page = 1,
    perPage = 12,
    mallId = null,
    boutiqueId = null,
    categoryId = null,
    searchQuery = "",
    sortBy = "default",
    colorId = null,
    sizeId = null,
    minPrice = null,
    maxPrice = null
}: UseShopProductsParams = {}) {
    const supabase = createClient();

    return useQuery({
        queryKey: ['shop-products', page, perPage, mallId, boutiqueId, categoryId, searchQuery, sortBy, colorId, sizeId, minPrice, maxPrice],
        queryFn: async () => {
            // Step 1: Get the current active event
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
                return { products: [], totalCount: 0, currentEvent: null };
            }

            // Step 2: Build the query for products in the current event
            let detailsQuery = supabase
                .schema("morpheus")
                .from("ydetailsevent")
                .select("yprodidfk")
                .eq("yeventidfk", currentEvent.yeventid)
                .not("yprodidfk", "is", null);

            // Apply filters
            if (mallId) {
                detailsQuery = detailsQuery.eq("ymallidfk", mallId);
            }
            if (boutiqueId) {
                detailsQuery = detailsQuery.eq("yboutiqueidfk", boutiqueId);
            }

            const { data: eventDetails, error: detailsError } = await detailsQuery;

            if (detailsError) {
                console.error("Error fetching event details:", detailsError);
                return { products: [], totalCount: 0, currentEvent };
            }

            if (!eventDetails || eventDetails.length === 0) {
                return { products: [], totalCount: 0, currentEvent };
            }

            const productIds = [...new Set(eventDetails.map(d => d.yprodidfk))];

            // Step 3: Fetch products with all details
            let productsQuery = supabase
                .schema("morpheus")
                .from("yprod")
                .select(`
                    *,
                    xcategprod:xcategprodidfk (
                        xcategprodid,
                        xcategprodintitule,
                        xcategprodcode
                    ),
                    ydesign:ydesignidfk (
                        ydesignid,
                        ydesignnom,
                        ydesignmarque
                    ),
                    yvarprod (
                        *,
                        xcouleur:xcouleuridfk (*),
                        xtaille:xtailleidfk (*),
                        yvarprodmedia (
                            ymedia:ymediaidfk (*)
                        ),
                        yobjet3d (*)
                    ),
                    ydetailsevent!inner (
                        ymallidfk,
                        yboutiqueidfk,
                        ydesignidfk,
                        ymall:ymallidfk (
                            ymallid,
                            ymallintitule
                        ),
                        yboutique:yboutiqueidfk (
                            yboutiqueid,
                            yboutiqueintitule,
                            yboutiquecode
                        )
                    )
                `, { count: 'exact' })
                .in("yprodid", productIds)
                .eq("yprodstatut", "approved")
                .eq("yestvisible", true)
                .eq("ydetailsevent.yeventidfk", currentEvent.yeventid);

            // Apply category filter
            if (categoryId) {
                productsQuery = productsQuery.eq("xcategprodidfk", categoryId);
            }

            // Apply search filter
            if (searchQuery) {
                productsQuery = productsQuery.or(`yprodintitule.ilike.%${searchQuery}%,yproddetailstech.ilike.%${searchQuery}%`);
            }

            // Apply mall filter to the joined data
            if (mallId) {
                productsQuery = productsQuery.eq("ydetailsevent.ymallidfk", mallId);
            }

            // Apply boutique filter to the joined data
            if (boutiqueId) {
                productsQuery = productsQuery.eq("ydetailsevent.yboutiqueidfk", boutiqueId);
            }

            // Apply sorting
            switch (sortBy) {
                case 'price_asc':
                    productsQuery = productsQuery.order("yvarprod.yvarprodprixcatalogue", { ascending: true });
                    break;
                case 'price_desc':
                    productsQuery = productsQuery.order("yvarprod.yvarprodprixcatalogue", { ascending: false });
                    break;
                case 'alphabetical':
                    productsQuery = productsQuery.order("yprodintitule", { ascending: true });
                    break;
                case 'recommended':
                    // For recommended, we'll sort by purchase count (handled after fetching)
                    productsQuery = productsQuery.order("yprodid", { ascending: false });
                    break;
                case 'default':
                case 'newest':
                default:
                    productsQuery = productsQuery.order("yprodid", { ascending: false });
                    break;
            }

            // Apply pagination
            const from = (page - 1) * perPage;
            const to = from + perPage - 1;
            productsQuery = productsQuery.range(from, to);

            const { data: products, error: productsError, count } = await productsQuery;

            if (productsError) {
                console.error("Error fetching products:", productsError);
                return { products: [], totalCount: 0, currentEvent };
            }

            // Get currencies for price conversion if price filters are applied
            let currencies: any[] = [];
            let pivotCurrency: any = null;

            if (minPrice || maxPrice) {
                const { data: currencyData, error: currencyError } = await supabase
                    .schema("morpheus")
                    .from("xdevise")
                    .select("*");

                if (!currencyError && currencyData) {
                    currencies = currencyData;
                    pivotCurrency = currencies.find(c => c.xispivot);
                }
            }

            // Filter approved variants and apply color, size, and price filters
            const productsWithApprovedVariants = products?.map(product => ({
                ...product,
                yvarprod: product.yvarprod?.filter((v: any) => {
                    const isApproved = v.yvarprodstatut === "approved";
                    const matchesColor = !colorId || v.xcouleur.xcouleurid === colorId;
                    const matchesSize = !sizeId || v.xtaille.xtailleid === sizeId;

                    // Price filtering with currency conversion
                    let matchesMinPrice = true;
                    let matchesMaxPrice = true;

                    if ((minPrice || maxPrice) && pivotCurrency) {
                        const rawPrice = v.yvarprodprixpromotion || v.yvarprodprixcatalogue;
                        if (rawPrice && rawPrice > 0) {
                            // Find variant's currency
                            const variantCurrency = currencies.find(c => c.xdeviseid === v.xdeviseidfk);

                            // Convert variant price to pivot currency for comparison
                            let priceInPivot = rawPrice;
                            if (variantCurrency && !variantCurrency.xispivot && variantCurrency.xtauxechange > 0) {
                                priceInPivot = rawPrice / variantCurrency.xtauxechange;
                            }

                            // Compare with filter values (which are already in pivot currency)
                            matchesMinPrice = !minPrice || priceInPivot >= minPrice;
                            matchesMaxPrice = !maxPrice || priceInPivot <= maxPrice;
                        }
                    }

                    return isApproved && matchesColor && matchesSize && matchesMinPrice && matchesMaxPrice;
                }) || []
            })).filter(product => product.yvarprod.length > 0) || [];

            // Handle special sorting cases
            let finalProducts = productsWithApprovedVariants as ProductWithDetails[];

            if (sortBy === 'recommended') {
                // Get purchase counts for products from zdetailscommande table
                const productIds = finalProducts.map(p => p.yvarprod.map(v => v.yvarprodid)).flat();

                if (productIds.length > 0) {
                    const { data: purchaseCounts } = await supabase
                        .schema("morpheus")
                        .from("zdetailscommande")
                        .select("yvarprodidfk, zcommandequantite")
                        .in("yvarprodidfk", productIds);

                    // Calculate total purchase count per product
                    const productPurchaseCounts = new Map<number, number>();

                    finalProducts.forEach(product => {
                        let totalPurchases = 0;
                        product.yvarprod.forEach(variant => {
                            const variantPurchases = purchaseCounts?.filter(pc => pc.yvarprodidfk === variant.yvarprodid)
                                .reduce((sum, pc) => sum + (pc.zcommandequantite || 0), 0) || 0;
                            totalPurchases += variantPurchases;
                        });
                        productPurchaseCounts.set(product.yprodid, totalPurchases);
                    });

                    // Sort by purchase count (descending)
                    finalProducts.sort((a, b) => {
                        const countA = productPurchaseCounts.get(a.yprodid) || 0;
                        const countB = productPurchaseCounts.get(b.yprodid) || 0;
                        return countB - countA;
                    });
                }
            } else if (sortBy === 'default') {
                // Randomize the products for default sorting
                finalProducts = [...finalProducts].sort(() => Math.random() - 0.5);
            }

            return {
                products: finalProducts,
                totalCount: count || 0,
                currentEvent
            };
        },
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 5 * 60 * 1000, // 5 minutes
        placeholderData: keepPreviousData,
    });
}

// Infinite scroll version
export function useShopProductsInfinite({
    perPage = 12,
    mallId = null,
    boutiqueId = null,
    categoryId = null,
    searchQuery = "",
    sortBy = "default",
    colorId = null,
    sizeId = null,
    minPrice = null,
    maxPrice = null
}: Omit<UseShopProductsParams, 'page'> = {}) {
    const supabase = createClient();

    return useInfiniteQuery({
        queryKey: ['shop-products-infinite', perPage, mallId, boutiqueId, categoryId, searchQuery, sortBy, colorId, sizeId, minPrice, maxPrice],
        queryFn: async ({ pageParam }: { pageParam: number }) => {
            const currentPage = pageParam || 1;
            // Step 1: Get the current active event
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
                return { products: [], totalCount: 0, currentEvent: null, hasNextPage: false };
            }

            // Step 2: Build the query for products in the current event
            let detailsQuery = supabase
                .schema("morpheus")
                .from("ydetailsevent")
                .select("yprodidfk")
                .eq("yeventidfk", currentEvent.yeventid)
                .not("yprodidfk", "is", null);

            // Apply filters
            if (mallId) {
                detailsQuery = detailsQuery.eq("ymallidfk", mallId);
            }

            if (boutiqueId) {
                detailsQuery = detailsQuery.eq("yboutiqueidfk", boutiqueId);
            }

            const { data: detailsData, error: detailsError } = await detailsQuery;

            if (detailsError) {
                console.error("Error fetching event details:", detailsError);
                return { products: [], totalCount: 0, currentEvent, hasNextPage: false };
            }

            const productIds = detailsData?.map(detail => detail.yprodidfk) || [];

            if (productIds.length === 0) {
                return { products: [], totalCount: 0, currentEvent, hasNextPage: false };
            }

            // Step 3: Fetch products with all related data
            let productsQuery = supabase
                .schema("morpheus")
                .from("yprod")
                .select(`
                    yprodid,
                    yprodcode,
                    yprodintitule,
                    yproddetailstech,
                    yprodinfobulle,
                    yprodstatut,
                    yestvisible,
                    xcategprodidfk,
                    xcategprod:xcategprodidfk (
                        xcategprodid,
                        xcategprodintitule,
                        xcategprodcode
                    ),
                    ydesign:ydesignidfk (
                        ydesignid,
                        ydesignnom,
                        ydesignmarque
                    ),
                    yvarprod (
                        yvarprodid,
                        yvarprodintitule,
                        yvarprodcode,
                        yvarprodprixcatalogue,
                        yvarprodprixpromotion,
                        yvarprodpromotiondatedeb,
                        yvarprodpromotiondatefin,
                        yvarprodnbrjourlivraison,
                        yvarprodstatut,
                        yvarprodcaract,
                        xdeviseidfk,
                        xcouleur:xcouleuridfk (
                            xcouleurid,
                            xcouleurintitule,
                            xcouleurhexa
                        ),
                        xtaille:xtailleidfk (
                            xtailleid,
                            xtailleintitule
                        ),
                        yvarprodmedia (
                            yvarprodmediaid,
                            ymedia:ymediaidfk (
                                ymediaid,
                                ymediaurl,
                                ymediaboolvideo
                            )
                        )
                    ),
                    ydetailsevent!inner (
                        ydetailseventid,
                        yeventidfk,
                        ymallidfk,
                        yboutiqueidfk,
                        ymall:ymallidfk (
                            ymallid,
                            ymallintitule
                        ),
                        yboutique:yboutiqueidfk (
                            yboutiqueid,
                            yboutiqueintitule,
                            yboutiquecode
                        )
                    )
                `, { count: 'exact' })
                .in("yprodid", productIds)
                .eq("yprodstatut", "approved")
                .eq("yestvisible", true)
                .eq("ydetailsevent.yeventidfk", currentEvent.yeventid);

            // Apply category filter
            if (categoryId) {
                productsQuery = productsQuery.eq("xcategprodidfk", categoryId);
            }

            // Apply search filter
            if (searchQuery) {
                productsQuery = productsQuery.or(`yprodintitule.ilike.%${searchQuery}%,yproddetailstech.ilike.%${searchQuery}%`);
            }

            // Apply mall filter to the joined data
            if (mallId) {
                productsQuery = productsQuery.eq("ydetailsevent.ymallidfk", mallId);
            }

            // Apply boutique filter to the joined data
            if (boutiqueId) {
                productsQuery = productsQuery.eq("ydetailsevent.yboutiqueidfk", boutiqueId);
            }

            // Apply sorting
            switch (sortBy) {
                case 'price_asc':
                    productsQuery = productsQuery.order("yvarprod.yvarprodprixcatalogue", { ascending: true });
                    break;
                case 'price_desc':
                    productsQuery = productsQuery.order("yvarprod.yvarprodprixcatalogue", { ascending: false });
                    break;
                case 'alphabetical':
                    productsQuery = productsQuery.order("yprodintitule", { ascending: true });
                    break;
                case 'recommended':
                    // For recommended, we'll sort by purchase count (handled after fetching)
                    productsQuery = productsQuery.order("yprodid", { ascending: false });
                    break;
                case 'default':
                case 'newest':
                default:
                    productsQuery = productsQuery.order("yprodid", { ascending: false });
                    break;
            }

            // Apply pagination
            const from = (currentPage - 1) * perPage;
            const to = from + perPage - 1;
            productsQuery = productsQuery.range(from, to);

            const { data: products, error: productsError, count } = await productsQuery;

            if (productsError) {
                console.error("Error fetching products:", productsError);
                return { products: [], totalCount: 0, currentEvent, hasNextPage: false };
            }

            // Get currencies for price conversion if price filters are applied
            let currencies: any[] = [];
            let pivotCurrency: any = null;

            if (minPrice || maxPrice) {
                const { data: currencyData, error: currencyError } = await supabase
                    .schema("morpheus")
                    .from("xdevise")
                    .select("*");

                if (!currencyError && currencyData) {
                    currencies = currencyData;
                    pivotCurrency = currencies.find(c => c.xispivot);
                }
            }

            // Filter approved variants and apply color, size, and price filters
            const productsWithApprovedVariants = products?.map(product => ({
                ...product,
                yvarprod: product.yvarprod?.filter(variant => {
                    const isApproved = variant.yvarprodstatut === "approved";
                    const matchesColor = !colorId || variant.xcouleur.xcouleurid === colorId;
                    const matchesSize = !sizeId || variant.xtaille.xtailleid === sizeId;

                    // Price filtering with currency conversion
                    let matchesMinPrice = true;
                    let matchesMaxPrice = true;

                    if ((minPrice || maxPrice) && pivotCurrency) {
                        const rawPrice = variant.yvarprodprixpromotion || variant.yvarprodprixcatalogue;
                        if (rawPrice && rawPrice > 0) {
                            // Find variant's currency
                            const variantCurrency = currencies.find(c => c.xdeviseid === variant.xdeviseidfk);

                            // Convert variant price to pivot currency for comparison
                            let priceInPivot = rawPrice;
                            if (variantCurrency && !variantCurrency.xispivot && variantCurrency.xtauxechange > 0) {
                                priceInPivot = rawPrice / variantCurrency.xtauxechange;
                            }

                            // Compare with filter values (which are already in pivot currency)
                            matchesMinPrice = !minPrice || priceInPivot >= minPrice;
                            matchesMaxPrice = !maxPrice || priceInPivot <= maxPrice;
                        }
                    }

                    return isApproved && matchesColor && matchesSize && matchesMinPrice && matchesMaxPrice;
                }) || []
            })).filter(product => product.yvarprod.length > 0) || [];

            // Handle special sorting cases
            let finalProducts = productsWithApprovedVariants;

            if (sortBy === 'recommended') {
                // Get purchase counts for products from zdetailscommande table
                const productIds = finalProducts.map(p => p.yvarprod.map(v => v.yvarprodid)).flat();

                if (productIds.length > 0) {
                    const { data: purchaseCounts } = await supabase
                        .schema("morpheus")
                        .from("zdetailscommande")
                        .select("yvarprodidfk, zcommandequantite")
                        .in("yvarprodidfk", productIds);

                    // Calculate total purchase count per product
                    const productPurchaseCounts = new Map<number, number>();

                    finalProducts.forEach(product => {
                        let totalPurchases = 0;
                        product.yvarprod.forEach(variant => {
                            const variantPurchases = purchaseCounts?.filter(pc => pc.yvarprodidfk === variant.yvarprodid)
                                .reduce((sum, pc) => sum + (pc.zcommandequantite || 0), 0) || 0;
                            totalPurchases += variantPurchases;
                        });
                        productPurchaseCounts.set(product.yprodid, totalPurchases);
                    });

                    // Sort by purchase count (descending)
                    finalProducts.sort((a, b) => {
                        const countA = productPurchaseCounts.get(a.yprodid) || 0;
                        const countB = productPurchaseCounts.get(b.yprodid) || 0;
                        return countB - countA;
                    });
                }
            } else if (sortBy === 'default') {
                // Randomize the products for default sorting
                finalProducts = [...finalProducts].sort(() => Math.random() - 0.5);
            }

            const totalCount = count || 0;
            const hasNextPage = (currentPage * perPage) < totalCount;

            return {
                products: finalProducts,
                totalCount,
                currentEvent,
                hasNextPage,
                nextPage: hasNextPage ? currentPage + 1 : undefined
            };
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage: any) => lastPage.nextPage,
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 5 * 60 * 1000, // 5 minutes
    });
}