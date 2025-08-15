"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase";

const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function useFilterOptions() {
    // Fetch events
    const { data: events = [], isLoading: eventsLoading } = useQuery({
        queryKey: ['filter-events'],
        queryFn: async () => {
            const { data, error } = await supabase
                .schema('morpheus')
                .from('yevent')
                .select('yeventid, yeventintitule')
                .order('yeventintitule');
            
            if (error) throw error;
            return data || [];
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
    });

    // Fetch malls
    const { data: malls = [], isLoading: mallsLoading } = useQuery({
        queryKey: ['filter-malls'],
        queryFn: async () => {
            const { data, error } = await supabase
                .schema('morpheus')
                .from('ymall')
                .select('ymallid, ymallintitule')
                .order('ymallintitule');
            
            if (error) throw error;
            return data || [];
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
    });

    // Fetch boutiques
    const { data: boutiques = [], isLoading: boutiquesLoading } = useQuery({
        queryKey: ['filter-boutiques'],
        queryFn: async () => {
            const { data, error } = await supabase
                .schema('morpheus')
                .from('yboutique')
                .select('yboutiqueid, yboutiqueintitule')
                .order('yboutiqueintitule');
            
            if (error) throw error;
            return data || [];
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
    });

    // Fetch categories
    const { data: categories = [], isLoading: categoriesLoading } = useQuery({
        queryKey: ['filter-categories'],
        queryFn: async () => {
            const { data, error } = await supabase
                .schema('morpheus')
                .from('xcategprod')
                .select('xcategprodid, xcategprodintitule')
                .order('xcategprodintitule');
            
            if (error) throw error;
            return data || [];
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
    });

    return {
        events: events as any[],
        malls: malls as any[],
        boutiques: boutiques as any[],
        categories: categories as any[],
        isLoading: eventsLoading || mallsLoading || boutiquesLoading || categoriesLoading,
    };
}