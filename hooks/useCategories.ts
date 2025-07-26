import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";
import type { Database } from "@/lib/supabase";

type Category = Database['morpheus']['Tables']['xcategprod']['Row'];

export function useCategories() {
    const supabase = createClient();

    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data, error } = await supabase
                .schema("morpheus")
                .from("xcategprod")
                .select("*")
                .order("xcategprodintitule", { ascending: true });

            if (error) {
                console.error("Error fetching categories:", error);
                throw error;
            }

            return data as Category[];
        },
    });
}
