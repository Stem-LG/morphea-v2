"use client";

import { createClient } from "@/lib/client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

// Types based on the Supabase schema
type Event = {
  yeventid: number;
  yeventcode: string;
  yeventintitule: string;
  yeventdatedeb: string;
  yeventdatefin: string;
  sysdate: string | null;
  sysaction: string | null;
  sysadresseip: string | null;
  sysuser: string | null;
};

type EventDetails = {
  ydetailseventid: number;
  yeventidfk: number | null;
  ydesignidfk: number | null;
  yboutiqueidfk: number | null;
  ymallidfk: number | null;
  yprodidfk: number | null;
  sysdate: string | null;
  sysaction: string | null;
  sysadresseip: string | null;
  sysuser: string | null;
};

type EventWithDetails = Event & {
  ydetailsevent: (EventDetails & {
    ydesign?: {
      ydesignid: number;
      ydesignnom: string;
      ydesignmarque: string;
      ydesigncode: string;
    };
    yboutique?: {
      yboutiqueid: number;
      yboutiqueintitule: string | null;
      yboutiquecode: string;
    };
  })[];
  registrationCount?: number;
  assignmentCount?: number;
};

interface UseEventsFilters {
  designerId?: number | null;
  boutiqueId?: number | null;
  onlyWithRegistrations?: boolean;
  onlyActiveEvents?: boolean;
  page?: number;
  perPage?: number;
}

interface UseEventsProps extends UseEventsFilters {
  enabled?: boolean;
}

