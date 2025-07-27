"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, CalendarDays, Clock, Plus, Edit, Trash2, Eye } from "lucide-react";
import { useEvents } from "./_hooks/use-events";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreateEventDialog } from "./_components/create-event-dialog";

// Event Card Skeleton Component
function EventCardSkeleton() {
    return (
        <Card className="bg-gradient-to-br from-morpheus-purple/20 to-morpheus-blue/10 border-morpheus-purple/30 backdrop-blur-sm overflow-hidden animate-pulse">
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="h-6 bg-gray-700/50 rounded mb-2"></div>
                        <div className="h-4 bg-gray-700/30 rounded w-2/3"></div>
                    </div>
                    <div className="h-12 w-12 bg-gray-700/50 rounded-full"></div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-gray-700/50 rounded"></div>
                        <div className="h-4 bg-gray-700/30 rounded flex-1"></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-gray-700/50 rounded"></div>
                        <div className="h-4 bg-gray-700/30 rounded flex-1"></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-gray-700/50 rounded"></div>
                        <div className="h-4 bg-gray-700/30 rounded w-3/4"></div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Event Card Component
function EventCard({ event }) {
    const { t } = useLanguage();
    const { data: user } = useAuth();

    const isAdmin = user?.app_metadata?.roles?.includes("admin");

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

    const getEventStatus = () => {
        const now = new Date();
        const startDate = new Date(event.yeventdatedeb);
        const endDate = new Date(event.yeventdatefin);

        if (now < startDate) {
            return {
                status: "upcoming",
                label: "Upcoming",
                variant: "secondary" as const,
                className: "bg-blue-500/20 text-blue-300 border-blue-500/30"
            };
        } else if (now > endDate) {
            return {
                status: "ended",
                label: "Ended",
                variant: "outline" as const,
                className: "bg-gray-500/20 text-gray-400 border-gray-500/30"
            };
        } else {
            return {
                status: "active",
                label: "Active",
                variant: "default" as const,
                className: "bg-green-500/20 text-green-300 border-green-500/30"
            };
        }
    };

    const eventStatus = getEventStatus();

    const handleEdit = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // TODO: Implement edit functionality
        console.log("Edit event:", event);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // TODO: Implement delete functionality
        console.log("Delete event:", event);
    };

    return (
        <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/50 backdrop-blur-sm hover:border-morpheus-gold-light/30 transition-all duration-300 hover:shadow-lg hover:shadow-morpheus-gold-light/10">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        {event.ymedia?.ymediaurl ? (
                            <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-700">
                                <img
                                    src={event.ymedia.ymediaurl}
                                    alt={event.ymedia.ymediaintitule || event.yeventintitule}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-morpheus-purple to-morpheus-blue flex items-center justify-center">
                                <Calendar className="h-5 w-5 text-white" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-white text-lg truncate">{event.yeventintitule}</CardTitle>
                            <Badge
                                variant={eventStatus.variant}
                                className={`${eventStatus.className} text-xs`}
                            >
                                {eventStatus.label}
                            </Badge>
                        </div>
                        <p className="text-sm text-gray-400">Code: {event.yeventcode}</p>
                    </div>
                    {isAdmin && (
                        <div className="flex gap-1">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleEdit}
                                className="h-8 w-8 p-0 border-gray-600 text-gray-300 hover:bg-gray-800/50 hover:text-white hover:border-morpheus-gold-light/50"
                                title="Edit Event"
                            >
                                <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleDelete}
                                className="h-8 w-8 p-0 border-gray-600 text-gray-300 hover:bg-red-900/50 hover:text-red-400 hover:border-red-500/50"
                                title="Delete Event"
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-gray-300">
                    <CalendarDays className="h-4 w-4 text-morpheus-gold-light" />
                    <span className="text-sm">{formatDate(event.yeventdatedeb)} - {formatDate(event.yeventdatefin)}</span>
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-morpheus-gold-dark hover:to-morpheus-gold-light text-white font-semibold transition-all duration-300 hover:scale-105"
                    size="sm"
                    onClick={() => console.log("View event details:", event)}
                >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                </Button>
            </CardFooter>
        </Card>
    );
}

export default function EventsPage() {
    const { data: user } = useAuth();
    const { data: events, isLoading, isError, error } = useEvents();

    const isAdmin = user?.app_metadata?.roles?.includes("admin");

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Events Management</h1>
                    <p className="text-lg text-gray-300">
                        {isAdmin ? "Manage all events" : `${events?.length || 0} events available`}
                    </p>
                </div>
                
                {isAdmin && (
                    <CreateEventDialog>
                        <Button className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light text-black font-medium flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Add Event
                        </Button>
                    </CreateEventDialog>
                )}
            </div>

            {/* Content */}
            <div className="space-y-6">
                {/* Loading State */}
                {isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <EventCardSkeleton key={i} />
                        ))}
                    </div>
                )}

                {/* Error State */}
                {isError && (
                    <Card className="bg-gradient-to-br from-red-900/20 to-red-800/10 border-red-700/50 backdrop-blur-sm">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="h-16 w-16 rounded-full bg-red-900/30 flex items-center justify-center mb-4">
                                <Calendar className="h-8 w-8 text-red-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Error Loading Events</h3>
                            <p className="text-gray-400 mb-4">{error?.message || "An error occurred"}</p>
                            <Button
                                variant="outline"
                                onClick={() => window.location.reload()}
                                className="border-red-700/50 text-red-400 hover:bg-red-900/30"
                            >
                                Retry
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Success State - Events List */}
                {!isLoading && !isError && events && (
                    <>
                        {events.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {events.map((event) => (
                                    <EventCard key={event.yeventid} event={event} />
                                ))}
                            </div>
                        ) : (
                            <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/50 backdrop-blur-sm">
                                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="h-16 w-16 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
                                        <Calendar className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">No Events Found</h3>
                                    <p className="text-gray-400 mb-6">
                                        {isAdmin
                                            ? "No events have been created yet. Create your first event to get started."
                                            : "No events are currently available."}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
