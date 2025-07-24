import { createClient } from "@/lib/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { Database } from "@/lib/supabase";

type CartRow = Database['morpheus']['Tables']['ypanier']['Row'];
type CartInsert = Database['morpheus']['Tables']['ypanier']['Insert'];

export interface CartItem extends CartRow {
    ypanierqte: number; // Explicitly include this property
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

export function useCart() {
    const supabase = createClient();
    const { data: user } = useAuth();
    const queryClient = useQueryClient();

    const cartQuery = useQuery({
        queryKey: ['cart', user?.id],
        queryFn: async (): Promise<CartItem[]> => {
            if (!user?.id) return [];

            const { data, error } = await supabase
                .schema('morpheus')
                .from('ypanier')
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
                console.error('Error fetching cart:', error);
                return [];
            }

            return data || [];
        },
        enabled: !!user?.id,
    });

    const addToCartMutation = useMutation({
        mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
            if (!user?.id) throw new Error('User not authenticated');

            // Check if item already exists in cart
            const { data: existingItem } = await supabase
                .schema('morpheus')
                .from('ypanier')
                .select('*')
                .eq('yuseridfk', user.id)
                .eq('yvarprodidfk', productId)
                .maybeSingle();

            if (existingItem) {
                // Update quantity if item exists
                const { data, error } = await supabase
                    .schema('morpheus')
                    .from('ypanier')
                    .update({ 
                        ypanierqte: existingItem.ypanierqte + quantity,
                        sysaction: 'UPDATE',
                        sysuser: user.id
                    })
                    .eq('ypanierid', existingItem.ypanierid)
                    .select()
                    .single();

                if (error) throw error;
                return data;
            } else {
                // Get the next available ID
                const { data: maxIdData } = await supabase
                    .schema('morpheus')
                    .from('ypanier')
                    .select('ypanierid')
                    .order('ypanierid', { ascending: false })
                    .limit(1)
                    .single();

                const nextId = (maxIdData?.ypanierid || 0) + 1;

                // Add new item
                const insertData: CartInsert = {
                    ypanierid: nextId,
                    yvarprodidfk: productId,
                    ypanierqte: quantity,
                    yuseridfk: user.id,
                    sysaction: 'INSERT',
                    sysuser: user.id
                };

                const { data, error } = await supabase
                    .schema('morpheus')
                    .from('ypanier')
                    .insert(insertData)
                    .select()
                    .single();

                if (error) throw error;
                return data;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
        },
    });

    const removeFromCartMutation = useMutation({
        mutationFn: async (itemId: number) => {
            const { error } = await supabase
                .schema('morpheus')
                .from('ypanier')
                .delete()
                .eq('ypanierid', itemId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
        },
    });

    const updateQuantityMutation = useMutation({
        mutationFn: async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
            if (quantity <= 0) {
                return removeFromCartMutation.mutateAsync(itemId);
            }

            const { error } = await supabase
                .schema('morpheus')
                .from('ypanier')
                .update({ 
                    ypanierqte: quantity,
                    sysaction: 'UPDATE',
                    sysuser: user?.id || ''
                })
                .eq('ypanierid', itemId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
        },
    });

    const getTotalItems = () => {
        return cartQuery.data?.reduce((total, item) => total + (item.ypanierqte || 0), 0) || 0;
    };

    const getTotalPrice = () => {
        return cartQuery.data?.reduce((total, item) => {
            const price = item.yvarprod?.yvarprodprixpromotion || item.yvarprod?.yvarprodprixcatalogue || 0;
            return total + (price * (item.ypanierqte || 0));
        }, 0) || 0;
    };

    return {
        cart: cartQuery.data || [],
        isLoading: cartQuery.isLoading,
        error: cartQuery.error,
        addToCart: addToCartMutation.mutate,
        removeFromCart: removeFromCartMutation.mutate,
        updateQuantity: updateQuantityMutation.mutate,
        isAddingToCart: addToCartMutation.isPending,
        isRemovingFromCart: removeFromCartMutation.isPending,
        isUpdatingQuantity: updateQuantityMutation.isPending,
        getTotalItems,
        getTotalPrice,
    };
}