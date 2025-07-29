"use client";

import { createClient } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateColorParams {
    code: string;
    name: string;
    hexColor: string;
    rgbColor: string;
}

export function useCreateColor() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (colorData: CreateColorParams) => {
            const { data, error } = await supabase
                .schema("morpheus")
                .from("xcouleur")
                .insert({
                    xcouleurcode: colorData.code,
                    xcouleurintitule: colorData.name,
                    xcouleurhexa: colorData.hexColor,
                    xcouleurrvb: colorData.rgbColor,
                })
                .select("*")
                .single();

            if (error) {
                throw new Error(error.message);
            }

            return data;
        },
        onSuccess: () => {
            // Invalidate colors query to refresh the list
            queryClient.invalidateQueries({ queryKey: ["colors"] });
        },
    });
}