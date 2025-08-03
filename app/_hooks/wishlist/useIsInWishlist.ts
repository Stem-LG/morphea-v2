"use client";

import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

export function useIsInWishlist(yvarprodidfk: number) {
  const supabase = createClient();
  const { data: userData } = useAuth();

  return useQuery({
    queryKey: ["wishlist-check", yvarprodidfk],
    queryFn: async () => {
      if (!userData) return false;

      const { data, error } = await supabase
        .schema("morpheus")
        .from("ywishlist")
        .select("ywishlistid")
        .eq("yuseridfk", userData.id)
        .eq("yvarprodidfk", yvarprodidfk)
        .single();

      if (error && error.code !== "PGRST116") {
        throw new Error(error.message);
      }

      return !!data;
    },
    enabled: !!userData && !!yvarprodidfk,
  });
}