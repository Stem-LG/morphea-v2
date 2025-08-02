"use client";

import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UpdateCartParams {
  ypanierid: number;
  ypanierqte: number;
}

export function useUpdateCart() {
  const supabase = createClient();
  const { data: userData } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ypanierid, ypanierqte }: UpdateCartParams) => {
      if (!userData) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .schema("morpheus")
        .from("ypanier")
        .update({
          ypanierqte,
          sysaction: "UPDATE",
          sysuser: userData.id,
          sysdate: new Date().toISOString(),
        })
        .eq("ypanierid", ypanierid)
        .eq("yuseridfk", userData.id) // Ensure user can only update their own cart items
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      // Invalidate cart query to refetch data
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Cart updated!");
    },
    onError: (error: Error) => {
      console.error("Error updating cart:", error);
      toast.error("Failed to update cart");
    },
  });
}