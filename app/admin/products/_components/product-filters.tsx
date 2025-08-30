"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { SuperSelect } from "@/components/super-select";
import type { ProductFilters } from "../_hooks/use-product-filters";
import { useFilterOptions } from "../_hooks/use-filter-options";

interface ProductFiltersComponentProps {
    filters: ProductFilters;
    onFiltersChange: (filters: Partial<ProductFilters>) => void;
    onReset?: () => void;
}

export function ProductFilters({ filters, onFiltersChange, onReset }: ProductFiltersComponentProps) {
    const { t } = useLanguage();
    const {
        events,
        malls,
        boutiques,
        categories,
    } = useFilterOptions();

    return (
        <div className="flex  items-center gap-4">

            {/* Event Filter */}
            <div className="min-w-[180px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.event') || 'Event'}
                </label>
                <SuperSelect
                    options={[
                        { value: '', label: t('admin.allEvents') || 'All Events' },
                        ...events.map(event => ({
                            value: event.yeventid.toString(),
                            label: event.yeventintitule
                        }))
                    ]}
                    value={filters.event || ''}
                    onValueChange={(value) => onFiltersChange({ event: value === "" ? null : (value as string) })}
                    placeholder={t('admin.selectEvent') || 'Select Event'}
                />
            </div>

            {/* Mall Filter */}
            <div className="min-w-[180px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.mall') || 'Mall'}
                </label>
                <SuperSelect
                    options={[
                        { value: '', label: t('admin.allMalls') || 'All Malls' },
                        ...malls.map(mall => ({
                            value: mall.ymallid.toString(),
                            label: mall.ymallintitule
                        }))
                    ]}
                    value={filters.mall || ''}
                    onValueChange={(value) => onFiltersChange({ mall: value === "" ? null : (value as string) })}
                    placeholder={t('admin.selectMall') || 'Select Mall'}
                />
            </div>

            {/* Boutique Filter */}
            <div className="min-w-[180px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.boutique') || 'Boutique'}
                </label>
                <SuperSelect
                    options={[
                        { value: '', label: t('admin.allBoutiques') || 'All Boutiques' },
                        ...boutiques.map(boutique => ({
                            value: boutique.yboutiqueid.toString(),
                            label: boutique.yboutiqueintitule || 'Unnamed Boutique'
                        }))
                    ]}
                    value={filters.boutique || ''}
                    onValueChange={(value) => onFiltersChange({ boutique: value === "" ? null : (value as string) })}
                    placeholder={t('admin.selectBoutique') || 'Select Boutique'}
                />
            </div>

            {/* Category Filter */}
            <div className="min-w-[180px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.category') || 'Category'}
                </label>
                <SuperSelect
                    options={[
                        { value: '', label: t('admin.allCategories') || 'All Categories' },
                        ...categories.map(category => ({
                            value: category.xcategprodid.toString(),
                            label: category.xcategprodintitule
                        }))
                    ]}
                    value={filters.category || ''}
                    onValueChange={(value) => onFiltersChange({ category: value === "" ? null : (value as string) })}
                    placeholder={t('admin.selectCategory') || 'Select Category'}
                />
            </div>

            {/* Visibility Filter */}
            <div className="min-w-[180px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.visibility') || 'Visibilité'}
                </label>
                <SuperSelect
                    options={[
                        { value: '', label: t('admin.allVisibility') || 'Toute Visibilité' },
                        { value: 'true', label: t('admin.visible') || 'Visible' },
                        { value: 'false', label: t('admin.invisible') || 'Invisible' }
                    ]}
                    value={filters.visibility || ''}
                    onValueChange={(value) => onFiltersChange({ visibility: value === "" ? null : (value as string) })}
                    placeholder={t('admin.selectVisibility') || 'Sélectionner la Visibilité'}
                />
            </div>

            {/* Reset Button - Only show if onReset is provided */}
            {onReset && (
                <div className="flex items-end">
                    <Button
                        variant="outline"
                        onClick={onReset}
                        className="border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-50 h-10"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        {t('admin.resetFilters') || 'Reset'}
                    </Button>
                </div>
            )}
        </div>
    );
}