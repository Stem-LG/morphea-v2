"use client";

import { createClient } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateTypebijouxParams {
    code: string;
    name: string;
}

export function useCreateTypeBijoux() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (typebijouxData: CreateTypebijouxParams) => {
            // Generate a UUID for the primary key
            const uuid = crypto.randomUUID();
            
            const { data, error } = await supabase
                .schema("morpheus")
                .from("xtypebijoux")
                .insert({
                    xtypebijouxid: uuid,
                    xtypebijouxcode: typebijouxData.code,
                    xtypebijouxintitule: typebijouxData.name,
                })
                .select("*")
                .single();

            if (error) {
                throw new Error(error.message);
            }

            return data;
        },
        onSuccess: () => {
            // Invalidate typebijoux query to refresh the list
            queryClient.invalidateQueries({ queryKey: ["typebijoux"] });
        },
    });
}