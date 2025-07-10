"use client";
import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

export function useStores() {
    const supabase = createClient();

    return useQuery({
        queryKey: ["use-stores"],
        queryFn: async () => {
            const { data: boutiques, error } = await supabase
                .schema('morpheus')
                .from("yboutique")
                .select(`
                    *,
                    yinfospotactions!yinfospotactions_yboutiqueidfk_fkey (
                        *,
                        yproduit!yproduit_yinfospotactionsidfk_fkey (
                            *,
                            ydesigneur (*)
                        ),
                        yinfospots!yinfospots_yinfospotactionsidfk_fkey (
                            *,
                            yscenes!yinfospots_ysceneid_fkey (*)
                        )
                    )
                `)
                .order('yboutiqueid');

            if (error) {
                throw error;
            }

            // Transform the data to group by categories (yinfospotactions)
            const transformedBoutiques = boutiques?.map((boutique: any) => {
                // Transform yinfospotactions into categories
                const categories = boutique.yinfospotactions?.map((action: any) => ({
                    id: action.yinfospotactionsid,
                    name: action.ytitle || action.yinfospotactionsid, // Use ytitle as the display name
                    type: action.ytype,
                    modalType: action.ymodaltype,
                    customHandler: action.ycustomhandler,
                    createdAt: action.ycreatedat,
                    products: action.yproduit || [],
                    infospots: action.yinfospots || []
                })) || [];

                return {
                    ...boutique,
                    categories: categories,
                    // Keep sections for backward compatibility if needed
                    sections: []
                };
            });

            return transformedBoutiques || [];
        },
    });
}
