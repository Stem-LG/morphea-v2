"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/lib/client";
import { useYDetailsEventOperations } from "./use-ydetailsevent-operations";

interface ApprovalData {
    categoryId?: number;
    infoactionId?: number;
    selectedEventId?: number;
    variants?: Array<{
        yvarprodid: number;
        yvarprodprixcatalogue: number;
        yvarprodprixpromotion?: number;
        yvarprodpromotiondatedeb?: string;
        yvarprodpromotiondatefin?: string;
        yvarprodnbrjourlivraison: number;
        currencyId: number;
    }>;
}

export function useApprovalOperations() {
    const queryClient = useQueryClient();
    const supabase = createClient();
    const { assignProductToEvent } = useYDetailsEventOperations();

    // Individual product approval
    const approveProduct = useMutation({
        mutationFn: async ({ productId, approvalData }: { productId: number; approvalData: ApprovalData }) => {
            const currentTime = new Date().toISOString();
            
            // Update product status and category
            const { data: updatedProduct, error: updateError } = await supabase
                .schema('morpheus')
                .from('yprod')
                .update({
                    yprodstatut: 'approved',
                    xcategprodidfk: approvalData.categoryId,
                    sysdate: currentTime,
                    sysaction: 'update'
                })
                .eq('yprodid', productId)
                .select()
                .single();

            if (updateError) {
                throw new Error(updateError.message || 'Failed to update product status');
            }

            // Update infospotaction in product if provided
            if (approvalData.infoactionId) {
                const { error: detailsError } = await supabase
                    .schema('morpheus')
                    .from('yprod')
                    .update({
                        yinfospotactionsidfk: approvalData.infoactionId,
                        sysdate: currentTime,
                        sysaction: 'update'
                    })
                    .eq('yprodid', productId);

                if (detailsError) {
                    throw new Error(detailsError.message || 'Failed to update product placement');
                }
            }

            // Update variants with pricing, delivery information, and currency
            if (approvalData.variants && approvalData.variants.length > 0) {
                for (const variant of approvalData.variants) {
                    const { error: variantError } = await supabase
                        .schema('morpheus')
                        .from('yvarprod')
                        .update({
                            yvarprodprixcatalogue: variant.yvarprodprixcatalogue,
                            yvarprodprixpromotion: variant.yvarprodprixpromotion,
                            yvarprodpromotiondatedeb: variant.yvarprodpromotiondatedeb,
                            yvarprodpromotiondatefin: variant.yvarprodpromotiondatefin,
                            yvarprodnbrjourlivraison: variant.yvarprodnbrjourlivraison,
                            xdeviseidfk: variant.currencyId,
                            yvarprodstatut: 'approved',
                            sysdate: currentTime,
                            sysaction: 'update'
                        })
                        .eq('yvarprodid', variant.yvarprodid);

                    if (variantError) {
                        throw new Error(`Failed to update variant ${variant.yvarprodid}: ${variantError.message}`);
                    }
                }
            }

            // Handle event-based approval if eventId is provided
            if (approvalData.selectedEventId) {
                // Get product details to extract designer and boutique information
                const { data: productDetails, error: productError } = await supabase
                    .schema('morpheus')
                    .from('yprod')
                    .select(`
                        *,
                        ydetailsevent(
                            ydesignidfk,
                            yboutiqueidfk,
                            ymallidfk
                        )
                    `)
                    .eq('yprodid', productId)
                    .single();

                if (productError) {
                    throw new Error(`Failed to get product details for event assignment: ${productError.message}`);
                }

                const eventDetails = productDetails.ydetailsevent?.[0];
                if (!eventDetails) {
                    throw new Error('Product must have associated event details for event-based approval');
                }

                console.log('Product details for event assignment:', {
                    productId,
                    productDesignerId: productDetails.ydesignidfk,
                    eventDetails,
                    extractedDesignerId: eventDetails?.ydesignidfk,
                    extractedBoutiqueId: eventDetails?.yboutiqueidfk
                });

                // Use the product's designer ID, not the event details designer ID
                const designerId = productDetails.ydesignidfk || eventDetails?.ydesignidfk;
                const boutiqueId = eventDetails?.yboutiqueidfk;

                if (!designerId || !boutiqueId) {
                    throw new Error('Product must have both designer and boutique information for event assignment');
                }

                // Assign product to the selected event
                await assignProductToEvent.mutateAsync({
                    eventId: approvalData.selectedEventId,
                    designerId: designerId,
                    boutiqueId: boutiqueId,
                    mallId: eventDetails.ymallidfk || undefined,
                    productId: productId
                });
            }

            const message = approvalData.selectedEventId
                ? `Product approved and assigned to event successfully with ${approvalData.variants?.length || 0} variants updated`
                : `Product approved successfully with ${approvalData.variants?.length || 0} variants updated`;

            return {
                product: updatedProduct,
                message
            };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["approvals"] });
            queryClient.invalidateQueries({ queryKey: ["approval-stats"] });
            toast.success(data.message || 'Product approved successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to approve product');
        },
    });

    // Mark product as needs revision
    const markNeedsRevision = useMutation({
        mutationFn: async (productId: number) => {
            const currentTime = new Date().toISOString();
            
            const { data: updatedProduct, error: updateError } = await supabase
                .schema('morpheus')
                .from('yprod')
                .update({
                    yprodstatut: 'rejected',
                    sysdate: currentTime,
                    sysaction: 'update'
                })
                .eq('yprodid', productId)
                .select()
                .single();

            if (updateError) {
                throw new Error(updateError.message || 'Failed to update product status');
            }

            return {
                product: updatedProduct,
                message: 'Product marked as needs revision'
            };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["approvals"] });
            queryClient.invalidateQueries({ queryKey: ["approval-stats"] });
            toast.success(data.message || 'Product marked for revision');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to mark product for revision');
        },
    });

    // Delete product
    const deleteProduct = useMutation({
        mutationFn: async (productId: number) => {
            // First, get all variants for this product
            const { data: variants } = await supabase
                .schema('morpheus')
                .from('yvarprod')
                .select('yvarprodid')
                .eq('yprodidfk', productId);

            // Delete all 3D objects associated with these variants
            if (variants && variants.length > 0) {
                const variantIds = variants.map(v => v.yvarprodid);
                
                const { error: objectsError } = await supabase
                    .schema('morpheus')
                    .from('yobjet3d')
                    .delete()
                    .in('yvarprodidfk', variantIds);

                if (objectsError) {
                    throw new Error(`Failed to delete associated 3D objects: ${objectsError.message}`);
                }

                // Delete variant media associations
                const { error: mediaError } = await supabase
                    .schema('morpheus')
                    .from('yvarprodmedia')
                    .delete()
                    .in('yvarprodidfk', variantIds);

                if (mediaError) {
                    throw new Error(`Failed to delete variant media: ${mediaError.message}`);
                }
            }

            // Delete all variants for this product
            const { error: variantsError } = await supabase
                .schema('morpheus')
                .from('yvarprod')
                .delete()
                .eq('yprodidfk', productId);

            if (variantsError) {
                throw new Error(`Failed to delete product variants: ${variantsError.message}`);
            }

            // Delete event details
            const { error: eventError } = await supabase
                .schema('morpheus')
                .from('ydetailsevent')
                .delete()
                .eq('yprodidfk', productId);

            if (eventError) {
                throw new Error(`Failed to delete event details: ${eventError.message}`);
            }

            // Finally delete the product
            const { error: productError } = await supabase
                .schema('morpheus')
                .from('yprod')
                .delete()
                .eq('yprodid', productId);

            if (productError) {
                throw new Error(`Failed to delete product: ${productError.message}`);
            }

            return {
                message: 'Product and associated data deleted successfully'
            };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["approvals"] });
            queryClient.invalidateQueries({ queryKey: ["approval-stats"] });
            toast.success(data.message || 'Product deleted successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete product');
        },
    });

    // Deny product (mark as denied)
    const denyProduct = useMutation({
        mutationFn: async (productId: number) => {
            const currentTime = new Date().toISOString();
            
            const { data: updatedProduct, error: updateError } = await supabase
                .schema('morpheus')
                .from('yprod')
                .update({
                    yprodstatut: 'rejected',
                    sysdate: currentTime,
                    sysaction: 'update'
                })
                .eq('yprodid', productId)
                .select()
                .single();

            if (updateError) {
                throw new Error(updateError.message || 'Failed to deny product');
            }

            return {
                product: updatedProduct,
                message: 'Product denied successfully'
            };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["approvals"] });
            queryClient.invalidateQueries({ queryKey: ["approval-stats"] });
            toast.success(data.message || 'Product denied successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to deny product');
        },
    });

    return {
        approveProduct,
        markNeedsRevision,
        deleteProduct,
        denyProduct,
        isLoading: approveProduct.isPending || markNeedsRevision.isPending || deleteProduct.isPending || denyProduct.isPending || assignProductToEvent.isPending
    };
}