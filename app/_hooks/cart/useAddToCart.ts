"use client";

import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface AddToCartParams {
  yvarprodidfk: number;
  ypanierqte: number;
}

export function useAddToCart() {
  const supabase = createClient();
  const { data: userData } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ yvarprodidfk, ypanierqte }: AddToCartParams) => {
      if (!userData) {
        throw new Error("User not authenticated");
      }

      // Check if item already exists in cart
      const { data: existingItem, error: checkError } = await supabase
        .schema("morpheus")
        .from("ypanier")
        .select("*")
        .eq("yuseridfk", userData.id)
        .eq("yvarprodidfk", yvarprodidfk)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw new Error(checkError.message);
      }

      if (existingItem) {
        // Update existing item quantity
        const { data, error } = await supabase
          .schema("morpheus")
          .from("ypanier")
          .update({
            ypanierqte: existingItem.ypanierqte + ypanierqte,
            sysaction: "UPDATE",
            sysuser: userData.id,
            sysdate: new Date().toISOString(),
          })
          .eq("ypanierid", existingItem.ypanierid)
          .select()
          .single();

        if (error) throw new Error(error.message);
        return data;
      } else {
        // Add new item to cart - generate a unique ID
        const uniqueId = Math.floor(Math.random() * 1000000) + Date.now();
        
        const { data, error } = await supabase
          .schema("morpheus")
          .from("ypanier")
          .insert({
            ypanierid: uniqueId,
            yuseridfk: userData.id,
            yvarprodidfk,
            ypanierqte,
            sysaction: "INSERT",
            sysuser: userData.id,
            sysdate: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw new Error(error.message);
        return data;
      }
    },
    onSuccess: () => {
      // Invalidate cart query to refetch data
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to cart!");
    },
    onError: (error: Error) => {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    },
  });
}