"use client";

import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

export function useMateriaux() {
    const supabase = createClient();

    return useQuery({
        queryKey: ["materiaux"],
        queryFn: async () => {
            const { data, error } = await supabase
                .schema("morpheus")
                .from("xmateriaux")
                .select("*")
                .order("xmateriauxintitule");

            if (error) {
                throw new Error(error.message);
            }

            return data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}