export function useEvents({
  designerId = null,
  boutiqueId = null,
  onlyWithRegistrations = false,
  onlyActiveEvents = true,
  page = 1,
  perPage = 20,
  enabled = true
}: UseEventsProps = {}) {
  const supabase = createClient();

  return useQuery({
    queryKey: [
      "events",
      designerId,
      boutiqueId,
      onlyWithRegistrations,
      onlyActiveEvents,
      page,
      perPage
    ],
    queryFn: async () => {
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;

      // Build the base query with event details and related data
      let query = supabase
        .schema("morpheus")
        .from("yevent")
        .select(`
          *,
          ydetailsevent(
            *,
            ydesign:ydesignidfk(
              ydesignid,
              ydesignnom,
              ydesignmarque,
              ydesigncode
            ),
            yboutique:yboutiqueidfk(
              yboutiqueid,
              yboutiqueintitule,
              yboutiquecode
            )
          )
        `, { count: "exact" });

      // Apply active events filter (current date within event date range)
      if (onlyActiveEvents) {
        const currentDate = new Date().toISOString().split('T')[0];
        query = query
          .lte("yeventdatedeb", currentDate)
          .gte("yeventdatefin", currentDate);
      }

      // Apply pagination
      query = query.range(from, to);

      // Order by event start date (newest first)
      query = query.order("yeventdatedeb", { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        throw new Error(error.message);
      }

      // Transform the data and apply client-side filtering
      let transformedData: EventWithDetails[] = (data || []).map(event => {
        const eventWithDetails = event as EventWithDetails;
        
        // Calculate registration records (where yprodidfk is NULL)
        const registrationCount = eventWithDetails.ydetailsevent?.filter(
          detail => detail.yprodidfk === null
        ).length || 0;
        
        // Calculate assignment records (where yprodidfk is not NULL)
        const assignmentCount = eventWithDetails.ydetailsevent?.filter(
          detail => detail.yprodidfk !== null
        ).length || 0;

        return {
          ...eventWithDetails,
          registrationCount,
          assignmentCount
        };
      });

      // Apply client-side filtering based on business rules
      transformedData = transformedData.filter(event => {
        // If no specific filters, include all events
        if (!designerId && !boutiqueId && !onlyWithRegistrations) {
          return true;
        }

        // NEW LOGIC: Check for complete registration record with matching designer, boutique, and mall
        // This ensures there's a record in ydetailsevent with same yeventidfk, ymallidfk, yboutiqueidfk, and ydesignidfk
        if (designerId !== null && boutiqueId !== null) {
          // Find registration records (yprodidfk is null) that match both designer and boutique
          const matchingRegistration = event.ydetailsevent?.find(detail =>
            detail.ydesignidfk === designerId &&
            detail.yboutiqueidfk === boutiqueId &&
            detail.yprodidfk === null // This is a registration record, not an assignment
          );

          if (!matchingRegistration) {
            // Debug logging for troubleshooting
            console.log(`Event ${event.yeventid} (${event.yeventintitule}) - No matching registration found:`, {
              designerId,
              boutiqueId,
              registrationRecords: event.ydetailsevent?.filter(d => d.yprodidfk === null).map(d => ({
                ydesignidfk: d.ydesignidfk,
                yboutiqueidfk: d.yboutiqueidfk,
                ymallidfk: d.ymallidfk,
                yprodidfk: d.yprodidfk
              }))
            });
            return false;
          }

          // Additional validation: ensure the mall ID matches
          const mallId = matchingRegistration.ymallidfk;
          if (mallId === null) {
            console.log(`Event ${event.yeventid} - Registration found but no mall ID specified`);
            return false;
          }

          console.log(`Event ${event.yeventid} (${event.yeventintitule}) - Valid registration found:`, {
            designerId,
            boutiqueId,
            mallId,
            registrationRecord: {
              ydesignidfk: matchingRegistration.ydesignidfk,
              yboutiqueidfk: matchingRegistration.yboutiqueidfk,
              ymallidfk: matchingRegistration.ymallidfk,
              yeventidfk: matchingRegistration.yeventidfk
            }
          });

          return true;
        }

        // Fallback to original logic for cases where only one filter is provided
        // Check if designer has registration records for this event
        const hasDesignerRegistration = designerId !== null ?
          event.ydetailsevent?.some(detail =>
            detail.ydesignidfk === designerId && detail.yprodidfk === null
          ) : true;
        
        // Check if boutique has registration records for this event
        const hasBoutiqueRegistration = boutiqueId !== null ?
          event.ydetailsevent?.some(detail =>
            detail.yboutiqueidfk === boutiqueId && detail.yprodidfk === null
          ) : true;
        
        // If only registration filter is applied (no designer/boutique filter)
        const hasRegistrations = onlyWithRegistrations && !designerId && !boutiqueId ?
          event.ydetailsevent?.some(detail => detail.yprodidfk === null) : true;
        
        const shouldInclude = hasDesignerRegistration && hasBoutiqueRegistration && hasRegistrations;
        
        // Debug logging for troubleshooting
        console.log(`Event ${event.yeventid} (${event.yeventintitule}) filtering (fallback logic):`, {
          designerId,
          boutiqueId,
          onlyWithRegistrations,
          hasDesignerRegistration,
          hasBoutiqueRegistration,
          hasRegistrations,
          shouldInclude
        });
        
        return shouldInclude;
      });

      const totalPages = Math.ceil((count || 0) / perPage);

      return {
        data: transformedData,
        count: count || 0,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      };
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled
  });
}

// Hook to get events for a specific designer
export function useDesignerEvents(designerId: number | null, options: Omit<UseEventsProps, 'designerId'> = {}) {
  return useEvents({
    ...options,
    designerId,
    enabled: options.enabled !== false && designerId !== null
  });
}

// Hook to get events for a specific boutique
export function useBoutiqueEvents(boutiqueId: number | null, options: Omit<UseEventsProps, 'boutiqueId'> = {}) {
  return useEvents({
    ...options,
    boutiqueId,
    enabled: options.enabled !== false && boutiqueId !== null
  });
}

// Hook to get only events with registrations
export function useEventsWithRegistrations(options: Omit<UseEventsProps, 'onlyWithRegistrations'> = {}) {
  return useEvents({
    ...options,
    onlyWithRegistrations: true
  });
}

// Hook to get a single event by ID
export function useEvent(eventId: number | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      if (!eventId) return null;

      const { data, error } = await supabase
        .schema("morpheus")
        .from("yevent")
        .select(`
          *,
          ydetailsevent(
            *,
            ydesign:ydesignidfk(
              ydesignid,
              ydesignnom,
              ydesignmarque,
              ydesigncode
            ),
            yboutique:yboutiqueidfk(
              yboutiqueid,
              yboutiqueintitule,
              yboutiquecode
            )
          )
        `)
        .eq("yeventid", eventId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Event not found
        }
        throw new Error(error.message);
      }

      const eventWithDetails = data as EventWithDetails;
      
      // Calculate registration and assignment information
      const registrationCount = eventWithDetails.ydetailsevent?.filter(
        detail => detail.yprodidfk === null
      ).length || 0;
      
      const assignmentCount = eventWithDetails.ydetailsevent?.filter(
        detail => detail.yprodidfk !== null
      ).length || 0;

      return {
        ...eventWithDetails,
        registrationCount,
        assignmentCount
      };
    },
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}