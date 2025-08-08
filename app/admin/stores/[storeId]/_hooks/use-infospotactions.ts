"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/client";

interface UseInfospotactionsParams {
    boutiqueId?: number;
    enabled?: boolean;
}

export function useInfospotactions({ boutiqueId, enabled = true }: UseInfospotactionsParams) {
    const supabase = createClient();

    return useQuery({
        queryKey: ["infospotactions", boutiqueId],
        queryFn: async () => {
            if (!boutiqueId) return [];

            const { data, error } = await supabase
                .schema("morpheus")
                .from("yinfospotactions")
                .select("*")
                .eq("yboutiqueidfk", boutiqueId)
                .order("yinfospotactionstitle", { ascending: true });

            if (error) {
                console.error("Error fetching infospotactions:", error);
                throw new Error(error.message);
            }

            return data || [];
        },
        enabled: enabled && !!boutiqueId,
    });
}