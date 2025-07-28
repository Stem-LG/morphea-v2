"use client";

import { createClient } from "@/lib/client";
import { useMutation } from "@tanstack/react-query";
import { uploadFile } from "@/app/_hooks/use-upload-file";

interface useUpdateEventProps {
    eventId: number;
    code?: string;
    name?: string;
    startDate?: string;
    endDate?: string;
    imagesToAdd?: File[];
    imagesToRemove?: number[]; // ymedia IDs to remove
}

export function useUpdateEvent() {
    const supabase = createClient();

    return useMutation({
        mutationFn: async (updateData: useUpdateEventProps) => {
            const { eventId, imagesToAdd, imagesToRemove, ...eventFields } = updateData;
            
            try {
                // Step 1: Update event basic information if provided
                if (Object.keys(eventFields).length > 0) {
                    const updateFields: any = {};
                    
                    if (eventFields.code !== undefined) updateFields.yeventcode = eventFields.code;
                    if (eventFields.name !== undefined) updateFields.yeventintitule = eventFields.name;
                    if (eventFields.startDate !== undefined) updateFields.yeventdatedeb = eventFields.startDate;
                    if (eventFields.endDate !== undefined) updateFields.yeventdatefin = eventFields.endDate;

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
                            .select('ymediaid')
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
                        const junctionRecords = newMediaIds.map(mediaId => ({
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

                return {
                    eventId,
                    updatedFields: eventFields,
                    addedMediaIds: newMediaIds,
                    removedMediaIds: imagesToRemove || [],
                };
                
            } catch (error) {
                console.error("Error in updateEvent:", error);
                throw error;
            }
        },
    });
}