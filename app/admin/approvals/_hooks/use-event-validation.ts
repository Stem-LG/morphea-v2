"use client";

import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

// Types for validation results
interface EventValidationResult {
  isValid: boolean;
  isActive: boolean;
  isDesignerRegistered: boolean;
  isBoutiqueRegistered: boolean;
  isProductAlreadyAssigned: boolean;
  errors: string[];
  warnings: string[];
}

interface EventValidationParams {
  eventId: number;
  designerId?: number | null;
  boutiqueId?: number | null;
}

export function useEventValidation({
  eventId,
  designerId = null,
  boutiqueId = null
}: EventValidationParams) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["event-validation", eventId, designerId, boutiqueId],
    queryFn: () => validateEvent(supabase, { eventId, designerId, boutiqueId }),
    enabled: !!eventId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false
  });
}

// Helper function to validate a single event (extracted from the hook)
async function validateEvent(
  supabase: any,
  { eventId, designerId = null, boutiqueId = null }: EventValidationParams
): Promise<EventValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Fetch event with details
  const { data: event, error: eventError } = await supabase
    .schema("morpheus")
    .from("yevent")
    .select(`
      *,
      ydetailsevent(
        *,
        ydesign:ydesignidfk(
          ydesignid,
          ydesignnom,
          ydesignmarque
        ),
        yboutique:yboutiqueidfk(
          yboutiqueid,
          yboutiqueintitule,
          yboutiquecode
        )
      )
    `)
    .eq("yeventid", eventId)
    .single();

  if (eventError) {
    errors.push(`Event not found: ${eventError.message}`);
    return {
      isValid: false,
      isActive: false,
      isDesignerRegistered: false,
      isBoutiqueRegistered: false,
      isProductAlreadyAssigned: false,
      errors,
      warnings
    };
  }

  // Check if event is currently active (current date within event date range)
  const currentDate = new Date();
  const eventStartDate = new Date(event.yeventdatedeb);
  const eventEndDate = new Date(event.yeventdatefin);
  
  const isActive = currentDate >= eventStartDate && currentDate <= eventEndDate;
  
  if (!isActive) {
    if (currentDate < eventStartDate) {
      warnings.push(`Event has not started yet. Starts on ${eventStartDate.toLocaleDateString()}`);
    } else {
      errors.push(`Event has ended. Ended on ${eventEndDate.toLocaleDateString()}`);
    }
  }

  // Check designer registration if designerId is provided
  let isDesignerRegistered = true;
  if (designerId !== null) {
    // Look for ANY record for this designer (regardless of yprodidfk value)
    const designerRegistration = event.ydetailsevent?.some(
      detail => detail.ydesignidfk === designerId
    ) || false;
    
    isDesignerRegistered = designerRegistration;
    
    if (!isDesignerRegistered) {
      errors.push("Designer is not registered for this event");
    }
  }

  // Check boutique registration if boutiqueId is provided
  let isBoutiqueRegistered = true;
  if (boutiqueId !== null) {
    // Look for ANY record for this boutique (regardless of yprodidfk value)
    const boutiqueRegistration = event.ydetailsevent?.some(
      detail => detail.yboutiqueidfk === boutiqueId
    ) || false;
    
    isBoutiqueRegistered = boutiqueRegistration;
    
    if (!isBoutiqueRegistered) {
      errors.push("Boutique is not registered for this event");
    }
  }

  // Overall validation
  const isValid = errors.length === 0 && isActive && isDesignerRegistered && isBoutiqueRegistered;

  return {
    isValid,
    isActive,
    isDesignerRegistered,
    isBoutiqueRegistered,
    isProductAlreadyAssigned: false, // This will be set by the eligibility check
    errors,
    warnings
  };
}

// Hook to validate multiple events at once
export function useMultipleEventValidation(
  validationParams: EventValidationParams[]
) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["multiple-event-validation", validationParams],
    queryFn: async (): Promise<Record<number, EventValidationResult>> => {
      const results: Record<number, EventValidationResult> = {};
      
      // Process each event validation
      for (const params of validationParams) {
        try {
          const validation = await validateEvent(supabase, params);
          results[params.eventId] = validation;
        } catch (error) {
          results[params.eventId] = {
            isValid: false,
            isActive: false,
            isDesignerRegistered: false,
            isBoutiqueRegistered: false,
            isProductAlreadyAssigned: false,
            errors: [`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
            warnings: []
          };
        }
      }

      return results;
    },
    enabled: validationParams.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false
  });
}

// Hook to check if a product can be approved for a specific event
export function useProductEventEligibility({
  eventId,
  productId,
  designerId,
  boutiqueId
}: {
  eventId: number;
  productId?: number;
  designerId?: number;
  boutiqueId?: number;
}) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["product-event-eligibility", eventId, productId, designerId, boutiqueId],
    queryFn: async () => {
      // First validate the event
      const eventValidation = await validateEvent(supabase, {
        eventId,
        designerId,
        boutiqueId
      });

      // Check if product is already assigned to this event
      let productAlreadyInEvent = false;
      if (productId) {
        const { data: existingEntry } = await supabase
          .schema("morpheus")
          .from("ydetailsevent")
          .select("ydetailseventid")
          .eq("yeventidfk", eventId)
          .eq("yprodidfk", productId)
          .maybeSingle();

        productAlreadyInEvent = !!existingEntry;
        
        if (productAlreadyInEvent) {
          eventValidation.errors.push("Product is already assigned to this event");
          eventValidation.isProductAlreadyAssigned = true;
          eventValidation.isValid = false;
        }
      }

      const eligible = eventValidation.isValid && !productAlreadyInEvent;
      const canApprove = eligible;

      return {
        eligible,
        canApprove,
        validation: eventValidation,
        productAlreadyInEvent
      };
    },
    enabled: !!eventId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false
  });
}

// Utility hook to get validation summary for UI display
export function useEventValidationSummary(eventId: number) {
  const validation = useEventValidation({ eventId });

  return {
    ...validation,
    data: validation.data ? {
      ...validation.data,
      statusText: validation.data.isValid
        ? "Event is ready for product assignments"
        : validation.data.errors.length > 0
          ? validation.data.errors[0]
          : "Event validation failed",
      statusColor: validation.data.isValid
        ? "green"
        : validation.data.warnings.length > 0 && validation.data.errors.length === 0
          ? "yellow"
          : "red"
    } : undefined
  };
}