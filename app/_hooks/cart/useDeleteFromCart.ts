"use client";

import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface DeleteFromCartParams {
  ypanierid: number;
}

export function useDeleteFromCart() {
  const supabase = createClient();
  const { data: userData } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ypanierid }: DeleteFromCartParams) => {
      if (!userData) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .schema("morpheus")
        .from("ypanier")
        .delete()
        .eq("ypanierid", ypanierid)
        .eq("yuseridfk", userData.id) // Ensure user can only delete their own cart items
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      // Invalidate cart query to refetch data
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Removed from cart!");
    },
    onError: (error: Error) => {
      console.error("Error removing from cart:", error);
      toast.error("Failed to remove from cart");
    },
  });
}