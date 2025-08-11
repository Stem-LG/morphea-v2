"use client";

import { createClient } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/lib/supabase";

type SceneRow = Database['morpheus']['Tables']['yscenes']['Row'];

export function useIncrementSceneView() {
    const queryClient = useQueryClient();
    const supabase = createClient();

    return useMutation({
        mutationFn: async (sceneId: number) => {
            const currentTime = new Date().toISOString();
            
            // First, get the current scene to check the current view count
            const { data: currentScene, error: fetchError } = await supabase
                .schema("morpheus")
                .from("yscenes")
                .select("ynombrevu")
                .eq("yscenesid", sceneId)
                .single();

            if (fetchError) {
                throw new Error(`Failed to fetch scene: ${fetchError.message}`);
            }

            // Calculate the new view count (handle null case for first view)
            const newViewCount = (currentScene.ynombrevu || 0) + 1;

            // Update the scene with incremented view count
            const { data, error } = await supabase
                .schema("morpheus")
                .from("yscenes")
                .update({
                    ynombrevu: newViewCount,
                    sysdate: currentTime,
                    sysaction: 'update',
                    sysuser: 'system', // Using 'system' for automated view tracking
                })
                .eq("yscenesid", sceneId)
                .select()
                .single();

            if (error) {
                throw new Error(`Failed to increment scene view count: ${error.message}`);
            }

            return data as SceneRow;
        },
        onSuccess: (data) => {
            // Invalidate relevant queries that might depend on scene data
            queryClient.invalidateQueries({ queryKey: ['scenes'] });
            queryClient.invalidateQueries({ queryKey: ['scene', data.yscenesid] });
            queryClient.invalidateQueries({ queryKey: ['sceneStats'] });
        },
        onError: (error) => {
            console.error("Error incrementing scene view count:", error);
        }
    });
}