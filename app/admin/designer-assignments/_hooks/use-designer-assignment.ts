"use client";

import { createClient } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface AssignDesignerParams {
    eventId: number;
    mallId: number;
    boutiqueId: number;
    designerId: number;
}

interface UnassignDesignerParams {
    eventId: number;
    mallId: number;
    boutiqueId: number;
}

export function useDesignerAssignment() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    const assignDesigner = useMutation({
        mutationFn: async ({ eventId, mallId, boutiqueId, designerId }: AssignDesignerParams) => {
            // Check if designer is already assigned to another boutique in this event
            const { data: existingAssignment, error: checkError } = await supabase
                .schema("morpheus")
                .from("ydetailsevent")
                .select("ydetailseventid, yboutiqueidfk")
                .eq("yeventidfk", eventId)
                .eq("ymallidfk", mallId)
                .eq("ydesignidfk", designerId)
                .not("yboutiqueidfk", "is", null)
                .limit(1);

            if (checkError) {
                throw new Error(`Failed to check existing assignments: ${checkError.message}`);
            }

            if (existingAssignment && existingAssignment.length > 0) {
                throw new Error("This designer is already assigned to another boutique in this event");
            }

            // Check if boutique already has a designer assigned
            const { data: boutiqueAssignment, error: boutiqueCheckError } = await supabase
                .schema("morpheus")
                .from("ydetailsevent")
                .select("ydetailseventid, ydesignidfk")
                .eq("yeventidfk", eventId)
                .eq("ymallidfk", mallId)
                .eq("yboutiqueidfk", boutiqueId)
                .not("ydesignidfk", "is", null)
                .limit(1);

            if (boutiqueCheckError) {
                throw new Error(`Failed to check boutique assignment: ${boutiqueCheckError.message}`);
            }

            if (boutiqueAssignment && boutiqueAssignment.length > 0) {
                // Update existing assignment
                const { error: updateError } = await supabase
                    .schema("morpheus")
                    .from("ydetailsevent")
                    .update({ ydesignidfk: designerId })
                    .eq("ydetailseventid", boutiqueAssignment[0].ydetailseventid);

                if (updateError) {
                    throw new Error(`Failed to update designer assignment: ${updateError.message}`);
                }
            } else {
                // Create new assignment
                const { error: insertError } = await supabase
                    .schema("morpheus")
                    .from("ydetailsevent")
                    .insert({
                        yeventidfk: eventId,
                        ymallidfk: mallId,
                        yboutiqueidfk: boutiqueId,
                        ydesignidfk: designerId
                    });

                if (insertError) {
                    throw new Error(`Failed to create designer assignment: ${insertError.message}`);
                }
            }

            return { eventId, mallId, boutiqueId, designerId };
        },
        onMutate: async ({ eventId, mallId, boutiqueId, designerId }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["event-mall-boutiques", eventId, mallId] });
            
            // Snapshot the previous value
            const previousData = queryClient.getQueryData(["event-mall-boutiques", eventId, mallId]);
            
            // Optimistically update the cache
            queryClient.setQueryData(["event-mall-boutiques", eventId, mallId], (old: any) => {
                if (!old) return old;
                
                const updatedAssignments = [...(old.assignments || [])];
                const existingIndex = updatedAssignments.findIndex(a => a.yboutiqueidfk === boutiqueId);
                
                if (existingIndex >= 0) {
                    // Update existing assignment
                    updatedAssignments[existingIndex] = {
                        ...updatedAssignments[existingIndex],
                        ydesignidfk: designerId
                    };
                } else {
                    // Add new assignment
                    updatedAssignments.push({
                        ydetailseventid: Date.now(), // Temporary ID
                        yboutiqueidfk: boutiqueId,
                        ydesignidfk: designerId,
                        hasProducts: false
                    });
                }
                
                return {
                    ...old,
                    assignments: updatedAssignments
                };
            });
            
            return { previousData };
        },
        onError: (err, variables, context) => {
            // Rollback on error
            if (context?.previousData) {
                queryClient.setQueryData(
                    ["event-mall-boutiques", variables.eventId, variables.mallId],
                    context.previousData
                );
            }
            toast.error(err.message || "Failed to assign designer");
        },
        onSuccess: ({ eventId, mallId }) => {
            // Invalidate specific queries with exact parameters
            queryClient.invalidateQueries({
                queryKey: ["event-mall-boutiques", eventId, mallId]
            });
            queryClient.invalidateQueries({
                queryKey: ["designers-paginated", eventId, mallId]
            });
            toast.success("Designer assigned successfully");
        }
    });

    const unassignDesigner = useMutation({
        mutationFn: async ({ eventId, mallId, boutiqueId }: UnassignDesignerParams) => {
            // Check if designer has created products (assignment is locked)
            const { data: productsCheck, error: productsError } = await supabase
                .schema("morpheus")
                .from("ydetailsevent")
                .select("ydetailseventid")
                .eq("yeventidfk", eventId)
                .eq("ymallidfk", mallId)
                .eq("yboutiqueidfk", boutiqueId)
                .not("yprodidfk", "is", null)
                .limit(1);

            if (productsError) {
                throw new Error(`Failed to check products: ${productsError.message}`);
            }

            if (productsCheck && productsCheck.length > 0) {
                throw new Error("Cannot unassign designer who has already created products in this boutique");
            }

            // Remove the designer assignment
            const { error: deleteError } = await supabase
                .schema("morpheus")
                .from("ydetailsevent")
                .delete()
                .eq("yeventidfk", eventId)
                .eq("ymallidfk", mallId)
                .eq("yboutiqueidfk", boutiqueId)
                .not("ydesignidfk", "is", null)
                .is("yprodidfk", null);

            if (deleteError) {
                throw new Error(`Failed to unassign designer: ${deleteError.message}`);
            }

            return { eventId, mallId, boutiqueId };
        },
        onMutate: async ({ eventId, mallId, boutiqueId }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["event-mall-boutiques", eventId, mallId] });
            
            // Snapshot the previous value
            const previousData = queryClient.getQueryData(["event-mall-boutiques", eventId, mallId]);
            
            // Optimistically update the cache
            queryClient.setQueryData(["event-mall-boutiques", eventId, mallId], (old: any) => {
                if (!old) return old;
                
                const updatedAssignments = (old.assignments || []).filter(
                    (a: any) => a.yboutiqueidfk !== boutiqueId
                );
                
                return {
                    ...old,
                    assignments: updatedAssignments
                };
            });
            
            return { previousData };
        },
        onError: (err, variables, context) => {
            // Rollback on error
            if (context?.previousData) {
                queryClient.setQueryData(
                    ["event-mall-boutiques", variables.eventId, variables.mallId],
                    context.previousData
                );
            }
            toast.error(err.message || "Failed to unassign designer");
        },
        onSuccess: ({ eventId, mallId }) => {
            // Invalidate specific queries with exact parameters
            queryClient.invalidateQueries({
                queryKey: ["event-mall-boutiques", eventId, mallId]
            });
            queryClient.invalidateQueries({
                queryKey: ["designers-paginated", eventId, mallId]
            });
            toast.success("Designer unassigned successfully");
        }
    });

    return {
        assignDesigner,
        unassignDesigner,
        isAssigning: assignDesigner.isPending,
        isUnassigning: unassignDesigner.isPending
    };
}