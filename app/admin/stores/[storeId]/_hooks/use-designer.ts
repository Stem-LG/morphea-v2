"use client";

import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

export function useDesigner() {
    const supabase = createClient();
    const { data: user } = useAuth();

    return useQuery({
        queryKey: ["designer", user?.id],
        queryFn: async () => {
            if (!user?.id) {
                throw new Error("User not authenticated");
            }

            // Check if user is admin - admins don't have designer records
            const isAdmin = user?.app_metadata?.roles?.includes("admin");
            if (isAdmin) {
                // Return null for admins - they don't have designer records
                return null;
            }

            const { data, error } = await supabase
                .schema("morpheus")
                .from("ydesign")
                .select("*")
                .eq("yuseridfk", user.id)
                .single();

            if (error) {
                // If no designer record found, return null instead of throwing error
                if (error.code === 'PGRST116') {
                    return null;
                }
                throw new Error(error.message);
            }

            return data;
        },
        enabled: !!user?.id,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}