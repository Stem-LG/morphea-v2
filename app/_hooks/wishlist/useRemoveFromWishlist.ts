"use client";

import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface RemoveFromWishlistParams {
  ywishlistid?: number;
  yvarprodidfk?: number;
}

export function useRemoveFromWishlist() {
  const supabase = createClient();
  const { data: userData } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ywishlistid, yvarprodidfk }: RemoveFromWishlistParams) => {
      if (!userData) {
        throw new Error("User not authenticated");
      }

      let query = supabase
        .schema("morpheus")
        .from("ywishlist")
        .delete()
        .eq("yuseridfk", userData.id);

      if (ywishlistid) {
        query = query.eq("ywishlistid", ywishlistid);
      } else if (yvarprodidfk) {
        query = query.eq("yvarprodidfk", yvarprodidfk);
      } else {
        throw new Error("Either ywishlistid or yvarprodidfk must be provided");
      }

      const { data, error } = await query.select().single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate wishlist query to refetch data
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      // Invalidate the specific wishlist-check query for this product
      if (variables.yvarprodidfk) {
        queryClient.invalidateQueries({ queryKey: ["wishlist-check", variables.yvarprodidfk] });
      }
      // Invalidate all wishlist-check queries to be safe
      queryClient.invalidateQueries({ queryKey: ["wishlist-check"] });
      toast.success("Removed from wishlist!");
    },
    onError: (error: Error) => {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove from wishlist");
    },
  });
}