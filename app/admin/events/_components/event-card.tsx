'use client'

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { Calendar, Edit, Trash2, CalendarDays, Eye } from 'lucide-react'
import { UpdateEventDialog } from './update-event-dialog'
import { DeleteEventDialog } from './delete-event-dialog'
import { ViewEventDetailsDialog } from './view-event-details-dialog'
import { Badge } from '@/components/ui/badge'
import { useDeleteEvent } from '../_hooks/use-delete-event'
import { useState } from 'react'
import { toast } from 'sonner'

// Event Card Component
export function EventCard({ event }) {
    const { data: user } = useAuth()
    const { t } = useLanguage()
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const deleteEventMutation = useDeleteEvent()

    const isAdmin = user?.app_metadata?.roles?.includes('admin')

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
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
                variant: 'secondary' as const,
                className: 'bg-blue-100 text-blue-700 border-blue-200',
            }
        } else if (now > endDate) {
            return {
                status: 'ended',
                label: t('admin.events.eventStatus.ended'),
                variant: 'outline' as const,
                className: 'bg-gray-100 text-gray-600 border-gray-200',
            }
        } else {
            return {
                status: 'active',
                label: t('admin.events.eventStatus.active'),
                variant: 'default' as const,
                className: 'bg-green-100 text-green-700 border-green-200',
            }
        }
    }

    const eventStatus = getEventStatus()

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setShowDeleteDialog(true)
    }

    const handleConfirmDelete = async () => {
        try {
            await deleteEventMutation.mutateAsync({ eventId: event.yeventid })
            toast.success(t('admin.events.eventDeletedSuccess'))
            setShowDeleteDialog(false)
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : t('common.error')
            toast.error(errorMessage)
            console.error('Delete error:', error)
        }
    }

    return (
        <Card className="hover:border-morpheus-gold-light/30 hover:shadow-morpheus-gold-light/10 border-gray-200/50 bg-gradient-to-br from-gray-50/50 to-white/50 backdrop-blur-sm shadow-xl transition-all duration-300 hover:shadow-lg">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        {event.yeventmedia?.[0]?.ymedia?.ymediaurl ? (
                            <div className="h-10 w-10 overflow-hidden rounded-lg bg-gray-200">
                                <img
                                    src={event.yeventmedia[0].ymedia.ymediaurl}
                                    alt={
                                        event.yeventmedia[0].ymedia
                                            .ymediaintitule ||
                                        event.yeventintitule
                                    }
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="from-blue-500 to-blue-600 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r">
                                <Calendar className="h-5 w-5 text-white" />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                            <CardTitle className="truncate text-lg text-gray-900">
                                {event.yeventintitule}
                            </CardTitle>
                            <Badge
                                variant={eventStatus.variant}
                                className={`${eventStatus.className} text-xs`}
                            >
                                {eventStatus.label}
                            </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                            {t('admin.events.eventCode')}: {event.yeventcode}
                        </p>
                    </div>
                    {isAdmin && (
                        <div className="flex gap-1">
                            <UpdateEventDialog event={event}>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="hover:border-morpheus-gold-light/50 h-8 w-8 border-gray-300 p-0 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    title={t('admin.events.editEvent')}
                                >
                                    <Edit className="h-3 w-3" />
                                </Button>
                            </UpdateEventDialog>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleDelete}
                                className="h-8 w-8 border-gray-300 p-0 text-gray-600 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                                title={t('admin.events.deleteEvent')}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-gray-700">
                    <CalendarDays className="text-blue-500 h-4 w-4" />
                    <span className="text-sm">
                        {formatDate(event.yeventdatedeb)} -{' '}
                        {formatDate(event.yeventdatefin)}
                    </span>
                </div>
            </CardContent>
            <CardFooter>
                <ViewEventDetailsDialog event={event}>
                    <Button
                        className="from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 w-full bg-gradient-to-r font-semibold text-white transition-all duration-300 hover:scale-105"
                        size="sm"
                    >
                        <Eye className="mr-2 h-4 w-4" />
                        {t('admin.events.viewDetails')}
                    </Button>
                </ViewEventDetailsDialog>
            </CardFooter>

            <DeleteEventDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={handleConfirmDelete}
                eventName={event.yeventintitule}
                isLoading={deleteEventMutation.isPending}
            />
        </Card>
    )
}
