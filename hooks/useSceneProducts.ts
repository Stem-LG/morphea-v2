import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query"


export function useSceneProducts(sceneId: string | null) {


    const supabase = createClient()

    return useQuery({
        queryKey: ['sceneProducts', sceneId],
        queryFn: async () => {
            if (!sceneId) {
                console.log("No sceneId provided to useSceneProducts");
                return [];
            }
            
            console.log("Fetching products for sceneId:", sceneId);
            const { data, error } = await supabase.schema("morpheus").from("yproduit").select("*,yobjet3d(*)").eq("yinfospotactionsidfk", sceneId);

            if (error) {
                console.error("Error fetching products:", {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code,
                    sceneId: sceneId
                });
                return [];
            }

            console.log("Fetched products for scene", sceneId, ":", data);

            return data || [];
        }
    })

}