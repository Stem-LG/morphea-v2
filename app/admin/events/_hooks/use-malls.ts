"use client";

import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

export function useMalls() {
    const supabase = createClient();

    return useQuery({
        queryKey: ["malls"],
        queryFn: async () => {
            const { data, error } = await supabase
                .schema("morpheus")
                .from("ymall")
                .select(`
                    ymallid,
                    ymallcode,
                    ymallintitule,
                    ymalladresse,
                    ymalllocalisation,
                    ymallcontactpersonne,
                    ymallcontactemail,
                    ymallcontacttelephone
                `)
                .order("ymallintitule");

            if (error) {
                throw new Error(`Failed to fetch malls: ${error.message}`);
            }

            return data || [];
        },
    });
}