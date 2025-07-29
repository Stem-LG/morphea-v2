"use client";

import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

export function useSizes() {
    const supabase = createClient();

    return useQuery({
        queryKey: ["sizes"],
        queryFn: async () => {
            const { data, error } = await supabase
                .schema("morpheus")
                .from("xtaille")
                .select("*")
                .order("xtailleintitule");

            if (error) {
                throw new Error(error.message);
            }

            return data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}