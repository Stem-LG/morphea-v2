"use client";

import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

interface Event {
    yeventid: number;
    yeventintitule: string;
    yeventcode: string;
    yeventdatedeb: string;
    yeventdatefin: string;
}

export function useEvents() {
    const supabase = createClient();

    return useQuery({
        queryKey: ["events"],
        queryFn: async (): Promise<Event[]> => {
            const { data, error } = await supabase
                .schema("morpheus")
                .from("yevent")
                .select("*")
                .order("yeventdatedeb", { ascending: false });

            if (error) {
                throw new Error(error.message);
            }

            return data || [];
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useActiveEvents() {
    const supabase = createClient();

    return useQuery({
        queryKey: ["active-events"],
        queryFn: async (): Promise<Event[]> => {
            const today = new Date().toISOString().split('T')[0];

            const { data, error } = await supabase
                .schema("morpheus")
                .from("yevent")
                .select("*")
                .lte("yeventdatedeb", today)
                .gte("yeventdatefin", today)
                .order("yeventdatedeb", { ascending: false });

            if (error) {
                throw new Error(error.message);
            }

            return data || [];
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function getFirstActiveEvent(events: Event[]): Event | null {
    const today = new Date().toISOString().split('T')[0];
    
    const activeEvents = events.filter(event => 
        event.yeventdatedeb <= today && event.yeventdatefin >= today
    );
    
    return activeEvents.length > 0 ? activeEvents[0] : null;
}