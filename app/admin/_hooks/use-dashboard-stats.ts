"use client";

import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

interface DashboardStats {
  totalStores: number;
  totalProducts: number;
  pendingApprovals: number;
  totalVisitors: number;
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

        // 4. Get total visitors count
        const visitorsQuery = supabase.schema("morpheus").from("yvisiteur").select("*", { count: "exact", head: true });
        
        // Apply same role-based filtering as other statistics if needed
        // For now, we'll get all visitors regardless of role since visitors aren't tied to specific stores
        
        const { count: totalVisitors, error: visitorsError } = await visitorsQuery;
        if (visitorsError) throw new Error(`Visitors query failed: ${visitorsError.message}`);

        return {
          totalStores: totalStores || 0,
          totalProducts,
          pendingApprovals,
          totalVisitors: totalVisitors || 0,
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
    totalVisitors: data?.totalVisitors || 0,
    isLoading,
    error: error as Error | null,
  };
}