"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";

interface UpdateVisibilityParams {
    productId: number;
    yestvisible: boolean;
}

interface BulkUpdateVisibilityParams {
    productIds: number[];
    yestvisible: boolean;
}

export function useProductVisibility() {
    const { t } = useLanguage();
    const queryClient = useQueryClient();

    const updateSingleVisibility = useMutation({
        mutationFn: async ({ productId, yestvisible }: UpdateVisibilityParams) => {
            const response = await fetch('/api/admin/products/visibility', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ productId, yestvisible }),
            });

            if (!response.ok) {
                throw new Error('Failed to update product visibility');
            }

            return response.json();
        },
        onMutate: async ({ productId, yestvisible }: UpdateVisibilityParams) => {
            // Cancel any outgoing refetches so they don't overwrite our optimistic update
            await queryClient.cancelQueries({ queryKey: ['products-by-status'] });
            await queryClient.cancelQueries({ queryKey: ['approved-products'] });

            // Snapshot the previous values
            const previousProductsData = queryClient.getQueriesData({ queryKey: ['products-by-status'] });
            const previousApprovedData = queryClient.getQueriesData({ queryKey: ['approved-products'] });

            // Optimistically update the cache
            queryClient.setQueriesData({ queryKey: ['products-by-status'] }, (oldData: any) => {
                if (!oldData?.data) return oldData;
                
                return {
                    ...oldData,
                    data: oldData.data.map((product: any) => 
                        product.yprodid === productId 
                            ? { ...product, yestvisible }
                            : product
                    )
                };
            });

            queryClient.setQueriesData({ queryKey: ['approved-products'] }, (oldData: any) => {
                if (!oldData?.data) return oldData;
                
                return {
                    ...oldData,
                    data: oldData.data.map((product: any) => 
                        product.yprodid === productId 
                            ? { ...product, yestvisible }
                            : product
                    )
                };
            });

            // Return a context object with the snapshotted value
            return { previousProductsData, previousApprovedData };
        },
        onError: (error, variables, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousProductsData) {
                context.previousProductsData.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            if (context?.previousApprovedData) {
                context.previousApprovedData.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            
            console.error('Error updating product visibility:', error);
            toast.error(t("admin.errorUpdatingVisibility") || "Failed to update product visibility");
        },
        onSuccess: (data, variables) => {
            toast.success(
                variables.yestvisible 
                    ? (t("admin.productMadeVisible") || "Product made visible")
                    : (t("admin.productMadeInvisible") || "Product made invisible")
            );
        },
        onSettled: () => {
            // Always refetch after error or success to ensure we have the latest data
            queryClient.invalidateQueries({ queryKey: ['products-by-status'] });
            queryClient.invalidateQueries({ queryKey: ['approved-products'] });
        },
    });

    const updateBulkVisibility = useMutation({
        mutationFn: async ({ productIds, yestvisible }: BulkUpdateVisibilityParams) => {
            const response = await fetch('/api/admin/products/visibility', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ productIds, yestvisible }),
            });

            if (!response.ok) {
                throw new Error('Failed to bulk update product visibility');
            }

            return response.json();
        },
        onMutate: async ({ productIds, yestvisible }: BulkUpdateVisibilityParams) => {
            // Cancel any outgoing refetches so they don't overwrite our optimistic update
            await queryClient.cancelQueries({ queryKey: ['products-by-status'] });
            await queryClient.cancelQueries({ queryKey: ['approved-products'] });

            // Snapshot the previous values
            const previousProductsData = queryClient.getQueriesData({ queryKey: ['products-by-status'] });
            const previousApprovedData = queryClient.getQueriesData({ queryKey: ['approved-products'] });

            // Optimistically update the cache
            queryClient.setQueriesData({ queryKey: ['products-by-status'] }, (oldData: any) => {
                if (!oldData?.data) return oldData;
                
                return {
                    ...oldData,
                    data: oldData.data.map((product: any) => 
                        productIds.includes(product.yprodid)
                            ? { ...product, yestvisible }
                            : product
                    )
                };
            });

            queryClient.setQueriesData({ queryKey: ['approved-products'] }, (oldData: any) => {
                if (!oldData?.data) return oldData;
                
                return {
                    ...oldData,
                    data: oldData.data.map((product: any) => 
                        productIds.includes(product.yprodid)
                            ? { ...product, yestvisible }
                            : product
                    )
                };
            });

            // Return a context object with the snapshotted value
            return { previousProductsData, previousApprovedData };
        },
        onError: (error, variables, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousProductsData) {
                context.previousProductsData.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            if (context?.previousApprovedData) {
                context.previousApprovedData.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            
            console.error('Error bulk updating product visibility:', error);
            toast.error(t("admin.errorBulkUpdatingVisibility") || "Failed to bulk update product visibility");
        },
        onSuccess: (data, variables) => {
            toast.success(
                variables.yestvisible 
                    ? (t("admin.productsAllMadeVisible") || `${variables.productIds.length} products made visible`)
                    : (t("admin.productsAllMadeInvisible") || `${variables.productIds.length} products made invisible`)
            );
        },
        onSettled: () => {
            // Always refetch after error or success to ensure we have the latest data
            queryClient.invalidateQueries({ queryKey: ['products-by-status'] });
            queryClient.invalidateQueries({ queryKey: ['approved-products'] });
        },
    });

    return {
        updateSingleVisibility,
        updateBulkVisibility,
        isUpdatingSingle: updateSingleVisibility.isPending,
        isBulkUpdating: updateBulkVisibility.isPending,
    };
}