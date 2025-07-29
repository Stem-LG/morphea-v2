"use client";

import { createClient } from "@/lib/client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

interface SortConfig {
    column: string;
    direction: 'asc' | 'desc';
}

interface useApprovalsProps {
    page?: number;
    perPage?: number;
    approvalType?: string;
    categoryFilter?: number | null;
    storeFilter?: number | null;
    search?: string;
    sorting?: SortConfig | null;
}

export function useApprovals({ 
    page = 1, 
    perPage = 10, 
    approvalType = "all",
    categoryFilter = null, 
    storeFilter = null,
    search = "", 
    sorting = null 
}: useApprovalsProps) {
    const supabase = createClient();

    return useQuery({
        queryKey: ["approvals", page, perPage, approvalType, categoryFilter, storeFilter, search, sorting],
        queryFn: async () => {
            const from = (page - 1) * perPage;
            const to = from + perPage - 1;

            // Build the base query with variants and related data
            let query = supabase
                .schema("morpheus")
                .from("yprod")
                .select(`
                    *,
                    yvarprod(
                        *,
                        xcouleur(*),
                        xtaille(*),
                        xdevise(*),
                        yobjet3d(*),
                        yvarprodmedia(
                            ymedia:ymediaidfk(*)
                        )
                    ),
                    ydetailsevent(
                        yboutique:yboutiqueidfk(*)
                    )
                `, { count: "exact" });

            // Apply approval type filter
            if (approvalType === "not_approved") {
                query = query.eq("yprodstatut", "not_approved");
            } else if (approvalType === "variant_approval") {
                // Products that are approved but have non-approved variants
                query = query.eq("yprodstatut", "approved");
                // Note: We'll filter variants in the transformation step
            } else if (approvalType === "needs_revision") {
                query = query.eq("yprodstatut", "needs_revision");
            } else if (approvalType === "all") {
                // All products that need some form of approval
                query = query.in("yprodstatut", ["not_approved", "needs_revision", "approved"]);
            }

            // Apply category filter if provided
            if (categoryFilter !== null) {
                query = query.eq("xcategprodidfk", categoryFilter);
            }

            // Apply store filter if provided
            if (storeFilter !== null) {
                query = query.eq("ydetailsevent.yboutiqueidfk", storeFilter);
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
                // Default sorting by creation date (newest first)
                query = query.order("sysdate", { ascending: false });
            }

            // Apply pagination
            query = query.range(from, to);

            const { data, error, count } = await query;

            if (error) {
                throw new Error(error.message);
            }

            // Transform the data to flatten store information and 3D objects
            let transformedData = data?.map(product => ({
                ...product,
                store: product.ydetailsevent?.[0]?.yboutique || null,
                yobjet3d: product.yvarprod?.flatMap(variant => variant.yobjet3d || []) || [],
                media: product.yvarprod?.flatMap(variant =>
                    variant.yvarprodmedia?.map(media => media.ymedia) || []
                ) || []
            })) || [];

            // Apply post-processing filters for variant approval
            if (approvalType === "variant_approval") {
                transformedData = transformedData.filter(product =>
                    product.yvarprod?.some((variant: any) => variant.yvarprodstatut === "not_approved")
                );
            } else if (approvalType === "all") {
                // For "all", include products that need approval OR have variants needing approval
                transformedData = transformedData.filter(product =>
                    product.yprodstatut === "not_approved" ||
                    product.yprodstatut === "needs_revision" ||
                    (product.yprodstatut === "approved" && product.yvarprod?.some((variant: any) => variant.yvarprodstatut === "not_approved"))
                );
            }

            const totalPages = Math.ceil((count || 0) / perPage);

            return {
                data: transformedData,
                count: count || 0,
                totalPages,
            };
        },
        placeholderData: keepPreviousData,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}