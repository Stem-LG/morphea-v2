"use client";

import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";
import type { Database } from "@/lib/supabase";

type Currency = Database['morpheus']['Tables']['xdevise']['Row'];

export function useCurrencies() {
    const supabase = createClient();

    return useQuery({
        queryKey: ["currencies"],
        queryFn: async () => {
            const { data, error } = await supabase
                .schema("morpheus")
                .from("xdevise")
                .select("*")
                .order("xdeviseintitule", { ascending: true });

            if (error) {
                throw new Error(`Failed to fetch currencies: ${error.message}`);
            }

            return data as Currency[];
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
    });
}