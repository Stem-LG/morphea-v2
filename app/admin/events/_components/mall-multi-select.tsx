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
import { useMalls } from "../_hooks/use-malls";
import { useLanguage } from "@/hooks/useLanguage";

interface MallMultiSelectProps {
    selectedMallIds: number[];
    onSelectionChange: (mallIds: number[]) => void;
    disabled?: boolean;
}

export function MallMultiSelect({ selectedMallIds, onSelectionChange, disabled }: MallMultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { data: malls = [], isLoading } = useMalls();
    const { t } = useLanguage();

    const selectedMalls = malls.filter((mall) => selectedMallIds.includes(mall.ymallid));

    const handleMallToggle = (mallId: number) => {
        const newSelection = selectedMallIds.includes(mallId)
            ? selectedMallIds.filter((id) => id !== mallId)
            : [...selectedMallIds, mallId];
        onSelectionChange(newSelection);
    };

    const handleRemoveMall = (mallId: number) => {
        onSelectionChange(selectedMallIds.filter((id) => id !== mallId));
    };

    const clearAll = () => {
        onSelectionChange([]);
    };

    return (
        <div className="space-y-2">
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={isOpen}
                        className="w-full justify-between bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700/50"
                        disabled={disabled || isLoading}
                    >
                        <span className="truncate">
                            {selectedMalls.length === 0
                                ? t("admin.events.malls.searchMalls")
                                : `${selectedMalls.length} ${t("admin.events.malls.mallsSelected")}`}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0 bg-gray-800 border-gray-600" align="start">
                    <Card className="border-0 bg-transparent">
                        <CardContent className="p-0">
                            <div className="flex items-center justify-between p-3 border-b border-gray-600">
                                <Label className="text-sm font-medium text-gray-300">
                                    {t("admin.events.malls.selectMalls")}
                                </Label>
                                {selectedMallIds.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearAll}
                                        className="h-auto p-1 text-xs text-red-400 hover:text-red-300"
                                    >
                                        {t("admin.events.malls.clearAll")}
                                    </Button>
                                )}
                            </div>
                            <ScrollArea className="h-60">
                                <div className="p-2 space-y-2">
                                    {isLoading ? (
                                        <div className="text-center py-4 text-gray-400">
                                            {t("admin.events.malls.loadingMalls")}
                                        </div>
                                    ) : malls.length === 0 ? (
                                        <div className="text-center py-4 text-gray-400">
                                            {t("admin.events.malls.noMallsFound")}
                                        </div>
                                    ) : (
                                        malls.map((mall) => (
                                            <div
                                                key={mall.ymallid}
                                                className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700/50 cursor-pointer"
                                                onClick={() => handleMallToggle(mall.ymallid)}
                                            >
                                                <Checkbox
                                                    id={`mall-${mall.ymallid}`}
                                                    checked={selectedMallIds.includes(mall.ymallid)}
                                                    onChange={() => handleMallToggle(mall.ymallid)}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <Label
                                                        htmlFor={`mall-${mall.ymallid}`}
                                                        className="text-sm font-medium text-white cursor-pointer"
                                                    >
                                                        {mall.ymallintitule}
                                                    </Label>
                                                    <p className="text-xs text-gray-400 truncate">
                                                        {mall.ymalllocalisation}
                                                    </p>
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

            {/* Selected malls display */}
            {selectedMalls.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedMalls.map((mall) => (
                        <Badge
                            key={mall.ymallid}
                            variant="secondary"
                            className="bg-morpheus-gold-dark/20 text-morpheus-gold-light border-morpheus-gold-dark/30"
                        >
                            {mall.ymallintitule}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="ml-1 h-auto p-0 text-morpheus-gold-light hover:text-white"
                                onClick={() => handleRemoveMall(mall.ymallid)}
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
