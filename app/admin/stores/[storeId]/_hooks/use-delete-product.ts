"use client";

import { createClient } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteProduct() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (productId: number) => {
            // First, delete all product variants and their media associations
            const { data: variants } = await supabase
                .schema("morpheus")
                .from("yvarprod")
                .select("yvarprodid")
                .eq("yprodidfk", productId);

            if (variants) {
                // Delete variant media associations
                for (const variant of variants) {
                    const { error: variantMediaError } = await supabase
                        .schema("morpheus")
                        .from("yvarprodmedia")
                        .delete()
                        .eq("yvarprodidfk", variant.yvarprodid);

                    if (variantMediaError) {
                        console.error("Error deleting variant media:", variantMediaError);
                    }
                }

                // Delete product variants
                const { error: variantsError } = await supabase
                    .schema("morpheus")
                    .from("yvarprod")
                    .delete()
                    .eq("yprodidfk", productId);

                if (variantsError) {
                    throw new Error(`Failed to delete product variants: ${variantsError.message}`);
                }
            }

            // Delete from ydetailsevent (event associations)
            const { error: detailsEventError } = await supabase
                .schema("morpheus")
                .from("ydetailsevent")
                .delete()
                .eq("yprodidfk", productId);

            if (detailsEventError) {
                console.error("Error deleting event details:", detailsEventError);
            }

            // Finally, delete the product itself
            const { error: productError } = await supabase
                .schema("morpheus")
                .from("yprod")
                .delete()
                .eq("yprodid", productId);

            if (productError) {
                throw new Error(`Failed to delete product: ${productError.message}`);
            }

            return productId;
        },
        onSuccess: () => {
            // Invalidate and refetch products
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["store-products"] });
        },
        onError: (error) => {
            console.error("Failed to delete product:", error);
        }
    });
}