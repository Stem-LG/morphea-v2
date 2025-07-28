"use client";

import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

export function useCategories() {
    const supabase = createClient();

    return useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            // Get all categories that have products associated with the store through events
            const { data, error } = await supabase
                .schema("morpheus")
                .from("xcategprod")
                .select()
                .order("xcategprodintitule");

            if (error) {
                throw new Error(error.message);
            }

            return data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}
