import { createClient } from "@/lib/client";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

interface UseShopProductsParams {
    page?: number;
    perPage?: number;
    mallId?: number | null;
    boutiqueId?: number | null;
    categoryId?: number | null;
    searchQuery?: string;
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
    searchQuery = ""
}: UseShopProductsParams = {}) {
    const supabase = createClient();

    return useQuery({
        queryKey: ['shop-products', page, perPage, mallId, boutiqueId, categoryId, searchQuery],
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

            // Apply pagination
            const from = (page - 1) * perPage;
            const to = from + perPage - 1;
            productsQuery = productsQuery.range(from, to);

            const { data: products, error: productsError, count } = await productsQuery;

            if (productsError) {
                console.error("Error fetching products:", productsError);
                return { products: [], totalCount: 0, currentEvent };
            }

            // Filter approved variants
            const productsWithApprovedVariants = products?.map(product => ({
                ...product,
                yvarprod: product.yvarprod?.filter((v: any) => v.yvarprodstatut === "approved") || []
            })) || [];

            return {
                products: productsWithApprovedVariants as ProductWithDetails[],
                totalCount: count || 0,
                currentEvent
            };
        },
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 5 * 60 * 1000, // 5 minutes
        placeholderData: keepPreviousData,
    });
}