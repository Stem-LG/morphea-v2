"use client";

import { Card, CardContent, } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, Plus } from "lucide-react";
import { useEvents } from "./_hooks/use-events";
import { Button } from "@/components/ui/button";
import { CreateEventDialog } from "./_components/create-event-dialog";
import { EventCard } from "./_components/event-card";
import { EventCardSkeleton } from "./_components/event-card-skeleton";


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
                        <Button className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-morpheus-gold-dark hover:to-morpheus-gold-light text-white font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2">
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
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
