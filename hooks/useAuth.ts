import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

export function useAuth() {

    const supabase = createClient();

    return useQuery({
        queryKey: ['authUser'],
        queryFn: async () => {
            const { data, error } = await supabase.auth.getUser();
            if (error) {
                console.error("Error fetching user:", error);
                return null;
            }
            return data?.user || null;
        }
    });

}