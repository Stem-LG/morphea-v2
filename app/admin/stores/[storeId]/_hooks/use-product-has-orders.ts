"use client";

import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

export function useProductHasOrders(productId: number) {
    const supabase = createClient();

    return useQuery({
        queryKey: ["product-has-orders", productId],
        queryFn: async (): Promise<boolean> => {
            if (!productId) return false;

            // First, get all variant IDs for this product
            const { data: variants, error: variantsError } = await supabase
                .schema("morpheus")
                .from("yvarprod")
                .select("yvarprodid")
                .eq("yprodidfk", productId);

            if (variantsError) {
                console.error("Error fetching product variants:", variantsError);
                return false;
            }

            if (!variants || variants.length === 0) {
                return false;
            }

            // Get all variant IDs
            const variantIds = variants.map(v => v.yvarprodid);

            // Check if any of these variants have orders
            const { data: orders, error: ordersError } = await supabase
                .schema("morpheus")
                .from("zdetailscommande")
                .select("zcommandeid")
                .in("yvarprodidfk", variantIds)
                .limit(1); // We only need to know if at least one exists

            if (ordersError) {
                console.error("Error checking product orders:", ordersError);
                return false;
            }

            return (orders && orders.length > 0);
        },
        enabled: !!productId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}