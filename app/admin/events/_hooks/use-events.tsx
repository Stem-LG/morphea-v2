import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

export function useEvents() {
    const supabase = createClient();

    return useQuery({
        queryKey: ["events"],
        queryFn: async () => {
            const { data, error } = await supabase.schema("morpheus").from("yevent").select(`
                    *,
                    yeventmedia(
                        ymedia(
                            *
                        )
                    )
                `);

            if (error) {
                throw new Error(error.message || error.code);
            }

            console.log("useEvents data", data);

            return data;
        },
    });
}
