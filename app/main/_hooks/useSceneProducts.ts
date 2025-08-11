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
            
            // Query products through yprod table with proper relationships
            const { data, error } = await supabase
                .schema("morpheus")
                .from("yprod")
                .select(`
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
                    ),
                    ydetailsevent!yprodidfk (
                        yeventidfk
                    )
                `)
                .eq("yinfospotactionsidfk", infospotActionId)
                .eq("yprodstatut", "approved"); // Only get approved products

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

            // Filter products that are part of the current event
            const eventProducts = data?.filter(product =>
                product.ydetailsevent?.some((detail: any) =>
                    detail.yeventidfk === currentEvent.yeventid
                )
            ) || [];

            console.log("Fetched approved products for infospot action", infospotActionId, "in event", currentEvent.yeventid, ":", eventProducts);

            return eventProducts;
        },
        enabled: !!infospotActionId && !!currentEvent // Only run query if both infospotActionId and currentEvent are available
    });
}