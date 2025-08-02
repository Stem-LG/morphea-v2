"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/lib/client";

// Removed unused interface YDetailsEventRecord

interface CreateYDetailsEventParams {
    eventId: number;
    designerId: number;
    boutiqueId: number;
    mallId?: number;
    productId: number;
}

interface CheckRegistrationParams {
    eventId: number;
    designerId: number;
    boutiqueId: number;
}

export function useYDetailsEventOperations() {
    const queryClient = useQueryClient();
    const supabase = createClient();

    // Check if designer and boutique are registered for the event
    const checkRegistration = useMutation({
        mutationFn: async ({ eventId, designerId, boutiqueId }: CheckRegistrationParams): Promise<{ designerRegistered: boolean; boutiqueRegistered: boolean }> => {
            // Check if designer is registered (has a record with yprodidfk = NULL)
            const { data: designerRegistration, error: designerError } = await supabase
                .schema('morpheus')
                .from('ydetailsevent')
                .select('ydetailseventid')
                .eq('yeventidfk', eventId)
                .eq('ydesignidfk', designerId)
                .is('yprodidfk', null)
                .limit(1);

            if (designerError) {
                throw new Error(`Failed to check designer registration: ${designerError.message}`);
            }

            // Check if boutique is registered (has a record with yprodidfk = NULL)
            const { data: boutiqueRegistration, error: boutiqueError } = await supabase
                .schema('morpheus')
                .from('ydetailsevent')
                .select('ydetailseventid')
                .eq('yeventidfk', eventId)
                .eq('yboutiqueidfk', boutiqueId)
                .is('yprodidfk', null)
                .limit(1);

            if (boutiqueError) {
                throw new Error(`Failed to check boutique registration: ${boutiqueError.message}`);
            }

            return {
                designerRegistered: (designerRegistration && designerRegistration.length > 0),
                boutiqueRegistered: (boutiqueRegistration && boutiqueRegistration.length > 0)
            };
        },
        onError: (error: Error) => {
            console.error('Check registration error:', error);
            toast.error(error.message || 'Failed to check event registration');
        },
    });

    // Create new ydetailsevent record for product assignment
    const createProductAssignment = useMutation({
        mutationFn: async ({ eventId, designerId, boutiqueId, mallId, productId }: CreateYDetailsEventParams) => {
            const currentTime = new Date().toISOString();
            
            const { data, error } = await supabase
                .schema('morpheus')
                .from('ydetailsevent')
                .insert({
                    yeventidfk: eventId,
                    ydesignidfk: designerId,
                    yboutiqueidfk: boutiqueId,
                    ymallidfk: mallId || null,
                    yprodidfk: productId,
                    sysdate: currentTime,
                    sysaction: 'insert'
                })
                .select()
                .single();

            if (error) {
                throw new Error(`Failed to create product assignment: ${error.message}`);
            }

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["events"] });
            queryClient.invalidateQueries({ queryKey: ["event-validation"] });
            queryClient.invalidateQueries({ queryKey: ["product-event-eligibility"] });
            toast.success('Product successfully assigned to event');
        },
        onError: (error: Error) => {
            console.error('Create product assignment error:', error);
            toast.error(error.message || 'Failed to assign product to event');
        },
    });

    // Validate event dates are still active
    const validateEventDates = useMutation({
        mutationFn: async (eventId: number): Promise<boolean> => {
            const { data, error } = await supabase
                .schema('morpheus')
                .from('yevent')
                .select('yeventdatedeb, yeventdatefin')
                .eq('yeventid', eventId)
                .single();

            if (error) {
                throw new Error(`Failed to validate event dates: ${error.message}`);
            }

            const currentDate = new Date();
            const eventStartDate = new Date(data.yeventdatedeb);
            const eventEndDate = new Date(data.yeventdatefin);

            const isActive = currentDate >= eventStartDate && currentDate <= eventEndDate;
            
            if (!isActive) {
                if (currentDate < eventStartDate) {
                    throw new Error(`Event has not started yet. Starts on ${eventStartDate.toLocaleDateString()}`);
                } else {
                    throw new Error(`Event has ended. Ended on ${eventEndDate.toLocaleDateString()}`);
                }
            }

            return true;
        },
        onError: (error: Error) => {
            console.error('Event validation error:', error);
            toast.error(error.message || 'Event validation failed');
        },
    });

    // Main function to handle event-based product assignment
    const assignProductToEvent = useMutation({
        mutationFn: async (params: CheckRegistrationParams & { productId: number; mallId?: number }) => {
            const { eventId, designerId, boutiqueId, productId, mallId } = params;

            // Step 1: Validate event dates
            await validateEventDates.mutateAsync(eventId);

            // Step 2: Check if designer and boutique are registered
            const registrationStatus = await checkRegistration.mutateAsync({
                eventId,
                designerId,
                boutiqueId
            });

            if (!registrationStatus.designerRegistered) {
                throw new Error('Designer is not registered for this event');
            }

            if (!registrationStatus.boutiqueRegistered) {
                throw new Error('Boutique is not registered for this event');
            }

            // Step 3: Check if product is already assigned to this event
            const { data: existingAssignment } = await supabase
                .schema('morpheus')
                .from('ydetailsevent')
                .select('ydetailseventid')
                .eq('yeventidfk', eventId)
                .eq('yprodidfk', productId)
                .limit(1);

            if (existingAssignment && existingAssignment.length > 0) {
                throw new Error('Product is already assigned to this event');
            }

            // Step 4: Create new assignment record
            return await createProductAssignment.mutateAsync({
                eventId,
                designerId,
                boutiqueId,
                mallId,
                productId
            });
        },
        onSuccess: (data) => {
            // Additional success handling if needed
            console.log('Product successfully assigned to event:', data);
        },
        onError: (error: Error) => {
            console.error('Assign product to event error:', error);
            // Error is already handled by individual mutations
        },
    });

    // Check if product is already assigned to an event
    const checkProductEventAssignment = useMutation({
        mutationFn: async ({ productId, eventId }: { productId: number; eventId?: number }) => {
            let query = supabase
                .schema('morpheus')
                .from('ydetailsevent')
                .select(`
                    *,
                    yevent:yeventidfk(
                        yeventid,
                        yeventintitule,
                        yeventdatedeb,
                        yeventdatefin
                    )
                `)
                .eq('yprodidfk', productId);

            if (eventId) {
                query = query.eq('yeventidfk', eventId);
            }

            const { data, error } = await query;

            if (error) {
                throw new Error(`Failed to check product event assignment: ${error.message}`);
            }

            return data || [];
        },
        onError: (error: Error) => {
            console.error('Check product event assignment error:', error);
            toast.error(error.message || 'Failed to check product event assignment');
        },
    });

    return {
        checkRegistration,
        createProductAssignment,
        validateEventDates,
        assignProductToEvent,
        checkProductEventAssignment,
        isLoading:
            checkRegistration.isPending ||
            createProductAssignment.isPending ||
            validateEventDates.isPending ||
            assignProductToEvent.isPending ||
            checkProductEventAssignment.isPending
    };
}