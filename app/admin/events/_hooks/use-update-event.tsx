"use client";

import { createClient } from "@/lib/client";
import { useMutation } from "@tanstack/react-query";
import { uploadFile } from "@/app/_hooks/use-upload-file";
import { useEvents } from "./use-events";

interface DesignerAssignment {
    boutiqueId: number;
    designerId: number | null;
}

interface useUpdateEventProps {
    eventId: number;
    code?: string;
    name?: string;
    startDate?: string;
    endDate?: string;
    imagesToAdd?: File[];
    imagesToRemove?: number[]; // ymedia IDs to remove
    selectedMallIds: number[];
    selectedBoutiqueIds: number[];
    designerAssignments: DesignerAssignment[];
}

export function useUpdateEvent() {
    const supabase = createClient();
    const { refetch: refetchEvents } = useEvents();

    return useMutation({
        mutationFn: async (updateData: useUpdateEventProps) => {
            const {
                eventId,
                imagesToAdd,
                imagesToRemove,
                selectedMallIds,
                selectedBoutiqueIds,
                designerAssignments,
                ...eventFields
            } = updateData;

            try {
                // Step 1: Update event basic information if provided
                const basicFields = { code: eventFields.code, name: eventFields.name, startDate: eventFields.startDate, endDate: eventFields.endDate };
                if (Object.values(basicFields).some(val => val !== undefined)) {
                    const updateFields: any = {};

                    if (basicFields.code !== undefined) updateFields.yeventcode = basicFields.code;
                    if (basicFields.name !== undefined) updateFields.yeventintitule = basicFields.name;
                    if (basicFields.startDate !== undefined) updateFields.yeventdatedeb = basicFields.startDate;
                    if (basicFields.endDate !== undefined) updateFields.yeventdatefin = basicFields.endDate;

                    const { error: eventError } = await supabase
                        .schema("morpheus")
                        .from("yevent")
                        .update(updateFields)
                        .eq("yeventid", eventId);

                    if (eventError) {
                        throw new Error(`Failed to update event: ${eventError.message}`);
                    }
                }

                // Step 2: Remove images if specified
                if (imagesToRemove && imagesToRemove.length > 0) {
                    // Remove junction records first
                    const { error: junctionRemoveError } = await supabase
                        .schema("morpheus")
                        .from("yeventmedia")
                        .delete()
                        .eq("yeventidfk", eventId)
                        .in("ymediaidfk", imagesToRemove);

                    if (junctionRemoveError) {
                        throw new Error(`Failed to remove media associations: ${junctionRemoveError.message}`);
                    }

                    // Note: We're not deleting the actual ymedia records or files from storage
                    // as they might be referenced elsewhere. This is a design decision for data integrity.
                }

                // Step 3: Add new images if provided
                const newMediaIds: number[] = [];

                if (imagesToAdd && imagesToAdd.length > 0) {
                    for (const file of imagesToAdd) {
                        // Upload file to storage
                        const fileUrl = await uploadFile({ file, type: "image" });

                        // Create ymedia record
                        const { data: mediaData, error: mediaError } = await supabase
                            .schema("morpheus")
                            .from("ymedia")
                            .insert({
                                ymediacode: `event_${eventId}_${Date.now()}`,
                                ymediaboolphotoevent: "1",
                                ymediaboolphotoprod: "0",
                                ymediaboolvideocapsule: "0",
                                ymediaintitule: `Event ${eventId} Image`,
                                ymediaurl: fileUrl,
                            })
                            .select("ymediaid")
                            .single();

                        if (mediaError) {
                            throw new Error(`Failed to create media record: ${mediaError.message}`);
                        }

                        if (mediaData?.ymediaid) {
                            newMediaIds.push(mediaData.ymediaid);
                        }
                    }

                    // Create junction records for new images
                    if (newMediaIds.length > 0) {
                        const junctionRecords = newMediaIds.map((mediaId) => ({
                            yeventidfk: eventId,
                            ymediaidfk: mediaId,
                        }));

                        const { error: junctionError } = await supabase
                            .schema("morpheus")
                            .from("yeventmedia")
                            .insert(junctionRecords);

                        if (junctionError) {
                            throw new Error(`Failed to create media associations: ${junctionError.message}`);
                        }
                    }
                }

                // Step 4: Update mall/boutique/designer relationships
                // First, remove all existing ydetailsevent records for this event
                const { error: removeDetailsError } = await supabase
                    .schema("morpheus")
                    .from("ydetailsevent")
                    .delete()
                    .eq("yeventidfk", eventId);

                if (removeDetailsError) {
                    throw new Error(`Failed to remove existing event details: ${removeDetailsError.message}`);
                }

                // Step 5: Create new ydetailsevent records for each mall
                const mallDetailRecords = selectedMallIds.map((mallId) => ({
                    yeventidfk: eventId,
                    ymallidfk: mallId,
                }));

                if (mallDetailRecords.length > 0) {
                    const { error: mallDetailsError } = await supabase
                        .schema("morpheus")
                        .from("ydetailsevent")
                        .insert(mallDetailRecords);

                    if (mallDetailsError) {
                        throw new Error(`Failed to create mall event details: ${mallDetailsError.message}`);
                    }
                }

                // Step 6: Create ydetailsevent records for each boutique with their assigned designers
                if (designerAssignments.length > 0) {
                    // Fetch boutique data to get mall mappings
                    const { data: boutiquesData, error: boutiquesError } = await supabase
                        .schema("morpheus")
                        .from("yboutique")
                        .select("yboutiqueid, ymallidfk")
                        .in("yboutiqueid", selectedBoutiqueIds);

                    if (boutiquesError) {
                        throw new Error(`Failed to fetch boutique data: ${boutiquesError.message}`);
                    }

                    const boutiqueDetailRecords = designerAssignments
                        .filter(assignment => assignment.designerId !== null)
                        .map((assignment) => {
                            // Find the mall ID for this boutique
                            const boutique = boutiquesData?.find(b => b.yboutiqueid === assignment.boutiqueId);
                            if (!boutique) {
                                throw new Error(`Boutique with ID ${assignment.boutiqueId} not found`);
                            }
                            
                            return {
                                yeventidfk: eventId,
                                ymallidfk: boutique.ymallidfk,
                                yboutiqueidfk: assignment.boutiqueId,
                                ydesignidfk: assignment.designerId,
                            };
                        });

                    if (boutiqueDetailRecords.length > 0) {
                        const { error: boutiqueDetailsError } = await supabase
                            .schema("morpheus")
                            .from("ydetailsevent")
                            .insert(boutiqueDetailRecords);

                        if (boutiqueDetailsError) {
                            throw new Error(`Failed to create boutique event details: ${boutiqueDetailsError.message}`);
                        }
                    }
                }

                return {
                    eventId,
                    updatedFields: basicFields,
                    addedMediaIds: newMediaIds,
                    removedMediaIds: imagesToRemove || [],
                };
            } catch (error) {
                console.error("Error in updateEvent:", error);
                throw error;
            }
        },
        onSuccess: async () => {
            // Invalidate and refetch events query
            await refetchEvents();
        },
    });
}
