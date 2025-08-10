"use client";

import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

interface YMedia {
  [key: string]: any;
}

interface YVarProd {
  yvarprodid: string;
  [key: string]: any;
  yvarprodmedia?: { ymedia: YMedia }[];
}

interface ZDetailsCommande {
  zcommandeno: string;
  zcommandeid: string;
  zcommandedate: string;
  zcommandelivraisondate?: string;
  zcommandestatut: string;
  [key: string]: any;
  yvarprod?: YVarProd;
}

interface GroupedOrder {
  zcommandeno: string;
  zcommandeid: string;
  zcommandedate: string;
  zcommandelivraisondate?: string;
  zcommandestatut: string;
  items: ZDetailsCommande[];
}

export function useUserOrders() {
  const supabase = createClient();
  const { data: userData, isError } = useAuth();

  return useQuery({
    queryKey: ["user-orders", userData?.id],
    queryFn: async () => {
      if (!userData || isError) return [];

      // First, get the user's ycompte
      const { data: compteData, error: compteError } = await supabase
        .schema("morpheus")
        .from("ycompte")
        .select("ycompteid")
        .eq("yuseridfk", userData.id)
        .single();

      if (compteError || !compteData) {
        // User doesn't have a ycompte yet, so no orders
        return [];
      }

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
          )
        `)
        .eq("ycompteidfk", compteData.ycompteid)
        .order("zcommandedate", { ascending: false });

      if (error) throw new Error(error.message);

      // Fetch media for each variant separately to avoid relation issues
      if (data && data.length > 0) {
        const enrichedData = await Promise.all(
          data.map(async (item) => {
            if (item.yvarprod) {
              const { data: mediaData } = await supabase
                .schema("morpheus")
                .from("yvarprodmedia")
                .select(`
                  ymedia:ymediaidfk (*)
                `)
                .eq("yvarprodidfk", item.yvarprod.yvarprodid)
                .limit(1);
              
              return {
                ...item,
                yvarprod: {
                  ...item.yvarprod,
                  yvarprodmedia: mediaData || []
                }
              };
            }
            return item;
          })
        );

        // Group orders by zcommandeno
        const groupedOrders = enrichedData.reduce<Record<string, GroupedOrder>>((acc, item) => {
          const orderNo = item.zcommandeno;
          if (!acc[orderNo]) {
            acc[orderNo] = {
              zcommandeno: orderNo,
              zcommandeid: item.zcommandeid,
              zcommandedate: item.zcommandedate,
              zcommandelivraisondate: item.zcommandelivraisondate,
              zcommandestatut: item.zcommandestatut,
              items: []
            };
          }
          acc[orderNo].items.push(item);
          return acc;
        }, {});

        return Object.values(groupedOrders);
      }

      return [];
    },
    enabled: !!userData && !isError,
  });
}