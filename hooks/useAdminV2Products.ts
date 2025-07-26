import { createClient } from "@/lib/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/lib/supabase";
import type { ProductWithObjects } from "./useProducts";

type Product = Database['morpheus']['Tables']['yprod']['Row'];
type ProductInsert = Database['morpheus']['Tables']['yprod']['Insert'];
type ProductUpdate = Database['morpheus']['Tables']['yprod']['Update'];

// Enhanced hook for store-specific products with better filtering and search
export function useStoreProducts(storeId: string | null, options?: {
    status?: 'all' | 'approved' | 'pending' | 'rejected';
    search?: string;
    categoryId?: string;
}) {
    const supabase = createClient();

    return useQuery({
        queryKey: ['adminv2-store-products', storeId, options],
        queryFn: async () => {
            if (!storeId) return [];

            // Build the query based on options
            let query = supabase
                .schema("morpheus")
                .from("yprod")
                .select("*");

            // Filter by status if specified
            if (options?.status && options.status !== 'all') {
                const statusMap = {
                    'approved': 'approved',
                    'pending': 'not_approved',
                    'rejected': 'rejected'
                };
                query = query.eq('yprodstatut', statusMap[options.status]);
            }

            // Filter by category if specified
            if (options?.categoryId) {
                query = query.eq('xcategprodidfk', parseInt(options.categoryId));
            }

            // For now, we'll get all products and filter by store relationship later
            // This is a simplified approach - in a real implementation, you'd want to
            // establish proper relationships between stores and products
            query = query.order("yprodid", { ascending: false });

            const { data, error } = await query;

            if (error) {
                console.error("Error fetching store products:", error);
                throw error;
            }

            // Filter by search term if provided
            let filteredData = data || [];
            if (options?.search) {
                const searchTerm = options.search.toLowerCase();
                filteredData = filteredData.filter(product => 
                    product.yprodintitule?.toLowerCase().includes(searchTerm) ||
                    product.yprodcode?.toLowerCase().includes(searchTerm) ||
                    product.yproddetailstech?.toLowerCase().includes(searchTerm)
                );
            }

            // Add empty yobjet3d array to match ProductWithObjects interface
            const productsWithObjects = filteredData.map(product => ({
                ...product,
                yobjet3d: []
            }));

            return productsWithObjects as ProductWithObjects[];
        },
        enabled: !!storeId,
    });
}

// Hook for getting product statistics for a store
export function useStoreProductStats(storeId: string | null) {
    const supabase = createClient();

    return useQuery({
        queryKey: ['adminv2-store-product-stats', storeId],
        queryFn: async () => {
            if (!storeId) return null;

            // Get all products for the store
            const { data: products, error } = await supabase
                .schema("morpheus")
                .from("yprod")
                .select("yprodstatut");

            if (error) {
                console.error("Error fetching product stats:", error);
                throw error;
            }

            // Calculate statistics
            const total = products?.length || 0;
            const approved = products?.filter(p => p.yprodstatut === 'approved').length || 0;
            const pending = products?.filter(p => p.yprodstatut === 'not_approved').length || 0;
            const rejected = products?.filter(p => p.yprodstatut === 'rejected').length || 0;

            return {
                total,
                approved,
                pending,
                rejected,
                approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0
            };
        },
        enabled: !!storeId,
    });
}

// Hook for bulk operations on products
export function useBulkProductOperations() {
    const queryClient = useQueryClient();
    const supabase = createClient();

    const bulkUpdateStatus = useMutation({
        mutationFn: async ({ productIds, status }: { productIds: number[], status: string }) => {
            const { data, error } = await supabase
                .schema("morpheus")
                .from("yprod")
                .update({ yprodstatut: status })
                .in("yprodid", productIds)
                .select();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminv2-store-products'] });
            queryClient.invalidateQueries({ queryKey: ['adminv2-store-product-stats'] });
        },
    });

    const bulkDelete = useMutation({
        mutationFn: async (productIds: number[]) => {
            // First delete associated 3D objects
            await supabase
                .schema("morpheus")
                .from("yobjet3d")
                .delete()
                .in("yvarprodidfk", productIds);

            // Then delete the products
            const { error } = await supabase
                .schema("morpheus")
                .from("yprod")
                .delete()
                .in("yprodid", productIds);

            if (error) throw error;
            return productIds;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminv2-store-products'] });
            queryClient.invalidateQueries({ queryKey: ['adminv2-store-product-stats'] });
        },
    });

    return {
        bulkUpdateStatus,
        bulkDelete
    };
}

