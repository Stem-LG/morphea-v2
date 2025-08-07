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
            return { status: "upcoming", label: "Upcoming", className: "bg-blue-500/20 text-blue-300" };
        } else if (now > endDate) {
            return { status: "ended", label: "Ended", className: "bg-gray-500/20 text-gray-400" };
        } else {
            return { status: "active", label: "Active", className: "bg-green-500/20 text-green-300" };
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
            <div className="flex items-center gap-2 text-gray-400">
                <Calendar className="h-4 w-4 animate-pulse" />
                <span>Loading events...</span>
            </div>
        );
    }

    return (
        <Select
            value={selectedEventId?.toString() || ""}
            onValueChange={(value) => onEventChange(value ? parseInt(value) : null)}
        >
            <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                <SelectValue placeholder="Select an event">
                    {selectedEventId && (
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-morpheus-gold-light" />
                            <span>
                                {events.find((e) => e.yeventid === selectedEventId)?.yeventintitule || "Unknown Event"}
                            </span>
                            {selectedEventId === activeEvent?.yeventid && (
                                <Badge className="bg-green-500/20 text-green-300 text-xs">Active</Badge>
                            )}
                        </div>
                    )}
                </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600 max-h-60">
                {events.length === 0 ? (
                    <SelectItem value="" disabled className="text-gray-400">
                        No events available
                    </SelectItem>
                ) : (
                    events.map((event) => {
                        const eventStatus = getEventStatus(event);
                        return (
                            <SelectItem
                                key={event.yeventid}
                                value={event.yeventid.toString()}
                                className="text-white focus:bg-gray-700"
                            >
                                <div className="flex flex-col gap-1 py-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{event.yeventintitule}</span>
                                        <Badge className={`${eventStatus.className} text-xs`}>
                                            {eventStatus.label}
                                        </Badge>
                                    </div>
                                    <div className="text-xs text-gray-400">
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
