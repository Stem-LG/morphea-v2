"use client";

import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

export function useApprovalStats() {
    const supabase = createClient();

    return useQuery({
        queryKey: ["approval-stats"],
        queryFn: async () => {
            // Get pending products (not_approved status)
            const { count: pending } = await supabase
                .schema("morpheus")
                .from("yprod")
                .select("*", { count: "exact", head: true })
                .eq("yprodstatut", "not_approved");

            // Get rejected products
            const { count: rejected } = await supabase
                .schema("morpheus")
                .from("yprod")
                .select("*", { count: "exact", head: true })
                .eq("yprodstatut", "rejected");

            // Get approved products with non-approved variants
            const { data: approvedProducts } = await supabase
                .schema("morpheus")
                .from("yprod")
                .select(`
                    yprodid,
                    yvarprod!inner(yvarprodstatut)
                `)
                .eq("yprodstatut", "approved")
                .eq("yvarprod.yvarprodstatut", "not_approved");

            const variantApprovals = approvedProducts?.length || 0;

            return {
                pending: pending || 0,
                rejected: rejected || 0,
                variantApprovals,
                total: (pending || 0) + (rejected || 0) + variantApprovals
            };
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 30 * 1000, // Refetch every 30 seconds
    });
}