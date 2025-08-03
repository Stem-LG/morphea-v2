"use client";

import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface AddToWishlistParams {
  yvarprodidfk: number;
}

export function useAddToWishlist() {
  const supabase = createClient();
  const { data: userData } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ yvarprodidfk }: AddToWishlistParams) => {
      if (!userData) {
        throw new Error("User not authenticated");
      }

      // Check if item already exists in wishlist
      const { data: existingItem, error: checkError } = await supabase
        .schema("morpheus")
        .from("ywishlist")
        .select("*")
        .eq("yuseridfk", userData.id)
        .eq("yvarprodidfk", yvarprodidfk)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw new Error(checkError.message);
      }

      if (existingItem) {
        throw new Error("Item already in wishlist");
      }

      // Generate a unique ID for wishlist item
      const uniqueId = Math.floor(Math.random() * 1000000) + Date.now();

      const { data, error } = await supabase
        .schema("morpheus")
        .from("ywishlist")
        .insert({
          ywishlistid: uniqueId,
          yuseridfk: userData.id,
          yvarprodidfk,
          sysaction: "INSERT",
          sysuser: userData.id,
          sysdate: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate wishlist query to refetch data
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      // Invalidate the specific wishlist-check query for this product
      queryClient.invalidateQueries({ queryKey: ["wishlist-check", variables.yvarprodidfk] });
      // Invalidate all wishlist-check queries to be safe
      queryClient.invalidateQueries({ queryKey: ["wishlist-check"] });
      toast.success("Added to wishlist!");
    },
    onError: (error: Error) => {
      if (error.message === "Item already in wishlist") {
        toast.info("Already in wishlist");
      } else {
        toast.error("Failed to add to wishlist");
      }
    },
  });
}