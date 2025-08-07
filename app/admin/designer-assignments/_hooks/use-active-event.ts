"use client";

import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

export function useActiveEvent() {
    const supabase = createClient();

    return useQuery({
        queryKey: ["active-event"],
        queryFn: async () => {
            const now = new Date().toISOString();
            
            const { data, error } = await supabase
                .schema("morpheus")
                .from("yevent")
                .select(`
                    yeventid,
                    yeventcode,
                    yeventintitule,
                    yeventdatedeb,
                    yeventdatefin
                `)
                .lte("yeventdatedeb", now)
                .gte("yeventdatefin", now)
                .order("yeventdatedeb", { ascending: false })
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
                throw new Error(`Failed to fetch active event: ${error.message}`);
            }

            return data || null;
        },
    });
}