"use client";

import { createClient } from "@/lib/client";
import { useMutation } from "@tanstack/react-query";
import { uploadFile } from "@/app/_hooks/use-upload-file";
import { useEvents } from "./use-events";

interface useCreateEventProps {
    code?: string;
    name: string;
    startDate: string;
    endDate: string;
    imageFiles?: File[];
    selectedMallIds: number[];
    selectedBoutiqueIds: number[];
}

export function useCreateEvent() {
    const supabase = createClient();
    const { refetch: refetchEvents } = useEvents();

    return useMutation({
        mutationFn: async (event: useCreateEventProps) => {
            const code = event.code || Date.now().toString();

            try {
                // Step 1: Upload files and create ymedia records
                const mediaIds: number[] = [];

                if (event.imageFiles && event.imageFiles.length > 0) {
                    for (const file of event.imageFiles) {
                        // Upload file to storage
                        const fileUrl = await uploadFile({ file, type: "image" });

                        // Create ymedia record
                        const { data: mediaData, error: mediaError } = await supabase
                            .schema("morpheus")
                            .from("ymedia")
                            .insert({
                                ymediacode: `${code}_${Date.now()}`,
                                ymediaboolphotoevent: "1",
                                ymediaboolphotoprod: "0",
                                ymediaboolvideocapsule: "0",
                                ymediaintitule: `${event.name} Image`,
                                ymediaurl: fileUrl,
                            })
                            .select("ymediaid")
                            .single();

                        if (mediaError) {
                            throw new Error(`Failed to create media record: ${mediaError.message}`);
                        }

                        if (mediaData?.ymediaid) {
                            mediaIds.push(mediaData.ymediaid);
                        }
                    }
                }

                // Step 2: Create yevent record
                const { data: eventData, error: eventError } = await supabase
                    .schema("morpheus")
                    .from("yevent")
                    .insert({
                        yeventcode: code,
                        yeventintitule: event.name,
                        yeventdatedeb: event.startDate,
                        yeventdatefin: event.endDate,
                    })
                    .select("yeventid")
                    .single();

                if (eventError) {
                    throw new Error(`Failed to create event: ${eventError.message}`);
                }

                const eventId = eventData.yeventid;

                // Step 3: Create yeventmedia junction records
                if (mediaIds.length > 0 && eventId) {
                    const junctionRecords = mediaIds.map((mediaId) => ({
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

                // Step 4: Create ydetailsevent records for each mall
                const mallDetailRecords = event.selectedMallIds.map((mallId) => ({
                    yeventidfk: eventId,
                    ymallidfk: mallId,
                }));

                const { error: mallDetailsError } = await supabase
                    .schema("morpheus")
                    .from("ydetailsevent")
                    .insert(mallDetailRecords);

                if (mallDetailsError) {
                    throw new Error(`Failed to create mall event details: ${mallDetailsError.message}`);
                }

                // Step 5: Create ydetailsevent records for boutiques (without designer assignments)
                if (event.selectedBoutiqueIds.length > 0) {
                    // Fetch boutique data to get mall mappings
                    const { data: boutiquesData, error: boutiquesError } = await supabase
                        .schema("morpheus")
                        .from("yboutique")
                        .select("yboutiqueid, ymallidfk")
                        .in("yboutiqueid", event.selectedBoutiqueIds);

                    if (boutiquesError) {
                        throw new Error(`Failed to fetch boutique data: ${boutiquesError.message}`);
                    }

                    const boutiqueDetailRecords = event.selectedBoutiqueIds.map((boutiqueId) => {
                        // Find the mall ID for this boutique
                        const boutique = boutiquesData?.find(b => b.yboutiqueid === boutiqueId);
                        if (!boutique) {
                            throw new Error(`Boutique with ID ${boutiqueId} not found`);
                        }
                        
                        return {
                            yeventidfk: eventId,
                            ymallidfk: boutique.ymallidfk,
                            yboutiqueidfk: boutiqueId,
                            ydesignidfk: null, // No designer assignment during event creation
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

                return eventData;
            } catch (error) {
                console.error("Error in createEvent:", error);
                throw error;
            }
        },
        onSuccess: async () => {
            // Invalidate and refetch events query
            await refetchEvents();
        },
    });
}
