"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Calendar, Edit, Trash2, CalendarDays, Eye } from "lucide-react";
import { UpdateEventDialog } from "./update-event-dialog";
import { DeleteEventDialog } from "./delete-event-dialog";
import { Badge } from "@/components/ui/badge";
import { useDeleteEvent } from "../_hooks/use-delete-event";
import { useState } from "react";
import { toast } from "sonner";

// Event Card Component
export function EventCard({ event }) {
    const { data: user } = useAuth();
    const { t } = useLanguage();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const deleteEventMutation = useDeleteEvent();

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
                label: t('admin.events.eventStatus.upcoming'),
                variant: "secondary" as const,
                className: "bg-blue-500/20 text-blue-300 border-blue-500/30",
            };
        } else if (now > endDate) {
            return {
                status: "ended",
                label: t('admin.events.eventStatus.ended'),
                variant: "outline" as const,
                className: "bg-gray-500/20 text-gray-400 border-gray-500/30",
            };
        } else {
            return {
                status: "active",
                label: t('admin.events.eventStatus.active'),
                variant: "default" as const,
                className: "bg-green-500/20 text-green-300 border-green-500/30",
            };
        }
    };

    const eventStatus = getEventStatus();

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowDeleteDialog(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await deleteEventMutation.mutateAsync({ eventId: event.yeventid });
            toast.success(t('admin.events.eventDeletedSuccess'));
            setShowDeleteDialog(false);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : t('common.error');
            toast.error(errorMessage);
            console.error("Delete error:", error);
        }
    };

    return (
        <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/50 backdrop-blur-sm hover:border-morpheus-gold-light/30 transition-all duration-300 hover:shadow-lg hover:shadow-morpheus-gold-light/10">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        {event.yeventmedia?.[0]?.ymedia?.ymediaurl ? (
                            <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-700">
                                <img
                                    src={event.yeventmedia[0].ymedia.ymediaurl}
                                    alt={event.yeventmedia[0].ymedia.ymediaintitule || event.yeventintitule}
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
                            <Badge variant={eventStatus.variant} className={`${eventStatus.className} text-xs`}>
                                {eventStatus.label}
                            </Badge>
                        </div>
                        <p className="text-sm text-gray-400">{t('admin.events.eventCode')}: {event.yeventcode}</p>
                    </div>
                    {isAdmin && (
                        <div className="flex gap-1">
                            <UpdateEventDialog event={event}>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0 border-gray-600 text-gray-300 hover:bg-gray-800/50 hover:text-white hover:border-morpheus-gold-light/50"
                                    title={t('admin.events.editEvent')}
                                >
                                    <Edit className="h-3 w-3" />
                                </Button>
                            </UpdateEventDialog>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleDelete}
                                className="h-8 w-8 p-0 border-gray-600 text-gray-300 hover:bg-red-900/50 hover:text-red-400 hover:border-red-500/50"
                                title={t('admin.events.deleteEvent')}
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
                    <span className="text-sm">
                        {formatDate(event.yeventdatedeb)} - {formatDate(event.yeventdatefin)}
                    </span>
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-morpheus-gold-dark hover:to-morpheus-gold-light text-white font-semibold transition-all duration-300 hover:scale-105"
                    size="sm"
                    onClick={() => console.log("View event details:", event)}
                >
                    <Eye className="h-4 w-4 mr-2" />
                    {t('admin.events.viewDetails')}
                </Button>
            </CardFooter>
            
            <DeleteEventDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={handleConfirmDelete}
                eventName={event.yeventintitule}
                isLoading={deleteEventMutation.isPending}
            />
        </Card>
    );
}
