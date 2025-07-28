import { useMutation, useQueryClient } from "@tanstack/react-query";

interface VariantApprovalData {
    yvarprodprixcatalogue: number;
    yvarprodprixpromotion: number | null;
    yvarprodpromotiondatedeb: string | null;
    yvarprodpromotiondatefin: string | null;
    yvarprodnbrjourlivraison: number;
    currencyId: number;
}

// Hook to approve a single variant
export function useApproveVariant() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ 
            variantId, 
            approvalData 
        }: { 
            variantId: number; 
            approvalData: VariantApprovalData 
        }) => {
            const response = await fetch('/api/admin/products/variants/approvals', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    variantId,
                    action: 'approve',
                    approvalData
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to approve variant');
            }

            return response.json();
        },
        onSuccess: () => {
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ['pending-products'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['product-variants'] });
        },
    });
}

// Hook to mark a variant as needs revision
export function useNeedsRevisionVariant() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ 
            variantId, 
            comments 
        }: { 
            variantId: number; 
            comments: string 
        }) => {
            const response = await fetch('/api/admin/products/variants/approvals', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    variantId,
                    action: 'needs_revision',
                    comments
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to mark variant as needs revision');
            }

            return response.json();
        },
        onSuccess: () => {
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ['pending-products'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['product-variants'] });
        },
    });
}

// Hook to reject a variant
export function useRejectVariant() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ variantId }: { variantId: number }) => {
            const response = await fetch('/api/admin/products/variants/approvals', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    variantId,
                    action: 'reject'
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to reject variant');
            }

            return response.json();
        },
        onSuccess: () => {
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ['pending-products'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['product-variants'] });
        },
    });
}

// Hook to approve all variants at once (bulk approval)
export function useBulkApproveVariants() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ 
            variantIds, 
            approvalData 
        }: { 
            variantIds: number[]; 
            approvalData: Record<number, VariantApprovalData>
        }) => {
            const response = await fetch('/api/admin/products/variants/approvals', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'bulk_approve',
                    variants: variantIds.map(id => ({
                        variantId: id,
                        approvalData: approvalData[id]
                    }))
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to bulk approve variants');
            }

            return response.json();
        },
        onSuccess: () => {
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ['pending-products'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['product-variants'] });
        },
    });
}
