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

            // Get approved products
            const { count: approved } = await supabase
                .schema("morpheus")
                .from("yprod")
                .select("*", { count: "exact", head: true })
                .eq("yprodstatut", "approved");

            // Get total products count
            const { count: total } = await supabase
                .schema("morpheus")
                .from("yprod")
                .select("*", { count: "exact", head: true });

            return {
                pending: pending || 0,
                rejected: rejected || 0,
                approved: approved || 0,
                total: total || 0
            };
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 30 * 1000, // Refetch every 30 seconds
    });
}