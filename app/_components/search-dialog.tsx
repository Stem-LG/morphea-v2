'use client'

import { useState, useEffect } from 'react'
import { useProductSearch } from '@/app/_hooks/use-product-search'
import { useLanguage } from '@/hooks/useLanguage'
import { useCurrency } from '@/hooks/useCurrency'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { SearchIcon, Package, X } from 'lucide-react'
import Image from 'next/image'

interface SearchDialogProps {
    isOpen: boolean
    onClose: () => void
    onProductSelect: (product: any) => void
}

export function SearchDialog({
    isOpen,
    onClose,
    onProductSelect,
}: SearchDialogProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const { t } = useLanguage()
    const { formatPrice, currencies } = useCurrency()

    const { data: searchResults = [], isLoading } = useProductSearch({
        query: searchQuery,
        limit: 5,
        enabled: isOpen && searchQuery.length >= 2,
    })

    // Reset search when dialog closes
    useEffect(() => {
        if (!isOpen) {
            setSearchQuery('')
        }
    }, [isOpen])

    const handleProductSelect = (product: any) => {
        onProductSelect(product)
        onClose()
        setSearchQuery('')
    }

    const getProductImage = (product: any) => {
        const firstVariant = product.yvarprod?.[0]
        const firstMedia = firstVariant?.yvarprodmedia?.[0]
        return firstMedia?.ymedia?.ymediaurl || null
    }

    const getProductPrice = (product: any) => {
        const firstVariant = product.yvarprod?.[0]
        if (!firstVariant) return null

        const currentPrice =
            firstVariant.yvarprodprixpromotion ||
            firstVariant.yvarprodprixcatalogue
        const originalPrice = firstVariant.yvarprodprixpromotion
            ? firstVariant.yvarprodprixcatalogue
            : null
        const hasDiscount = !!firstVariant.yvarprodprixpromotion

        // Find the product's currency
        const productCurrency = currencies.find(
            (c) => c.xdeviseid === firstVariant.xdeviseidfk
        )

        return {
            current: formatPrice(currentPrice, productCurrency),
            original: originalPrice
                ? formatPrice(originalPrice, productCurrency)
                : null,
            hasDiscount,
        }
    }

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent
                side="right"
                className="z-[90] w-[400px] bg-white p-0 sm:w-[540px]"
            >
                {/* Header */}
                <div className="flex-shrink-0">
                    <div className="flex items-center justify-center py-4 text-3xl">
                        <h1 className="font-recia font-medium">
                            {t('shop.search')}
                        </h1>
                    </div>
                    <Separator />
                </div>

                {/* Close button - positioned relative to the entire sheet */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-5 right-7 z-10 h-8 w-8"
                    onClick={onClose}
                >
                    <X className="h-4 w-4" />
                </Button>

                {/* Content */}
                <ScrollArea className="flex-1 overflow-hidden">
                    <div className="flex flex-col px-6">
                        {/* Search Input */}
                        <div className="py-6">
                            <div className="relative">
                                <SearchIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                <Input
                                    placeholder={t('shop.searchPlaceholder')}
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="h-12 pl-10"
                                />
                            </div>
                        </div>

                        {/* Results */}
                        <div className="pb-6">
                            {searchQuery.length < 2 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <SearchIcon className="mb-4 h-12 w-12 text-gray-400" />
                                    <p className="text-sm text-gray-500">
                                        {t('shop.minCharacters')}
                                    </p>
                                </div>
                            ) : isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="border-morpheus-blue-dark h-8 w-8 animate-spin rounded-full border-b-2"></div>
                                </div>
                            ) : searchResults.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <Package className="mb-4 h-12 w-12 text-gray-400" />
                                    <p className="text-sm text-gray-500">
                                        {t('shop.noProductsFoundFor')} "
                                        {searchQuery}"
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <h3 className="mb-3 text-sm font-medium text-gray-900">
                                        {t('shop.products')}
                                    </h3>
                                    {searchResults.map((product) => {
                                        const image = getProductImage(product)
                                        const pricing = getProductPrice(product)

                                        return (
                                            <div
                                                key={product.yprodid}
                                                onClick={() =>
                                                    handleProductSelect(product)
                                                }
                                                className="flex cursor-pointer items-center gap-4 rounded-lg p-4 transition-colors hover:bg-gray-50"
                                            >
                                                {/* Product Image */}
                                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                                    {image ? (
                                                        <Image
                                                            src={image}
                                                            alt={
                                                                product.yprodintitule
                                                            }
                                                            width={64}
                                                            height={64}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center">
                                                            <Package className="h-6 w-6 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Product Info */}
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="truncate font-medium text-gray-900">
                                                        {product.yprodintitule}
                                                    </h3>
                                                    {product.ydesign && (
                                                        <p className="truncate text-sm text-gray-500">
                                                            {
                                                                product.ydesign
                                                                    .ydesignmarque
                                                            }
                                                        </p>
                                                    )}
                                                    {pricing && (
                                                        <div className="mt-1 flex items-center gap-2">
                                                            <span className="text-morpheus-blue-dark text-sm font-medium">
                                                                {
                                                                    pricing.current
                                                                }
                                                            </span>
                                                            {pricing.hasDiscount &&
                                                                pricing.original && (
                                                                    <span className="text-xs text-gray-400 line-through">
                                                                        {
                                                                            pricing.original
                                                                        }
                                                                    </span>
                                                                )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Arrow indicator */}
                                                <div className="flex-shrink-0">
                                                    <svg
                                                        className="h-4 w-4 text-gray-400"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M9 5l7 7-7 7"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}
