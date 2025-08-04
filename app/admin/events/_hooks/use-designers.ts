"use client";

import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

export function useDesigners() {
    const supabase = createClient();

    return useQuery({
        queryKey: ["designers"],
        queryFn: async () => {
            const { data, error } = await supabase
                .schema("morpheus")
                .from("ydesign")
                .select(`
                    ydesignid,
                    ydesigncode,
                    ydesignnom,
                    ydesignmarque,
                    ydesignspecialite,
                    ydesignpays,
                    ydesigncontactpersonne,
                    ydesigncontactemail,
                    ydesigncontacttelephone
                `)
                .order("ydesignnom");

            if (error) {
                throw new Error(`Failed to fetch designers: ${error.message}`);
            }

            return data || [];
        },
    });
}