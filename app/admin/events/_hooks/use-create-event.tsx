"use client";

import { createClient } from "@/lib/client";
import { useMutation } from "@tanstack/react-query";
import { uploadFile } from "@/app/_hooks/use-upload-file";

interface useCreateEventProps {
    code?: string;
    name: string;
    startDate: string;
    endDate: string;
    imageFiles?: File[];
}

export function useCreateEvent() {
    const supabase = createClient();

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
                            .select('ymediaid')
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
                    .select('yeventid')
                    .single();

                if (eventError) {
                    throw new Error(`Failed to create event: ${eventError.message}`);
                }

                // Step 3: Create yeventmedia junction records
                if (mediaIds.length > 0 && eventData?.yeventid) {
                    const junctionRecords = mediaIds.map(mediaId => ({
                        yeventidfk: eventData.yeventid,
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

                return eventData;
                
            } catch (error) {
                console.error("Error in createEvent:", error);
                throw error;
            }
        },
    });
}
