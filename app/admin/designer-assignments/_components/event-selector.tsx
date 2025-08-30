"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEvents } from "../../events/_hooks/use-events";
import { useActiveEvent } from "../_hooks/use-active-event";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

interface EventSelectorProps {
    selectedEventId: number | null;
    onEventChange: (eventId: number | null) => void;
}

export function EventSelector({ selectedEventId, onEventChange }: EventSelectorProps) {
    const { data: events = [], isLoading } = useEvents();
    const { data: activeEvent } = useActiveEvent();

    const getEventStatus = (event: any) => {
        const now = new Date();
        const startDate = new Date(event.yeventdatedeb);
        const endDate = new Date(event.yeventdatefin);

        if (now < startDate) {
            return { status: "upcoming", label: "Upcoming", className: "bg-blue-100 text-blue-800 border-blue-200" };
        } else if (now > endDate) {
            return { status: "ended", label: "Ended", className: "bg-gray-100 text-gray-600 border-gray-200" };
        } else {
            return { status: "active", label: "Active", className: "bg-green-100 text-green-800 border-green-200" };
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
        } catch {
            return dateString;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4 animate-pulse text-gray-400" />
                <span>Loading events...</span>
            </div>
        );
    }

    return (
        <Select
            value={selectedEventId?.toString() || ""}
            onValueChange={(value) => onEventChange(value ? parseInt(value) : null)}
        >
            <SelectTrigger className="bg-white border-gray-300 text-gray-900 shadow-sm">
                <SelectValue placeholder="Select an event">
                    {selectedEventId && (
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span>
                                {events.find((e) => e.yeventid === selectedEventId)?.yeventintitule || "Unknown Event"}
                            </span>
                            {selectedEventId === activeEvent?.yeventid && (
                                <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Active</Badge>
                            )}
                        </div>
                    )}
                </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-300 max-h-60 shadow-lg">
                {events.length === 0 ? (
                    <SelectItem value="" disabled className="text-gray-500">
                        No events available
                    </SelectItem>
                ) : (
                    events.map((event) => {
                        const eventStatus = getEventStatus(event);
                        return (
                            <SelectItem
                                key={event.yeventid}
                                value={event.yeventid.toString()}
                                className="text-gray-900 focus:bg-gray-100"
                            >
                                <div className="flex flex-col gap-1 py-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{event.yeventintitule}</span>
                                        <Badge className={`${eventStatus.className} text-xs`}>
                                            {eventStatus.label}
                                        </Badge>
                                    </div>
                                    <div className="text-xs text-gray-600">
                                        {formatDate(event.yeventdatedeb)} - {formatDate(event.yeventdatefin)}
                                    </div>
                                    <div className="text-xs text-gray-500">Code: {event.yeventcode}</div>
                                </div>
                            </SelectItem>
                        );
                    })
                )}
            </SelectContent>
        </Select>
    );
}
