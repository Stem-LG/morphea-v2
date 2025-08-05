"use client"

import { createClient } from "@/lib/client"
import { useQuery } from "@tanstack/react-query"

export function useStores() {

    const supabase = createClient()

    return useQuery({
        queryKey: ["stores"],
        queryFn: async () => {
            // Get current user
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            
            if (userError || !user) {
                console.error("Error getting user:", userError);
                return null;
            }

            const isAdmin = user?.app_metadata?.roles?.includes("admin");
            const isStoreAdmin = user?.app_metadata?.roles?.includes("store_admin");

            // If user is admin, return all stores
            if (isAdmin) {
                const { data, error } = await supabase.schema("morpheus").from("yboutique").select("*");
                
                if (error) {
                    console.error("Error fetching all stores:", error);
                    return null;
                }
                
                return data;
            }

            // If user is store_admin, filter stores based on current events and user's design
            if (isStoreAdmin) {
                const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

                // First, find the user's design ID
                const { data: designData, error: designError } = await supabase
                    .schema("morpheus")
                    .from("ydesign")
                    .select("ydesignid")
                    .eq("yuseridfk", user.id)
                    .single();

                if (designError || !designData) {
                    console.error("Error fetching user design:", designError);
                    return [];
                }

                // Find current active events (where today is between yeventdatedeb and yeventdatefin)
                const { data: eventData, error: eventError } = await supabase
                    .schema("morpheus")
                    .from("yevent")
                    .select("yeventid")
                    .lte("yeventdatedeb", today)
                    .gte("yeventdatefin", today);

                if (eventError) {
                    console.error("Error fetching active events:", eventError);
                    return [];
                }

                if (!eventData || eventData.length === 0) {
                    // No active events, return empty array
                    return [];
                }

                const activeEventIds = eventData.map(event => event.yeventid);

                // Find store IDs from ydetailsevent where:
                // - yeventidfk is in active events
                // - ydesignidfk matches user's design
                const { data: detailsEventData, error: detailsError } = await supabase
                    .schema("morpheus")
                    .from("ydetailsevent")
                    .select("yboutiqueidfk")
                    .in("yeventidfk", activeEventIds)
                    .eq("ydesignidfk", designData.ydesignid)
                    .not("yboutiqueidfk", "is", null);

                if (detailsError) {
                    console.error("Error fetching event details:", detailsError);
                    return [];
                }

                if (!detailsEventData || detailsEventData.length === 0) {
                    // No stores assigned to this user for active events
                    return [];
                }

                const storeIds = detailsEventData.map(detail => detail.yboutiqueidfk);

                // Finally, fetch the actual store data
                const { data: storesData, error: storesError } = await supabase
                    .schema("morpheus")
                    .from("yboutique")
                    .select("*")
                    .in("yboutiqueid", storeIds);

                if (storesError) {
                    console.error("Error fetching filtered stores:", storesError);
                    return [];
                }

                return storesData;
            }

            // For other roles, return empty array
            return [];
        }
    })

}