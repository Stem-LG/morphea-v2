"use client";

import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

interface Mall {
    ymallid: number;
    ymallintitule: string;
    ymalladresse?: string;
}

export function useMalls() {
    const supabase = createClient();

    return useQuery({
        queryKey: ["malls"],
        queryFn: async (): Promise<Mall[]> => {
            const { data, error } = await supabase
                .schema("morpheus")
                .from("ymall")
                .select("*")
                .order("ymallintitule");

            if (error) {
                throw new Error(error.message);
            }

            return data || [];
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}