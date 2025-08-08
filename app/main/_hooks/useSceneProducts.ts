import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";
import { useCurrentEvent } from "./useCurrentEvent";

export function useSceneProducts(infospotActionId: string | null) {
    const supabase = createClient();
    const { data: currentEvent } = useCurrentEvent();

    return useQuery({
        queryKey: ['sceneProducts', infospotActionId, currentEvent?.yeventid],
        queryFn: async () => {
            if (!infospotActionId) {
                console.log("No infospotActionId provided to useSceneProducts");
                return [];
            }

            if (!currentEvent) {
                console.log("No current event found, cannot fetch products");
                return [];
            }
            
            console.log("Fetching products for infospotActionId:", infospotActionId, "and eventId:", currentEvent.yeventid);
            
            // Query products through ydetailsevent table with proper relationships
            const { data, error } = await supabase
                .schema("morpheus")
                .from("ydetailsevent")
                .select(`
                    *,
                    yprod!yprodidfk (
                        *,
                        yvarprod (
                            *,
                            xcouleur(*),
                            xtaille(*),
                            xdevise(*),
                            yvarprodmedia (
                                ymedia (*)
                            ),
                            yobjet3d (*)
                        )
                    )
                `)
                .eq("yinfospotactionId", infospotActionId)
                .eq("yeventidfk", currentEvent.yeventid)
                .not("yprodidfk", "is", null); // Ensure we have a product

            if (error) {
                console.error("Error fetching products for infospot action:", {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code,
                    infospotActionId: infospotActionId,
                    eventId: currentEvent.yeventid
                });
                return [];
            }

            // Filter for approved products only and transform the data
            const approvedProducts = data
                ?.filter(detailEvent =>
                    detailEvent.yprod &&
                    detailEvent.yprod.yprodstatut === "approved"
                )
                .map(detailEvent => detailEvent.yprod) || [];

            console.log("Fetched approved products for infospot action", infospotActionId, "in event", currentEvent.yeventid, ":", approvedProducts);

            return approvedProducts;
        },
        enabled: !!infospotActionId && !!currentEvent // Only run query if both infospotActionId and currentEvent are available
    });
}