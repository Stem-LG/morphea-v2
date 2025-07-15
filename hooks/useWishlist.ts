import { createClient } from "@/lib/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

export interface WishlistItem {
    id: number;
    yproduit_id: number;
    created_at: string;
    yuser_id: string;
}

export function useWishlist() {
    const supabase = createClient();
    const { data: user } = useAuth();
    const queryClient = useQueryClient();

    const wishlistQuery = useQuery({
        queryKey: ['wishlist', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            
            const { data, error } = await supabase
                .schema('morpheus')
                .from('ywishlist')
                .select(`
                    *,
                    yproduit:yproduit_id (
                        yproduitid,
                        yproduitintitule,
                        imageurl,
                        yproduitdetailstech,
                        yinfospotactions:yinfospotactionsidfk (
                            yinfospotactionsid,
                            ytitle,
                            yboutique:yboutiqueidfk (
                                yboutiqueid,
                                yboutiqueintitule,
                                yboutiquecode
                            )
                        )
                    )
                `)
                .eq('yuser_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching wishlist:', error);
                return [];
            }

            return data || [];
        },
        enabled: !!user?.id,
    });

    const addToWishlistMutation = useMutation({
        mutationFn: async (productId: number) => {
            if (!user?.id) throw new Error('User not authenticated');

            // Check if item already exists in wishlist
            const { data: existingItem } = await supabase
                .schema('morpheus')
                .from('ywishlist')
                .select('*')
                .eq('yuser_id', user.id)
                .eq('yproduit_id', productId)
                .single();

            if (existingItem) {
                throw new Error('Item already in wishlist');
            }

            const { data, error } = await supabase
                .schema('morpheus')
                .from('ywishlist')
                .insert({
                    yproduit_id: productId,
                    yuser_id: user.id
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] });
        },
    });

    const removeFromWishlistMutation = useMutation({
        mutationFn: async (productId: number) => {
            if (!user?.id) throw new Error('User not authenticated');

            const { error } = await supabase
                .schema('morpheus')
                .from('ywishlist')
                .delete()
                .eq('yuser_id', user.id)
                .eq('yproduit_id', productId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] });
        },
    });

    const isInWishlist = (productId: number) => {
        return wishlistQuery.data?.some(item => item.yproduit_id === productId) || false;
    };

    return {
        wishlist: wishlistQuery.data || [],
        isLoading: wishlistQuery.isLoading,
        error: wishlistQuery.error,
        addToWishlist: addToWishlistMutation.mutate,
        removeFromWishlist: removeFromWishlistMutation.mutate,
        isInWishlist,
        isAddingToWishlist: addToWishlistMutation.isPending,
        isRemovingFromWishlist: removeFromWishlistMutation.isPending,
    };
}