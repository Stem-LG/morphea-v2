"use client";

import { createClient } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateSizeParams {
    code: string;
    name: string;
    eur?: string;
    us?: string;
    x?: string;
}

export function useCreateSize() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (sizeData: CreateSizeParams) => {
            const { data, error } = await supabase
                .schema("morpheus")
                .from("xtaille")
                .insert({
                    xtaillecode: sizeData.code,
                    xtailleintitule: sizeData.name,
                    xtailleeur: sizeData.eur || null,
                    xtailleus: sizeData.us || null,
                    xtaillex: sizeData.x || null,
                })
                .select("*")
                .single();

            if (error) {
                throw new Error(error.message);
            }

            return data;
        },
        onSuccess: () => {
            // Invalidate sizes query to refresh the list
            queryClient.invalidateQueries({ queryKey: ["sizes"] });
        },
    });
}