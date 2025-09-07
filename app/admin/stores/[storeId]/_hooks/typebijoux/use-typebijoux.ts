"use client";

import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

export function useTypeBijoux() {
    const supabase = createClient();

    return useQuery({
        queryKey: ["typebijoux"],
        queryFn: async () => {
            const { data, error } = await supabase
                .schema("morpheus")
                .from("xtypebijoux")
                .select("*")
                .order("xtypebijouxintitule");

            if (error) {
                throw new Error(error.message);
            }

            return data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}