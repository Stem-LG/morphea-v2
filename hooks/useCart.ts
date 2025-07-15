import { createClient } from "@/lib/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

export interface CartItem {
    id: number;
    yproduit_id: number;
    yquantite: number;
    ycouleur: string | null;
    created_at: string;
    yuser_id: string;
}

export function useCart() {
    const supabase = createClient();
    const { data: user } = useAuth();
    const queryClient = useQueryClient();

    const cartQuery = useQuery({
        queryKey: ['cart', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];

            const { data, error } = await supabase
                .schema('morpheus')
                .from('ypanier')
                .select(`
                    *,
                    yproduit:yproduit_id (
                        yproduitid,
                        yproduitintitule,
                        imageurl,
                        yproduitdetailstech
                    )
                `)
                .eq('yuser_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching cart:', error);
                return [];
            }

            return data || [];
        },
        enabled: !!user?.id,
    });

    const addToCartMutation = useMutation({
        mutationFn: async ({ productId, quantity, color }: { productId: number; quantity: number; color?: string }) => {
            if (!user?.id) throw new Error('User not authenticated');

            // Check if item already exists in cart
            const { data: existingItem } = await supabase
                .schema('morpheus')
                .from('ypanier')
                .select('*')
                .eq('yuser_id', user.id)
                .eq('yproduit_id', productId)
                .eq('ycouleur', color || null)
                .single();

            if (existingItem) {
                // Update quantity if item exists
                const { data, error } = await supabase
                    .schema('morpheus')
                    .from('ypanier')
                    .update({ yquantite: existingItem.yquantite + quantity })
                    .eq('id', existingItem.id)
                    .select()
                    .single();

                if (error) throw error;
                return data;
            } else {
                // Add new item
                const { data, error } = await supabase
                    .schema('morpheus')
                    .from('ypanier')
                    .insert({
                        yproduit_id: productId,
                        yquantite: quantity,
                        ycouleur: color || null,
                        yuser_id: user.id
                    })
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
                .eq('id', itemId);

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
                .update({ yquantite: quantity })
                .eq('id', itemId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
        },
    });

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
    };
}