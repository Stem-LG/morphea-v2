"use client";

import { createClient } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteCurrency() {
    const queryClient = useQueryClient();
    const supabase = createClient();

    return useMutation({
        mutationFn: async (currencyId: number) => {
            // First check if currency is being used by any product variants
            const { data: variantsUsingCurrency, error: checkError } = await supabase
                .schema("morpheus")
                .from("yvarprod")
                .select("yvarprodid")
                .eq("xdeviseidfk", currencyId)
                .limit(1);

            if (checkError) {
                throw new Error(`Failed to check currency usage: ${checkError.message}`);
            }

            if (variantsUsingCurrency && variantsUsingCurrency.length > 0) {
                throw new Error("Cannot delete currency: it is being used by one or more product variants");
            }

            // Check if this is the pivot currency
            const { data: currencyData, error: currencyError } = await supabase
                .schema("morpheus")
                .from("xdevise")
                .select("xispivot")
                .eq("xdeviseid", currencyId)
                .single();

            if (currencyError) {
                throw new Error(`Failed to fetch currency data: ${currencyError.message}`);
            }

            if (currencyData?.xispivot) {
                throw new Error("Cannot delete the pivot currency. Please set another currency as pivot first.");
            }

            const { error } = await supabase
                .schema("morpheus")
                .from("xdevise")
                .delete()
                .eq("xdeviseid", currencyId);

            if (error) {
                throw new Error(`Failed to delete currency: ${error.message}`);
            }

            return currencyId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currencies-with-stats'] });
        },
        onError: (error) => {
            console.error("Error deleting currency:", error);
        }
    });
}