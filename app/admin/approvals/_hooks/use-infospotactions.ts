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
            // Only get actions from scenes that belong to the specific boutique
            const { data, error } = await supabase
                .schema("morpheus")
                .from("yscenes")
                .select(`
                    yscenesid,
                    yscenesname,
                    yboutiqueidfk,
                    yinfospots (
                        yinfospotsid,
                        yinfospotstitle,
                        yinfospotactions (
                            yinfospotactionsid,
                            yinfospotactionstitle,
                            yinfospotactionstype,
                            yinfospotactionsdescription
                        )
                    )
                `)
                .eq("yboutiqueidfk", boutiqueId);

            if (error) {
                console.error("Error fetching infospotactions:", error);
                throw new Error(error.message);
            }

            // Flatten the nested structure to get unique actions
            // Only include actions from scenes that have the matching boutique ID
            const actions = new Map();
            data?.forEach(scene => {
                // Double-check that this scene belongs to the correct boutique
                if (scene.yboutiqueidfk === boutiqueId) {
                    scene.yinfospots?.forEach((infospot: any) => {
                        if (infospot.yinfospotactions) {
                            // Add scene context to the action for better identification
                            const actionWithContext = {
                                ...infospot.yinfospotactions,
                                _sceneId: scene.yscenesid,
                                _sceneName: scene.yscenesname,
                                _infospotId: infospot.yinfospotsid,
                                _infospotTitle: infospot.yinfospotstitle
                            };
                            actions.set(infospot.yinfospotactions.yinfospotactionsid, actionWithContext);
                        }
                    });
                }
            });

            // Convert to array and sort by scene name, then by action title
            const actionsArray = Array.from(actions.values()).sort((a: any, b: any) => {
                // First sort by scene name
                const sceneCompare = (a._sceneName || '').localeCompare(b._sceneName || '');
                if (sceneCompare !== 0) return sceneCompare;
                
                // Then by action title
                return (a.yinfospotactionstitle || '').localeCompare(b.yinfospotactionstitle || '');
            });

            return actionsArray;
        },
        enabled: enabled && !!boutiqueId,
    });
}