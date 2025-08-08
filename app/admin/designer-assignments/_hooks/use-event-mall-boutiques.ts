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

            // Get boutiques for the mall
            const { data: boutiques, error: boutiquesError } = await supabase
                .schema("morpheus")
                .from("yboutique")
                .select(`
                    yboutiqueid,
                    yboutiquecode,
                    yboutiqueintitule,
                    yboutiqueadressemall,
                    ymallidfk
                `)
                .eq("ymallidfk", mallId)
                .order("yboutiqueintitule");

            if (boutiquesError) {
                throw new Error(`Failed to fetch boutiques: ${boutiquesError.message}`);
            }

            // Get existing designer assignments for this event and mall
            const { data: assignments, error: assignmentsError } = await supabase
                .schema("morpheus")
                .from("ydetailsevent")
                .select(`
                    ydetailseventid,
                    yboutiqueidfk,
                    ydesignidfk,
                    yprodidfk,
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
                .not("yboutiqueidfk", "is", null);

            if (assignmentsError) {
                throw new Error(`Failed to fetch assignments: ${assignmentsError.message}`);
            }

            // Group assignments by boutique and select the most relevant one
            const assignmentsByBoutique = new Map<number, typeof assignments[0][]>();
            
            // Group all assignments by boutique ID
            (assignments || []).forEach(assignment => {
                if (assignment.yboutiqueidfk) {
                    const boutiqueAssignments = assignmentsByBoutique.get(assignment.yboutiqueidfk) || [];
                    boutiqueAssignments.push(assignment);
                    assignmentsByBoutique.set(assignment.yboutiqueidfk, boutiqueAssignments);
                }
            });

            // For each boutique, select the most relevant assignment
            const relevantAssignments = Array.from(assignmentsByBoutique.entries()).map(([, boutiqueAssignments]) => {
                // Sort assignments by priority:
                // 1. Has product (yprodidfk not null) - highest priority (locked assignment)
                // 2. Has designer (ydesignidfk not null)
                // 3. Most recent (highest ydetailseventid)
                const sortedAssignments = boutiqueAssignments.sort((a, b) => {
                    // First priority: has product
                    if (a.yprodidfk && !b.yprodidfk) return -1;
                    if (!a.yprodidfk && b.yprodidfk) return 1;
                    
                    // Second priority: has designer
                    if (a.ydesignidfk && !b.ydesignidfk) return -1;
                    if (!a.ydesignidfk && b.ydesignidfk) return 1;
                    
                    // Third priority: most recent (highest ID)
                    return b.ydetailseventid - a.ydetailseventid;
                });

                return sortedAssignments[0];
            });

            // Check for products created by designers (to determine if assignment is locked)
            const assignmentsWithProducts = await Promise.all(
                relevantAssignments.map(async (assignment) => {
                    // If assignment already has a product, it's locked
                    if (assignment.yprodidfk) {
                        return { ...assignment, hasProducts: true };
                    }

                    // If no designer assigned, can't have products
                    if (!assignment.ydesignidfk || !assignment.yboutiqueidfk) {
                        return { ...assignment, hasProducts: false };
                    }

                    // Check if this designer has created any products for this boutique
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
                boutiques: boutiques || [],
                assignments: assignmentsWithProducts || []
            };
        },
        enabled: !!eventId && !!mallId,
        staleTime: 30 * 1000, // Consider data fresh for 30 seconds
        gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
        refetchOnWindowFocus: false, // Prevent unnecessary refetches
        refetchOnMount: true, // Always refetch when component mounts
    });
}