"use client";

import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CartItem {
  ypanierid: number;
  ypanierqte: number;
  yvarprod?: {
    yvarprodid: number;
    yvarprodprixpromotion?: number;
    yvarprodprixcatalogue?: number;
  };
}

interface CreateOrderParams {
  cartItems: CartItem[];
  paymentIntentId?: string;
}

export function useCreateOrder() {
  const supabase = createClient();
  const { data: userData } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ cartItems, paymentIntentId }: CreateOrderParams) => {
      if (!userData) {
        throw new Error("User not authenticated");
      }

      if (!cartItems || cartItems.length === 0) {
        throw new Error("No items in cart");
      }

      // Generate a unique order number using timestamp
      const zcommandeno = Date.now().toString();
      const currentDate = new Date().toISOString();

      // Calculate delivery date (7 days from now)
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 30);
      const zcommandelivraisondate = deliveryDate.toISOString();

      // First, check if user has a yvisiteur record, if not create one
      let { data: existingVisiteur } = await supabase
        .schema("morpheus")
        .from("yvisiteur")
        .select("*")
        .eq("yuseridfk", userData.id)
        .single();

      if (!existingVisiteur) {
        // Create yvisiteur record
        const { data: newVisiteur, error: visiteurError } = await supabase
          .schema("morpheus")
          .from("yvisiteur")
          .insert({
            yuseridfk: userData.id,
            yvisiteurcode: `VIS_${Date.now()}`,
            yvisiteurnom: userData.user_metadata?.full_name || userData.email || "Unknown User",
            yvisiteuremail: userData.email,
            yvisiteurboolacheteurluxe: "N",
            yvisiteurboolacheteurpro: "N",
            yvisiteurboolartisan: "N",
            yvisiteurboolclientprive: "Y",
            yvisiteurboolcollectionneur: "N",
            yvisiteurboolcreateur: "N",
            yvisiteurboolculturel: "N",
            yvisiteurboolgrandpublic: "Y",
            yvisiteurboolinfluenceur: "N",
            yvisiteurboolinvestisseur: "N",
            yvisiteurbooljournaliste: "N",
            yvisiteurboolpressespecialisee: "N",
            yvisiteurboolvip: "N",
            sysaction: "INSERT",
            sysuser: userData.id,
            sysdate: currentDate,
          })
          .select()
          .single();

        if (visiteurError) {
          console.error("Visiteur creation error:", visiteurError);
          throw new Error(visiteurError.message);
        }
        existingVisiteur = newVisiteur;
      }

      // Check if user has a ycompte record, if not create one
      let { data: existingCompte } = await supabase
        .schema("morpheus")
        .from("ycompte")
        .select("*")
        .eq("yuseridfk", userData.id)
        .single();

      if (!existingCompte) {
        // Create ycompte record
        const { data: newCompte, error: compteError } = await supabase
          .schema("morpheus")
          .from("ycompte")
          .insert({
            yuseridfk: userData.id,
            yvisiteuridfk: existingVisiteur.yvisiteurid,
            ycompteno: `CPT_${Date.now()}`,
            ycomptecreationdate: currentDate,
            ycomptestatut: "active",
            sysaction: "INSERT",
            sysuser: userData.id,
            sysdate: currentDate,
          })
          .select()
          .single();

        if (compteError) {
          console.error("Compte creation error:", compteError);
          throw new Error(compteError.message);
        }
        existingCompte = newCompte;
      }

      // Create order entries for each cart item
      const orderEntries = cartItems.map((item, index) => ({
        ycompteidfk: existingCompte.ycompteid,
        yvarprodidfk: item.yvarprod?.yvarprodid || 0,
        zcommandeno: zcommandeno,
        zcommandeligneno: index + 1,
        zcommandequantite: item.ypanierqte,
        zcommandedate: currentDate,
        zcommandelivraisondate: zcommandelivraisondate,
        zcommandestatut: paymentIntentId ? "paid" : "pending",
        sysaction: "INSERT",
        sysuser: userData.id,
        sysdate: currentDate,
      }));

      // Insert all order entries
      const { data: orderData, error: orderError } = await supabase
        .schema("morpheus")
        .from("zdetailscommande")
        .insert(orderEntries)
        .select();

      if (orderError) {
        console.error("Order creation error:", orderError);
        throw new Error(orderError.message);
      }

      // Clear the cart after successful order creation
      const cartItemIds = cartItems.map(item => item.ypanierid);
      const { error: clearCartError } = await supabase
        .schema("morpheus")
        .from("ypanier")
        .delete()
        .in("ypanierid", cartItemIds)
        .eq("yuseridfk", userData.id);

      if (clearCartError) {
        console.error("Cart clearing error:", clearCartError);
        // Don't throw error here as the order was created successfully
        // Just log the error
      }

      return {
        orderData,
        orderNumber: zcommandeno,
      };
    },
    onSuccess: (data) => {
      // Invalidate cart query to refetch data (should be empty now)
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success(`Order #${data.orderNumber} created successfully!`);
    },
    onError: (error: Error) => {
      console.error("Error creating order:", error);
      toast.error("Failed to create order: " + error.message);
    },
  });
}