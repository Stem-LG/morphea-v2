import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query"


export function useSceneProducts(sceneId: string | null) {


    const supabase = createClient()

    return useQuery({
        queryKey: ['sceneProducts', sceneId],
        queryFn: async () => {
            if (!sceneId) return [];
            const { data, error } = await supabase.schema("morpheus").from("yproduit").select().eq("yproduitinfobulle", sceneId);

            if (error) {
                console.error("Error fetching products:", error);
                return [];
            }

            console.log("Fetched products:", data);

            return data || [];
        }
    })

}