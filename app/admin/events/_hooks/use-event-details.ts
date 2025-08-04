"use client";

import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

export function useEventDetails(eventId: number) {
    const supabase = createClient();

    return useQuery({
        queryKey: ["event-details", eventId],
        queryFn: async () => {
            // Fetch event details with related data
            const { data: eventDetails, error: eventError } = await supabase
                .schema("morpheus")
                .from("ydetailsevent")
                .select(`
                    ydetailseventid,
                    yeventidfk,
                    ymallidfk,
                    yboutiqueidfk,
                    ydesignidfk,
                    ymall:ymallidfk (
                        ymallid,
                        ymallintitule,
                        ymalllocalisation
                    ),
                    yboutique:yboutiqueidfk (
                        yboutiqueid,
                        yboutiquecode,
                        yboutiqueintitule,
                        yboutiqueadressemall,
                        ymallidfk
                    ),
                    ydesign:ydesignidfk (
                        ydesignid,
                        ydesignnom,
                        ydesignmarque,
                        ydesignspecialite
                    )
                `)
                .eq("yeventidfk", eventId);

            if (eventError) {
                throw new Error(`Failed to fetch event details: ${eventError.message}`);
            }

            // Process the data to extract unique malls, boutiques, and designer assignments
            const details = eventDetails || [];
            
            // Get unique malls
            const mallsMap = new Map();
            details.forEach(detail => {
                if (detail.ymall && !mallsMap.has(detail.ymallidfk)) {
                    mallsMap.set(detail.ymallidfk, detail.ymall);
                }
            });
            const selectedMalls = Array.from(mallsMap.values());

            // Get unique boutiques
            const boutiquesMap = new Map();
            details.forEach(detail => {
                if (detail.yboutique && !boutiquesMap.has(detail.yboutiqueidfk)) {
                    boutiquesMap.set(detail.yboutiqueidfk, detail.yboutique);
                }
            });
            const selectedBoutiques = Array.from(boutiquesMap.values());

            // Get designer assignments
            const designerAssignments = details
                .filter(detail => detail.yboutiqueidfk && detail.ydesignidfk)
                .map(detail => ({
                    boutiqueId: detail.yboutiqueidfk!,
                    designerId: detail.ydesignidfk!,
                }));

            return {
                selectedMallIds: selectedMalls.map(mall => mall.ymallid),
                selectedBoutiqueIds: selectedBoutiques.map(boutique => boutique.yboutiqueid),
                designerAssignments,
                rawDetails: details
            };
        },
        enabled: !!eventId,
    });
}