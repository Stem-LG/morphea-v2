"use client";

import { createClient } from "@/lib/client";
import { useMutation } from "@tanstack/react-query";
import { uploadFile } from "@/app/_hooks/use-upload-file";
import { useEvents } from "./use-events";

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
    originalStartDate?: string; // Add original start date for validation
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
                ...eventFields
            } = updateData;

            try {
                // If updating dates, validate them
                if (eventFields.startDate || eventFields.endDate) {
                    const now = new Date();
                    const start = eventFields.startDate ? new Date(eventFields.startDate) : undefined;
                    const end = eventFields.endDate ? new Date(eventFields.endDate) : undefined;

                    // For start date validation: allow past dates but not before the original start date
                    if (start && updateData.originalStartDate) {
                        const originalStart = new Date(updateData.originalStartDate);
                        if (start < originalStart) {
                            throw new Error("Event start date cannot be before the original start date");
                        }
                    }

                    // For end date validation: still prevent past end dates
                    if (end && end < now) {
                        throw new Error("Event end date cannot be in the past");
                    }

                    if (start && end && end < start) {
                        throw new Error("Event end date cannot be before start date");
                    }

                    // Fetch existing events excluding current
                    const { data: existingEvents, error: existingEventsError } = await supabase
                        .schema("morpheus")
                        .from("yevent")
                        .select("yeventid, yeventdatedeb, yeventdatefin")
                        .neq("yeventid", eventId);
                    if (existingEventsError) {
                        throw new Error(`Failed to fetch existing events: ${existingEventsError.message}`);
                    }
                    const checkStart = start || new Date();
                    const checkEnd = end || start || new Date();
                    for (const ev of existingEvents || []) {
                        const evStart = new Date(ev.yeventdatedeb);
                        const evEnd = new Date(ev.yeventdatefin);
                        const overlap = (checkStart <= evEnd && checkEnd >= evStart);
                        if (overlap) {
                            throw new Error("Updated event dates overlap with an existing event");
                        }
                    }
                }
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

                // Step 4: Update mall/boutique relationships surgically
                // First, fetch ALL existing ydetailsevent records for this event
                const { data: existingDetails, error: fetchDetailsError } = await supabase
                    .schema("morpheus")
                    .from("ydetailsevent")
                    .select("ydetailseventid, ymallidfk, yboutiqueidfk, ydesignidfk, yprodidfk")
                    .eq("yeventidfk", eventId);

                if (fetchDetailsError) {
                    throw new Error(`Failed to fetch existing event details: ${fetchDetailsError.message}`);
                }

                const existing = existingDetails || [];

                // Separate records by type:
                // - Mall-only records (no boutique, no designer, no product)
                // - Boutique-only records (has boutique, no designer, no product)
                // - Designer assignment records (has boutique AND designer, no product)
                // - Product assignment records (has product)
                const mallOnlyRecords = existing.filter(r =>
                    !r.yboutiqueidfk && !r.ydesignidfk && !r.yprodidfk
                );
                const boutiqueOnlyRecords = existing.filter(r =>
                    r.yboutiqueidfk && !r.ydesignidfk && !r.yprodidfk
                );
                const designerAssignmentRecords = existing.filter(r =>
                    r.yboutiqueidfk && r.ydesignidfk && !r.yprodidfk
                );
                const productAssignmentRecords = existing.filter(r => r.yprodidfk);

                // Determine what needs to change for malls
                const existingMallIds = new Set(mallOnlyRecords.map(r => r.ymallidfk));
                const newMallIds = new Set(selectedMallIds);

                const mallsToAdd = selectedMallIds.filter(id => !existingMallIds.has(id));
                const mallsToRemove = mallOnlyRecords.filter(r => !newMallIds.has(r.ymallidfk));

                // Delete mall-only records that are no longer selected
                if (mallsToRemove.length > 0) {
                    const idsToDelete = mallsToRemove.map(r => r.ydetailseventid);
                    const { error: deleteMallsError } = await supabase
                        .schema("morpheus")
                        .from("ydetailsevent")
                        .delete()
                        .in("ydetailseventid", idsToDelete);

                    if (deleteMallsError) {
                        throw new Error(`Failed to remove old mall associations: ${deleteMallsError.message}`);
                    }
                }

                // Insert new mall-only records
                if (mallsToAdd.length > 0) {
                    const mallRecordsToInsert = mallsToAdd.map(mallId => ({
                        yeventidfk: eventId,
                        ymallidfk: mallId,
                    }));

                    const { error: insertMallsError } = await supabase
                        .schema("morpheus")
                        .from("ydetailsevent")
                        .insert(mallRecordsToInsert);

                    if (insertMallsError) {
                        throw new Error(`Failed to add new mall associations: ${insertMallsError.message}`);
                    }
                }

                // Determine what needs to change for boutiques
                // Get boutique data to find their mall IDs
                const { data: boutiquesData, error: boutiquesError } = await supabase
                    .schema("morpheus")
                    .from("yboutique")
                    .select("yboutiqueid, ymallidfk")
                    .in("yboutiqueid", selectedBoutiqueIds);

                if (boutiquesError) {
                    throw new Error(`Failed to fetch boutique data: ${boutiquesError.message}`);
                }

                const existingBoutiqueIds = new Set(boutiqueOnlyRecords.map(r => r.yboutiqueidfk!));
                const newBoutiqueIds = new Set(selectedBoutiqueIds);

                const boutiquesToAdd = selectedBoutiqueIds.filter(id => !existingBoutiqueIds.has(id));
                const boutiquesToRemove = boutiqueOnlyRecords.filter(r => !newBoutiqueIds.has(r.yboutiqueidfk!));

                // Delete boutique-only records that are no longer selected
                // BUT KEEP designer and product assignments even if boutique is deselected
                if (boutiquesToRemove.length > 0) {
                    const idsToDelete = boutiquesToRemove.map(r => r.ydetailseventid);
                    const { error: deleteBoutiquesError } = await supabase
                        .schema("morpheus")
                        .from("ydetailsevent")
                        .delete()
                        .in("ydetailseventid", idsToDelete);

                    if (deleteBoutiquesError) {
                        throw new Error(`Failed to remove old boutique associations: ${deleteBoutiquesError.message}`);
                    }
                }

                // For boutiques that were deselected, also remove their designer assignments
                // (but keep product assignments as they might be global)
                const deselectedBoutiqueIds = boutiqueOnlyRecords
                    .filter(r => !newBoutiqueIds.has(r.yboutiqueidfk!))
                    .map(r => r.yboutiqueidfk!);

                if (deselectedBoutiqueIds.length > 0) {
                    const designerAssignmentsToRemove = designerAssignmentRecords.filter(r =>
                        deselectedBoutiqueIds.includes(r.yboutiqueidfk!)
                    );

                    if (designerAssignmentsToRemove.length > 0) {
                        const idsToDelete = designerAssignmentsToRemove.map(r => r.ydetailseventid);
                        const { error: deleteDesignersError } = await supabase
                            .schema("morpheus")
                            .from("ydetailsevent")
                            .delete()
                            .in("ydetailseventid", idsToDelete);

                        if (deleteDesignersError) {
                            throw new Error(`Failed to remove designer assignments for deselected boutiques: ${deleteDesignersError.message}`);
                        }
                    }
                }

                // Insert new boutique-only records
                if (boutiquesToAdd.length > 0) {
                    const boutiqueRecordsToInsert = boutiquesToAdd.map(boutiqueId => {
                        const boutique = boutiquesData?.find(b => b.yboutiqueid === boutiqueId);
                        if (!boutique) {
                            throw new Error(`Boutique with ID ${boutiqueId} not found`);
                        }

                        return {
                            yeventidfk: eventId,
                            ymallidfk: boutique.ymallidfk,
                            yboutiqueidfk: boutiqueId,
                        };
                    });

                    const { error: insertBoutiquesError } = await supabase
                        .schema("morpheus")
                        .from("ydetailsevent")
                        .insert(boutiqueRecordsToInsert);

                    if (insertBoutiquesError) {
                        throw new Error(`Failed to add new boutique associations: ${insertBoutiquesError.message}`);
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
