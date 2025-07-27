"use client";

import { createClient } from "@/lib/client";
import { useMutation } from "@tanstack/react-query";

interface useCreateEventProps {
    code?: string;
    name: string;
    startDate: string;
    endDate: string;
    mediaId?: number;
}

export function useCreateEvent() {
    const supabase = createClient();

    return useMutation({
        mutationFn: async (event: useCreateEventProps) => {
            const code = event.code || Date.now().toString();

            const { data, error } = await supabase.schema("morpheus").from("yevent").insert({
                yeventcode: code,
                yeventintitule: event.name,
                yeventdatedeb: event.startDate,
                yeventdatefin: event.endDate,
                ymediaidfk: event.mediaId,
            });

            if (error) {
                throw new Error(error.message || error.code);
            }

            return data;
        },
    });
}
