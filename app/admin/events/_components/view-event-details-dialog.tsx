"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, MapPin, Store, Users, Image as ImageIcon, Clock, Code } from "lucide-react";
import { useEventDetails } from "../_hooks/use-event-details";
import { useLanguage } from "@/hooks/useLanguage";
import { Skeleton } from "@/components/ui/skeleton";

interface ViewEventDetailsDialogProps {
    children: React.ReactNode;
    event: any;
}

export function ViewEventDetailsDialog({ children, event }: ViewEventDetailsDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useLanguage();
    const { data: eventDetails, isLoading, error } = useEventDetails(event?.yeventid);

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
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
                className: "bg-blue-500/20 text-blue-300 border-blue-500/30",
            };
        } else if (now > endDate) {
            return {
                status: "ended",
                label: t('admin.events.eventStatus.ended'),
                className: "bg-gray-500/20 text-gray-400 border-gray-500/30",
            };
        } else {
            return {
                status: "active",
                label: t('admin.events.eventStatus.active'),
                className: "bg-green-500/20 text-green-300 border-green-500/30",
            };
        }
    };

    const eventStatus = getEventStatus();

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-morpheus-gold-light" />
                        {t('admin.events.viewDetails')}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 h-[calc(80vh-120px)] overflow-y-auto">
                    {/* Event Header - Full Width */}
                    <div className="space-y-3">
                        {/* Event Header */}
                        <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/50">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        {event.yeventmedia?.[0]?.ymedia?.ymediaurl ? (
                                            <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-700">
                                                <img
                                                    src={event.yeventmedia[0].ymedia.ymediaurl}
                                                    alt={event.yeventmedia[0].ymedia.ymediaintitule || event.yeventintitule}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-morpheus-purple to-morpheus-blue flex items-center justify-center">
                                                <Calendar className="h-6 w-6 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <CardTitle className="text-white text-xl">{event.yeventintitule}</CardTitle>
                                            <Badge className={`${eventStatus.className} text-sm`}>
                                                {eventStatus.label}
                                            </Badge>
                                        </div>
                                        {event.yeventcode && (
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Code className="h-4 w-4" />
                                                <span className="text-sm">{event.yeventcode}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-2 text-gray-300">
                                    <Clock className="h-4 w-4 text-morpheus-gold-light" />
                                    <span className="text-sm">
                                        {formatDate(event.yeventdatedeb)} - {formatDate(event.yeventdatefin)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Event Images */}
                        {event.yeventmedia && event.yeventmedia.length > 0 && (
                            <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/50">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <ImageIcon className="h-5 w-5 text-morpheus-gold-light" />
                                        {t('admin.events.eventImages')} ({event.yeventmedia.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-32">
                                        <div className="grid grid-cols-3 gap-2">
                                            {event.yeventmedia.map((media: any, index: number) => (
                                                <div key={media.yeventmediaid} className="relative group">
                                                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-700">
                                                        <img
                                                            src={media.ymedia.ymediaurl}
                                                            alt={media.ymedia.ymediaintitule || `Event image ${index + 1}`}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                    </div>
                                                    {media.ymedia.ymediaintitule && (
                                                        <p className="text-xs text-gray-400 mt-1 truncate">
                                                            {media.ymedia.ymediaintitule}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Event Details Grid - Two Columns */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {isLoading && (
                            <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-3">
                                <Skeleton className="h-20 w-full bg-gray-700/50" />
                                <Skeleton className="h-20 w-full bg-gray-700/50" />
                                <Skeleton className="h-20 w-full bg-gray-700/50" />
                                <Skeleton className="h-20 w-full bg-gray-700/50" />
                            </div>
                        )}

                        {error && (
                            <div className="lg:col-span-2">
                                <Card className="bg-gradient-to-br from-red-900/20 to-red-800/10 border-red-700/50">
                                    <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                                        <p className="text-red-400 mb-2">{t('admin.events.errorLoadingDetails')}</p>
                                        <p className="text-gray-400 text-sm">{error.message}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {eventDetails && !isLoading && !error && (
                            <>
                                {/* Malls */}
                                {eventDetails.rawDetails.some((detail: any) => detail.ymall) && (
                                    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/50">
                                        <CardHeader>
                                            <CardTitle className="text-white flex items-center gap-2">
                                                <MapPin className="h-5 w-5 text-morpheus-gold-light" />
                                                {t('admin.events.malls.title')}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="py-3">
                                            <ScrollArea className="max-h-32">
                                                <div className="space-y-3">
                                                    {Array.from(new Map(
                                                        eventDetails.rawDetails
                                                            .filter((detail: any) => detail.ymall)
                                                            .map((detail: any) => [detail.ymallidfk, detail.ymall])
                                                    ).values()).map((mall: any) => (
                                                        <div key={mall.ymallid} className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                                                            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-morpheus-purple to-morpheus-blue flex items-center justify-center">
                                                                <MapPin className="h-4 w-4 text-white" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-white font-medium">{mall.ymallintitule}</p>
                                                                {mall.ymalllocalisation && (
                                                                    <p className="text-gray-400 text-sm">{mall.ymalllocalisation}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Boutiques */}
                                {eventDetails.rawDetails.some((detail: any) => detail.yboutique) && (
                                    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/50">
                                        <CardHeader>
                                            <CardTitle className="text-white flex items-center gap-2">
                                                <Store className="h-5 w-5 text-morpheus-gold-light" />
                                                {t('admin.events.boutiques.title')}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="py-3">
                                            <ScrollArea className="max-h-32">
                                                <div className="space-y-3">
                                                    {Array.from(new Map(
                                                        eventDetails.rawDetails
                                                            .filter((detail: any) => detail.yboutique)
                                                            .map((detail: any) => [detail.yboutiqueidfk, detail.yboutique])
                                                    ).values()).map((boutique: any) => (
                                                        <div key={boutique.yboutiqueid} className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                                                            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light flex items-center justify-center">
                                                                <Store className="h-4 w-4 text-white" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-white font-medium">{boutique.yboutiqueintitule}</p>
                                                                <div className="flex items-center gap-2 text-gray-400 text-sm">
                                                                    {boutique.yboutiquecode && (
                                                                        <span>Code: {boutique.yboutiquecode}</span>
                                                                    )}
                                                                    {boutique.yboutiqueadressemall && (
                                                                        <span>• {boutique.yboutiqueadressemall}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Designer Assignments - Full Width */}
                                {eventDetails.rawDetails.some((detail: any) => detail.ydesign) && (
                                    <div className="lg:col-span-2">
                                        <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/50">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-white flex items-center gap-2">
                                                    <Users className="h-5 w-5 text-morpheus-gold-light" />
                                                    {t('admin.events.designerAssignments')}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="py-3">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                                                    {eventDetails.rawDetails
                                                        .filter((detail: any) => detail.ydesign && detail.yboutique)
                                                        .map((detail: any, index: number) => (
                                                            <div key={`${detail.yboutiqueidfk}-${detail.ydesignidfk}-${index}`} className="flex items-center gap-2 p-2 bg-gray-800/30 rounded-lg">
                                                                <div className="h-6 w-6 rounded bg-gradient-to-r from-morpheus-purple to-morpheus-blue flex items-center justify-center flex-shrink-0">
                                                                    <Users className="h-3 w-3 text-white" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-white font-medium text-sm truncate">{detail.ydesign.ydesignnom}</p>
                                                                    <div className="flex items-center gap-1 text-gray-400 text-xs">
                                                                        <span className="truncate">{detail.yboutique.yboutiqueintitule}</span>
                                                                        {detail.ydesign.ydesignmarque && (
                                                                            <span>• {detail.ydesign.ydesignmarque}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end pt-2 border-t border-gray-700/50 mt-2">
                    <Button
                        onClick={() => setIsOpen(false)}
                        size="sm"
                        className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-morpheus-gold-dark hover:to-morpheus-gold-light text-white font-semibold transition-all duration-300 hover:scale-105"
                    >
                        {t('common.close')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}