// Hook for product approval workflow
export function useProductApprovalWorkflow() {
    const queryClient = useQueryClient();
    const supabase = createClient();

    const approveProduct = useMutation({
        mutationFn: async (productId: number) => {
            const { data, error } = await supabase
                .schema("morpheus")
                .from("yprod")
                .update({ 
                    yprodstatut: 'approved',
                    sysdate: new Date().toISOString(),
                    sysaction: 'update'
                })
                .eq("yprodid", productId)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminv2-store-products'] });
            queryClient.invalidateQueries({ queryKey: ['adminv2-store-product-stats'] });
            queryClient.invalidateQueries({ queryKey: ['pending-products'] });
        },
    });

    const rejectProduct = useMutation({
        mutationFn: async (productId: number) => {
            const { data, error } = await supabase
                .schema("morpheus")
                .from("yprod")
                .update({ 
                    yprodstatut: 'rejected',
                    sysdate: new Date().toISOString(),
                    sysaction: 'update'
                })
                .eq("yprodid", productId)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminv2-store-products'] });
            queryClient.invalidateQueries({ queryKey: ['adminv2-store-product-stats'] });
            queryClient.invalidateQueries({ queryKey: ['pending-products'] });
        },
    });

    const requestReview = useMutation({
        mutationFn: async (productId: number) => {
            const { data, error } = await supabase
                .schema("morpheus")
                .from("yprod")
                .update({ 
                    yprodstatut: 'not_approved',
                    sysdate: new Date().toISOString(),
                    sysaction: 'update'
                })
                .eq("yprodid", productId)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminv2-store-products'] });
            queryClient.invalidateQueries({ queryKey: ['adminv2-store-product-stats'] });
            queryClient.invalidateQueries({ queryKey: ['pending-products'] });
        },
    });

    return {
        approveProduct,
        rejectProduct,
        requestReview
    };
}

// Hook for advanced product search and filtering
export function useProductSearch() {
    const supabase = createClient();

    return useMutation({
        mutationFn: async (searchParams: {
            storeId?: string;
            query?: string;
            status?: string[];
            categories?: string[];
            dateRange?: { start: string; end: string };
            sortBy?: 'name' | 'date' | 'status';
            sortOrder?: 'asc' | 'desc';
            limit?: number;
            offset?: number;
        }) => {
            let query = supabase
                .schema("morpheus")
                .from("yprod")
                .select("*");

            // Apply filters
            if (searchParams.query) {
                query = query.or(`yprodintitule.ilike.%${searchParams.query}%,yprodcode.ilike.%${searchParams.query}%,yproddetailstech.ilike.%${searchParams.query}%`);
            }

            if (searchParams.status && searchParams.status.length > 0) {
                query = query.in('yprodstatut', searchParams.status);
            }

            if (searchParams.categories && searchParams.categories.length > 0) {
                query = query.in('xcategprodidfk', searchParams.categories.map(c => parseInt(c)));
            }

            if (searchParams.dateRange) {
                query = query
                    .gte('sysdate', searchParams.dateRange.start)
                    .lte('sysdate', searchParams.dateRange.end);
            }

            // Apply sorting
            if (searchParams.sortBy) {
                const column = searchParams.sortBy === 'name' ? 'yprodintitule' :
                              searchParams.sortBy === 'date' ? 'sysdate' : 'yprodstatut';
                query = query.order(column, { ascending: searchParams.sortOrder === 'asc' });
            }

            // Apply pagination
            if (searchParams.limit) {
                query = query.limit(searchParams.limit);
            }
            if (searchParams.offset) {
                query = query.range(searchParams.offset, searchParams.offset + (searchParams.limit || 10) - 1);
            }

            const { data, error } = await query;

            if (error) throw error;

            // Add empty yobjet3d array to match ProductWithObjects interface
            const productsWithObjects = data?.map(product => ({
                ...product,
                yobjet3d: []
            })) || [];

            return productsWithObjects as ProductWithObjects[];
        },
    });
}