"use client"

import { createClient } from "@/lib/client"
import { useQuery } from "@tanstack/react-query"

export function useStores() {

    const supabase = createClient()

    return useQuery({
        queryKey: ["stores"],
        queryFn: async () => {
            const { data, error } = await supabase.schema("morpheus").from("yboutique").select("*");

            if (error) {
                return null;
            }

            return data;
        }
    })

}