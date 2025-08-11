import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";
import type { Database } from "@/lib/supabase";

type Product = Database["morpheus"]["Tables"]["yprod"]["Row"] & {
    yvarprod?: Array<Database["morpheus"]["Tables"]["yvarprod"]["Row"] & {
        xcouleur?: Database["morpheus"]["Tables"]["xcouleur"]["Row"];
        xtaille?: Database["morpheus"]["Tables"]["xtaille"]["Row"];
        xdevise?: Database["morpheus"]["Tables"]["xdevise"]["Row"];
        yobjet3d?: Database["morpheus"]["Tables"]["yobjet3d"]["Row"][];
    }>;
    yinfospotactions?: Database["morpheus"]["Tables"]["yinfospotactions"]["Row"];
};

export function useSceneProducts(infospotActionId: string | null) {
    const supabase = createClient();

    return useQuery({
        queryKey: ['sceneProducts', infospotActionId],
        queryFn: async (): Promise<Product[]> => {
            if (!infospotActionId) {
                console.log("No infospotActionId provided to useSceneProducts");
                return [];
            }
            
            console.log("Fetching products for infospotActionId:", infospotActionId);
            
            // Fetch products that are linked to this infospot action
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
                        yobjet3d(*)
                    ),
                    yinfospotactions!yinfospotactionsidfk (*)
                `)
                .eq("yinfospotactionsidfk", parseInt(infospotActionId))
                .eq("yprodstatut", "approved"); // Only fetch approved products

            if (error) {
                console.error("Error fetching products for infospot action:", {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code,
                    infospotActionId: infospotActionId
                });
                throw new Error(error.message);
            }

            console.log("Fetched products for infospot action", infospotActionId, ":", data);

            return data || [];
        },
        enabled: !!infospotActionId // Only run query if infospotActionId is provided
    });
}