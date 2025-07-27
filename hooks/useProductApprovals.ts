import { createClient } from "@/lib/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/lib/supabase";
import type { ProductWithObjects } from "./useProducts";

type Product = Database['morpheus']['Tables']['yprod']['Row'];

interface ApprovalData {
    categoryId: number;
    variants: {
        yvarprodid: number;
        yvarprodprixcatalogue: number;
        yvarprodprixpromotion: number | null;
        yvarprodpromotiondatedeb: string | null;
        yvarprodpromotiondatefin: string | null;
        yvarprodnbrjourlivraison: number;
        currencyId: number;
    }[];
}

// Hook to fetch products for approval management (all statuses: not_approved, approved, needs_revision)
export function usePendingProducts() {
    return useQuery({
        queryKey: ['pending-products'],
        queryFn: async () => {
            const response = await fetch('/api/admin/products/approvals');
            
            if (!response.ok) {
                throw new Error('Failed to fetch products for approval');
            }
            
            const data = await response.json();
            return data.products as ProductWithObjects[] || [];
        },
    });
}

// Hook to approve a product with detailed approval data
export function useApproveProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ productId, approvalData }: { productId: number; approvalData: ApprovalData }) => {
            const response = await fetch('/api/admin/products/approvals', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId,
                    action: 'approve',
                    approvalData
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

// Hook to mark a product as needs revision
export function useNeedsRevisionProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ productId, comments }: { productId: number; comments: string }) => {
            const response = await fetch('/api/admin/products/approvals', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId,
                    action: 'needs_revision',
                    comments
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to mark product as needs revision');
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
                .from("yprod")
                .select("*")
                .order("sysdate", { ascending: false });

            if (error) {
                console.error("Error fetching products with status:", error);
                throw error;
            }

            // Add empty yobjet3d array to match ProductWithObjects interface
            const productsWithObjects = data?.map(product => ({
                ...product,
                yobjet3d: []
            })) || [];

            return productsWithObjects as ProductWithObjects[];
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