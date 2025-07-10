import { createClient } from "@/lib/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/lib/supabase";

type Product = Database['morpheus']['Tables']['yproduit']['Row'];
type ProductInsert = Database['morpheus']['Tables']['yproduit']['Insert'];
type ProductUpdate = Database['morpheus']['Tables']['yproduit']['Update'];
type Object3D = Database['morpheus']['Tables']['yobjet3d']['Row'];
type Object3DInsert = Database['morpheus']['Tables']['yobjet3d']['Insert'];
type Object3DUpdate = Database['morpheus']['Tables']['yobjet3d']['Update'];

export interface ProductWithObjects extends Product {
    yobjet3d: Object3D[];
}

export function useProducts(storeId: string | null) {
    const supabase = createClient();

    return useQuery({
        queryKey: ['products', storeId],
        queryFn: async () => {
            if (!storeId) return [];

            // First, get all info spots for the given store (scene)
            const { data: infoSpots, error: infoSpotsError } = await supabase
                .schema("morpheus")
                .from("yinfospots")
                .select("yinfospotactionsidfk")
                .eq("ysceneid", storeId)
                .not("yinfospotactionsidfk", "is", null);

            if (infoSpotsError) {
                console.error("Error fetching info spots:", infoSpotsError);
                throw infoSpotsError;
            }

            if (!infoSpots || infoSpots.length === 0) {
                return [];
            }

            // Extract unique action IDs
            const actionIds = [...new Set(infoSpots.map(spot => spot.yinfospotactionsidfk).filter(Boolean))];

            if (actionIds.length === 0) {
                return [];
            }

            // Then get all products for those info spot actions
            const { data, error } = await supabase
                .schema("morpheus")
                .from("yproduit")
                .select("*, yobjet3d(*)")
                .in("yinfospotactionsidfk", actionIds)
                .order("yproduitid");

            if (error) {
                console.error("Error fetching products:", {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
                throw error;
            }

            return data as ProductWithObjects[] || [];
        },
        enabled: !!storeId,
    });
}

export function useProductsByCategory(categoryId: string | null) {
    const supabase = createClient();

    return useQuery({
        queryKey: ['products-by-category', categoryId],
        queryFn: async () => {
            if (!categoryId) return [];

            const { data, error } = await supabase
                .schema("morpheus")
                .from("yproduit")
                .select("*, yobjet3d(*)")
                .eq("yinfospotactionsidfk", categoryId)
                .order("yproduitid");

            if (error) {
                console.error("Error fetching products by category:", {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
                throw error;
            }

            return data as ProductWithObjects[] || [];
        },
        enabled: !!categoryId,
    });
}

export function useCreateProduct() {
    const queryClient = useQueryClient();
    const supabase = createClient();

    return useMutation({
        mutationFn: async (product: ProductInsert) => {
            const { data, error } = await supabase
                .schema("morpheus")
                .from("yproduit")
                .insert(product)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['products', data.yinfospotactionsidfk] });
        },
    });
}

export function useUpdateProduct() {
    const queryClient = useQueryClient();
    const supabase = createClient();

    return useMutation({
        mutationFn: async ({ id, updates }: { id: number; updates: ProductUpdate }) => {
            const { data, error } = await supabase
                .schema("morpheus")
                .from("yproduit")
                .update(updates)
                .eq("yproduitid", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['products', data.yinfospotactionsidfk] });
        },
    });
}

export function useDeleteProduct() {
    const queryClient = useQueryClient();
    const supabase = createClient();

    return useMutation({
        mutationFn: async (id: number) => {
            // First delete all associated 3D objects
            await supabase
                .schema("morpheus")
                .from("yobjet3d")
                .delete()
                .eq("produit_id", id);

            // Then delete the product
            const { error } = await supabase
                .schema("morpheus")
                .from("yproduit")
                .delete()
                .eq("yproduitid", id);

            if (error) throw error;
            return id;
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

export function useCreate3DObject() {
    const queryClient = useQueryClient();
    const supabase = createClient();

    return useMutation({
        mutationFn: async (object3d: Object3DInsert) => {
            const { data, error } = await supabase
                .schema("morpheus")
                .from("yobjet3d")
                .insert(object3d)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

export function useUpdate3DObject() {
    const queryClient = useQueryClient();
    const supabase = createClient();

    return useMutation({
        mutationFn: async ({ id, updates }: { id: number; updates: Object3DUpdate }) => {
            const { data, error } = await supabase
                .schema("morpheus")
                .from("yobjet3d")
                .update(updates)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

export function useDelete3DObject() {
    const queryClient = useQueryClient();
    const supabase = createClient();

    return useMutation({
        mutationFn: async (id: number) => {
            const { error } = await supabase
                .schema("morpheus")
                .from("yobjet3d")
                .delete()
                .eq("id", id);

            if (error) throw error;
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}
