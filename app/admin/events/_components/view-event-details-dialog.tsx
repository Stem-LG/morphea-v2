'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Calendar,
    MapPin,
    Store,
    Users,
    Image as ImageIcon,
    Clock,
    Code,
} from 'lucide-react'
import { useEventDetails } from '../_hooks/use-event-details'
import { useLanguage } from '@/hooks/useLanguage'
import { Skeleton } from '@/components/ui/skeleton'

interface ViewEventDetailsDialogProps {
    children: React.ReactNode
    event: any
}

export function ViewEventDetailsDialog({
    children,
    event,
}: ViewEventDetailsDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const { t } = useLanguage()
    const {
        data: eventDetails,
        isLoading,
        error,
    } = useEventDetails(event?.yeventid)

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            })
        } catch {
            return dateString
        }
    }

    const getEventStatus = () => {
        const now = new Date()
        const startDate = new Date(event.yeventdatedeb)
        const endDate = new Date(event.yeventdatefin)

        if (now < startDate) {
            return {
                status: 'upcoming',
                label: t('admin.events.eventStatus.upcoming'),
                className: 'bg-blue-100 text-blue-700 border-blue-200',
            }
        } else if (now > endDate) {
            return {
                status: 'ended',
                label: t('admin.events.eventStatus.ended'),
                className: 'bg-gray-100 text-gray-600 border-gray-200',
            }
        } else {
            return {
                status: 'active',
                label: t('admin.events.eventStatus.active'),
                className: 'bg-green-100 text-green-700 border-green-200',
            }
        }
    }

    const eventStatus = getEventStatus()

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="from-gray-50/95 to-white/95 max-w-3xl bg-gradient-to-br shadow-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-gray-900">
                        <Calendar className="text-blue-500 h-5 w-5" />
                        {t('admin.events.viewDetails')}
                    </DialogTitle>
                </DialogHeader>

                <div className="h-[calc(80vh-120px)] space-y-3 overflow-y-auto">
                    {/* Event Header - Full Width */}
                    <div className="space-y-3">
                        {/* Event Header */}
                        <Card className="border-gray-200/50 bg-gradient-to-br from-gray-50/50 to-white/50 shadow-xl">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        {event.yeventmedia?.[0]?.ymedia
                                            ?.ymediaurl ? (
                                            <div className="h-12 w-12 overflow-hidden rounded-lg bg-gray-100">
                                                <img
                                                    src={
                                                        event.yeventmedia[0]
                                                            .ymedia.ymediaurl
                                                    }
                                                    alt={
                                                        event.yeventmedia[0]
                                                            .ymedia
                                                            .ymediaintitule ||
                                                        event.yeventintitule
                                                    }
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="from-morpheus-purple to-morpheus-blue flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r">
                                                <Calendar className="h-6 w-6 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="mb-1 flex items-center gap-2">
                                            <CardTitle className="text-xl text-gray-900">
                                                {event.yeventintitule}
                                            </CardTitle>
                                            <Badge
                                                className={`${eventStatus.className} text-sm`}
                                            >
                                                {eventStatus.label}
                                            </Badge>
                                        </div>
                                        {event.yeventcode && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Code className="h-4 w-4" />
                                                <span className="text-sm">
                                                    {event.yeventcode}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Clock className="text-blue-500 h-4 w-4" />
                                    <span className="text-sm">
                                        {formatDate(event.yeventdatedeb)} -{' '}
                                        {formatDate(event.yeventdatefin)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Event Images */}
                        {event.yeventmedia && event.yeventmedia.length > 0 && (
                            <Card className="border-gray-200/50 bg-gradient-to-br from-gray-50/50 to-white/50 shadow-xl">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-gray-900">
                                        <ImageIcon className="text-blue-500 h-5 w-5" />
                                        {t('admin.events.eventImages')} (
                                        {event.yeventmedia.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-32">
                                        <div className="grid grid-cols-3 gap-2">
                                            {event.yeventmedia.map(
                                                (media: any, index: number) => (
                                                    <div
                                                        key={
                                                            media.yeventmediaid
                                                        }
                                                        className="group relative"
                                                    >
                                                        <div className="aspect-video overflow-hidden rounded-lg bg-gray-100">
                                                            <img
                                                                src={
                                                                    media.ymedia
                                                                        .ymediaurl
                                                                }
                                                                alt={
                                                                    media.ymedia
                                                                        .ymediaintitule ||
                                                                    `Event image ${index + 1}`
                                                                }
                                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                            />
                                                        </div>
                                                        {media.ymedia
                                                            .ymediaintitule && (
                                                            <p className="mt-1 truncate text-xs text-gray-600">
                                                                {
                                                                    media.ymedia
                                                                        .ymediaintitule
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Event Details Grid - Two Columns */}
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                        {isLoading && (
                            <div className="grid grid-cols-1 gap-3 lg:col-span-2 lg:grid-cols-2">
                                <Skeleton className="h-20 w-full bg-gray-200" />
                                <Skeleton className="h-20 w-full bg-gray-200" />
                                <Skeleton className="h-20 w-full bg-gray-200" />
                                <Skeleton className="h-20 w-full bg-gray-200" />
                            </div>
                        )}

                        {error && (
                            <div className="lg:col-span-2">
                                <Card className="border-red-200/50 bg-gradient-to-br from-red-50/50 to-white/50 shadow-xl">
                                    <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                                        <p className="mb-2 text-red-700">
                                            {t(
                                                'admin.events.errorLoadingDetails'
                                            )}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {error.message}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {eventDetails && !isLoading && !error && (
                            <>
                                {/* Malls */}
                                {eventDetails.rawDetails.some(
                                    (detail: any) => detail.ymall
                                ) && (
                                    <Card className="border-gray-200/50 bg-gradient-to-br from-gray-50/50 to-white/50 shadow-xl">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-gray-900">
                                                <MapPin className="text-blue-500 h-5 w-5" />
                                                {t('admin.events.malls.title')}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="py-3">
                                            <ScrollArea className="max-h-64">
                                                <div className="space-y-3">
                                                    {Array.from(
                                                        new Map(
                                                            eventDetails.rawDetails
                                                                .filter(
                                                                    (
                                                                        detail: any
                                                                    ) =>
                                                                        detail.ymall
                                                                )
                                                                .map(
                                                                    (
                                                                        detail: any
                                                                    ) => [
                                                                        detail.ymallidfk,
                                                                        detail.ymall,
                                                                    ]
                                                                )
                                                        ).values()
                                                    ).map((mall: any) => (
                                                        <div
                                                            key={mall.ymallid}
                                                            className="flex items-center gap-3 rounded-lg bg-gray-50 p-3"
                                                        >
                                                            <div className="from-morpheus-purple to-morpheus-blue flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r">
                                                                <MapPin className="h-4 w-4 text-white" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-medium text-gray-900">
                                                                    {
                                                                        mall.ymallintitule
                                                                    }
                                                                </p>
                                                                {mall.ymalllocalisation && (
                                                                    <p className="text-sm text-gray-600">
                                                                        {
                                                                            mall.ymalllocalisation
                                                                        }
                                                                    </p>
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
                                {eventDetails.rawDetails.some(
                                    (detail: any) => detail.yboutique
                                ) && (
                                    <Card className="border-gray-200/50 bg-gradient-to-br from-gray-50/50 to-white/50 shadow-xl">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-gray-900">
                                                <Store className="text-blue-500 h-5 w-5" />
                                                {t(
                                                    'admin.events.boutiques.title'
                                                )}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="py-3">
                                                <div className="space-y-1 h-44 overflow-y-scroll">
                                                    {Array.from(
                                                        new Map(
                                                            eventDetails.rawDetails
                                                                .filter(
                                                                    (
                                                                        detail: any
                                                                    ) =>
                                                                        detail.yboutique
                                                                )
                                                                .map(
                                                                    (
                                                                        detail: any
                                                                    ) => [
                                                                        detail.yboutiqueidfk,
                                                                        detail.yboutique,
                                                                    ]
                                                                )
                                                        ).values()
                                                    ).map((boutique: any) => (
                                                        <div
                                                            key={
                                                                boutique.yboutiqueid
                                                            }
                                                            className="flex items-center gap-3 rounded-lg bg-gray-50 p-3"
                                                        >
                                                            <div className="from-blue-500 to-blue-600 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r">
                                                                <Store className="h-4 w-4 text-white" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-medium text-gray-900">
                                                                    {
                                                                        boutique.yboutiqueintitule
                                                                    }
                                                                </p>
                                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                    {boutique.yboutiquecode && (
                                                                        <span>
                                                                            Code:{' '}
                                                                            {
                                                                                boutique.yboutiquecode
                                                                            }
                                                                        </span>
                                                                    )}
                                                                    {boutique.yboutiqueadressemall && (
                                                                        <span>
                                                                            •{' '}
                                                                            {
                                                                                boutique.yboutiqueadressemall
                                                                            }
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Designer Assignments - Full Width */}
                                {eventDetails.rawDetails.some(
                                    (detail: any) => detail.ydesign
                                ) && (
                                    <div className="lg:col-span-2">
                                        <Card className="border-gray-200/50 bg-gradient-to-br from-gray-50/50 to-white/50 shadow-xl">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="flex items-center gap-2 text-gray-900">
                                                    <Users className="text-blue-500 h-5 w-5" />
                                                    {t(
                                                        'admin.events.designerAssignments'
                                                    )}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="py-3">
                                                <div className="grid max-h-32 grid-cols-1 gap-2 overflow-y-auto md:grid-cols-2">
                                                    {eventDetails.rawDetails
                                                        .filter(
                                                            (detail: any) =>
                                                                detail.ydesign &&
                                                                detail.yboutique
                                                        )
                                                        .map(
                                                            (
                                                                detail: any,
                                                                index: number
                                                            ) => (
                                                                <div
                                                                    key={`${detail.yboutiqueidfk}-${detail.ydesignidfk}-${index}`}
                                                                    className="flex items-center gap-2 rounded-lg bg-gray-50 p-2"
                                                                >
                                                                    <div className="from-morpheus-purple to-morpheus-blue flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-gradient-to-r">
                                                                        <Users className="h-3 w-3 text-white" />
                                                                    </div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="truncate text-sm font-medium text-gray-900">
                                                                            {
                                                                                detail
                                                                                    .ydesign
                                                                                    .ydesignnom
                                                                            }
                                                                        </p>
                                                                        <div className="flex items-center gap-1 text-xs text-gray-600">
                                                                            <span className="truncate">
                                                                                {
                                                                                    detail
                                                                                        .yboutique
                                                                                        .yboutiqueintitule
                                                                                }
                                                                            </span>
                                                                            {detail
                                                                                .ydesign
                                                                                .ydesignmarque && (
                                                                                <span>
                                                                                    •{' '}
                                                                                    {
                                                                                        detail
                                                                                            .ydesign
                                                                                            .ydesignmarque
                                                                                    }
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        )}
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
                <div className="mt-2 flex justify-end border-t border-gray-200 pt-2">
                    <Button
                        onClick={() => setIsOpen(false)}
                        size="sm"
                        className="from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 bg-gradient-to-r font-semibold text-white transition-all duration-300 hover:scale-105"
                    >
                        {t('common.close')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
