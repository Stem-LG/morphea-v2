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
import { useMalls } from '../_hooks/use-malls'
import { useLanguage } from '@/hooks/useLanguage'

interface MallMultiSelectProps {
    selectedMallIds: number[]
    onSelectionChange: (mallIds: number[]) => void
    disabled?: boolean
}

export function MallMultiSelect({
    selectedMallIds,
    onSelectionChange,
    disabled,
}: MallMultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const { data: malls = [], isLoading } = useMalls()
    const { t } = useLanguage()

    const selectedMalls = malls.filter((mall) =>
        selectedMallIds.includes(mall.ymallid)
    )

    const handleMallToggle = (mallId: number) => {
        const newSelection = selectedMallIds.includes(mallId)
            ? selectedMallIds.filter((id) => id !== mallId)
            : [...selectedMallIds, mallId]
        onSelectionChange(newSelection)
    }

    const handleRemoveMall = (mallId: number) => {
        onSelectionChange(selectedMallIds.filter((id) => id !== mallId))
    }

    const clearAll = () => {
        onSelectionChange([])
    }

    return (
        <div className="space-y-2">
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={isOpen}
                        className="w-full justify-between border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
                        disabled={disabled || isLoading}
                    >
                        <span className="truncate">
                            {selectedMalls.length === 0
                                ? t('admin.events.malls.searchMalls')
                                : `${selectedMalls.length} ${t('admin.events.malls.mallsSelected')}`}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-[400px] border-gray-200 bg-white p-0 shadow-xl"
                    align="start"
                >
                    <Card className="border-0 bg-transparent">
                        <CardContent className="p-0">
                            <div className="flex items-center justify-between border-b border-gray-200 p-3">
                                <Label className="text-sm font-medium text-gray-700">
                                    {t('admin.events.malls.selectMalls')}
                                </Label>
                                {selectedMallIds.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearAll}
                                        className="h-auto p-1 text-xs text-red-600 hover:text-red-700"
                                    >
                                        {t('admin.events.malls.clearAll')}
                                    </Button>
                                )}
                            </div>
                            <ScrollArea className="h-60">
                                <div className="space-y-2 p-2">
                                    {isLoading ? (
                                        <div className="py-4 text-center text-gray-600">
                                            {t(
                                                'admin.events.malls.loadingMalls'
                                            )}
                                        </div>
                                    ) : malls.length === 0 ? (
                                        <div className="py-4 text-center text-gray-600">
                                            {t(
                                                'admin.events.malls.noMallsFound'
                                            )}
                                        </div>
                                    ) : (
                                        malls.map((mall) => (
                                            <div
                                                key={mall.ymallid}
                                                className="flex cursor-pointer items-center space-x-2 rounded p-2 hover:bg-gray-100"
                                                onClick={() =>
                                                    handleMallToggle(
                                                        mall.ymallid
                                                    )
                                                }
                                            >
                                                <Checkbox
                                                    id={`mall-${mall.ymallid}`}
                                                    checked={selectedMallIds.includes(
                                                        mall.ymallid
                                                    )}
                                                    onChange={() =>
                                                        handleMallToggle(
                                                            mall.ymallid
                                                        )
                                                    }
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <Label
                                                        htmlFor={`mall-${mall.ymallid}`}
                                                        className="cursor-pointer text-sm font-medium text-gray-900"
                                                    >
                                                        {mall.ymallintitule}
                                                    </Label>
                                                    <p className="truncate text-xs text-gray-600">
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
                            className="bg-blue-100 text-blue-700 border-blue-200"
                        >
                            {mall.ymallintitule}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-700 ml-1 h-auto p-0 hover:text-gray-700"
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
    )
}
