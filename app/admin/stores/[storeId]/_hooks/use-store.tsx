"use client";

import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

interface useStoreProps {
    storeId: number;
}

export function useStore({ storeId }: useStoreProps) {
    const supabase = createClient();

    return useQuery({
        queryKey: ["store", storeId],
        queryFn: async () => {
            const { data, error } = await supabase
                .schema("morpheus")
                .from("yboutique")
                .select("*")
                .eq("yboutiqueid", storeId);

            if (error) {
                return null;
            }

            return data;
        },
    });
}