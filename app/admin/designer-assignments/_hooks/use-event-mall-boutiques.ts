"use client";

import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

export function useEventMallBoutiques(eventId: number | null, mallId: number | null) {
    const supabase = createClient();

    return useQuery({
        queryKey: ["event-mall-boutiques", eventId, mallId],
        queryFn: async () => {
            if (!eventId || !mallId) {
                return { boutiques: [], assignments: [] };
            }

            // Get boutiques for the event and mall with NO designer and NO product
            const { data: boutiques, error: boutiquesError } = await supabase
                .schema("morpheus")
                .from("ydetailsevent")
                .select(`
                    ydetailseventid,
                    yboutiqueidfk,
                    yboutique:yboutiqueidfk (
                        yboutiqueid,
                        yboutiquecode,
                        yboutiqueintitule,
                        yboutiqueadressemall,
                        ymallidfk
                    )
                `)
                .eq("yeventidfk", eventId)
                .eq("ymallidfk", mallId)
                .not("yboutiqueidfk", "is", null)
                .is("ydesignidfk", null)
                .is("yprodidfk", null);

            // Map to just the boutique objects (avoid duplicates if multiple details entries per boutique)
            const boutiqueMap = new Map();
            (boutiques || []).forEach((b: any) => {
                if (b.yboutique && !boutiqueMap.has(b.yboutique.yboutiqueid)) {
                    boutiqueMap.set(b.yboutique.yboutiqueid, b.yboutique);
                }
            });

            if (boutiquesError) {
                throw new Error(`Failed to fetch boutiques: ${boutiquesError.message}`);
            }

            // Get existing designer assignments for this event and mall (NO product)
            const { data: assignments, error: assignmentsError } = await supabase
                .schema("morpheus")
                .from("ydetailsevent")
                .select(`
                    ydetailseventid,
                    yboutiqueidfk,
                    ydesignidfk,
                    ydesign:ydesignidfk (
                        ydesignid,
                        ydesignnom,
                        ydesignmarque,
                        ydesignspecialite,
                        ydesignpays,
                        ydesigncontactpersonne,
                        ydesigncontactemail,
                        ydesigncontacttelephone,
                        ydesigncouleur1codehexa,
                        ydesigncouleur1dsg,
                        ydesigncouleur2codehexa,
                        ydesigncouleur2dsg,
                        ydesigncouleur3codehexa,
                        ydesigncouleur3dsg
                    )
                `)
                .eq("yeventidfk", eventId)
                .eq("ymallidfk", mallId)
                .not("yboutiqueidfk", "is", null)
                .not("ydesignidfk", "is", null)
                .is("yprodidfk", null);

            if (assignmentsError) {
                throw new Error(`Failed to fetch assignments: ${assignmentsError.message}`);
            }

            // Check for products created by designers (to determine if assignment is locked)
            const assignmentsWithProducts = await Promise.all(
                (assignments || []).map(async (assignment) => {
                    if (!assignment.ydesignidfk || !assignment.yboutiqueidfk) {
                        return { ...assignment, hasProducts: false };
                    }

                    const { data: products, error: productsError } = await supabase
                        .schema("morpheus")
                        .from("ydetailsevent")
                        .select("ydetailseventid")
                        .eq("yeventidfk", eventId)
                        .eq("ymallidfk", mallId)
                        .eq("yboutiqueidfk", assignment.yboutiqueidfk)
                        .eq("ydesignidfk", assignment.ydesignidfk)
                        .not("yprodidfk", "is", null)
                        .limit(1);

                    if (productsError) {
                        console.error("Error checking products:", productsError);
                        return { ...assignment, hasProducts: false };
                    }

                    return { ...assignment, hasProducts: (products || []).length > 0 };
                })
            );

            return {
                boutiques: Array.from(boutiqueMap.values()) || [],
                assignments: assignmentsWithProducts || []
            };
        },
        enabled: !!eventId && !!mallId,
    });
}