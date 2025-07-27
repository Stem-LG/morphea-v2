"use client";

import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

interface useProductsProps {
    storeId: number;
    page?: number;
    perPage?: number;
    categoryFilter?: number | null;
    search?: string;
}

export function useProducts({ storeId, page = 1, perPage = 10, categoryFilter = null, search = "" }: useProductsProps) {
    const supabase = createClient();

    return useQuery({
        queryKey: ["products", storeId, page, perPage, categoryFilter, search],
        queryFn: async () => {
            const from = (page - 1) * perPage;
            const to = from + perPage - 1;

            // Build the query
            let query = supabase
                .schema("morpheus")
                .from("yprod")
                .select("*, ydetailsevent", { count: "exact" })
                .eq("ydetailsevent.yboutiqueidfk", storeId);

            // Apply category filter if provided
            if (categoryFilter !== null) {
                query = query.eq("xcategprodidfk", categoryFilter);
            }

            // Apply search filter if provided
            if (search && search.trim()) {
                query = query.or(`yprodintitule.ilike.%${search}%,yprodcode.ilike.%${search}%`);
            }

            // Apply pagination and ordering
            query = query.order("yprodintitule").range(from, to);

            const { data, error, count } = await query;

            if (error) {
                throw new Error(error.message);
            }

            const totalPages = Math.ceil((count || 0) / perPage);

            return {
                data,
                count: count || 0,
                totalPages,
            };
        },

        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}
