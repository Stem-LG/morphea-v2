'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLanguage } from '@/hooks/useLanguage'
import { Users, Calendar, Building2 } from 'lucide-react'
import { useState } from 'react'
import { EventSelector } from './_components/event-selector'
import { MallSelector } from './_components/mall-selector'
import { BoutiqueGrid } from './_components/boutique-grid'
import { useActiveEvent } from './_hooks/use-active-event'
import { useEventMallBoutiques } from './_hooks/use-event-mall-boutiques'
import { Toaster } from './_components/toaster'

export default function DesignerAssignmentsPage() {
    const { t } = useLanguage()
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
    const [selectedMallId, setSelectedMallId] = useState<number | null>(null)

    const { data: activeEvent } = useActiveEvent()
    const { data: eventMallBoutiques, isLoading: isLoadingBoutiques } =
        useEventMallBoutiques(
            selectedEventId || activeEvent?.yeventid || null,
            selectedMallId
        )

    // Set default event to active event when it loads
    if (activeEvent && !selectedEventId) {
        setSelectedEventId(activeEvent.yeventid)
    }

    return (
        <>
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="mb-2 text-3xl font-bold text-gray-900 lg:text-4xl">
                            {t('admin.designerAssignments.title') ||
                                'Designer Assignments'}
                        </h1>
                        <p className="text-lg text-gray-600">
                            {t('admin.designerAssignments.subtitle') ||
                                'Assign designers to boutiques for events'}
                        </p>
                    </div>
                </div>

                {/* Selection Controls */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Card className="border-gray-200/50 bg-gradient-to-br from-gray-50/50 to-white/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-gray-900">
                                <Calendar className="h-5 w-5 text-blue-600" />
                                {t('admin.designerAssignments.selectEvent') ||
                                    'Select Event'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <EventSelector
                                selectedEventId={selectedEventId}
                                onEventChange={setSelectedEventId}
                            />
                        </CardContent>
                    </Card>

                    <Card className="border-gray-200/50 bg-gradient-to-br from-gray-50/50 to-white/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-gray-900">
                                <Building2 className="h-5 w-5 text-blue-600" />
                                {t('admin.designerAssignments.selectMall') ||
                                    'Select Mall'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <MallSelector
                                eventId={selectedEventId}
                                selectedMallId={selectedMallId}
                                onMallChange={setSelectedMallId}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Boutiques Grid */}
                {selectedEventId && selectedMallId && (
                    <Card className="border-gray-200/50 bg-gradient-to-br from-gray-50/50 to-white/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-gray-900">
                                <Users className="h-5 w-5 text-blue-600" />
                                {t(
                                    'admin.designerAssignments.boutiqueAssignments'
                                ) || 'Boutique Designer Assignments'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <BoutiqueGrid
                                eventId={selectedEventId}
                                mallId={selectedMallId}
                                boutiques={eventMallBoutiques?.boutiques || []}
                                assignments={(
                                    eventMallBoutiques?.assignments || []
                                ).map((assignment: any) => ({
                                    ...assignment,
                                    ydesign: Array.isArray(assignment.ydesign)
                                        ? assignment.ydesign[0]
                                        : assignment.ydesign,
                                }))}
                                isLoading={isLoadingBoutiques}
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Empty State */}
                {(!selectedEventId || !selectedMallId) && (
                    <Card className="border-gray-200/50 bg-gradient-to-br from-gray-50/50 to-white/50 backdrop-blur-sm">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                <Users className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold text-gray-900">
                                {t(
                                    'admin.designerAssignments.selectEventAndMall'
                                ) || 'Select Event and Mall'}
                            </h3>
                            <p className="text-gray-500">
                                {t(
                                    'admin.designerAssignments.chooseEventAndMall'
                                ) ||
                                    'Choose an event and mall to view and manage designer assignments for boutiques.'}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
            <Toaster />
        </>
    )
}
