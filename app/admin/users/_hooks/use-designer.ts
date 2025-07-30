"use client";

import { createClient } from "@/lib/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DesignerFormData } from "../_components/designer-form";

interface Designer extends DesignerFormData {
    ydesignid: number;
    yuseridfk: string;
    ydesignmorpheusdate: string;
}

export function useDesigner(userId?: string) {
    const supabase = createClient();

    return useQuery({
        queryKey: ["designer", userId],
        queryFn: async () => {
            if (!userId) return null;

            const { data, error } = await supabase
                .schema("morpheus")
                .from("ydesign")
                .select("*")
                .eq("yuseridfk", userId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // No designer found, return null
                    return null;
                }
                throw new Error(error.message);
            }

            return data as Designer;
        },
        enabled: !!userId,
    });
}

export function useCreateDesigner() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ designerData, userId }: { designerData: DesignerFormData; userId: string }) => {
            const insertData = {
                ...designerData,
                yuseridfk: userId,
                ydesignmorpheusdate: new Date().toISOString(),
            };

            const { data, error } = await supabase
                .schema("morpheus")
                .from("ydesign")
                .insert(insertData)
                .select()
                .single();

            if (error) {
                throw new Error(error.message);
            }

            return data as Designer;
        },
        onSuccess: (data) => {
            // Invalidate and refetch designer data
            queryClient.invalidateQueries({ queryKey: ["designer", data.yuseridfk] });
        },
        onError: (error) => {
            console.error("Failed to create designer:", error);
        }
    });
}

export function useUpdateDesigner() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ designerId, designerData, userId }: { 
            designerId: number; 
            designerData: Partial<DesignerFormData>; 
            userId: string 
        }) => {
            const { data, error } = await supabase
                .schema("morpheus")
                .from("ydesign")
                .update(designerData)
                .eq("ydesignid", designerId)
                .eq("yuseridfk", userId)
                .select()
                .single();

            if (error) {
                throw new Error(error.message);
            }

            return data as Designer;
        },
        onSuccess: (data) => {
            // Invalidate and refetch designer data
            queryClient.invalidateQueries({ queryKey: ["designer", data.yuseridfk] });
        },
        onError: (error) => {
            console.error("Failed to update designer:", error);
        }
    });
}

export function useDeleteDesigner() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ designerId, userId }: { designerId: number; userId: string }) => {
            const { error } = await supabase
                .schema("morpheus")
                .from("ydesign")
                .delete()
                .eq("ydesignid", designerId)
                .eq("yuseridfk", userId);

            if (error) {
                throw new Error(error.message);
            }

            return designerId;
        },
        onSuccess: (_, variables) => {
            // Invalidate and refetch designer data
            queryClient.invalidateQueries({ queryKey: ["designer", variables.userId] });
        },
        onError: (error) => {
            console.error("Failed to delete designer:", error);
        }
    });
}

// Hook to check if a user has a designer profile
export function useHasDesigner(userId?: string) {
    const { data: designer, isLoading } = useDesigner(userId);
    
    return {
        hasDesigner: !!designer,
        designer,
        isLoading
    };
}