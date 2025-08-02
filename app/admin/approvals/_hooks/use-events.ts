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

      // Apply designer filter if provided
      if (designerId !== null) {
        query = query.eq("ydetailsevent.ydesignidfk", designerId);
      }

      // Apply boutique filter if provided
      if (boutiqueId !== null) {
        query = query.eq("ydetailsevent.yboutiqueidfk", boutiqueId);
      }

      // Apply pagination
      query = query.range(from, to);

      // Order by event start date (newest first)
      query = query.order("yeventdatedeb", { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        throw new Error(error.message);
      }

      // Transform the data to include registration and assignment information
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

      // Apply registration filter if requested
      if (onlyWithRegistrations) {
        transformedData = transformedData.filter(event =>
          (event.registrationCount || 0) > 0
        );
      }

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