import { createClient } from "@/lib/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/lib/supabase";

type Category = Database['morpheus']['Tables']['xcategprod']['Row'];
type CategoryInsert = Database['morpheus']['Tables']['xcategprod']['Insert'];
type CategoryUpdate = Database['morpheus']['Tables']['xcategprod']['Update'];

// Hook to fetch all categories
export function useCategories() {
    const supabase = createClient();

    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data, error } = await supabase
                .schema("morpheus")
                .from("xcategprod")
                .select("*")
                .order("xcategprodintitule", { ascending: true });

            if (error) {
                console.error("Error fetching categories:", error);
                throw error;
            }

            return data as Category[];
        },
    });
}

// Hook to get a single category by ID
export function useCategory(categoryId: number | null) {
    const supabase = createClient();

    return useQuery({
        queryKey: ['category', categoryId],
        queryFn: async () => {
            if (!categoryId) return null;

            const { data, error } = await supabase
                .schema("morpheus")
                .from("xcategprod")
                .select("*")
                .eq("xcategprodid", categoryId)
                .single();

            if (error) {
                console.error("Error fetching category:", error);
                throw error;
            }

            return data as Category;
        },
        enabled: !!categoryId,
    });
}

// Hook to create a new category
export function useCreateCategory() {
    const queryClient = useQueryClient();
    const supabase = createClient();

    return useMutation({
        mutationFn: async (categoryData: Omit<CategoryInsert, 'xcategprodid' | 'sysdate' | 'sysaction' | 'sysuser' | 'sysadresseip'>) => {
            const currentTime = new Date().toISOString();
            
            const { data, error } = await supabase
                .schema("morpheus")
                .from("xcategprod")
                .insert({
                    ...categoryData,
                    sysdate: currentTime,
                    sysaction: 'insert',
                    sysuser: 'admin', // This should be replaced with actual user
                    sysadresseip: null
                })
                .select()
                .single();

            if (error) {
                console.error("Error creating category:", error);
                throw error;
            }

            return data as Category;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['categories-with-stats'] });
        },
    });
}

// Hook to update a category
export function useUpdateCategory() {
    const queryClient = useQueryClient();
    const supabase = createClient();

    return useMutation({
        mutationFn: async ({ categoryId, updates }: { categoryId: number; updates: Partial<CategoryUpdate> }) => {
            const currentTime = new Date().toISOString();
            
            const { data, error } = await supabase
                .schema("morpheus")
                .from("xcategprod")
                .update({
                    ...updates,
                    sysdate: currentTime,
                    sysaction: 'update',
                    sysuser: 'admin', // This should be replaced with actual user
                })
                .eq("xcategprodid", categoryId)
                .select()
                .single();

            if (error) {
                console.error("Error updating category:", error);
                throw error;
            }

            return data as Category;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['categories-with-stats'] });
            queryClient.invalidateQueries({ queryKey: ['category', data.xcategprodid] });
        },
    });
}

// Hook to delete a category
export function useDeleteCategory() {
    const queryClient = useQueryClient();
    const supabase = createClient();

    return useMutation({
        mutationFn: async (categoryId: number) => {
            // First check if category is being used by any products
            const { data: productsUsingCategory, error: checkError } = await supabase
                .schema("morpheus")
                .from("yprod")
                .select("yprodid")
                .eq("xcategprodidfk", categoryId)
                .limit(1);

            if (checkError) {
                console.error("Error checking category usage:", checkError);
                throw checkError;
            }

            if (productsUsingCategory && productsUsingCategory.length > 0) {
                throw new Error("Cannot delete category: it is being used by one or more products");
            }

            const { error } = await supabase
                .schema("morpheus")
                .from("xcategprod")
                .delete()
                .eq("xcategprodid", categoryId);

            if (error) {
                console.error("Error deleting category:", error);
                throw error;
            }

            return categoryId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['categories-with-stats'] });
        },
    });
}

// Hook to get categories with product count
export function useCategoriesWithStats() {
    const supabase = createClient();

    return useQuery({
        queryKey: ['categories-with-stats'],
        queryFn: async () => {
            const { data, error } = await supabase
                .schema("morpheus")
                .from("xcategprod")
                .select(`
                    *,
                    yprod(count)
                `)
                .order("xcategprodintitule", { ascending: true });

            if (error) {
                console.error("Error fetching categories with stats:", error);
                throw error;
            }

            return data as (Category & { yprod: { count: number }[] })[];
        },
    });
}
