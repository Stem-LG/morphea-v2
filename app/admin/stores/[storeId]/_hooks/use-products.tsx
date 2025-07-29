"use client";

import { createClient } from "@/lib/client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

interface SortConfig {
    column: string;
    direction: 'asc' | 'desc';
}

interface useProductsProps {
    storeId: number;
    page?: number;
    perPage?: number;
    categoryFilter?: number | null;
    search?: string;
    sorting?: SortConfig | null;
}

export function useProducts({ storeId, page = 1, perPage = 10, categoryFilter = null, search = "", sorting = null }: useProductsProps) {
    const supabase = createClient();

    return useQuery({
        queryKey: ["products", storeId, page, perPage, categoryFilter, search, sorting],
        queryFn: async () => {
            const from = (page - 1) * perPage;
            const to = from + perPage - 1;

            // Build the query - join with ydetailsevent to filter by store
            let query = supabase
                .schema("morpheus")
                .from("yprod")
                .select("*, ydetailsevent!inner(yboutiqueidfk)", { count: "exact" })
                .eq("ydetailsevent.yboutiqueidfk", storeId);

            // Apply category filter if provided
            if (categoryFilter !== null) {
                query = query.eq("xcategprodidfk", categoryFilter);
            }

            // Apply search filter if provided
            if (search && search.trim()) {
                query = query.or(`yprodintitule.ilike.%${search}%,yprodcode.ilike.%${search}%`);
            }

            // Apply sorting
            if (sorting) {
                const ascending = sorting.direction === 'asc';
                query = query.order(sorting.column, { ascending });
            } else {
                // Default sorting by product name
                query = query.order("yprodintitule");
            }

            // Apply pagination
            query = query.range(from, to);

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
        placeholderData: keepPreviousData,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}
