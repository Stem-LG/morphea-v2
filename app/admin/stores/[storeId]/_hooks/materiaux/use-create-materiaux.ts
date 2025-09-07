"use client";

import { createClient } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateMateriauxParams {
    code: string;
    name: string;
}

export function useCreateMateriaux() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (materiauxData: CreateMateriauxParams) => {
            // Generate a UUID for the primary key
            const uuid = crypto.randomUUID();
            
            const { data, error } = await supabase
                .schema("morpheus")
                .from("xmateriaux")
                .insert({
                    xmateriauxid: uuid,
                    xmateriauxcode: materiauxData.code,
                    xmateriauxintitule: materiauxData.name,
                })
                .select("*")
                .single();

            if (error) {
                throw new Error(error.message);
            }

            return data;
        },
        onSuccess: () => {
            // Invalidate materiaux query to refresh the list
            queryClient.invalidateQueries({ queryKey: ["materiaux"] });
        },
    });
}