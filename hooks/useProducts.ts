import { createClient } from "@/lib/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/lib/supabase";

type Product = Database['morpheus']['Tables']['yprod']['Row'];
type ProductInsert = Database['morpheus']['Tables']['yprod']['Insert'];
type ProductUpdate = Database['morpheus']['Tables']['yprod']['Update'];
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
                .select("yinfospotactionidfk")
                .eq("yscenesidfk", parseInt(storeId))
                .not("yinfospotactionidfk", "is", null);

            if (infoSpotsError) {
                console.error("Error fetching info spots:", infoSpotsError);
                throw infoSpotsError;
            }

            if (!infoSpots || infoSpots.length === 0) {
                return [];
            }

            // Extract unique action IDs
            const actionIds = [...new Set(infoSpots.map(spot => spot.yinfospotactionidfk).filter(Boolean))];

            if (actionIds.length === 0) {
                return [];
            }

            // Get products through ydetailsevent table which links events to products
            const { data: eventDetails, error: eventDetailsError } = await supabase
                .schema("morpheus")
                .from("ydetailsevent")
                .select("yprodidfk")
                .not("yprodidfk", "is", null);

            if (eventDetailsError) {
                console.error("Error fetching event details:", eventDetailsError);
                throw eventDetailsError;
            }

            if (!eventDetails || eventDetails.length === 0) {
                return [];
            }

            const productIds = [...new Set(eventDetails.map(detail => detail.yprodidfk).filter(Boolean))];

            if (productIds.length === 0) {
                return [];
            }

            // Then get all products (without 3D objects for now due to relationship complexity)
            const { data, error } = await supabase
                .schema("morpheus")
                .from("yprod")
                .select("*")
                .in("yprodid", productIds)
                .order("yprodid");

            if (error) {
                console.error("Error fetching products:", {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
                throw error;
            }

            // Add empty yobjet3d array to match ProductWithObjects interface
            const productsWithObjects = data?.map(product => ({
                ...product,
                yobjet3d: []
            })) || [];

            return productsWithObjects as ProductWithObjects[];
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
                .from("yprod")
                .select("*")
                .eq("xcategprodidfk", parseInt(categoryId))
                .order("yprodid");

            if (error) {
                console.error("Error fetching products by category:", {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
                throw error;
            }

            // Add empty yobjet3d array to match ProductWithObjects interface
            const productsWithObjects = data?.map(product => ({
                ...product,
                yobjet3d: []
            })) || [];

            return productsWithObjects as ProductWithObjects[];
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
                .from("yprod")
                .insert(product)
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

export function useUpdateProduct() {
    const queryClient = useQueryClient();
    const supabase = createClient();

    return useMutation({
        mutationFn: async ({ id, updates }: { id: number; updates: ProductUpdate }) => {
            const { data, error } = await supabase
                .schema("morpheus")
                .from("yprod")
                .update(updates)
                .eq("yprodid", id)
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
                .eq("yvarprodidfk", id);

            // Then delete the product
            const { error } = await supabase
                .schema("morpheus")
                .from("yprod")
                .delete()
                .eq("yprodid", id);

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
                .eq("yobjet3did", id)
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
                .eq("yobjet3did", id);

            if (error) throw error;
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}
