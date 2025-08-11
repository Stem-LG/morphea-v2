"use client";

import { createClient } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/lib/supabase";

type CurrencyInsert = Database['morpheus']['Tables']['xdevise']['Insert'];
type Currency = Database['morpheus']['Tables']['xdevise']['Row'];

export function useCreateCurrency() {
    const queryClient = useQueryClient();
    const supabase = createClient();

    return useMutation({
        mutationFn: async (currencyData: Omit<CurrencyInsert, 'xdeviseid' | 'sysdate' | 'sysaction' | 'sysuser' | 'sysadresseip'>) => {
            const currentTime = new Date().toISOString();
            
            // Convert boolean string to single character for database if needed
            const convertedData = {
                ...currencyData,
                xdeviseboolautorisepaiement: currencyData.xdeviseboolautorisepaiement === "true" ? "Y" : "N"
            };
            
            const { data, error } = await supabase
                .schema("morpheus")
                .from("xdevise")
                .insert({
                    ...convertedData,
                    sysdate: currentTime,
                    sysaction: 'insert',
                    sysuser: 'admin', // This should be replaced with actual user
                    sysadresseip: null
                })
                .select()
                .single();

            if (error) {
                throw new Error(`Failed to create currency: ${error.message}`);
            }

            return data as Currency;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currencies-with-stats'] });
        },
        onError: (error) => {
            console.error("Error creating currency:", error);
        }
    });
}