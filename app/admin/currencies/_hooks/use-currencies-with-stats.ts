"use client";

import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";
import type { Database } from "@/lib/supabase";

type Currency = Database['morpheus']['Tables']['xdevise']['Row'];

export function useCurrenciesWithStats() {
    const supabase = createClient();

    return useQuery({
        queryKey: ["currencies-with-stats"],
        queryFn: async () => {
            const { data, error } = await supabase
                .schema("morpheus")
                .from("xdevise")
                .select(`
                    *,
                    yvarprod(count)
                `)
                .order("xdeviseintitule", { ascending: true });

            if (error) {
                throw new Error(`Failed to fetch currencies with stats: ${error.message}`);
            }

            return data as (Currency & { yvarprod: { count: number }[] })[];
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
    });
}