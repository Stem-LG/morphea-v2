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
            console.log('checkRegistration debug:', { eventId, designerId, boutiqueId });

            // Get all event details for this event
            const { data: eventDetails, error: eventError } = await supabase
                .schema('morpheus')
                .from('ydetailsevent')
                .select('*')
                .eq('yeventidfk', eventId);

            if (eventError) {
                throw new Error(`Failed to fetch event details: ${eventError.message}`);
            }

            console.log('All event details:', eventDetails);

            // Filter for registration records only (yprodidfk IS NULL)
            const registrationRecords = eventDetails?.filter(detail => detail.yprodidfk === null) || [];
            console.log('Registration records:', registrationRecords);

            // Check designer registration
            const designerRegistered = designerId ?
                registrationRecords.some(detail => detail.ydesignidfk === designerId) : false;

            // Check boutique registration
            const boutiqueRegistered = boutiqueId ?
                registrationRecords.some(detail => detail.yboutiqueidfk === boutiqueId) : false;

            console.log('Registration check results:', {
                designerRegistered,
                boutiqueRegistered,
                designerRecords: registrationRecords.filter(d => d.ydesignidfk === designerId),
                boutiqueRecords: registrationRecords.filter(d => d.yboutiqueidfk === boutiqueId)
            });

            return {
                designerRegistered,
                boutiqueRegistered
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

            console.log('assignProductToEvent debug:', {
                eventId,
                designerId,
                boutiqueId,
                productId,
                mallId
            });

            // Step 1: Validate event dates
            await validateEventDates.mutateAsync(eventId);

            // Step 2: Check if product is already assigned to this event
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

            // Step 3: Create single product assignment record
            console.log('Creating product assignment record...');
            const currentTime = new Date().toISOString();
            
            const { data, error } = await supabase
                .schema('morpheus')
                .from('ydetailsevent')
                .insert({
                    yeventidfk: eventId,
                    ydesignidfk: designerId,
                    yboutiqueidfk: boutiqueId,
                    ymallidfk: mallId || null,
                    yprodidfk: productId, // Product assignment record
                    sysdate: currentTime,
                    sysaction: 'insert'
                })
                .select()
                .single();

            if (error) {
                throw new Error(`Failed to create product assignment: ${error.message}`);
            }

            console.log('Product assignment created successfully:', data);
            return data;
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