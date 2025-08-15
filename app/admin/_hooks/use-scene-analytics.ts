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
  const isStoreAdmin = roles.includes("store_admin");

  return useQuery({
    queryKey: ["scene-analytics", user?.id, boutiqueId, sceneId, isAdmin, isStoreAdmin],
    queryFn: async (): Promise<{
      data: SceneAnalyticsData[];
      stats: SceneAnalyticsStats;
    }> => {
      try {
        // Get assigned boutique IDs for store admins
        let assignedBoutiqueIds: number[] = [];
        
        if (isStoreAdmin && !isAdmin) {
          // Find the user's design ID
          const { data: designData, error: designError } = await supabase
            .schema("morpheus")
            .from("ydesign")
            .select("ydesignid")
            .eq("yuseridfk", user?.id)
            .single();

          if (designError || !designData) {
            console.error("Error fetching user design:", designError);
            throw new Error("Unable to fetch designer information");
          }

          // Find assigned boutiques for this designer across all events
          const { data: detailsEventData, error: detailsError } = await supabase
            .schema("morpheus")
            .from("ydetailsevent")
            .select("yboutiqueidfk")
            .eq("ydesignidfk", designData.ydesignid)
            .not("yboutiqueidfk", "is", null);

          if (detailsError) {
            console.error("Error fetching event details:", detailsError);
            throw new Error("Unable to fetch assigned boutiques");
          }

          assignedBoutiqueIds = [...new Set(detailsEventData?.map(detail => detail.yboutiqueidfk) || [])];
        }

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
        if (isStoreAdmin && !isAdmin && assignedBoutiqueIds.length > 0) {
          query = query.in("yboutiqueidfk", assignedBoutiqueIds);
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
  const isStoreAdmin = roles.includes("store_admin");

  return useQuery({
    queryKey: ["scene-options", user?.id, isAdmin, isStoreAdmin],
    queryFn: async () => {
      // Get assigned boutique IDs for store admins
      let assignedBoutiqueIds: number[] = [];
      
      if (isStoreAdmin && !isAdmin) {
        // Find the user's design ID
        const { data: designData, error: designError } = await supabase
          .schema("morpheus")
          .from("ydesign")
          .select("ydesignid")
          .eq("yuseridfk", user?.id)
          .single();

        if (designError || !designData) {
          console.error("Error fetching user design:", designError);
          throw new Error("Unable to fetch designer information");
        }

        // Find assigned boutiques for this designer across all events
        const { data: detailsEventData, error: detailsError } = await supabase
          .schema("morpheus")
          .from("ydetailsevent")
          .select("yboutiqueidfk")
          .eq("ydesignidfk", designData.ydesignid)
          .not("yboutiqueidfk", "is", null);

        if (detailsError) {
          console.error("Error fetching event details:", detailsError);
          throw new Error("Unable to fetch assigned boutiques");
        }

        assignedBoutiqueIds = [...new Set(detailsEventData?.map(detail => detail.yboutiqueidfk) || [])];
      }

      let query = supabase
        .schema("morpheus")
        .from("yscenes")
        .select("yscenesid, yscenesname, yboutiqueidfk")
        .order("yscenesname", { ascending: true });

      // Apply role-based filtering for store admins
      if (isStoreAdmin && !isAdmin && assignedBoutiqueIds.length > 0) {
        query = query.in("yboutiqueidfk", assignedBoutiqueIds);
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
  const isStoreAdmin = roles.includes("store_admin");

  return useQuery({
    queryKey: ["boutique-options", user?.id, isAdmin, isStoreAdmin],
    queryFn: async () => {
      // Get assigned boutique IDs for store admins
      let assignedBoutiqueIds: number[] = [];
      
      if (isStoreAdmin && !isAdmin) {
        // Find the user's design ID
        const { data: designData, error: designError } = await supabase
          .schema("morpheus")
          .from("ydesign")
          .select("ydesignid")
          .eq("yuseridfk", user?.id)
          .single();

        if (designError || !designData) {
          console.error("Error fetching user design:", designError);
          throw new Error("Unable to fetch designer information");
        }

        // Find assigned boutiques for this designer across all events
        const { data: detailsEventData, error: detailsError } = await supabase
          .schema("morpheus")
          .from("ydetailsevent")
          .select("yboutiqueidfk")
          .eq("ydesignidfk", designData.ydesignid)
          .not("yboutiqueidfk", "is", null);

        if (detailsError) {
          console.error("Error fetching event details:", detailsError);
          throw new Error("Unable to fetch assigned boutiques");
        }

        assignedBoutiqueIds = [...new Set(detailsEventData?.map(detail => detail.yboutiqueidfk) || [])];
      }

      let query = supabase
        .schema("morpheus")
        .from("yboutique")
        .select("yboutiqueid, yboutiqueintitule")
        .order("yboutiqueintitule", { ascending: true });

      // Apply role-based filtering for store admins
      if (isStoreAdmin && !isAdmin && assignedBoutiqueIds.length > 0) {
        query = query.in("yboutiqueid", assignedBoutiqueIds);
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