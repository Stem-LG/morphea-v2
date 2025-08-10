"use client";

import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UpdateOrderStatusParams {
  orderNumber: string;
  status: string;
}

export function useUpdateOrderStatus() {
  const supabase = createClient();
  const { data: userData } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderNumber, status }: UpdateOrderStatusParams) => {
      if (!userData) {
        throw new Error("User not authenticated");
      }

      // Update ALL rows with the same zcommandeno (order number)
      const { data, error } = await supabase
        .schema("morpheus")
        .from("zdetailscommande")
        .update({
          zcommandestatut: status,
          sysaction: "UPDATE",
          sysuser: userData.id,
          sysdate: new Date().toISOString(),
        })
        .eq("zcommandeno", orderNumber)
        .select();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate orders query to refetch data
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success(`Order status updated to ${variables.status}`);
    },
    onError: (error: Error) => {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    },
  });
}