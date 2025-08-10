"use client";

import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

export function useAllOrders() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("morpheus")
        .from("zdetailscommande")
        .select(`
          *,
          yvarprod:yvarprodidfk (
            *,
            xcouleur:xcouleuridfk (*),
            xtaille:xtailleidfk (*),
            yprod:yprodidfk (
              *,
              ydesign:ydesignidfk (*)
            )
          ),
          ycompte:ycompteidfk (
            *,
            yvisiteur:yvisiteuridfk (
              yvisiteurnom,
              yvisiteuremail,
              yvisiteurtelephone
            )
          )
        `)
        .order("zcommandedate", { ascending: false });

      if (error) throw new Error(error.message);

      // Group orders by zcommandeno
      const groupedOrders = data?.reduce((acc: any, item: any) => {
        const orderNo = item.zcommandeno;
        if (!acc[orderNo]) {
          acc[orderNo] = {
            zcommandeno: orderNo,
            zcommandeid: item.zcommandeid,
            zcommandedate: item.zcommandedate,
            zcommandelivraisondate: item.zcommandelivraisondate,
            zcommandestatut: item.zcommandestatut,
            yvisiteur: item.ycompte?.yvisiteur || null,
            items: []
          };
        }
        acc[orderNo].items.push(item);
        return acc;
      }, {});

      return Object.values(groupedOrders || {});
    },
  });
}