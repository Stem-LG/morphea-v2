import { createClient } from "@/lib/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/lib/supabase";
import type { ProductWithObjects } from "./useProducts";

type Product = Database['morpheus']['Tables']['yprod']['Row'];

interface ApprovalData {
    categoryId: number;
    infoactionId: number;
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