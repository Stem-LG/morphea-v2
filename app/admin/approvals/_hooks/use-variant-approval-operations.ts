"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/lib/client";

interface VariantApprovalData {
    yvarprodprixcatalogue: number;
    yvarprodprixpromotion?: number;
    yvarprodpromotiondatedeb?: string;
    yvarprodpromotiondatefin?: string;
    yvarprodnbrjourlivraison: number;
    currencyId: number;
}

export function useVariantApprovalOperations() {
    const queryClient = useQueryClient();
    const supabase = createClient();

    // Approve individual variant
    const approveVariant = useMutation({
        mutationFn: async ({
            variantId,
            approvalData
        }: {
            variantId: number;
            approvalData: VariantApprovalData
        }) => {
            const currentTime = new Date().toISOString();
            
            // Validate currency ID exists
            if (approvalData.currencyId) {
                const { data: currency } = await supabase
                    .schema('morpheus')
                    .from('xdevise')
                    .select('xdeviseid')
                    .eq('xdeviseid', approvalData.currencyId)
                    .single();
                
                if (!currency) {
                    throw new Error('Invalid currency selected');
                }
            }
            
            const updateData: any = {
                yvarprodprixcatalogue: approvalData.yvarprodprixcatalogue,
                yvarprodprixpromotion: approvalData.yvarprodprixpromotion || null,
                yvarprodpromotiondatedeb: approvalData.yvarprodpromotiondatedeb || null,
                yvarprodpromotiondatefin: approvalData.yvarprodpromotiondatefin || null,
                yvarprodnbrjourlivraison: approvalData.yvarprodnbrjourlivraison,
                yvarprodstatut: 'approved',
                sysdate: currentTime,
                sysaction: 'update'
            };

            // Only update currency if provided and valid
            if (approvalData.currencyId && approvalData.currencyId > 0) {
                updateData.xdeviseidfk = approvalData.currencyId;
            }
            
            const { data: updatedVariant, error: updateError } = await supabase
                .schema('morpheus')
                .from('yvarprod')
                .update(updateData)
                .eq('yvarprodid', variantId)
                .select()
                .single();

            if (updateError) {
                throw new Error(updateError.message || 'Failed to approve variant');
            }

            return {
                variant: updatedVariant,
                message: 'Variant approved successfully'
            };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["approvals"] });
            queryClient.invalidateQueries({ queryKey: ["approval-stats"] });
            queryClient.invalidateQueries({ queryKey: ["product-details-approval"] });
            toast.success(data.message);
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to approve variant');
        },
    });

    // Mark variant as needs revision
    const markVariantNeedsRevision = useMutation({
        mutationFn: async (variantId: number) => {
            const currentTime = new Date().toISOString();
            
            const { data: updatedVariant, error: updateError } = await supabase
                .schema('morpheus')
                .from('yvarprod')
                .update({
                    yvarprodstatut: 'rejected',
                    sysdate: currentTime,
                    sysaction: 'update'
                })
                .eq('yvarprodid', variantId)
                .select()
                .single();

            if (updateError) {
                throw new Error(updateError.message || 'Failed to mark variant for revision');
            }

            return {
                variant: updatedVariant,
                message: 'Variant marked as needs revision'
            };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["approvals"] });
            queryClient.invalidateQueries({ queryKey: ["approval-stats"] });
            queryClient.invalidateQueries({ queryKey: ["product-details-approval"] });
            toast.success(data.message);
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to mark variant for revision');
        },
    });

    // Deny variant
    const denyVariant = useMutation({
        mutationFn: async (variantId: number) => {
            const currentTime = new Date().toISOString();
            
            const { data: updatedVariant, error: updateError } = await supabase
                .schema('morpheus')
                .from('yvarprod')
                .update({
                    yvarprodstatut: 'rejected',
                    sysdate: currentTime,
                    sysaction: 'update'
                })
                .eq('yvarprodid', variantId)
                .select()
                .single();

            if (updateError) {
                throw new Error(updateError.message || 'Failed to deny variant');
            }

            return {
                variant: updatedVariant,
                message: 'Variant denied successfully'
            };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["approvals"] });
            queryClient.invalidateQueries({ queryKey: ["approval-stats"] });
            queryClient.invalidateQueries({ queryKey: ["product-details-approval"] });
            toast.success(data.message);
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to deny variant');
        },
    });

    // Bulk approve all variants for a product
    const bulkApproveVariants = useMutation({
        mutationFn: async ({
            variantApprovals
        }: {
            variantApprovals: Array<{ variantId: number; approvalData: VariantApprovalData }>
        }) => {
            const currentTime = new Date().toISOString();
            
            // Update all variants
            for (const { variantId, approvalData } of variantApprovals) {
                // Validate currency ID exists
                if (approvalData.currencyId) {
                    const { data: currency } = await supabase
                        .schema('morpheus')
                        .from('xdevise')
                        .select('xdeviseid')
                        .eq('xdeviseid', approvalData.currencyId)
                        .single();
                    
                    if (!currency) {
                        throw new Error(`Invalid currency selected for variant ${variantId}`);
                    }
                }

                const updateData: any = {
                    yvarprodprixcatalogue: approvalData.yvarprodprixcatalogue,
                    yvarprodprixpromotion: approvalData.yvarprodprixpromotion || null,
                    yvarprodpromotiondatedeb: approvalData.yvarprodpromotiondatedeb || null,
                    yvarprodpromotiondatefin: approvalData.yvarprodpromotiondatefin || null,
                    yvarprodnbrjourlivraison: approvalData.yvarprodnbrjourlivraison,
                    yvarprodstatut: 'approved',
                    sysdate: currentTime,
                    sysaction: 'update'
                };

                // Only update currency if provided and valid
                if (approvalData.currencyId && approvalData.currencyId > 0) {
                    updateData.xdeviseidfk = approvalData.currencyId;
                }

                const { error: variantError } = await supabase
                    .schema('morpheus')
                    .from('yvarprod')
                    .update(updateData)
                    .eq('yvarprodid', variantId);

                if (variantError) {
                    throw new Error(`Failed to approve variant ${variantId}: ${variantError.message}`);
                }
            }

            return {
                message: `${variantApprovals.length} variants approved successfully`
            };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["approvals"] });
            queryClient.invalidateQueries({ queryKey: ["approval-stats"] });
            queryClient.invalidateQueries({ queryKey: ["product-details-approval"] });
            toast.success(data.message);
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to approve variants');
        },
    });

    // Reset variant status to not_approved
    const resetVariantStatus = useMutation({
        mutationFn: async (variantId: number) => {
            const currentTime = new Date().toISOString();
            
            const { data: updatedVariant, error: updateError } = await supabase
                .schema('morpheus')
                .from('yvarprod')
                .update({
                    yvarprodstatut: 'not_approved',
                    sysdate: currentTime,
                    sysaction: 'update'
                })
                .eq('yvarprodid', variantId)
                .select()
                .single();

            if (updateError) {
                throw new Error(updateError.message || 'Failed to reset variant status');
            }

            return {
                variant: updatedVariant,
                message: 'Variant status reset to pending approval'
            };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["approvals"] });
            queryClient.invalidateQueries({ queryKey: ["approval-stats"] });
            queryClient.invalidateQueries({ queryKey: ["product-details-approval"] });
            toast.success(data.message);
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to reset variant status');
        },
    });

    return {
        approveVariant,
        markVariantNeedsRevision,
        denyVariant,
        bulkApproveVariants,
        resetVariantStatus,
        isLoading: approveVariant.isPending || 
                  markVariantNeedsRevision.isPending || 
                  denyVariant.isPending || 
                  bulkApproveVariants.isPending ||
                  resetVariantStatus.isPending
    };
}