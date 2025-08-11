"use client";

import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

export function useCurrencies() {
    const supabase = createClient();

    return useQuery({
        queryKey: ["currencies"],
        queryFn: async () => {
            const { data, error } = await supabase
                .schema("morpheus")
                .from("xdevise")
                .select("*")
                .order("xdeviseintitule");

            if (error) {
                throw new Error(`Failed to fetch currencies: ${error.message}`);
            }

            return data || [];
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
    });
}