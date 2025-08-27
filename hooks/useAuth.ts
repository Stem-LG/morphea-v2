import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";
import { use, useMemo } from "react";

export function useAuth() {

    const supabase = createClient();

    const result = useQuery({

        queryKey: ['authUser'],
        queryFn: async () => {
            try {

                const { data, error } = await supabase.auth.getUser();



                // Handle auth session missing (normal when not logged in)

                if (error && (error.message === 'Auth session missing!' || error.name === 'AuthSessionMissingError')) {

                    // Create anonymous user if no session exists

                    const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();



                    if (anonError) {

                        console.error("Error creating anonymous user:", anonError);

                        return null;

                    }

                    return anonData?.user || null;
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

                    // Create anonymous user if no session exists

                    try {

                        const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();



                        if (anonError) {
                            console.error("Error creating anonymous user:", anonError);
                            return null;
                        }

                        return anonData?.user || null;
                    } catch (anonCreateError) {
                        console.error("Error creating anonymous user:", anonCreateError);
                        return null;
                    }
                }
                console.error("Error fetching user:", error);
                return null;
            }
        },
        retry: false, // Don't retry on auth errors
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });


    return result;
}

export function useLogout() {
    const supabase = createClient();

    const logout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error("Error logging out:", error);
                throw error;
            }
            // The useAuth query will automatically refetch and create a new anonymous user
            window.location.href = '/'; // Redirect to home page
        } catch (error) {
            console.error("Logout failed:", error);
            throw error;
        }
    };

    return { logout };
}

export function useUserRoles() {
    const { data: currentUser } = useAuth();

    const userRoles = useMemo(() => {
        if (!currentUser || currentUser.is_anonymous) return []

        // Check role field first
        if (currentUser.role === 'admin' || currentUser.role === 'store_admin') {
            return [currentUser.role]
        }

        // Check app_metadata for roles (fallback)
        try {
            const appMetadata = currentUser.app_metadata
            if (appMetadata && typeof appMetadata === 'object' && 'roles' in appMetadata) {
                return Array.isArray(appMetadata.roles) ? appMetadata.roles : []
            }
        } catch (error) {
            console.warn('Error parsing user roles:', error)
        }

        return []
    }, [currentUser])

    const hasAdminAccess = useMemo(() => {
        return currentUser && !currentUser.is_anonymous && (userRoles.includes('admin') || userRoles.includes('store_admin'))
    }, [currentUser, userRoles])

    return { userRoles, hasAdminAccess }
}