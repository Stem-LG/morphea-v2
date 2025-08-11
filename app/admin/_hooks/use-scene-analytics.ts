"use client";

import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";


export interface SceneAnalyticsData {
  sceneId: number;
  sceneName: string;
  views: number;
  boutiqueId: number | null;
  boutiqueName: string | null;
}

export interface SceneAnalyticsStats {
  totalViews: number;
  totalScenes: number;
  averageViewsPerScene: number;
  topScenes: SceneAnalyticsData[];
  viewsByBoutique: Array<{
    boutiqueId: number;
    boutiqueName: string;
    totalViews: number;
    sceneCount: number;
  }>;
}

export interface UseSceneAnalyticsOptions {
  boutiqueId?: number;
  sceneId?: number;
}

export function useSceneAnalytics(options: UseSceneAnalyticsOptions = {}) {
  const supabase = createClient();
  const { data: user } = useAuth();
  
  const { boutiqueId, sceneId } = options;

  const userMetadata = user?.app_metadata as { roles?: string[]; assigned_stores?: number[] };
  const roles = userMetadata?.roles || [];
  const isAdmin = roles.includes("admin");
  const assignedStores = userMetadata?.assigned_stores || [];

  return useQuery({
    queryKey: ["scene-analytics", user?.id, boutiqueId, sceneId, isAdmin, assignedStores],
    queryFn: async (): Promise<{
      data: SceneAnalyticsData[];
      stats: SceneAnalyticsStats;
    }> => {
      try {
        // Build the base query with joins
        let query = supabase
          .schema("morpheus")
          .from("yscenes")
          .select(`
            yscenesid,
            yscenesname,
            ynombrevu,
            yboutiqueidfk,
            yboutique:yboutiqueidfk (
              yboutiqueid,
              yboutiqueintitule
            )
          `);

        // Apply filters based on options
        if (sceneId) {
          query = query.eq("yscenesid", sceneId);
        }

        if (boutiqueId) {
          query = query.eq("yboutiqueidfk", boutiqueId);
        }

        // Apply role-based filtering for store admins
        if (!isAdmin && assignedStores.length > 0) {
          query = query.in("yboutiqueidfk", assignedStores);
        }

        // Order by views descending
        query = query.order("ynombrevu", { ascending: false });

        const { data: scenes, error } = await query;

        if (error) {
          throw new Error(`Failed to fetch scene analytics: ${error.message}`);
        }

        if (!scenes) {
          throw new Error("No scene data returned");
        }

        // Transform the data
        const analyticsData: SceneAnalyticsData[] = scenes.map((scene: any) => ({
          sceneId: scene.yscenesid,
          sceneName: scene.yscenesname,
          views: scene.ynombrevu || 0,
          boutiqueId: scene.yboutiqueidfk,
          boutiqueName: scene.yboutique?.yboutiqueintitule || null,
        }));

        // Calculate statistics
        const totalViews = analyticsData.reduce((sum, scene) => sum + scene.views, 0);
        const totalScenes = analyticsData.length;
        const averageViewsPerScene = totalScenes > 0 ? totalViews / totalScenes : 0;
        const topScenes = analyticsData.slice(0, 10); // Show top 10 scenes

        // Group by boutique for boutique statistics
        const boutiqueMap = new Map<number, {
          boutiqueId: number;
          boutiqueName: string;
          totalViews: number;
          sceneCount: number;
        }>();

        analyticsData.forEach((scene) => {
          if (scene.boutiqueId && scene.boutiqueName) {
            const existing = boutiqueMap.get(scene.boutiqueId);
            if (existing) {
              existing.totalViews += scene.views;
              existing.sceneCount += 1;
            } else {
              boutiqueMap.set(scene.boutiqueId, {
                boutiqueId: scene.boutiqueId,
                boutiqueName: scene.boutiqueName,
                totalViews: scene.views,
                sceneCount: 1,
              });
            }
          }
        });

        const viewsByBoutique = Array.from(boutiqueMap.values())
          .sort((a, b) => b.totalViews - a.totalViews);

        const stats: SceneAnalyticsStats = {
          totalViews,
          totalScenes,
          averageViewsPerScene,
          topScenes,
          viewsByBoutique,
        };

        return {
          data: analyticsData,
          stats,
        };
      } catch (err) {
        console.error("Scene analytics query error:", err);
        throw err;
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
}

// Hook for getting scene options for filters
export function useSceneOptions() {
  const supabase = createClient();
  const { data: user } = useAuth();

  const userMetadata = user?.app_metadata as { roles?: string[]; assigned_stores?: number[] };
  const roles = userMetadata?.roles || [];
  const isAdmin = roles.includes("admin");
  const assignedStores = userMetadata?.assigned_stores || [];

  return useQuery({
    queryKey: ["scene-options", user?.id, isAdmin, assignedStores],
    queryFn: async () => {
      let query = supabase
        .schema("morpheus")
        .from("yscenes")
        .select("yscenesid, yscenesname, yboutiqueidfk")
        .order("yscenesname", { ascending: true });

      // Apply role-based filtering for store admins
      if (!isAdmin && assignedStores.length > 0) {
        query = query.in("yboutiqueidfk", assignedStores);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch scene options: ${error.message}`);
      }

      return data?.map((scene: any) => ({
        value: scene.yscenesid,
        label: scene.yscenesname,
        boutiqueId: scene.yboutiqueidfk,
      })) || [];
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for getting boutique options for filters
export function useBoutiqueOptions() {
  const supabase = createClient();
  const { data: user } = useAuth();

  const userMetadata = user?.app_metadata as { roles?: string[]; assigned_stores?: number[] };
  const roles = userMetadata?.roles || [];
  const isAdmin = roles.includes("admin");
  const assignedStores = userMetadata?.assigned_stores || [];

  return useQuery({
    queryKey: ["boutique-options", user?.id, isAdmin, assignedStores],
    queryFn: async () => {
      let query = supabase
        .schema("morpheus")
        .from("yboutique")
        .select("yboutiqueid, yboutiqueintitule")
        .order("yboutiqueintitule", { ascending: true });

      // Apply role-based filtering for store admins
      if (!isAdmin && assignedStores.length > 0) {
        query = query.in("yboutiqueid", assignedStores);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch boutique options: ${error.message}`);
      }

      return data?.map((boutique: any) => ({
        value: boutique.yboutiqueid,
        label: boutique.yboutiqueintitule || `Boutique ${boutique.yboutiqueid}`,
      })) || [];
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}