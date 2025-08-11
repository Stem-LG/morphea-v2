"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/client";

interface UseInfospotactionsParams {
    boutiqueId?: number;
    enabled?: boolean;
}

export function useInfospotactions({ boutiqueId, enabled = true }: UseInfospotactionsParams) {
    const supabase = createClient();

    console.log("useInfospotactions called with:", { boutiqueId, enabled });

    return useQuery({
        queryKey: ["infospotactions", boutiqueId],
        queryFn: async () => {
            console.log("useInfospotactions queryFn executing with boutiqueId:", boutiqueId);
            
            if (!boutiqueId) {
                console.log("No boutiqueId provided, fetching all available infospotactions as fallback");
                
                // Fallback: Get all infospotactions from all scenes
                const { data, error } = await supabase
                    .schema("morpheus")
                    .from("yinfospotactions")
                    .select("*")
                    .order("yinfospotactionstitle");

                console.log("Fallback infospotactions query result:", { data, error });

                if (error) {
                    console.error("Error fetching fallback infospotactions:", error);
                    throw new Error(error.message);
                }

                console.log("Final fallback infospot actions:", data || []);
                return data || [];
            }

            // Since yboutiqueidfk moved from yinfospotactions to yscenes,
            // we need to get actions through scenes -> infospots -> actions
            console.log("Fetching scenes for boutiqueId:", boutiqueId);
            const { data, error } = await supabase
                .schema("morpheus")
                .from("yscenes")
                .select(`
                    yinfospots (
                        yinfospotactions (*)
                    )
                `)
                .eq("yboutiqueidfk", boutiqueId);

            console.log("Scenes query result:", { data, error, boutiqueId });

            if (error) {
                console.error("Error fetching infospotactions:", error);
                throw new Error(error.message);
            }

            // Flatten the nested structure to get unique actions
            const actions = new Map();
            data?.forEach(scene => {
                console.log("Processing scene:", scene);
                scene.yinfospots?.forEach((infospot: any) => {
                    console.log("Processing infospot:", infospot);
                    if (infospot.yinfospotactions) {
                        console.log("Found infospot action:", infospot.yinfospotactions);
                        actions.set(infospot.yinfospotactions.yinfospotactionsid, infospot.yinfospotactions);
                    }
                });
            });

            // Convert to array and sort by title
            const actionsArray = Array.from(actions.values()).sort((a: any, b: any) =>
                (a.yinfospotactionstitle || '').localeCompare(b.yinfospotactionstitle || '')
            );

            console.log("Final infospot actions for boutique", boutiqueId, ":", actionsArray);

            return actionsArray;
        },
        enabled: enabled,
    });
}