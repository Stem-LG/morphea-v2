"use client";

import { useState } from "react";
import { ChevronDown, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useBoutiques } from "../_hooks/use-boutiques";
import { useDesigners } from "../_hooks/use-designers";
import { useLanguage } from "@/hooks/useLanguage";

interface DesignerAssignment {
    boutiqueId: number;
    designerId: number | null;
}

interface DesignerAssignmentProps {
    selectedMallIds: number[];
    selectedBoutiqueIds: number[];
    designerAssignments: DesignerAssignment[];
    onAssignmentChange: (assignments: DesignerAssignment[]) => void;
    disabled?: boolean;
}

export function DesignerAssignment({
    selectedMallIds,
    selectedBoutiqueIds,
    designerAssignments,
    onAssignmentChange,
    disabled
}: DesignerAssignmentProps) {
    const { data: boutiques = [] } = useBoutiques(selectedMallIds);
    const { data: designers = [], isLoading: isLoadingDesigners } = useDesigners();
    const { t } = useLanguage();

    const selectedBoutiques = boutiques.filter(boutique => 
        selectedBoutiqueIds.includes(boutique.yboutiqueid)
    );

    const handleDesignerAssignment = (boutiqueId: number, designerId: string | null) => {
        const newAssignments = designerAssignments.filter(a => a.boutiqueId !== boutiqueId);
        if (designerId) {
            newAssignments.push({
                boutiqueId,
                designerId: parseInt(designerId)
            });
        }
        onAssignmentChange(newAssignments);
    };

    const getAssignedDesigner = (boutiqueId: number) => {
        return designerAssignments.find(a => a.boutiqueId === boutiqueId)?.designerId || null;
    };

    const getDesignerById = (designerId: number) => {
        return designers.find(d => d.ydesignid === designerId);
    };

    // Group boutiques by mall for better organization
    const boutiquesByMall = selectedBoutiques.reduce((acc, boutique) => {
        const mallName = boutique.ymall?.ymallintitule || 'Unknown Mall';
        if (!acc[mallName]) {
            acc[mallName] = [];
        }
        acc[mallName].push(boutique);
        return acc;
    }, {} as Record<string, typeof selectedBoutiques>);

    const assignedCount = designerAssignments.filter(a => a.designerId !== null).length;
    const totalBoutiques = selectedBoutiqueIds.length;

    if (selectedBoutiqueIds.length === 0) {
        return (
            <Card className="bg-gray-800/30 border-gray-600">
                <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center text-gray-400">
                        <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>{t('admin.events.designers.selectBoutiquesFirst')}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-gray-800/30 border-gray-600">
            <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <User className="h-5 w-5 text-morpheus-gold-light" />
                        {t('admin.events.designers.assignDesigners')}
                    </span>
                    <Badge 
                        variant="secondary" 
                        className={`${
                            assignedCount === totalBoutiques 
                                ? 'bg-green-600/20 text-green-300 border-green-600/30' 
                                : 'bg-yellow-600/20 text-yellow-300 border-yellow-600/30'
                        }`}
                    >
                        {assignedCount}/{totalBoutiques} {t('admin.events.designers.designersAssigned')}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-80">
                    <div className="space-y-4">
                        {Object.entries(boutiquesByMall).map(([mallName, mallBoutiques]) => (
                            <div key={mallName} className="space-y-3">
                                <Label className="text-sm font-semibold text-morpheus-gold-light uppercase tracking-wide">
                                    {mallName}
                                </Label>
                                <div className="space-y-3 pl-2">
                                    {mallBoutiques.map((boutique) => {
                                        const assignedDesignerId = getAssignedDesigner(boutique.yboutiqueid);
                                        const assignedDesigner = assignedDesignerId ? getDesignerById(assignedDesignerId) : null;

                                        return (
                                            <div
                                                key={boutique.yboutiqueid}
                                                className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-gray-600/50"
                                            >
                                                <div className="flex-1 min-w-0 mr-3">
                                                    <Label className="text-sm font-medium text-white">
                                                        {boutique.yboutiqueintitule || `Boutique ${boutique.yboutiquecode}`}
                                                    </Label>
                                                    <p className="text-xs text-gray-400 truncate">
                                                        {boutique.yboutiqueadressemall}
                                                    </p>
                                                </div>
                                                <div className="w-48 min-w-48">
                                                    <Select
                                                        value={assignedDesignerId?.toString() || "none"}
                                                        onValueChange={(value) =>
                                                            handleDesignerAssignment(
                                                                boutique.yboutiqueid,
                                                                value === "none" ? null : value
                                                            )
                                                        }
                                                        disabled={disabled || isLoadingDesigners}
                                                    >
                                                        <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white w-full">
                                                            <SelectValue placeholder={t('admin.events.designers.selectDesigner')}>
                                                                {assignedDesignerId && assignedDesignerId !== null ? (
                                                                    <div className="flex flex-col text-left">
                                                                        <span className="font-medium truncate">
                                                                            {getDesignerById(assignedDesignerId)?.ydesignnom || "Unknown Designer"}
                                                                        </span>
                                                                        <span className="text-xs text-gray-400 truncate">
                                                                            {getDesignerById(assignedDesignerId)?.ydesignmarque} • {getDesignerById(assignedDesignerId)?.ydesignspecialite}
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    t('admin.events.designers.selectDesigner')
                                                                )}
                                                            </SelectValue>
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-gray-800 border-gray-600 w-[300px]">
                                                            <SelectItem value="none" className="text-gray-400">
                                                                {t('admin.events.designers.noDesignersAvailable')}
                                                            </SelectItem>
                                                            {designers.map((designer) => (
                                                                <SelectItem
                                                                    key={designer.ydesignid}
                                                                    value={designer.ydesignid.toString()}
                                                                    className="text-white"
                                                                >
                                                                    <div className="flex flex-col">
                                                                        <span className="font-medium">{designer.ydesignnom}</span>
                                                                        <span className="text-xs text-gray-400">
                                                                            {designer.ydesignmarque} • {designer.ydesignspecialite}
                                                                        </span>
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}