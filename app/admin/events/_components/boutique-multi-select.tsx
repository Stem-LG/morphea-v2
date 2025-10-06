'use client'

import { useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { useBoutiques } from '../_hooks/use-boutiques'
import { useLanguage } from '@/hooks/useLanguage'

interface BoutiqueMultiSelectProps {
    selectedMallIds: number[]
    selectedBoutiqueIds: number[]
    onSelectionChange: (boutiqueIds: number[]) => void
    disabled?: boolean
}

export function BoutiqueMultiSelect({
    selectedMallIds,
    selectedBoutiqueIds,
    onSelectionChange,
    disabled,
}: BoutiqueMultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const { data: boutiques = [], isLoading } = useBoutiques(selectedMallIds)
    const { t } = useLanguage()

    const selectedBoutiques = boutiques.filter((boutique) =>
        selectedBoutiqueIds.includes(boutique.yboutiqueid)
    )

    const handleBoutiqueToggle = (boutiqueId: number) => {
        const newSelection = selectedBoutiqueIds.includes(boutiqueId)
            ? selectedBoutiqueIds.filter((id) => id !== boutiqueId)
            : [...selectedBoutiqueIds, boutiqueId]
        onSelectionChange(newSelection)
    }

    const handleRemoveBoutique = (boutiqueId: number) => {
        onSelectionChange(selectedBoutiqueIds.filter((id) => id !== boutiqueId))
    }

    const clearAll = () => {
        onSelectionChange([])
    }

    // Group boutiques by mall
    const boutiquesByMall = boutiques.reduce(
        (acc, boutique) => {
            const mallName =
                (boutique.ymall as any)?.ymallintitule || 'Unknown Mall'
            if (!acc[mallName]) {
                acc[mallName] = []
            }
            acc[mallName].push(boutique)
            return acc
        },
        {} as Record<string, typeof boutiques>
    )

    const isDisabled = disabled || selectedMallIds.length === 0

    return (
        <div className="space-y-2">
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={isOpen}
                        className="w-full justify-between border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
                        disabled={isDisabled || isLoading}
                    >
                        <span className="truncate">
                            {selectedMallIds.length === 0
                                ? t('admin.events.boutiques.selectMallsFirst')
                                : selectedBoutiques.length === 0
                                  ? t('admin.events.boutiques.searchBoutiques')
                                  : `${selectedBoutiques.length} ${t('admin.events.boutiques.boutiquesSelected')}`}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-[450px] border-gray-200 bg-white p-0 shadow-xl"
                    align="start"
                >
                    <Card className="border-0 bg-transparent">
                        <CardContent className="p-0">
                            <div className="flex items-center justify-between border-b border-gray-200 p-3">
                                <Label className="text-sm font-medium text-gray-700">
                                    {t(
                                        'admin.events.boutiques.selectBoutiques'
                                    )}
                                </Label>
                                {selectedBoutiqueIds.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearAll}
                                        className="h-auto p-1 text-xs text-red-600 hover:text-red-700"
                                    >
                                        {t('admin.events.boutiques.clearAll')}
                                    </Button>
                                )}
                            </div>
                            <div className="h-60 space-y-3 p-2 overflow-y-scroll">
                                    {isLoading ? (
                                        <div className="py-4 text-center text-gray-600">
                                            {t(
                                                'admin.events.boutiques.loadingBoutiques'
                                            )}
                                        </div>
                                    ) : boutiques.length === 0 ? (
                                        <div className="py-4 text-center text-gray-600">
                                            {selectedMallIds.length === 0
                                                ? t(
                                                      'admin.events.boutiques.selectMallsFirst'
                                                  )
                                                : t(
                                                      'admin.events.boutiques.noBoutiquesFound'
                                                  )}
                                        </div>
                                    ) : (
                                        Object.entries(boutiquesByMall).map(
                                            ([mallName, mallBoutiques]) => (
                                                <div
                                                    key={mallName}
                                                    className="space-y-2"
                                                >
                                                    <Label className="text-blue-600 text-xs font-semibold tracking-wide uppercase">
                                                        {mallName}
                                                    </Label>
                                                    <div className="space-y-1 pl-2">
                                                        {mallBoutiques.map(
                                                            (boutique) => (
                                                                <div
                                                                    key={
                                                                        boutique.yboutiqueid
                                                                    }
                                                                    className="flex cursor-pointer items-center space-x-2 rounded p-2 hover:bg-gray-100"
                                                                    onClick={() =>
                                                                        handleBoutiqueToggle(
                                                                            boutique.yboutiqueid
                                                                        )
                                                                    }
                                                                >
                                                                    <Checkbox
                                                                        id={`boutique-${boutique.yboutiqueid}`}
                                                                        checked={selectedBoutiqueIds.includes(
                                                                            boutique.yboutiqueid
                                                                        )}
                                                                        onChange={() =>
                                                                            handleBoutiqueToggle(
                                                                                boutique.yboutiqueid
                                                                            )
                                                                        }
                                                                    />
                                                                    <div className="min-w-0 flex-1">
                                                                        <Label
                                                                            htmlFor={`boutique-${boutique.yboutiqueid}`}
                                                                            className="cursor-pointer text-sm font-medium text-gray-900"
                                                                        >
                                                                            {boutique.yboutiqueintitule ||
                                                                                `Boutique ${boutique.yboutiquecode}`}
                                                                        </Label>
                                                                        <p className="truncate text-xs text-gray-600">
                                                                            {
                                                                                boutique.yboutiqueadressemall
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        )
                                    )}
                            </div>
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
                            className="border-blue-300 bg-blue-100 text-blue-700"
                        >
                            {boutique.yboutiqueintitule ||
                                `Boutique ${boutique.yboutiquecode}`}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="ml-1 h-auto p-0 text-blue-700 hover:text-gray-700"
                                onClick={() =>
                                    handleRemoveBoutique(boutique.yboutiqueid)
                                }
                                disabled={disabled}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    )
}
