"use client";

import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useBoutiques } from "../_hooks/use-boutiques";
import { useLanguage } from "@/hooks/useLanguage";

interface BoutiqueMultiSelectProps {
    selectedMallIds: number[];
    selectedBoutiqueIds: number[];
    onSelectionChange: (boutiqueIds: number[]) => void;
    disabled?: boolean;
}

export function BoutiqueMultiSelect({
    selectedMallIds,
    selectedBoutiqueIds,
    onSelectionChange,
    disabled,
}: BoutiqueMultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { data: boutiques = [], isLoading } = useBoutiques(selectedMallIds);
    const { t } = useLanguage();

    const selectedBoutiques = boutiques.filter((boutique) => selectedBoutiqueIds.includes(boutique.yboutiqueid));

    const handleBoutiqueToggle = (boutiqueId: number) => {
        const newSelection = selectedBoutiqueIds.includes(boutiqueId)
            ? selectedBoutiqueIds.filter((id) => id !== boutiqueId)
            : [...selectedBoutiqueIds, boutiqueId];
        onSelectionChange(newSelection);
    };

    const handleRemoveBoutique = (boutiqueId: number) => {
        onSelectionChange(selectedBoutiqueIds.filter((id) => id !== boutiqueId));
    };

    const clearAll = () => {
        onSelectionChange([]);
    };

    // Group boutiques by mall
    const boutiquesByMall = boutiques.reduce((acc, boutique) => {
        const mallName = (boutique.ymall as any)?.ymallintitule || "Unknown Mall";
        if (!acc[mallName]) {
            acc[mallName] = [];
        }
        acc[mallName].push(boutique);
        return acc;
    }, {} as Record<string, typeof boutiques>);

    const isDisabled = disabled || selectedMallIds.length === 0;

    return (
        <div className="space-y-2">
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={isOpen}
                        className="w-full justify-between bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700/50"
                        disabled={isDisabled || isLoading}
                    >
                        <span className="truncate">
                            {selectedMallIds.length === 0
                                ? t("admin.events.boutiques.selectMallsFirst")
                                : selectedBoutiques.length === 0
                                ? t("admin.events.boutiques.searchBoutiques")
                                : `${selectedBoutiques.length} ${t("admin.events.boutiques.boutiquesSelected")}`}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[450px] p-0 bg-gray-800 border-gray-600" align="start">
                    <Card className="border-0 bg-transparent">
                        <CardContent className="p-0">
                            <div className="flex items-center justify-between p-3 border-b border-gray-600">
                                <Label className="text-sm font-medium text-gray-300">
                                    {t("admin.events.boutiques.selectBoutiques")}
                                </Label>
                                {selectedBoutiqueIds.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearAll}
                                        className="h-auto p-1 text-xs text-red-400 hover:text-red-300"
                                    >
                                        {t("admin.events.boutiques.clearAll")}
                                    </Button>
                                )}
                            </div>
                            <ScrollArea className="h-60">
                                <div className="p-2 space-y-3">
                                    {isLoading ? (
                                        <div className="text-center py-4 text-gray-400">
                                            {t("admin.events.boutiques.loadingBoutiques")}
                                        </div>
                                    ) : boutiques.length === 0 ? (
                                        <div className="text-center py-4 text-gray-400">
                                            {selectedMallIds.length === 0
                                                ? t("admin.events.boutiques.selectMallsFirst")
                                                : t("admin.events.boutiques.noBoutiquesFound")}
                                        </div>
                                    ) : (
                                        Object.entries(boutiquesByMall).map(([mallName, mallBoutiques]) => (
                                            <div key={mallName} className="space-y-2">
                                                <Label className="text-xs font-semibold text-morpheus-gold-light uppercase tracking-wide">
                                                    {mallName}
                                                </Label>
                                                <div className="space-y-1 pl-2">
                                                    {mallBoutiques.map((boutique) => (
                                                        <div
                                                            key={boutique.yboutiqueid}
                                                            className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700/50 cursor-pointer"
                                                            onClick={() => handleBoutiqueToggle(boutique.yboutiqueid)}
                                                        >
                                                            <Checkbox
                                                                id={`boutique-${boutique.yboutiqueid}`}
                                                                checked={selectedBoutiqueIds.includes(
                                                                    boutique.yboutiqueid
                                                                )}
                                                                onChange={() =>
                                                                    handleBoutiqueToggle(boutique.yboutiqueid)
                                                                }
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <Label
                                                                    htmlFor={`boutique-${boutique.yboutiqueid}`}
                                                                    className="text-sm font-medium text-white cursor-pointer"
                                                                >
                                                                    {boutique.yboutiqueintitule ||
                                                                        `Boutique ${boutique.yboutiquecode}`}
                                                                </Label>
                                                                <p className="text-xs text-gray-400 truncate">
                                                                    {boutique.yboutiqueadressemall}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </PopoverContent>
            </Popover>

            {/* Selected boutiques display */}
            {selectedBoutiques.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedBoutiques.map((boutique) => (
                        <Badge
                            key={boutique.yboutiqueid}
                            variant="secondary"
                            className="bg-blue-600/20 text-blue-300 border-blue-600/30"
                        >
                            {boutique.yboutiqueintitule || `Boutique ${boutique.yboutiquecode}`}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="ml-1 h-auto p-0 text-blue-300 hover:text-white"
                                onClick={() => handleRemoveBoutique(boutique.yboutiqueid)}
                                disabled={disabled}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
}
