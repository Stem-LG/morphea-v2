'use client'

import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { Calendar, Plus } from 'lucide-react'
import { useEvents } from './_hooks/use-events'
import { Button } from '@/components/ui/button'
import { CreateEventDialog } from './_components/create-event-dialog'
import { EventCard } from './_components/event-card'
import { EventCardSkeleton } from './_components/event-card-skeleton'

export default function EventsPage() {
    const { data: user } = useAuth()
    const { data: events, isLoading, isError, error } = useEvents()
    const { t } = useLanguage()

    const isAdmin = user?.app_metadata?.roles?.includes('admin')

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="mb-2 text-3xl font-bold text-gray-900 lg:text-4xl">
                        {t('admin.events.title')}
                    </h1>
                    <p className="text-lg text-gray-600">
                        {isAdmin
                            ? t('admin.events.subtitle')
                            : `${events?.length || 0} ${t('admin.events.subtitleCount')}`}
                    </p>
                </div>

                {isAdmin && (
                    <CreateEventDialog>
                        <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 font-semibold text-white transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-blue-600">
                            <Plus className="h-4 w-4" />
                            {t('admin.events.addEvent')}
                        </Button>
                    </CreateEventDialog>
                )}
            </div>

            {/* Content */}
            <div className="space-y-6">
                {/* Loading State */}
                {isLoading && (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <EventCardSkeleton key={i} />
                        ))}
                    </div>
                )}

                {/* Error State */}
                {isError && (
                    <Card className="border-red-200/50 bg-gradient-to-br from-red-50/50 to-red-100/30 backdrop-blur-sm">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                                <Calendar className="h-8 w-8 text-red-500" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold text-gray-900">
                                {t('admin.events.errorLoadingEvents')}
                            </h3>
                            <p className="mb-4 text-gray-600">
                                {error?.message || t('common.error')}
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => window.location.reload()}
                                className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                                {t('admin.events.retry')}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Success State - Events List */}
                {!isLoading && !isError && events && (
                    <>
                        {events.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                                {events.map((event) => (
                                    <EventCard
                                        key={event.yeventid}
                                        event={event}
                                    />
                                ))}
                            </div>
                        ) : (
                            <Card className="border-gray-200/50 bg-gradient-to-br from-gray-50/50 to-white/50 backdrop-blur-sm">
                                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                        <Calendar className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <h3 className="mb-2 text-xl font-semibold text-gray-900">
                                        {t('admin.events.noEventsFound')}
                                    </h3>
                                    <p className="mb-6 text-gray-500">
                                        {isAdmin
                                            ? t('admin.events.noEventsCreated')
                                            : t(
                                                  'admin.events.noEventsAvailable'
                                              )}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
