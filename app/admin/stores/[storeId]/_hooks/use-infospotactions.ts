"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/client";

interface UseInfospotactionsParams {
    boutiqueId?: number;
    enabled?: boolean;
}

export function useInfospotactions({ boutiqueId, enabled = true }: UseInfospotactionsParams) {
    const supabase = createClient();

    return useQuery({
        queryKey: ["infospotactions", boutiqueId],
        queryFn: async () => {
            if (!boutiqueId) return [];

            // Since yboutiqueidfk moved from yinfospotactions to yscenes,
            // we need to get actions through scenes -> infospots -> actions
            const { data, error } = await supabase
                .schema("morpheus")
                .from("yscenes")
                .select(`
                    yinfospots (
                        yinfospotactions (*)
                    )
                `)
                .eq("yboutiqueidfk", boutiqueId);

            if (error) {
                console.error("Error fetching infospotactions:", error);
                throw new Error(error.message);
            }

            // Flatten the nested structure to get unique actions
            const actions = new Map();
            data?.forEach(scene => {
                scene.yinfospots?.forEach((infospot: any) => {
                    if (infospot.yinfospotactions) {
                        actions.set(infospot.yinfospotactions.yinfospotactionsid, infospot.yinfospotactions);
                    }
                });
            });

            // Convert to array and sort by title
            const actionsArray = Array.from(actions.values()).sort((a: any, b: any) =>
                (a.yinfospotactionstitle || '').localeCompare(b.yinfospotactionstitle || '')
            );

            return actionsArray;
        },
        enabled: enabled && !!boutiqueId,
    });
}