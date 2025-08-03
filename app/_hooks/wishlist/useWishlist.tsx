"use client";

import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

export function useWishlist() {
  const supabase = createClient();
  const { data: userData, isError } = useAuth();

  return useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      if (!userData || isError) return [];

      const { data, error } = await supabase
        .schema("morpheus")
        .from("ywishlist")
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
        .eq("yuseridfk", userData.id);

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
        return enrichedData;
      }

      return data || [];
    },
    enabled: !!userData && !isError,
  });
}