"use client";

import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

interface DashboardStats {
  totalStores: number;
  totalProducts: number;
  pendingApprovals: number;
  rejectedProducts: number;
  approvedVisibleProducts: number;
  approvedInvisibleProducts: number;
  totalVisitors: number;
  totalViews: number;
  totalScenes: number;
  averageViews: number;
  isLoading: boolean;
  error: Error | null;
}

export function useDashboardStats(): DashboardStats {
  const supabase = createClient();
  const { data: user } = useAuth();

  const userMetadata = user?.app_metadata as { roles?: string[]; assigned_stores?: number[] };
  const roles = userMetadata?.roles || [];
  const isAdmin = roles.includes("admin");
  const isStoreAdmin = roles.includes("store_admin");

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-stats", user?.id, isAdmin, isStoreAdmin],
    queryFn: async () => {
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

        // 1. Get total stores count
        let storesQuery = supabase.schema("morpheus").from("yboutique").select("*", { count: "exact", head: true });
        
        // Filter by assigned boutiques for store admins
        if (isStoreAdmin && !isAdmin && assignedBoutiqueIds.length > 0) {
          storesQuery = storesQuery.in("yboutiqueid", assignedBoutiqueIds);
        }

        const { count: totalStores, error: storesError } = await storesQuery;
        if (storesError) throw new Error(`Stores query failed: ${storesError.message}`);

        // 2. Get total products count
        let totalProducts = 0;
        let productsError: any = null;
        
        if (isStoreAdmin && !isAdmin && assignedBoutiqueIds.length > 0) {
          // For store admins, filter products through ydetailsevent table
          // First get product IDs that are assigned to their boutiques
          const { data: productIds, error: productIdsError } = await supabase
            .schema("morpheus")
            .from("ydetailsevent")
            .select("yprodidfk")
            .in("yboutiqueidfk", assignedBoutiqueIds)
            .not("yprodidfk", "is", null);

          if (productIdsError) {
            productsError = productIdsError;
          } else {
            const uniqueProductIds = [...new Set(productIds?.map(item => item.yprodidfk) || [])];
            
            if (uniqueProductIds.length > 0) {
              const { count, error } = await supabase
                .schema("morpheus")
                .from("yprod")
                .select("*", { count: "exact", head: true })
                .in("yprodid", uniqueProductIds);
              
              totalProducts = count || 0;
              productsError = error;
            }
          }
        } else {
          // For admins, get all products
          const { count, error } = await supabase
            .schema("morpheus")
            .from("yprod")
            .select("*", { count: "exact", head: true });
          
          totalProducts = count || 0;
          productsError = error;
        }
        if (productsError) throw new Error(`Products query failed: ${productsError.message}`);

        // 3. Get pending approvals count
        let pendingApprovals = 0;
        let pendingApprovalsError: any = null;

        if (isStoreAdmin && !isAdmin && assignedBoutiqueIds.length > 0) {
          // For store admins, filter pending approvals through ydetailsevent table
          // First get product IDs that are assigned to their boutiques
          const { data: productIds, error: productIdsError } = await supabase
            .schema("morpheus")
            .from("ydetailsevent")
            .select("yprodidfk")
            .in("yboutiqueidfk", assignedBoutiqueIds)
            .not("yprodidfk", "is", null);

          if (productIdsError) {
            pendingApprovalsError = productIdsError;
          } else {
            const uniqueProductIds = [...new Set(productIds?.map(item => item.yprodidfk) || [])];
            
            if (uniqueProductIds.length > 0) {
              const { count, error } = await supabase
                .schema("morpheus")
                .from("yprod")
                .select("*", { count: "exact", head: true })
                .eq("yprodstatut", "not_approved")
                .in("yprodid", uniqueProductIds);
              
              pendingApprovals = count || 0;
              pendingApprovalsError = error;
            }
          }
        } else {
          // For admins, get all pending approvals
          const { count, error } = await supabase
            .schema("morpheus")
            .from("yprod")
            .select("*", { count: "exact", head: true })
            .eq("yprodstatut", "not_approved");
          
          pendingApprovals = count || 0;
          pendingApprovalsError = error;
        }
        if (pendingApprovalsError) throw new Error(`Pending approvals query failed: ${pendingApprovalsError.message}`);

        // 4. Get rejected products count
        let rejectedProducts = 0;
        let rejectedProductsError: any = null;

        if (isStoreAdmin && !isAdmin && assignedBoutiqueIds.length > 0) {
          const { data: productIds, error: productIdsError } = await supabase
            .schema("morpheus")
            .from("ydetailsevent")
            .select("yprodidfk")
            .in("yboutiqueidfk", assignedBoutiqueIds)
            .not("yprodidfk", "is", null);

          if (productIdsError) {
            rejectedProductsError = productIdsError;
          } else {
            const uniqueProductIds = [...new Set(productIds?.map(item => item.yprodidfk) || [])];
            
            if (uniqueProductIds.length > 0) {
              const { count, error } = await supabase
                .schema("morpheus")
                .from("yprod")
                .select("*", { count: "exact", head: true })
                .eq("yprodstatut", "rejected")
                .in("yprodid", uniqueProductIds);
              
              rejectedProducts = count || 0;
              rejectedProductsError = error;
            }
          }
        } else {
          const { count, error } = await supabase
            .schema("morpheus")
            .from("yprod")
            .select("*", { count: "exact", head: true })
            .eq("yprodstatut", "rejected");
          
          rejectedProducts = count || 0;
          rejectedProductsError = error;
        }
        if (rejectedProductsError) throw new Error(`Rejected products query failed: ${rejectedProductsError.message}`);

        // 5. Get approved visible products count
        let approvedVisibleProducts = 0;
        let approvedVisibleError: any = null;

        if (isStoreAdmin && !isAdmin && assignedBoutiqueIds.length > 0) {
          const { data: productIds, error: productIdsError } = await supabase
            .schema("morpheus")
            .from("ydetailsevent")
            .select("yprodidfk")
            .in("yboutiqueidfk", assignedBoutiqueIds)
            .not("yprodidfk", "is", null);

          if (productIdsError) {
            approvedVisibleError = productIdsError;
          } else {
            const uniqueProductIds = [...new Set(productIds?.map(item => item.yprodidfk) || [])];
            
            if (uniqueProductIds.length > 0) {
              const { count, error } = await supabase
                .schema("morpheus")
                .from("yprod")
                .select("*", { count: "exact", head: true })
                .eq("yprodstatut", "approved")
                .eq("yestvisible", true)
                .in("yprodid", uniqueProductIds);
              
              approvedVisibleProducts = count || 0;
              approvedVisibleError = error;
            }
          }
        } else {
          const { count, error } = await supabase
            .schema("morpheus")
            .from("yprod")
            .select("*", { count: "exact", head: true })
            .eq("yprodstatut", "approved")
            .eq("yestvisible", true);
          
          approvedVisibleProducts = count || 0;
          approvedVisibleError = error;
        }
        if (approvedVisibleError) throw new Error(`Approved visible products query failed: ${approvedVisibleError.message}`);

        // 6. Get approved invisible products count
        let approvedInvisibleProducts = 0;
        let approvedInvisibleError: any = null;

        if (isStoreAdmin && !isAdmin && assignedBoutiqueIds.length > 0) {
          const { data: productIds, error: productIdsError } = await supabase
            .schema("morpheus")
            .from("ydetailsevent")
            .select("yprodidfk")
            .in("yboutiqueidfk", assignedBoutiqueIds)
            .not("yprodidfk", "is", null);

          if (productIdsError) {
            approvedInvisibleError = productIdsError;
          } else {
            const uniqueProductIds = [...new Set(productIds?.map(item => item.yprodidfk) || [])];
            
            if (uniqueProductIds.length > 0) {
              const { count, error } = await supabase
                .schema("morpheus")
                .from("yprod")
                .select("*", { count: "exact", head: true })
                .eq("yprodstatut", "approved")
                .eq("yestvisible", false)
                .in("yprodid", uniqueProductIds);
              
              approvedInvisibleProducts = count || 0;
              approvedInvisibleError = error;
            }
          }
        } else {
          const { count, error } = await supabase
            .schema("morpheus")
            .from("yprod")
            .select("*", { count: "exact", head: true })
            .eq("yprodstatut", "approved")
            .eq("yestvisible", false);
          
          approvedInvisibleProducts = count || 0;
          approvedInvisibleError = error;
        }
        if (approvedInvisibleError) throw new Error(`Approved invisible products query failed: ${approvedInvisibleError.message}`);

        // 7. Get total visitors count
        const visitorsQuery = supabase.schema("morpheus").from("yvisiteur").select("*", { count: "exact", head: true });
        
        // Apply same role-based filtering as other statistics if needed
        // For now, we'll get all visitors regardless of role since visitors aren't tied to specific stores
        
        const { count: totalVisitors, error: visitorsError } = await visitorsQuery;
        if (visitorsError) throw new Error(`Visitors query failed: ${visitorsError.message}`);

        // 8. Get total scenes count
        let totalScenes = 0;
        let scenesError: any = null;

        if (isStoreAdmin && !isAdmin && assignedBoutiqueIds.length > 0) {
          const { count, error } = await supabase
            .schema("morpheus")
            .from("yscenes")
            .select("*", { count: "exact", head: true })
            .in("yboutiqueidfk", assignedBoutiqueIds);
          
          totalScenes = count || 0;
          scenesError = error;
        } else {
          const { count, error } = await supabase
            .schema("morpheus")
            .from("yscenes")
            .select("*", { count: "exact", head: true });
          
          totalScenes = count || 0;
          scenesError = error;
        }
        if (scenesError) throw new Error(`Scenes query failed: ${scenesError.message}`);

        // 9. Get total views (sum of ynombrevu from scenes)
        let totalViews = 0;
        let viewsError: any = null;

        if (isStoreAdmin && !isAdmin && assignedBoutiqueIds.length > 0) {
          const { data, error } = await supabase
            .schema("morpheus")
            .from("yscenes")
            .select("ynombrevu")
            .in("yboutiqueidfk", assignedBoutiqueIds);
          
          if (error) {
            viewsError = error;
          } else {
            totalViews = data?.reduce((sum, scene) => sum + (scene.ynombrevu || 0), 0) || 0;
          }
        } else {
          const { data, error } = await supabase
            .schema("morpheus")
            .from("yscenes")
            .select("ynombrevu");
          
          if (error) {
            viewsError = error;
          } else {
            totalViews = data?.reduce((sum, scene) => sum + (scene.ynombrevu || 0), 0) || 0;
          }
        }
        if (viewsError) throw new Error(`Views query failed: ${viewsError.message}`);

        // 10. Calculate average views per scene
        const averageViews = totalScenes > 0 ? Math.round(totalViews / totalScenes * 100) / 100 : 0;

        return {
          totalStores: totalStores || 0,
          totalProducts,
          pendingApprovals,
          rejectedProducts,
          approvedVisibleProducts,
          approvedInvisibleProducts,
          totalVisitors: totalVisitors || 0,
          totalViews,
          totalScenes,
          averageViews,
        };
      } catch (err) {
        console.error("Dashboard stats query error:", err);
        throw err;
      }
    },
    enabled: !!user?.id, // Only run query when user is authenticated
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  return {
    totalStores: data?.totalStores || 0,
    totalProducts: data?.totalProducts || 0,
    pendingApprovals: data?.pendingApprovals || 0,
    rejectedProducts: data?.rejectedProducts || 0,
    approvedVisibleProducts: data?.approvedVisibleProducts || 0,
    approvedInvisibleProducts: data?.approvedInvisibleProducts || 0,
    totalVisitors: data?.totalVisitors || 0,
    totalViews: data?.totalViews || 0,
    totalScenes: data?.totalScenes || 0,
    averageViews: data?.averageViews || 0,
    isLoading,
    error: error as Error | null,
  };
}