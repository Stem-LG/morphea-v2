"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/useLanguage";
import { Users, Calendar, Building2 } from "lucide-react";
import { useState } from "react";
import { EventSelector } from "./_components/event-selector";
import { MallSelector } from "./_components/mall-selector";
import { BoutiqueGrid } from "./_components/boutique-grid";
import { useActiveEvent } from "./_hooks/use-active-event";
import { useEventMallBoutiques } from "./_hooks/use-event-mall-boutiques";
import { Toaster } from "./_components/toaster";

export default function DesignerAssignmentsPage() {
    const { t } = useLanguage();
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [selectedMallId, setSelectedMallId] = useState<number | null>(null);

    const { data: activeEvent } = useActiveEvent();
    const { data: eventMallBoutiques, isLoading: isLoadingBoutiques } = useEventMallBoutiques(
        selectedEventId || activeEvent?.yeventid || null,
        selectedMallId
    );

    // Set default event to active event when it loads
    if (activeEvent && !selectedEventId) {
        setSelectedEventId(activeEvent.yeventid);
    }

    return (
        <>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">{t('admin.designerAssignments.title') || "Designer Assignments"}</h1>
                        <p className="text-lg text-gray-300">{t('admin.designerAssignments.subtitle') || "Assign designers to boutiques for events"}</p>
                    </div>
                </div>

                {/* Selection Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-morpheus-gold-light" />
                                {t('admin.designerAssignments.selectEvent') || "Select Event"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <EventSelector
                                selectedEventId={selectedEventId}
                                onEventChange={setSelectedEventId}
                            />
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-morpheus-gold-light" />
                                {t('admin.designerAssignments.selectMall') || "Select Mall"}
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
                    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Users className="h-5 w-5 text-morpheus-gold-light" />
                                {t('admin.designerAssignments.boutiqueAssignments') || "Boutique Designer Assignments"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <BoutiqueGrid
                                eventId={selectedEventId}
                                mallId={selectedMallId}
                                boutiques={eventMallBoutiques?.boutiques || []}
                                assignments={(eventMallBoutiques?.assignments || []).map((assignment: any) => ({
                                    ...assignment,
                                    ydesign: Array.isArray(assignment.ydesign) ? assignment.ydesign[0] : assignment.ydesign
                                }))}
                                isLoading={isLoadingBoutiques}
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Empty State */}
                {(!selectedEventId || !selectedMallId) && (
                    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="h-16 w-16 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
                                <Users className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">{t('admin.designerAssignments.selectEventAndMall') || "Select Event and Mall"}</h3>
                            <p className="text-gray-400">
                                {t('admin.designerAssignments.chooseEventAndMall') || "Choose an event and mall to view and manage designer assignments for boutiques."}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
            <Toaster />
        </>
    );
}
