"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";

interface UpdateVariantVisibilityParams {
    variantId: number;
    yestvisible: boolean;
}

interface BulkUpdateVariantVisibilityParams {
    variantIds: number[];
    yestvisible: boolean;
}

export function useVariantVisibility() {
    const { t } = useLanguage();
    const queryClient = useQueryClient();

    const updateSingleVisibility = useMutation({
        mutationFn: async ({ variantId, yestvisible }: UpdateVariantVisibilityParams) => {
            const response = await fetch('/api/admin/variants/visibility', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ variantId, yestvisible }),
            });

            if (!response.ok) {
                throw new Error('Failed to update variant visibility');
            }

            return response.json();
        },
        onMutate: async ({ variantId, yestvisible }: UpdateVariantVisibilityParams) => {
            // Cancel any outgoing refetches so they don't overwrite our optimistic update
            await queryClient.cancelQueries({ queryKey: ['product-view'] });

            // Snapshot the previous values
            const previousProductViewData = queryClient.getQueriesData({ queryKey: ['product-view'] });

            // Optimistically update the cache
            queryClient.setQueriesData({ queryKey: ['product-view'] }, (oldData: any) => {
                if (!oldData?.variants) return oldData;
                
                return {
                    ...oldData,
                    variants: oldData.variants.map((variant: any) => 
                        variant.yvarprodid === variantId 
                            ? { ...variant, yestvisible }
                            : variant
                    )
                };
            });

            // Return a context object with the snapshotted value
            return { previousProductViewData };
        },
        onError: (error, variables, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousProductViewData) {
                context.previousProductViewData.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            
            console.error('Error updating variant visibility:', error);
            toast.error(t("admin.errorUpdatingVariantVisibility") || "Failed to update variant visibility");
        },
        onSuccess: (data, variables) => {
            toast.success(
                variables.yestvisible 
                    ? (t("admin.variantMadeVisible") || "Variant made visible")
                    : (t("admin.variantMadeInvisible") || "Variant made invisible")
            );
        },
        onSettled: () => {
            // Always refetch after error or success to ensure we have the latest data
            queryClient.invalidateQueries({ queryKey: ['product-view'] });
        },
    });

    const updateBulkVisibility = useMutation({
        mutationFn: async ({ variantIds, yestvisible }: BulkUpdateVariantVisibilityParams) => {
            const response = await fetch('/api/admin/variants/visibility', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ variantIds, yestvisible }),
            });

            if (!response.ok) {
                throw new Error('Failed to bulk update variant visibility');
            }

            return response.json();
        },
        onMutate: async ({ variantIds, yestvisible }: BulkUpdateVariantVisibilityParams) => {
            // Cancel any outgoing refetches so they don't overwrite our optimistic update
            await queryClient.cancelQueries({ queryKey: ['product-view'] });

            // Snapshot the previous values
            const previousProductViewData = queryClient.getQueriesData({ queryKey: ['product-view'] });

            // Optimistically update the cache
            queryClient.setQueriesData({ queryKey: ['product-view'] }, (oldData: any) => {
                if (!oldData?.variants) return oldData;
                
                return {
                    ...oldData,
                    variants: oldData.variants.map((variant: any) => 
                        variantIds.includes(variant.yvarprodid)
                            ? { ...variant, yestvisible }
                            : variant
                    )
                };
            });

            // Return a context object with the snapshotted value
            return { previousProductViewData };
        },
        onError: (error, variables, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousProductViewData) {
                context.previousProductViewData.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            
            console.error('Error bulk updating variant visibility:', error);
            toast.error(t("admin.errorBulkUpdatingVariantVisibility") || "Failed to bulk update variant visibility");
        },
        onSuccess: (data, variables) => {
            toast.success(
                variables.yestvisible 
                    ? (t("admin.variantsAllMadeVisible") || `${variables.variantIds.length} variants made visible`)
                    : (t("admin.variantsAllMadeInvisible") || `${variables.variantIds.length} variants made invisible`)
            );
        },
        onSettled: () => {
            // Always refetch after error or success to ensure we have the latest data
            queryClient.invalidateQueries({ queryKey: ['product-view'] });
        },
    });

    return {
        updateSingleVisibility,
        updateBulkVisibility,
        isUpdatingSingle: updateSingleVisibility.isPending,
        isBulkUpdating: updateBulkVisibility.isPending,
    };
}