import { createClient } from "@/lib/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/lib/supabase";
import { uploadFile } from "@/app/_hooks/use-upload-file";
import { useCreateMedia } from "@/app/_hooks/use-create-media";

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
                .select(`
                    *,
                    media:xcategprodmediaid(
                        ymediaid,
                        ymediaurl,
                        ymediaintitule,
                        ymediacode
                    )
                `)
                .order("xcategprodintitule", { ascending: true });

            if (error) {
                console.error("Error fetching categories:", error);
                throw error;
            }

            return data as (Category & { media?: any })[];
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
        mutationFn: async (categoryData: Omit<CategoryInsert, 'xcategprodid' | 'sysdate' | 'sysaction' | 'sysuser' | 'sysadresseip'> & { imageFile?: File }) => {
            const currentTime = new Date().toISOString();
            let mediaId: number | null = null;

            // Handle image upload if provided
            if (categoryData.imageFile) {
                try {
                    // Upload file to storage
                    const fileUrl = await uploadFile({ file: categoryData.imageFile, type: "image" });

                    // Create media record
                    const { data: mediaData, error: mediaError } = await supabase
                        .schema("morpheus")
                        .from("ymedia")
                        .insert({
                            ymediacode: `category_${Date.now()}`,
                            ymediaboolphotoevent: "0",
                            ymediaboolphotoprod: "0",
                            ymediaboolvideocapsule: "0",
                            ymediaboolphotoeditoriale: false,
                            ymediaboolvideo: false,
                            ymediaintitule: `${categoryData.xcategprodintitule} Image`,
                            ymediaurl: fileUrl,
                        })
                        .select("ymediaid")
                        .single();

                    if (mediaError) {
                        throw new Error(`Failed to create media record: ${mediaError.message}`);
                    }

                    mediaId = mediaData?.ymediaid || null;
                } catch (error) {
                    console.error("Error uploading category image:", error);
                    throw error;
                }
            }

            // Remove imageFile from categoryData before inserting
            const { imageFile, ...insertData } = categoryData;

            const { data, error } = await supabase
                .schema("morpheus")
                .from("xcategprod")
                .insert({
                    ...insertData,
                    xcategprodmediaid: mediaId,
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
        mutationFn: async ({ categoryId, updates, imageFile }: { categoryId: number; updates: Partial<CategoryUpdate>; imageFile?: File }) => {
            const currentTime = new Date().toISOString();
            let mediaId: number | null = updates.xcategprodmediaid || null;

            // Handle image upload if provided
            if (imageFile) {
                try {
                    // Upload file to storage
                    const fileUrl = await uploadFile({ file: imageFile, type: "image" });

                    // Create media record
                    const { data: mediaData, error: mediaError } = await supabase
                        .schema("morpheus")
                        .from("ymedia")
                        .insert({
                            ymediacode: `category_${categoryId}_${Date.now()}`,
                            ymediaboolphotoevent: "0",
                            ymediaboolphotoprod: "0",
                            ymediaboolvideocapsule: "0",
                            ymediaboolphotoeditoriale: false,
                            ymediaboolvideo: false,
                            ymediaintitule: `Category ${categoryId} Image`,
                            ymediaurl: fileUrl,
                        })
                        .select("ymediaid")
                        .single();

                    if (mediaError) {
                        throw new Error(`Failed to create media record: ${mediaError.message}`);
                    }

                    mediaId = mediaData?.ymediaid || null;
                } catch (error) {
                    console.error("Error uploading category image:", error);
                    throw error;
                }
            }

            const { data, error } = await supabase
                .schema("morpheus")
                .from("xcategprod")
                .update({
                    ...updates,
                    xcategprodmediaid: mediaId,
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
                    yprod(count),
                    media:xcategprodmediaid(
                        ymediaid,
                        ymediaurl,
                        ymediaintitule,
                        ymediacode
                    )
                `)
                .order("xcategprodintitule", { ascending: true });

            if (error) {
                console.error("Error fetching categories with stats:", error);
                throw error;
            }

            // Fetch parent category information separately
            const categoryIdsWithParent = data
                .filter(category => category.xcategparentid !== null)
                .map(category => category.xcategparentid);

            if (categoryIdsWithParent.length > 0) {
                const { data: parentCategories, error: parentError } = await supabase
                    .schema("morpheus")
                    .from("xcategprod")
                    .select("xcategprodid, xcategprodintitule, xcategprodcode")
                    .in("xcategprodid", categoryIdsWithParent);

                if (parentError) {
                    console.error("Error fetching parent categories:", parentError);
                    throw parentError;
                }

                // Create a map of parent categories for quick lookup
                const parentCategoryMap = new Map(
                    parentCategories.map(parent => [parent.xcategprodid, parent])
                );

                // Add parent information to each category
                const categoriesWithParent = data.map(category => {
                    if (category.xcategparentid !== null) {
                        return {
                            ...category,
                            parent: parentCategoryMap.get(category.xcategparentid) || null
                        };
                    }
                    return {
                        ...category,
                        parent: null
                    };
                });

                return categoriesWithParent as (Category & { parent?: Pick<Category, 'xcategprodid' | 'xcategprodintitule' | 'xcategprodcode'> | null; yprod: { count: number }[] })[];
            }

            // If no categories have parents, just return the data with null parent
            const categoriesWithNullParent = data.map(category => ({
                ...category,
                parent: null
            }));

            return categoriesWithNullParent as (Category & { parent?: Pick<Category, 'xcategprodid' | 'xcategprodintitule' | 'xcategprodcode'> | null; yprod: { count: number }[] })[];
        },
    });
}
