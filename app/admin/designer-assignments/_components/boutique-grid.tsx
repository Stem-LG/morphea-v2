"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Store, User, UserPlus, UserMinus, Lock, Mail } from "lucide-react";
import { DesignerSelectionDialog } from "./designer-selection-dialog";
import { DesignerInfoDialog } from "./designer-info-dialog";
import { useDesignerAssignment } from "../_hooks/use-designer-assignment";
import { useLanguage } from "@/hooks/useLanguage";
import { useState } from "react";

interface Boutique {
    yboutiqueid: number;
    yboutiquecode: string;
    yboutiqueintitule: string;
    yboutiqueadressemall: string;
}

interface Assignment {
    ydetailseventid: number;
    yboutiqueidfk: number;
    ydesignidfk: number;
    hasProducts: boolean;
    ydesign?: {
        ydesignid: number;
        ydesignnom: string;
        ydesignmarque: string;
        ydesignspecialite: string;
        ydesignpays: string;
        ydesigncontactpersonne: string;
        ydesigncontactemail: string;
        ydesigncontacttelephone: string;
        ydesigncouleur1codehexa?: string;
        ydesigncouleur1dsg?: string;
        ydesigncouleur2codehexa?: string;
        ydesigncouleur2dsg?: string;
        ydesigncouleur3codehexa?: string;
        ydesigncouleur3dsg?: string;
    };
}

interface BoutiqueGridProps {
    eventId: number;
    mallId: number;
    boutiques: Boutique[];
    assignments: Assignment[];
    isLoading?: boolean;
}

export function BoutiqueGrid({ eventId, mallId, boutiques, assignments, isLoading }: BoutiqueGridProps) {
    const { t } = useLanguage();
    const { unassignDesigner, isUnassigning } = useDesignerAssignment();
    const [unassigningBoutiqueId, setUnassigningBoutiqueId] = useState<number | null>(null);

    const getAssignmentForBoutique = (boutiqueId: number) => {
        return assignments.find(a => a.yboutiqueidfk === boutiqueId);
    };

    const handleUnassignDesigner = async (boutiqueId: number) => {
        const assignment = getAssignmentForBoutique(boutiqueId);
        if (!assignment || assignment.hasProducts) return;

        setUnassigningBoutiqueId(boutiqueId);
        try {
            await unassignDesigner.mutateAsync({
                eventId,
                mallId,
                boutiqueId
            });
        } catch (error) {
            console.error("Unassignment error:", error);
        } finally {
            setUnassigningBoutiqueId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="border-gray-200 bg-gray-50 animate-pulse">
                        <CardHeader>
                            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-10 bg-gray-300 rounded"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (boutiques.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Store className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('admin.designerAssignments.noBoutiquesFound')}</h3>
                <p className="text-gray-600">
                    {t('admin.designerAssignments.noBoutiquesMessage')}
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {boutiques.map((boutique) => {
                const assignment = getAssignmentForBoutique(boutique.yboutiqueid);
                const hasDesigner = !!assignment?.ydesignidfk;
                const isLocked = assignment?.hasProducts || false;

                return (
                    <Card
                        key={boutique.yboutiqueid}
                        className="border-gray-200 bg-gradient-to-br from-gray-50/50 to-white/50 shadow-xl hover:shadow-2xl transition-all duration-300"
                    >
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                                    <Store className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <CardTitle className="text-gray-900 text-lg truncate">
                                        {boutique.yboutiqueintitule || `Boutique ${boutique.yboutiquecode}`}
                                    </CardTitle>
                                    <p className="text-sm text-gray-600 truncate">
                                        {boutique.yboutiqueadressemall}
                                    </p>
                                </div>
                                {isLocked && (
                                    <div title={t('admin.designerAssignments.assignmentLocked')}>
                                        <Lock className="h-4 w-4 text-yellow-600" />
                                    </div>
                                )}
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {hasDesigner && assignment?.ydesign ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-green-100 text-green-800 border-green-200">
                                            <User className="h-3 w-3 mr-1" />
                                            {t('admin.designerAssignments.assigned')}
                                        </Badge>
                                        {isLocked && (
                                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                                <Lock className="h-3 w-3 mr-1" />
                                                {t('admin.designerAssignments.locked')}
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="bg-gray-100 rounded-lg p-3 space-y-2">
                                        <div className="font-medium text-gray-900">
                                            {assignment.ydesign.ydesignnom}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {assignment.ydesign.ydesignmarque} • {assignment.ydesign.ydesignspecialite}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <Mail className="h-3 w-3" />
                                            {assignment.ydesign.ydesigncontactemail}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {!isLocked && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleUnassignDesigner(boutique.yboutiqueid)}
                                                disabled={isUnassigning && unassigningBoutiqueId === boutique.yboutiqueid}
                                                className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                                            >
                                                <UserMinus className="h-4 w-4 mr-2" />
                                                {isUnassigning && unassigningBoutiqueId === boutique.yboutiqueid
                                                    ? t('admin.designerAssignments.unassigning')
                                                    : t('admin.designerAssignments.unassign')
                                                }
                                            </Button>
                                        )}

                                        {isLocked ? (
                                            <DesignerInfoDialog
                                                designer={assignment.ydesign}
                                                boutiqueName={boutique.yboutiqueintitule || boutique.yboutiquecode}
                                                isLocked={isLocked}
                                            >
                                                <Button
                                                    size="sm"
                                                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
                                                >
                                                    <User className="h-4 w-4 mr-2" />
                                                    {t('admin.designerAssignments.viewDesigner')}
                                                </Button>
                                            </DesignerInfoDialog>
                                        ) : (
                                            <DesignerSelectionDialog
                                                eventId={eventId}
                                                mallId={mallId}
                                                boutiqueId={boutique.yboutiqueid}
                                                boutiqueName={boutique.yboutiqueintitule || boutique.yboutiquecode}
                                            >
                                                <Button
                                                    size="sm"
                                                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
                                                >
                                                    <User className="h-4 w-4 mr-2" />
                                                    {t('admin.designerAssignments.changeDesigner')}
                                                </Button>
                                            </DesignerSelectionDialog>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <Badge className="bg-gray-100 text-gray-600 border-gray-200">
                                        <UserPlus className="h-3 w-3 mr-1" />
                                        {t('admin.designerAssignments.noDesignerAssigned')}
                                    </Badge>

                                    <DesignerSelectionDialog
                                        eventId={eventId}
                                        mallId={mallId}
                                        boutiqueId={boutique.yboutiqueid}
                                        boutiqueName={boutique.yboutiqueintitule || boutique.yboutiquecode}
                                    >
                                        <Button
                                            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
                                        >
                                            <UserPlus className="h-4 w-4 mr-2" />
                                            {t('admin.designerAssignments.assignDesigner')}
                                        </Button>
                                    </DesignerSelectionDialog>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}