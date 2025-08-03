"use client";

import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

interface EventValidationResult {
  isValid: boolean;
  message: string;
  eventDetails?: any;
}

export function useEventValidation(
  eventId: number | null,
  designerId: number | null,
  boutiqueId: number | null
) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["event-validation", eventId, designerId, boutiqueId],
    queryFn: async (): Promise<EventValidationResult> => {
      if (!eventId) {
        return {
          isValid: false,
          message: "No event selected"
        };
      }

      if (!designerId && !boutiqueId) {
        return {
          isValid: false,
          message: "No designer or boutique specified"
        };
      }

      try {
        // Get event with all its details
        const { data: eventData, error: eventError } = await supabase
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
          return {
            isValid: false,
            message: `Event not found: ${eventError.message}`
          };
        }

        // Check if event is active (current date within event date range)
        const currentDate = new Date().toISOString().split('T')[0];
        const eventStartDate = eventData.yeventdatedeb;
        const eventEndDate = eventData.yeventdatefin;

        if (currentDate < eventStartDate || currentDate > eventEndDate) {
          return {
            isValid: false,
            message: `Event is not active. Event runs from ${eventStartDate} to ${eventEndDate}`,
            eventDetails: eventData
          };
        }

        // Check for registration records (yprodidfk IS NULL)
        const registrationRecords = eventData.ydetailsevent?.filter(
          (detail: any) => detail.yprodidfk === null
        ) || [];

        // NEW LOGIC: If both designer and boutique are provided, check for complete match
        if (designerId !== null && boutiqueId !== null) {
          // Find a registration record that matches both designer and boutique
          const matchingRegistration = registrationRecords.find(
            (detail: any) =>
              detail.ydesignidfk === designerId &&
              detail.yboutiqueidfk === boutiqueId
          );

          if (!matchingRegistration) {
            console.log("Event validation debug - No matching registration:", {
              eventId,
              designerId,
              boutiqueId,
              eventDetails: eventData.ydetailsevent,
              registrationRecords: registrationRecords.map(r => ({
                ydesignidfk: r.ydesignidfk,
                yboutiqueidfk: r.yboutiqueidfk,
                ymallidfk: r.ymallidfk,
                yeventidfk: r.yeventidfk
              }))
            });

            return {
              isValid: false,
              message: "No matching registration found for this designer/boutique combination in this event",
              eventDetails: eventData
            };
          }

          // Validate that the registration has a mall ID
          if (!matchingRegistration.ymallidfk) {
            return {
              isValid: false,
              message: "Registration found but mall information is missing",
              eventDetails: eventData
            };
          }

          console.log("Event validation success - Complete match found:", {
            eventId,
            designerId,
            boutiqueId,
            mallId: matchingRegistration.ymallidfk,
            registrationRecord: {
              ydesignidfk: matchingRegistration.ydesignidfk,
              yboutiqueidfk: matchingRegistration.yboutiqueidfk,
              ymallidfk: matchingRegistration.ymallidfk,
              yeventidfk: matchingRegistration.yeventidfk
            }
          });

          return {
            isValid: true,
            message: "Event is valid - complete registration found for designer/boutique combination",
            eventDetails: eventData
          };
        }

        // Fallback to original logic for individual checks
        // Check designer registration
        if (designerId !== null) {
          const hasDesignerRegistration = registrationRecords.some(
            (detail: any) => detail.ydesignidfk === designerId
          );

          if (!hasDesignerRegistration) {
            console.log("Event validation debug:", {
              eventId,
              designerId,
              boutiqueId,
              eventDetails: eventData.ydetailsevent,
              registrationRecords,
              designerRecords: eventData.ydetailsevent?.filter((d: any) => d.ydesignidfk === designerId),
              designerRegistrationRecords: registrationRecords.filter((d: any) => d.ydesignidfk === designerId)
            });

            return {
              isValid: false,
              message: "Designer is not registered for this event",
              eventDetails: eventData
            };
          }
        }

        // Check boutique registration
        if (boutiqueId !== null) {
          const hasBoutiqueRegistration = registrationRecords.some(
            (detail: any) => detail.yboutiqueidfk === boutiqueId
          );

          if (!hasBoutiqueRegistration) {
            return {
              isValid: false,
              message: "Boutique is not registered for this event",
              eventDetails: eventData
            };
          }
        }

        return {
          isValid: true,
          message: "Event is valid for approval",
          eventDetails: eventData
        };

      } catch (error) {
        console.error("Event validation error:", error);
        return {
          isValid: false,
          message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    },
    enabled: !!eventId && (!!designerId || !!boutiqueId),
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false
  });
}