"use client";

import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

export function useBoutiques(mallIds: number[] = []) {
    const supabase = createClient();

    return useQuery({
        queryKey: ["boutiques", mallIds],
        queryFn: async () => {
            if (mallIds.length === 0) {
                return [];
            }

            const { data, error } = await supabase
                .schema("morpheus")
                .from("yboutique")
                .select(`
                    yboutiqueid,
                    yboutiquecode,
                    yboutiqueintitule,
                    yboutiqueadressemall,
                    ymallidfk,
                    ymall:ymallidfk (
                        ymallid,
                        ymallintitule
                    )
                `)
                .in("ymallidfk", mallIds)
                .order("yboutiqueintitule");

            if (error) {
                throw new Error(`Failed to fetch boutiques: ${error.message}`);
            }

            return data || [];
        },
        enabled: mallIds.length > 0,
    });
}