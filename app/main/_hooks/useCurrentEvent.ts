import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

export function useCurrentEvent() {
    const supabase = createClient();

    return useQuery({
        queryKey: ['currentEvent'],
        queryFn: async () => {
            // Get the current active event (the one that's currently running)
            const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
            
            const { data, error } = await supabase
                .schema("morpheus")
                .from("yevent")
                .select("*")
                .lte("yeventdatedeb", currentDate) // Event has started
                .gte("yeventdatefin", currentDate) // Event hasn't ended
                .order("yeventdatedeb", { ascending: false })
                .limit(1)
                .single();

            if (error) {
                console.error("Error fetching current event:", error);
                // If no current event found, get the most recent event as fallback
                const { data: fallbackData, error: fallbackError } = await supabase
                    .schema("morpheus")
                    .from("yevent")
                    .select("*")
                    .order("yeventdatedeb", { ascending: false })
                    .limit(1)
                    .single();
                
                if (fallbackError) {
                    console.error("Error fetching fallback event:", fallbackError);
                    return null;
                }
                
                return fallbackData;
            }

            return data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
}