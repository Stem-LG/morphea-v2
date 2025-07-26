import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";
import type { Database } from "@/lib/supabase";

type ProductVariant = Database['morpheus']['Tables']['yvarprod']['Row'] & {
    xcouleur?: Database['morpheus']['Tables']['xcouleur']['Row'];
    xtaille?: Database['morpheus']['Tables']['xtaille']['Row'];
    xdevise?: Database['morpheus']['Tables']['xdevise']['Row'];
};

export function useProductVariants(productId: number) {
    const supabase = createClient();

    return useQuery({
        queryKey: ['product-variants', productId],
        queryFn: async () => {
            const { data, error } = await supabase
                .schema("morpheus")
                .from("yvarprod")
                .select(`
                    *,
                    xcouleur(*),
                    xtaille(*),
                    xdevise(*)
                `)
                .eq('yprodidfk', productId)
                .order("yvarprodid", { ascending: true });

            if (error) {
                console.error("Error fetching product variants:", error);
                throw error;
            }

            return data as ProductVariant[];
        },
        enabled: !!productId,
    });
}
