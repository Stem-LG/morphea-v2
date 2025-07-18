import { createClient } from "@/lib/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/lib/supabase";
import type { ProductWithObjects } from "./useProducts";

type Product = Database['morpheus']['Tables']['yproduit']['Row'];

// Hook to fetch pending products (products with status 'not_approved')
export function usePendingProducts() {
    return useQuery({
        queryKey: ['pending-products'],
        queryFn: async () => {
            const response = await fetch('/api/admin/products/approvals');
            
            if (!response.ok) {
                throw new Error('Failed to fetch pending products');
            }
            
            const data = await response.json();
            return data.products as ProductWithObjects[] || [];
        },
    });
}

// Hook to approve a product
export function useApproveProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (productId: number) => {
            const response = await fetch('/api/admin/products/approvals', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId,
                    action: 'approve'
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to approve product');
            }

            return response.json();
        },
        onSuccess: () => {
            // Invalidate and refetch pending products
            queryClient.invalidateQueries({ queryKey: ['pending-products'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['products-with-status'] });
            queryClient.invalidateQueries({ queryKey: ['approval-stats'] });
        },
    });
}


// Hook to get all products with their approval status
export function useProductsWithStatus() {
    const supabase = createClient();

    return useQuery({
        queryKey: ['products-with-status'],
        queryFn: async () => {
            const { data, error } = await supabase
                .schema("morpheus")
                .from("yproduit")
                .select("*, yobjet3d(*)")
                .order("sysdate", { ascending: false });

            if (error) {
                console.error("Error fetching products with status:", error);
                throw error;
            }

            return data as ProductWithObjects[] || [];
        },
    });
}

// Hook to get product approval statistics
export function useApprovalStats() {
    return useQuery({
        queryKey: ['approval-stats'],
        queryFn: async () => {
            const response = await fetch('/api/admin/products/stats');
            
            if (!response.ok) {
                throw new Error('Failed to fetch approval statistics');
            }
            
            const data = await response.json();
            return data.stats;
        },
    });
}