"use client";

import { createClient } from "@/lib/client";
import { useMutation } from "@tanstack/react-query";
import { useEvents } from "./use-events";

interface useDeleteEventProps {
    eventId: number;
}

export function useDeleteEvent() {
    const supabase = createClient();
    const { refetch: refetchEvents } = useEvents();

    return useMutation({
        mutationFn: async ({ eventId }: useDeleteEventProps) => {
            try {
                const { error: eventError } = await supabase
                    .schema("morpheus")
                    .from("yevent")
                    .delete()
                    .eq("yeventid", eventId);

                if (eventError) {
                    throw new Error(`Failed to delete event: ${eventError.message}`);
                }

                return { eventId };
            } catch (error) {
                console.error("Error in deleteEvent:", error);
                throw error;
            }
        },
        onSuccess: async () => {
            // Invalidate and refetch events query
            await refetchEvents();
        },
    });
}
