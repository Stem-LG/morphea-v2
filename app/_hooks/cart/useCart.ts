"use client"

import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/client"
import { useQuery } from "@tanstack/react-query"

export function useCart() {

  const supabase = createClient();
  const { data: userData, isError, isLoading: isAuthLoading } = useAuth()

  return useQuery({
    queryKey: ["cart"],
    queryFn: async () => {

      if (isError) return [];
      if (!userData) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .schema("morpheus")
        .from("ypanier")
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

      if (error) throw new Error(error.message);


      return data || [];
    },
    enabled: !isAuthLoading && !!userData, // Only run when auth is loaded and user exists
  })

}