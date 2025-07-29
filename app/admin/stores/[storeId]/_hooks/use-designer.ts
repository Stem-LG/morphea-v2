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

            const { data, error } = await supabase
                .schema("morpheus")
                .from("ydesign")
                .select("*")
                .eq("yuseridfk", user.id)
                .single();

            if (error) {
                throw new Error(error.message);
            }

            return data;
        },
        enabled: !!user?.id,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}