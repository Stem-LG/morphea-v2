import { createClient } from "@/lib/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { Database } from "@/lib/supabase";

type WishlistRow = Database['morpheus']['Tables']['ywishlist']['Row'];
type WishlistInsert = Database['morpheus']['Tables']['ywishlist']['Insert'];

export interface WishlistItem extends WishlistRow {
    yvarprodidfk: number; // Explicitly include this property
    yvarprod?: {
        yvarprodid: number;
        yvarprodintitule: string;
        yvarprodcode: string;
        yvarprodprixcatalogue: number;
        yvarprodprixpromotion: number | null;
        yprod?: {
            yprodid: number;
            yprodintitule: string;
            yproddetailstech: string;
            yprodinfobulle: string;
        } | null;
        xcouleur?: {
            xcouleurid: number;
            xcouleurintitule: string;
            xcouleurhexa: string;
        } | null;
        xtaille?: {
            xtailleid: number;
            xtailleintitule: string;
        } | null;
    } | null;
}

export function useWishlist() {
    const supabase = createClient();
    const { data: user } = useAuth();
    const queryClient = useQueryClient();

    const wishlistQuery = useQuery({
        queryKey: ['wishlist', user?.id],
        queryFn: async (): Promise<WishlistItem[]> => {
            if (!user?.id) return [];
            
            const { data, error } = await supabase
                .schema('morpheus')
                .from('ywishlist')
                .select(`
                    *,
                    yvarprod:yvarprodidfk (
                        yvarprodid,
                        yvarprodintitule,
                        yvarprodcode,
                        yvarprodprixcatalogue,
                        yvarprodprixpromotion,
                        yprod:yprodidfk (
                            yprodid,
                            yprodintitule,
                            yproddetailstech,
                            yprodinfobulle
                        ),
                        xcouleur:xcouleuridfk (
                            xcouleurid,
                            xcouleurintitule,
                            xcouleurhexa
                        ),
                        xtaille:xtailleidfk (
                            xtailleid,
                            xtailleintitule
                        )
                    )
                `)
                .eq('yuseridfk', user.id)
                .order('sysdate', { ascending: false });

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
                .eq('yuseridfk', user.id)
                .eq('yvarprodidfk', productId)
                .maybeSingle();

            if (existingItem) {
                throw new Error('Item already in wishlist');
            }

            // Get the next available ID
            const { data: maxIdData } = await supabase
                .schema('morpheus')
                .from('ywishlist')
                .select('ywishlistid')
                .order('ywishlistid', { ascending: false })
                .limit(1)
                .single();

            const nextId = (maxIdData?.ywishlistid || 0) + 1;

            const insertData: WishlistInsert = {
                ywishlistid: nextId,
                yvarprodidfk: productId,
                yuseridfk: user.id,
                sysaction: 'INSERT',
                sysuser: user.id
            };

            const { data, error } = await supabase
                .schema('morpheus')
                .from('ywishlist')
                .insert(insertData)
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
                .eq('yuseridfk', user.id)
                .eq('yvarprodidfk', productId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] });
        },
    });

    const isInWishlist = (productId: number) => {
        return wishlistQuery.data?.some(item => item.yvarprodidfk === productId) || false;
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