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
  const assignedStores = userMetadata?.assigned_stores || [];

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-stats", user?.id, isAdmin, assignedStores],
    queryFn: async () => {
      try {
        // Get current and previous month dates
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        // Format dates for SQL queries
        const currentMonthStartStr = currentMonthStart.toISOString().split('T')[0];
        const previousMonthStartStr = previousMonthStart.toISOString().split('T')[0];
        const previousMonthEndStr = previousMonthEnd.toISOString().split('T')[0];

        // 1. Get total stores count
        let storesQuery = supabase.schema("morpheus").from("yboutique").select("*", { count: "exact", head: true });
        
        // Filter by assigned stores for store admins
        if (!isAdmin && assignedStores.length > 0) {
          storesQuery = storesQuery.in("yboutiqueid", assignedStores);
        }

        const { count: totalStores, error: storesError } = await storesQuery;
        if (storesError) throw new Error(`Stores query failed: ${storesError.message}`);

        // 2. Get total products count
        let productsQuery = supabase.schema("morpheus").from("yprod").select("*", { count: "exact", head: true });
        
        // Filter by assigned stores for store admins
        if (!isAdmin && assignedStores.length > 0) {
          // For store admins, we need to find products through events and store relationships
          // Since there's no direct relationship between stores and products,
          // we'll get all products for now and filter based on business logic later
          // This is a simplified approach - in a real scenario, you'd need proper relationships
          
          // For now, if user has assigned stores, show all products
          // This should be refined based on actual business requirements
        }

        const { count: totalProducts, error: productsError } = await productsQuery;
        if (productsError) throw new Error(`Products query failed: ${productsError.message}`);

        // 3. Get pending approvals count
        let pendingApprovalsQuery = supabase
          .schema("morpheus")
          .from("yprod")
          .select("*", { count: "exact", head: true })
          .eq("yprodstatut", "not_approved");

        // Filter by assigned stores for store admins
        if (!isAdmin && assignedStores.length > 0) {
          // For store admins, filter by assigned stores if there's a relationship
          // This assumes there's a way to connect products to stores through business logic
          // For now, if user has assigned stores, show all pending approvals
          // This should be refined based on actual business requirements
        }

        const { count: pendingApprovals, error: pendingApprovalsError } = await pendingApprovalsQuery;
        if (pendingApprovalsError) throw new Error(`Pending approvals query failed: ${pendingApprovalsError.message}`);

        // 4. Get total visitors count
        let visitorsQuery = supabase.schema("morpheus").from("yvisiteur").select("*", { count: "exact", head: true });
        
        // Apply same role-based filtering as other statistics if needed
        // For now, we'll get all visitors regardless of role since visitors aren't tied to specific stores
        
        const { count: totalVisitors, error: visitorsError } = await visitorsQuery;
        if (visitorsError) throw new Error(`Visitors query failed: ${visitorsError.message}`);

        return {
          totalStores: totalStores || 0,
          totalProducts: totalProducts || 0,
          pendingApprovals: pendingApprovals || 0,
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