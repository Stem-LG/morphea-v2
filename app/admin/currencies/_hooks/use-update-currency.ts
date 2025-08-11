"use client";

import { createClient } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/lib/supabase";

type CurrencyUpdate = Database['morpheus']['Tables']['xdevise']['Update'];
type Currency = Database['morpheus']['Tables']['xdevise']['Row'];

export function useUpdateCurrency() {
    const queryClient = useQueryClient();
    const supabase = createClient();

    return useMutation({
        mutationFn: async ({ currencyId, updates }: { currencyId: number; updates: Partial<CurrencyUpdate> }) => {
            const currentTime = new Date().toISOString();
            
            // Convert boolean string to single character for database if present
            const convertedUpdates = { ...updates };
            if (convertedUpdates.xdeviseboolautorisepaiement !== undefined) {
                convertedUpdates.xdeviseboolautorisepaiement = convertedUpdates.xdeviseboolautorisepaiement === "true" ? "Y" : "N";
            }

            // Handle pivot constraint logic
            if (convertedUpdates.xispivot === true) {
                // First, set all other currencies' xispivot to false
                const { error: resetPivotError } = await supabase
                    .schema("morpheus")
                    .from("xdevise")
                    .update({ 
                        xispivot: false,
                        sysdate: currentTime,
                        sysaction: 'update',
                        sysuser: 'admin'
                    })
                    .neq("xdeviseid", currencyId)
                    .eq("xispivot", true);

                if (resetPivotError) {
                    throw new Error(`Failed to reset other pivot currencies: ${resetPivotError.message}`);
                }
            }
            
            // Now update the target currency
            const { data, error } = await supabase
                .schema("morpheus")
                .from("xdevise")
                .update({
                    ...convertedUpdates,
                    sysdate: currentTime,
                    sysaction: 'update',
                    sysuser: 'admin', // This should be replaced with actual user
                })
                .eq("xdeviseid", currencyId)
                .select()
                .single();

            if (error) {
                throw new Error(`Failed to update currency: ${error.message}`);
            }

            return data as Currency;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['currencies-with-stats'] });
            queryClient.invalidateQueries({ queryKey: ['currency', data.xdeviseid] });
        },
        onError: (error) => {
            console.error("Error updating currency:", error);
        }
    });
}