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
                        *
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
                    name: action.yinfospotactionstitle || action.yinfospotactionsid, // Use correct field name
                    type: action.yinfospotactionstype,
                    modalType: action.yinfospotactionsmodaltype,
                    customHandler: action.yinfospotactionscustomhandler,
                    description: action.yinfospotactionsdescription,
                    products: [], // Products will be fetched separately when needed
                    infospots: [] // Infospots will be fetched separately when needed
                })) || [];

                return {
                    ...boutique,
                    categories: categories,
                    // Keep sections for backward compatibility if needed
                    sections: []
                };
            });

            console.log(transformedBoutiques)

            return transformedBoutiques || [];
        },
    });
}
