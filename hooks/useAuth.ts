import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

export function useAuth() {

    const supabase = createClient();

    return useQuery({
        queryKey: ['authUser'],
        queryFn: async () => {
            try {
                const { data, error } = await supabase.auth.getUser();
                
                // Handle auth session missing (normal when not logged in)
                if (error && (error.message === 'Auth session missing!' || error.name === 'AuthSessionMissingError')) {
                    return null;
                }
                
                // Handle other errors
                if (error) {
                    console.error("Error fetching user:", error);
                    return null;
                }
                
                return data?.user || null;
            } catch (error: any) {
                // Handle thrown AuthSessionMissingError
                if (error.message === 'Auth session missing!' || error.name === 'AuthSessionMissingError') {
                    return null;
                }
                console.error("Error fetching user:", error);
                return null;
            }
        },
        retry: false, // Don't retry on auth errors
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });

}