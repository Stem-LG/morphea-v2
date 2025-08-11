"use client";

import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

interface Store {
  yboutiqueid: number;
  yboutiqueintitule: string;
  yboutiqueadressemall?: string;
  ymallidfk?: number;
  // For admin view - designer info
  designer_name?: string;
  designer_contact?: string;
}

interface FilteredStoresParams {
  eventId?: number;
  mallId?: number;
  userRole?: string;
  userId?: string;
}

export function useFilteredStores({ eventId, mallId, userRole, userId }: FilteredStoresParams) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["filtered-stores", eventId, mallId, userRole, userId],
    queryFn: async (): Promise<Store[]> => {
      if (!userId) return [];

      const isAdmin = userRole === "admin";
      const isStoreAdmin = userRole === "store_admin";

      if (isAdmin) {
        // Admin can see all stores, with optional filtering by event/mall
        let query = supabase
          .schema("morpheus")
          .from("yboutique")
          .select(`
                        *,
                        ymall:ymallidfk (
                            ymallintitule
                        )
                    `);

        // If mall filter is applied
        if (mallId) {
          query = query.eq("ymallidfk", mallId);
        }

        const { data: storesData, error } = await query.order("yboutiqueintitule");

        let stores = storesData || [];

        if (error) {
          throw new Error(error.message);
        }

        if (!stores) return [];

        // If event filter is applied, get designer assignments for this event
        if (eventId) {
          const { data: assignments, error: assignmentError } = await supabase
            .schema("morpheus")
            .from("ydetailsevent")
            .select(`
                            yboutiqueidfk,
                            ydesign:ydesignidfk (
                                ydesignnom,
                                ydesigncontactemail
                            )
                        `)
            .eq("yeventidfk", eventId)
            .not("yboutiqueidfk", "is", null)
            .not("ydesignidfk", "is", null);

          if (!assignmentError && assignments) {
            // Create a map of boutique ID to designer info
            const designerMap = new Map();
            assignments.forEach(assignment => {
              if (assignment.yboutiqueidfk && assignment.ydesign) {
                designerMap.set(assignment.yboutiqueidfk, {
                  designer_name: (assignment.ydesign as any).ydesignnom,
                  designer_contact: (assignment.ydesign as any).ydesigncontactemail
                });
              }
            });

            // Add designer info to stores
            stores = stores.map(store => ({
              ...store,
              designer_name: designerMap.get(store.yboutiqueid)?.designer_name,
              designer_contact: designerMap.get(store.yboutiqueid)?.designer_contact
            }));
          }
        }

        return stores;
      }

      if (isStoreAdmin) {
        // Store admin can only see assigned stores for the selected event
        if (!eventId) return [];

        // First, find the user's design ID
        const { data: designData, error: designError } = await supabase
          .schema("morpheus")
          .from("ydesign")
          .select("ydesignid")
          .eq("yuseridfk", userId)
          .single();

        if (designError || !designData) {
          console.error("Error fetching user design:", designError);
          return [];
        }

        // Find assigned boutiques for this event and designer
        let detailsQuery = supabase
          .schema("morpheus")
          .from("ydetailsevent")
          .select("yboutiqueidfk, ymallidfk")
          .eq("yeventidfk", eventId)
          .eq("ydesignidfk", designData.ydesignid)
          .not("yboutiqueidfk", "is", null);

        // If mall filter is applied
        if (mallId) {
          detailsQuery = detailsQuery.eq("ymallidfk", mallId);
        }

        const { data: detailsEventData, error: detailsError } = await detailsQuery;

        if (detailsError) {
          console.error("Error fetching event details:", detailsError);
          return [];
        }

        if (!detailsEventData || detailsEventData.length === 0) {
          return [];
        }

        const storeIds = detailsEventData.map(detail => detail.yboutiqueidfk);

        // Fetch the actual store data
        const { data: storesData, error: storesError } = await supabase
          .schema("morpheus")
          .from("yboutique")
          .select(`
                        *,
                        ymall:ymallidfk (
                            ymallintitule
                        )
                    `)
          .in("yboutiqueid", storeIds)
          .order("yboutiqueintitule");

        if (storesError) {
          console.error("Error fetching filtered stores:", storesError);
          return [];
        }

        return storesData || [];
      }

      // For other roles, return empty array
      return [];
    },
    enabled: !!userId && (!!eventId || userRole === "admin"), // Only run if we have userId and either eventId or user is admin
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}