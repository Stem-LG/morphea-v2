"use client"

import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/client"
import { useQuery } from "@tanstack/react-query"

export function useCart() {

  const supabase = createClient();
  const { data: userData, isError } = useAuth()

  return useQuery({
    queryKey: ["cart"],
    queryFn: async () => {

      if (!userData || isError) return [];

      const { data, error } = await supabase
        .schema("morpheus")
        .from("ypanier")
        .select(`
          *,
          ydetailsevent:ydetailseventidfk (
            *,
            yprod:yprodidfk (
              *,
              ydesign:ydesignidfk (*)
            )
          )
        `)
        .eq("yuseridfk", userData.id);

      // Fetch media for each variant separately to avoid relation issues
      if (data && data.length > 0) {
        const enrichedData = await Promise.all(
          data.map(async (item) => {
            if (item.ydetailsevent?.yprod) {
              // Get variants for this product
              const { data: variants } = await supabase
                .schema("morpheus")
                .from("yvarprod")
                .select(`
                  *,
                  xcouleur:xcouleuridfk (*),
                  xtaille:xtailleidfk (*)
                `)
                .eq("yprodidfk", item.ydetailsevent.yprod.yprodid);

              // Get media for the first variant (or you could get media for all variants)
              let mediaData = [];
              if (variants && variants.length > 0) {
                const { data: media } = await supabase
                  .schema("morpheus")
                  .from("yvarprodmedia")
                  .select(`
                    ymedia:ymediaidfk (*)
                  `)
                  .eq("yvarprodidfk", variants[0].yvarprodid)
                  .limit(1);
                
                mediaData = media || [];
              }
              
              return {
                ...item,
                ydetailsevent: {
                  ...item.ydetailsevent,
                  yprod: {
                    ...item.ydetailsevent.yprod,
                    yvarprod: variants || [],
                    yvarprodmedia: mediaData
                  }
                }
              };
            }
            return item;
          })
        );
        return enrichedData;
      }

      if (error) throw new Error(error.message);


      return data || [];
    },
  })

}