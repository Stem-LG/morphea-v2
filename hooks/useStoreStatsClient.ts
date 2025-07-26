"use client";
import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

interface StoreStatsData {
  totalProducts: number;
  approvedProducts: number;
  pendingProducts: number;
  rejectedProducts: number;
  categories: number;
  sales: number;
  visitors: number;
}

// Hook to fetch store statistics directly from Supabase client
export function useStoreStatsClient(storeId: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['store-stats-client', storeId],
    queryFn: async (): Promise<StoreStatsData> => {
      if (!storeId) {
        return {
          totalProducts: 0,
          approvedProducts: 0,
          pendingProducts: 0,
          rejectedProducts: 0,
          categories: 0,
          sales: 0,
          visitors: 0
        };
      }

      const storeIdNum = parseInt(storeId);

      // Get product statistics
      const { count: totalProducts, error: totalProductsError } = await supabase
        .schema('morpheus')
        .from('yprod')
        .select('*', { count: 'exact', head: true })
        .eq('ydesignidfk', storeIdNum);

      if (totalProductsError) {
        console.error('Error getting total products:', totalProductsError);
      }

      const { count: approvedProducts, error: approvedProductsError } = await supabase
        .schema('morpheus')
        .from('yprod')
        .select('*', { count: 'exact', head: true })
        .eq('ydesignidfk', storeIdNum)
        .eq('yprodstatut', 'approved');

      if (approvedProductsError) {
        console.error('Error getting approved products:', approvedProductsError);
      }

      const { count: pendingProducts, error: pendingProductsError } = await supabase
        .schema('morpheus')
        .from('yprod')
        .select('*', { count: 'exact', head: true })
        .eq('ydesignidfk', storeIdNum)
        .eq('yprodstatut', 'not_approved');

      if (pendingProductsError) {
        console.error('Error getting pending products:', pendingProductsError);
      }

      const { count: rejectedProducts, error: rejectedProductsError } = await supabase
        .schema('morpheus')
        .from('yprod')
        .select('*', { count: 'exact', head: true })
        .eq('ydesignidfk', storeIdNum)
        .eq('yprodstatut', 'rejected');

      if (rejectedProductsError) {
        console.error('Error getting rejected products:', rejectedProductsError);
      }

      // Get categories count (using yinfospotactions table as per the API route)
      const { count: categories, error: categoriesError } = await supabase
        .schema('morpheus')
        .from('yinfospotactions')
        .select('*', { count: 'exact', head: true })
        .eq('yboutiqueidfk', storeIdNum);

      if (categoriesError) {
        console.error('Error getting categories:', categoriesError);
      }

      // Sales and visitors are set to 0 since no system exists yet
      // These can be updated when sales/visitor tracking systems are implemented
      const sales = 0;
      const visitors = 0;

      return {
        totalProducts: totalProducts || 0,
        approvedProducts: approvedProducts || 0,
        pendingProducts: pendingProducts || 0,
        rejectedProducts: rejectedProducts || 0,
        categories: categories || 0,
        sales,
        visitors
      };
    },
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook to fetch stats for multiple stores
export function useMultipleStoreStatsClient(storeIds: number[]) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['multiple-store-stats-client', storeIds],
    queryFn: async (): Promise<Record<number, StoreStatsData>> => {
      if (storeIds.length === 0) {
        return {};
      }

      const promises = storeIds.map(async (storeId) => {
        try {
          // Get product statistics for this store
          const { count: totalProducts, error: totalProductsError } = await supabase
            .schema('morpheus')
            .from('yprod')
            .select('*', { count: 'exact', head: true })
            .eq('ydesignidfk', storeId);

          if (totalProductsError) {
            console.error(`Error getting total products for store ${storeId}:`, totalProductsError);
          }

          const { count: approvedProducts, error: approvedProductsError } = await supabase
            .schema('morpheus')
            .from('yprod')
            .select('*', { count: 'exact', head: true })
            .eq('ydesignidfk', storeId)
            .eq('yprodstatut', 'approved');

          if (approvedProductsError) {
            console.error(`Error getting approved products for store ${storeId}:`, approvedProductsError);
          }

          const { count: pendingProducts, error: pendingProductsError } = await supabase
            .schema('morpheus')
            .from('yprod')
            .select('*', { count: 'exact', head: true })
            .eq('ydesignidfk', storeId)
            .eq('yprodstatut', 'not_approved');

          if (pendingProductsError) {
            console.error(`Error getting pending products for store ${storeId}:`, pendingProductsError);
          }

          const { count: rejectedProducts, error: rejectedProductsError } = await supabase
            .schema('morpheus')
            .from('yprod')
            .select('*', { count: 'exact', head: true })
            .eq('ydesignidfk', storeId)
            .eq('yprodstatut', 'rejected');

          if (rejectedProductsError) {
            console.error(`Error getting rejected products for store ${storeId}:`, rejectedProductsError);
          }

          // Get categories count
          const { count: categories, error: categoriesError } = await supabase
            .schema('morpheus')
            .from('yinfospotactions')
            .select('*', { count: 'exact', head: true })
            .eq('yboutiqueidfk', storeId);

          if (categoriesError) {
            console.error(`Error getting categories for store ${storeId}:`, categoriesError);
          }

          return {
            storeId,
            stats: {
              totalProducts: totalProducts || 0,
              approvedProducts: approvedProducts || 0,
              pendingProducts: pendingProducts || 0,
              rejectedProducts: rejectedProducts || 0,
              categories: categories || 0,
              sales: 0,
              visitors: 0
            }
          };
        } catch (error) {
          console.error(`Failed to fetch stats for store ${storeId}:`, error);
          return {
            storeId,
            stats: {
              totalProducts: 0,
              approvedProducts: 0,
              pendingProducts: 0,
              rejectedProducts: 0,
              categories: 0,
              sales: 0,
              visitors: 0
            }
          };
        }
      });

      const results = await Promise.all(promises);
      
      // Convert to object with storeId as key
      const statsMap: Record<number, StoreStatsData> = {};
      results.forEach(({ storeId, stats }) => {
        statsMap[storeId] = stats;
      });
      
      return statsMap;
    },
    enabled: storeIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}