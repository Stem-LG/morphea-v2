'use client'

import { Suspense, useState, useCallback, useEffect, useMemo } from 'react'
import { X, ChevronDown } from 'lucide-react'
import { useQueryStates, parseAsInteger, parseAsString } from 'nuqs'
import { useLanguage } from '@/hooks/useLanguage'
import { useCurrency } from '@/hooks/useCurrency'
import { useShopProductsInfinite } from './_hooks/use-shop-products'
import {
    useShopBoutiques,
    useShopCategories,
    useShopColors,
    useShopSizes,
    useShopPriceRange,
} from './_hooks/use-shop-filters'
import { ProductCard } from './_components/product-card'
import { ProductDetailsPage } from '@/app/main/_components/product-details-page'
import { cn } from '@/lib/utils'
import Footer from '@/components/footer'
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetTitle,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { CurrencySelector } from '@/app/_components/currency-selector'
import { LoadingAnimation } from '../_components/loading'

// Custom SVG Components
const ThreeColumnIcon = ({
    className,
    isActive,
}: {
    className?: string
    isActive?: boolean
}) => (
    <svg
        width="37"
        height="31"
        viewBox="0 0 37 31"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <defs>
            <linearGradient
                id="three-column-gradient"
                x1="0"
                y1="0"
                x2="37"
                y2="31"
                gradientUnits="userSpaceOnUse"
            >
                <stop offset="0%" stopColor="#B27C64" />
                <stop offset="50%" stopColor="#E8D07A" />
                <stop offset="100%" stopColor="#B27C64" />
            </linearGradient>
        </defs>
        <rect
            x="24.829"
            y="10.4019"
            width="12.1711"
            height="10.1982"
            rx="2"
            fill={isActive ? 'url(#three-column-gradient)' : '#D9D9D9'}
        />
        <rect
            x="24.829"
            y="10.4019"
            width="12.1711"
            height="10.1982"
            rx="2"
            fill={isActive ? 'url(#three-column-gradient)' : '#D9D9D9'}
        />
        <rect
            x="12.4144"
            y="10.4019"
            width="12.1711"
            height="10.1982"
            rx="2"
            fill={isActive ? 'url(#three-column-gradient)' : '#D9D9D9'}
        />
        <rect
            width="12.1711"
            height="10.1982"
            rx="2"
            fill={isActive ? 'url(#three-column-gradient)' : '#D9D9D9'}
        />
        <rect
            y="10.4014"
            width="12.1711"
            height="10.1982"
            rx="2"
            fill={isActive ? 'url(#three-column-gradient)' : '#D9D9D9'}
        />
        <rect
            y="20.8027"
            width="12.1711"
            height="10.1982"
            rx="2"
            fill={isActive ? 'url(#three-column-gradient)' : '#D9D9D9'}
        />
        <rect
            x="24.829"
            y="20.8027"
            width="12.1711"
            height="10.1982"
            rx="2"
            fill={isActive ? 'url(#three-column-gradient)' : '#D9D9D9'}
        />
        <rect
            x="12.4144"
            y="20.8027"
            width="12.1711"
            height="10.1982"
            rx="2"
            fill={isActive ? 'url(#three-column-gradient)' : '#D9D9D9'}
        />
        <rect
            x="12.4144"
            width="12.1711"
            height="10.1982"
            rx="2"
            fill={isActive ? 'url(#three-column-gradient)' : '#D9D9D9'}
        />
        <rect
            x="24.829"
            width="12.1711"
            height="10.1982"
            rx="2"
            fill={isActive ? 'url(#three-column-gradient)' : '#D9D9D9'}
        />
    </svg>
)

const FourColumnIcon = ({
    className,
    isActive,
}: {
    className?: string
    isActive?: boolean
}) => (
    <svg
        width="50"
        height="31"
        viewBox="0 0 50 31"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <defs>
            <linearGradient
                id="four-column-gradient"
                x1="0"
                y1="0"
                x2="50"
                y2="31"
                gradientUnits="userSpaceOnUse"
            >
                <stop offset="0%" stopColor="#B27C64" />
                <stop offset="50%" stopColor="#E8D07A" />
                <stop offset="100%" stopColor="#B27C64" />
            </linearGradient>
        </defs>
        <rect
            x="12.5172"
            y="10.4019"
            width="12.2718"
            height="10.1974"
            rx="2"
            fill={isActive ? 'url(#four-column-gradient)' : '#D9D9D9'}
        />
        <rect
            width="12.2718"
            height="10.1974"
            rx="2"
            fill={isActive ? 'url(#four-column-gradient)' : '#D9D9D9'}
        />
        <rect
            y="10.4014"
            width="12.2718"
            height="10.1974"
            rx="2"
            fill={isActive ? 'url(#four-column-gradient)' : '#D9D9D9'}
        />
        <rect
            y="20.8027"
            width="12.2718"
            height="10.1974"
            rx="2"
            fill={isActive ? 'url(#four-column-gradient)' : '#D9D9D9'}
        />
        <rect
            x="12.5172"
            y="20.8027"
            width="12.2718"
            height="10.1974"
            rx="2"
            fill={isActive ? 'url(#four-column-gradient)' : '#D9D9D9'}
        />
        <rect
            x="12.5172"
            width="12.2718"
            height="10.1974"
            rx="2"
            fill={isActive ? 'url(#four-column-gradient)' : '#D9D9D9'}
        />
        <rect
            x="25.0344"
            y="10.4019"
            width="12.2718"
            height="10.1974"
            rx="2"
            fill={isActive ? 'url(#four-column-gradient)' : '#D9D9D9'}
        />
        <rect
            x="25.0344"
            y="10.4019"
            width="12.2718"
            height="10.1974"
            rx="2"
            fill={isActive ? 'url(#four-column-gradient)' : '#D9D9D9'}
        />
        <rect
            x="25.0344"
            y="20.8027"
            width="12.2718"
            height="10.1974"
            rx="2"
            fill={isActive ? 'url(#four-column-gradient)' : '#D9D9D9'}
        />
        <rect
            x="25.0344"
            width="12.2718"
            height="10.1974"
            rx="2"
            fill={isActive ? 'url(#four-column-gradient)' : '#D9D9D9'}
        />
        <rect
            x="37.5518"
            y="10.4019"
            width="12.2718"
            height="10.1974"
            rx="2"
            fill={isActive ? 'url(#four-column-gradient)' : '#D9D9D9'}
        />
        <rect
            x="37.5518"
            y="10.4019"
            width="12.2718"
            height="10.1974"
            rx="2"
            fill={isActive ? 'url(#four-column-gradient)' : '#D9D9D9'}
        />
        <rect
            x="37.5518"
            y="20.8027"
            width="12.2718"
            height="10.1974"
            rx="2"
            fill={isActive ? 'url(#four-column-gradient)' : '#D9D9D9'}
        />
        <rect
            x="37.5518"
            width="12.2718"
            height="10.1974"
            rx="2"
            fill={isActive ? 'url(#four-column-gradient)' : '#D9D9D9'}
        />
    </svg>
)

// Filter and Sort Icons
const FilterIcon = ({ className }: { className?: string }) => (
    <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <path
            d="M14 8.1665L23.3333 8.1665"
            stroke="currentColor"
            strokeLinecap="round"
        />
        <path
            d="M4.66663 8.1665L9.33329 8.1665"
            stroke="currentColor"
            strokeLinecap="round"
        />
        <path
            d="M19.8333 19.8335L23.3333 19.8335"
            stroke="currentColor"
            strokeLinecap="round"
        />
        <path
            d="M4.66663 19.8335L14 19.8335"
            stroke="currentColor"
            strokeLinecap="round"
        />
        <circle
            cx="11.6667"
            cy="8.16683"
            r="2.33333"
            transform="rotate(90 11.6667 8.16683)"
            stroke="currentColor"
            strokeLinecap="round"
        />
        <circle
            cx="17.5"
            cy="19.8333"
            r="2.33333"
            transform="rotate(90 17.5 19.8333)"
            stroke="currentColor"
            strokeLinecap="round"
        />
    </svg>
)

const SortIcon = ({ className }: { className?: string }) => (
    <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <path
            d="M9.33335 2.3335L8.9798 1.97994L9.33335 1.62639L9.68691 1.97994L9.33335 2.3335ZM9.83335 19.8335C9.83335 20.1096 9.6095 20.3335 9.33335 20.3335C9.05721 20.3335 8.83335 20.1096 8.83335 19.8335L9.33335 19.8335L9.83335 19.8335ZM4.66669 7.00016L4.31313 6.64661L8.9798 1.97994L9.33335 2.3335L9.68691 2.68705L5.02024 7.35372L4.66669 7.00016ZM9.33335 2.3335L9.68691 1.97994L14.3536 6.64661L14 7.00016L13.6465 7.35372L8.9798 2.68705L9.33335 2.3335ZM9.33335 2.3335L9.83335 2.3335L9.83335 19.8335L9.33335 19.8335L8.83335 19.8335L8.83335 2.3335L9.33335 2.3335Z"
            fill="currentColor"
        />
        <path
            d="M18.6667 25.6665L18.3131 26.0201L18.6667 26.3736L19.0202 26.0201L18.6667 25.6665ZM19.1667 8.1665C19.1667 7.89036 18.9428 7.6665 18.6667 7.6665C18.3905 7.6665 18.1667 7.89036 18.1667 8.1665L18.6667 8.1665L19.1667 8.1665ZM14 20.9998L13.6464 21.3534L18.3131 26.0201L18.6667 25.6665L19.0202 25.313L14.3536 20.6463L14 20.9998ZM18.6667 25.6665L19.0202 26.0201L23.6869 21.3534L23.3333 20.9998L22.9798 20.6463L18.3131 25.313L18.6667 25.6665ZM18.6667 25.6665L19.1667 25.6665L19.1667 8.1665L18.6667 8.1665L18.1667 8.1665L18.1667 25.6665L18.6667 25.6665Z"
            fill="currentColor"
        />
    </svg>
)

function ShopContent() {
    const { t } = useLanguage()
    const { currentCurrency, convertPrice, formatPrice } = useCurrency()

    // URL state management for filters and view mode
    const [
        {
            boutiqueId,
            categoryId,
            search,
            sortBy,
            columns,
            colorId,
            sizeId,
            minPrice,
            maxPrice,
        },
        setQueryState,
    ] = useQueryStates({
        boutiqueId: parseAsInteger,
        categoryId: parseAsInteger,
        search: parseAsString.withDefault(''),
        sortBy: parseAsString.withDefault('default'),
        columns: parseAsInteger.withDefault(3),
        colorId: parseAsInteger,
        sizeId: parseAsInteger,
        minPrice: parseAsInteger,
        maxPrice: parseAsInteger,
    })

    const [showFilterSheet, setShowFilterSheet] = useState(false)
    const [isNearFooter, setIsNearFooter] = useState(false)

    // Collapsible filter sections state
    const [expandedSections, setExpandedSections] = useState({
        sort: true,
        categories: false,
        creators: false,
        colors: false,
        sizes: false,
        priceRange: false,
    })

    // State for product details modal
    const [selectedProduct, setSelectedProduct] = useState<any>(null)
    const [showProductDetails, setShowProductDetails] = useState(false)

    const perPage = 12

    // Fetch products with infinite scroll
    const {
        data: infiniteData,
        isLoading: isLoadingProducts,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useShopProductsInfinite({
        perPage,
        boutiqueId,
        categoryId,
        searchQuery: search,
        sortBy,
        colorId,
        sizeId,
        minPrice,
        maxPrice,
    })

    // Flatten all pages into a single products array
    const products =
        infiniteData?.pages.flatMap((page: any) => page.products) || []
    const totalCount = (infiniteData?.pages[0] as any)?.totalCount || 0
    const currentEvent = (infiniteData?.pages[0] as any)?.currentEvent

    // Fetch filter options
    const { data: boutiques = [] } = useShopBoutiques(
        currentEvent?.yeventid || null,
        null
    )
    const { data: categories = [] } = useShopCategories(
        currentEvent?.yeventid || null
    )
    const { data: colors = [] } = useShopColors()
    const { data: sizes = [] } = useShopSizes()
    const { data: priceRange = { min: 0, max: 1000 } } = useShopPriceRange()

    // Convert price range to current currency and get decimal places
    const convertedPriceRange = useMemo(() => {
        if (!currentCurrency) return { min: 0, max: 1000, decimals: 2 }

        const decimals = currentCurrency.xdevisenbrdec || 2

        // If current currency is the pivot currency, no conversion needed
        if (currentCurrency.xispivot) {
            return {
                min: Math.max(0, priceRange.min),
                max: priceRange.max,
                decimals,
            }
        }

        // Convert from pivot currency to current currency
        const convertedMin = convertPrice(priceRange.min)
        const convertedMax = convertPrice(priceRange.max)

        // Debug logging to see what's happening
        console.log('Price Range Conversion Debug:', {
            originalRange: priceRange,
            currentCurrency: {
                code: currentCurrency.xdevisecodealpha,
                exchangeRate: currentCurrency.xtauxechange,
                isPivot: currentCurrency.xispivot,
                decimals: currentCurrency.xdevisenbrdec,
            },
            convertedMin,
            convertedMax,
            convertedMinFixed: Number(convertedMin.toFixed(decimals)),
            convertedMaxFixed: Number(convertedMax.toFixed(decimals)),
        })

        // Ensure reasonable bounds
        const safeMin = Math.max(0, Number(convertedMin.toFixed(decimals)))
        const safeMax = Math.max(
            safeMin,
            Number(convertedMax.toFixed(decimals))
        )

        return {
            min: safeMin,
            max: safeMax,
            decimals,
        }
    }, [priceRange, currentCurrency, convertPrice])

    // Convert URL price params to current currency for display
    const displayPrices = useMemo(() => {
        const displayMin = minPrice
            ? Number(
                convertPrice(minPrice).toFixed(convertedPriceRange.decimals)
            )
            : null
        const displayMax = maxPrice
            ? Number(
                convertPrice(maxPrice).toFixed(convertedPriceRange.decimals)
            )
            : null

        return { min: displayMin, max: displayMax }
    }, [minPrice, maxPrice, convertPrice, convertedPriceRange.decimals])

    // Local state for input values (separate from slider to avoid conflicts)
    const [inputValues, setInputValues] = useState({
        min: displayPrices.min?.toString() || '',
        max: displayPrices.max?.toString() || '',
    })

    // Update input values when display prices change
    useEffect(() => {
        setInputValues({
            min: displayPrices.min?.toString() || '',
            max: displayPrices.max?.toString() || '',
        })
    }, [displayPrices])

    // Handle filter changes (no pagination needed)
    const handleFilterChange = useCallback(
        (key: string) => (value: any) => {
            setQueryState({ [key]: value })
        },
        [setQueryState]
    )

    // Convert price from current currency to pivot currency for API
    const convertToPivotCurrency = useCallback(
        (price: number) => {
            if (!currentCurrency) return price

            // Convert from current currency to pivot currency
            if (currentCurrency.xispivot) {
                return price
            } else if (currentCurrency.xtauxechange > 0) {
                return price / currentCurrency.xtauxechange
            }
            return price
        },
        [currentCurrency]
    )

    // Handle slider changes
    const handleSliderChange = useCallback(
        (values: number[]) => {
            const [newMin, newMax] = values

            // Convert to pivot currency for API
            const pivotMin = convertToPivotCurrency(newMin)
            const pivotMax = convertToPivotCurrency(newMax)

            setQueryState({
                minPrice: newMin === convertedPriceRange.min ? null : pivotMin,
                maxPrice: newMax === convertedPriceRange.max ? null : pivotMax,
            })
        },
        [
            setQueryState,
            convertedPriceRange.min,
            convertedPriceRange.max,
            convertToPivotCurrency,
        ]
    )

    // Validate decimal places for currency
    const validateDecimalPlaces = useCallback(
        (value: string, maxDecimals: number): boolean => {
            if (value === '' || value === '.') return true

            const decimalIndex = value.indexOf('.')
            if (decimalIndex === -1) return true // No decimal point

            const actualDecimals = value.length - decimalIndex - 1
            return actualDecimals <= maxDecimals
        },
        []
    )

    // Handle manual input changes
    const handleMinInputChange = useCallback(
        (value: string) => {
            // Validate decimal places before allowing the input
            if (!validateDecimalPlaces(value, convertedPriceRange.decimals)) {
                return // Don't update if too many decimal places
            }

            setInputValues((prev) => ({ ...prev, min: value }))

            const numValue = parseFloat(value)
            if (!isNaN(numValue) && numValue >= 0) {
                const pivotValue = convertToPivotCurrency(numValue)
                setQueryState({ minPrice: pivotValue })
            } else if (value === '') {
                setQueryState({ minPrice: null })
            }
        },
        [
            setQueryState,
            convertToPivotCurrency,
            validateDecimalPlaces,
            convertedPriceRange.decimals,
        ]
    )

    const handleMaxInputChange = useCallback(
        (value: string) => {
            // Validate decimal places before allowing the input
            if (!validateDecimalPlaces(value, convertedPriceRange.decimals)) {
                return // Don't update if too many decimal places
            }

            setInputValues((prev) => ({ ...prev, max: value }))

            const numValue = parseFloat(value)
            if (!isNaN(numValue) && numValue >= 0) {
                const pivotValue = convertToPivotCurrency(numValue)
                setQueryState({ maxPrice: pivotValue })
            } else if (value === '') {
                setQueryState({ maxPrice: null })
            }
        },
        [
            setQueryState,
            convertToPivotCurrency,
            validateDecimalPlaces,
            convertedPriceRange.decimals,
        ]
    )

    const hasActiveFilters = Boolean(boutiqueId || categoryId || search)

    // Infinite scroll detection and footer proximity detection
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = document.documentElement.scrollTop
            const windowHeight = window.innerHeight
            const documentHeight = document.documentElement.offsetHeight

            // Infinite scroll logic
            if (
                windowHeight + scrollTop >= documentHeight - 1000 &&
                hasNextPage &&
                !isFetchingNextPage
            ) {
                fetchNextPage()
            }

            // Footer proximity detection - adjust filter button position
            // Consider we're near footer when we're within 300px of the bottom
            const distanceFromBottom =
                documentHeight - (scrollTop + windowHeight)
            setIsNearFooter(distanceFromBottom <= 200)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    return (
        <div className="min-h-[100svh] bg-white">
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header with Results Count and Column Toggle */}
                <div className="mb-8 flex items-center justify-between">
                    <div></div>
                    <div className="text-center">
                        <p className="text-gray-500">
                            +{totalCount} {t('shop.results') || 'resultats'}
                        </p>
                    </div>
                    {/* Grid toggle buttons and Currency Selector - Hidden on mobile and small screens */}
                    <div className="hidden items-center gap-3 lg:flex">
                        <CurrencySelector />
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setQueryState({ columns: 3 })}
                                className="rounded-lg p-2 transition-opacity hover:opacity-70"
                                title={t('shop.threeColumns')}
                            >
                                <ThreeColumnIcon
                                    className="h-6 w-8"
                                    isActive={columns === 3}
                                />
                            </button>
                            <button
                                onClick={() => setQueryState({ columns: 4 })}
                                className="rounded-lg p-2 transition-opacity hover:opacity-70"
                                title={t('shop.fourColumns')}
                            >
                                <FourColumnIcon
                                    className="h-6 w-10"
                                    isActive={columns === 4}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <main>
                    {/* Products Grid */}
                    {isLoadingProducts ? (
                        <div className="flex h-64 items-center justify-center">
                            <LoadingAnimation />
                        </div>
                    ) : products.length > 0 ? (
                        <>
                            <div
                                className={cn(
                                    'grid grid-cols-1 gap-8 sm:grid-cols-2',
                                    columns === 3
                                        ? 'lg:grid-cols-3'
                                        : 'lg:grid-cols-4'
                                )}
                            >
                                {products.map((product) => (
                                    <ProductCard
                                        key={product.yprodid}
                                        product={product}
                                        viewMode="grid"
                                        onViewDetails={() => {
                                            setSelectedProduct(product)
                                            setShowProductDetails(true)
                                        }}
                                    />
                                ))}
                            </div>

                            {/* Infinite Scroll Loading Indicator */}
                            {isFetchingNextPage && (
                                <div className="mt-8 flex justify-center">
                                    <div className="border-t-morpheus-gold-light h-8 w-8 animate-spin rounded-full border-4 border-gray-300"></div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="py-16 text-center">
                            <div className="mx-auto max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
                                <p className="mb-4 text-lg text-gray-600">
                                    {t('shop.noProductsFound')}
                                </p>
                                {hasActiveFilters && (
                                    <button
                                        onClick={() => {
                                            setQueryState({
                                                boutiqueId: null,
                                                categoryId: null,
                                                search: '',
                                                sortBy: 'default',
                                            })
                                        }}
                                        className="from-morpheus-gold-dark to-morpheus-gold-light hover:from-morpheus-gold-light hover:to-morpheus-gold-dark rounded-lg bg-gradient-to-r px-6 py-3 font-medium text-white transition-all duration-300"
                                    >
                                        {t('shop.clearFilters')}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Fixed Bottom Filter Button */}
            <div
                className={cn(
                    'fixed left-1/2 z-50 -translate-x-1/2 transform shadow-xl transition-all duration-300',
                    isNearFooter ? 'bottom-16' : 'bottom-6'
                )}
            >
                <button
                    onClick={() => setShowFilterSheet(true)}
                    className="flex h-16 w-56 items-center justify-center gap-3 rounded-2xl border-[0.50px] border-zinc-300 bg-gradient-to-r from-cyan-950 to-sky-900 text-white shadow-[0px_4px_100px_1px_rgba(0,0,0,0.10)] transition-all hover:shadow-xl"
                >
                    <FilterIcon className="h-6 w-6" />
                    <span className="font-medium">{t('shop.filter')}</span>
                    <div className="h-6 w-px bg-white"></div>
                    <SortIcon className="h-6 w-6" />
                    <span className="font-medium">{t('shop.sort')}</span>
                </button>
            </div>

            {/* Filter Sheet */}
            <Sheet open={showFilterSheet} onOpenChange={setShowFilterSheet}>
                <SheetTitle />
                <SheetContent side="right" className="z-[80] bg-white">
                    {/* Header */}
                    <div className="flex-shrink-0">
                        <div className="flex items-center justify-center py-4 text-3xl">
                            <h1 className="font-recia font-medium">
                                {t('shop.filterAndSort')}
                            </h1>
                        </div>
                        <Separator />
                    </div>

                    {/* Close button - positioned relative to the entire sheet */}
                    <SheetClose>
                        <div className="absolute top-10 right-7 z-10">
                            <X className="size-5" />
                        </div>
                    </SheetClose>

                    {/* Content */}
                    <ScrollArea className="flex-1 overflow-hidden">
                        <div className="flex flex-col px-6">
                            {/* Sort Options */}
                            <div className="mb-6">
                                <button
                                    onClick={() =>
                                        setExpandedSections((prev) => ({
                                            ...prev,
                                            sort: !prev.sort,
                                        }))
                                    }
                                    className="hover:bg-morpheus-blue-lighter flex h-12 w-full items-center justify-between rounded-none p-4 text-lg text-neutral-400 hover:text-white"
                                >
                                    <span className="flex-1 text-left">
                                        {t('shop.sortBy')}
                                    </span>
                                    <ChevronDown
                                        className={cn(
                                            'size-5 transition-transform',
                                            expandedSections.sort
                                                ? 'rotate-180'
                                                : ''
                                        )}
                                    />
                                </button>
                                <Separator />
                                {expandedSections.sort && (
                                    <div className="mt-2 space-y-0 px-2">
                                        <button
                                            onClick={() =>
                                                handleFilterChange('sortBy')(
                                                    'default'
                                                )
                                            }
                                            className={cn(
                                                'hover:bg-morpheus-blue-lighter flex h-12 w-full items-center justify-start rounded-none p-4 text-lg hover:text-white',
                                                sortBy === 'default'
                                                    ? 'text-morpheus-blue-dark bg-gray-50'
                                                    : 'text-neutral-400'
                                            )}
                                        >
                                            <span>{t('shop.default')}</span>
                                        </button>
                                        <Separator />
                                        <button
                                            onClick={() =>
                                                handleFilterChange('sortBy')(
                                                    'recommended'
                                                )
                                            }
                                            className={cn(
                                                'hover:bg-morpheus-blue-lighter flex h-12 w-full items-center justify-start rounded-none p-4 text-lg hover:text-white',
                                                sortBy === 'recommended'
                                                    ? 'text-morpheus-blue-dark bg-gray-50'
                                                    : 'text-neutral-400'
                                            )}
                                        >
                                            <span>{t('shop.recommended')}</span>
                                        </button>
                                        <Separator />
                                        <button
                                            onClick={() =>
                                                handleFilterChange('sortBy')(
                                                    'newest'
                                                )
                                            }
                                            className={cn(
                                                'hover:bg-morpheus-blue-lighter flex h-12 w-full items-center justify-start rounded-none p-4 text-lg hover:text-white',
                                                sortBy === 'newest'
                                                    ? 'text-morpheus-blue-dark bg-gray-50'
                                                    : 'text-neutral-400'
                                            )}
                                        >
                                            <span>{t('shop.newest')}</span>
                                        </button>
                                        <Separator />
                                        <button
                                            onClick={() =>
                                                handleFilterChange('sortBy')(
                                                    'price_asc'
                                                )
                                            }
                                            className={cn(
                                                'hover:bg-morpheus-blue-lighter flex h-12 w-full items-center justify-start rounded-none p-4 text-lg hover:text-white',
                                                sortBy === 'price_asc'
                                                    ? 'text-morpheus-blue-dark bg-gray-50'
                                                    : 'text-neutral-400'
                                            )}
                                        >
                                            <span>
                                                {t('shop.priceAscending')}
                                            </span>
                                        </button>
                                        <Separator />
                                        <button
                                            onClick={() =>
                                                handleFilterChange('sortBy')(
                                                    'price_desc'
                                                )
                                            }
                                            className={cn(
                                                'hover:bg-morpheus-blue-lighter flex h-12 w-full items-center justify-start rounded-none p-4 text-lg hover:text-white',
                                                sortBy === 'price_desc'
                                                    ? 'text-morpheus-blue-dark bg-gray-50'
                                                    : 'text-neutral-400'
                                            )}
                                        >
                                            <span>
                                                {t('shop.priceDescending')}
                                            </span>
                                        </button>
                                        <Separator />
                                        <button
                                            onClick={() =>
                                                handleFilterChange('sortBy')(
                                                    'alphabetical'
                                                )
                                            }
                                            className={cn(
                                                'hover:bg-morpheus-blue-lighter flex h-12 w-full items-center justify-start rounded-none p-4 text-lg hover:text-white',
                                                sortBy === 'alphabetical'
                                                    ? 'text-morpheus-blue-dark bg-gray-50'
                                                    : 'text-neutral-400'
                                            )}
                                        >
                                            <span>
                                                {t('shop.alphabetical')}
                                            </span>
                                        </button>
                                        <Separator />
                                    </div>
                                )}
                            </div>

                            {/* Filter Categories */}
                            <div className="space-y-0">
                                {/* Categories */}
                                {categories.length > 0 && (
                                    <div>
                                        <button
                                            onClick={() =>
                                                setExpandedSections((prev) => ({
                                                    ...prev,
                                                    categories:
                                                        !prev.categories,
                                                }))
                                            }
                                            className="hover:bg-morpheus-blue-lighter flex h-12 w-full items-center justify-between rounded-none p-4 text-lg text-neutral-400 hover:text-white"
                                        >
                                            <span className="flex-1 text-left">
                                                {t('shop.categories')}
                                            </span>
                                            <ChevronDown
                                                className={cn(
                                                    'size-5 transition-transform',
                                                    expandedSections.categories
                                                        ? 'rotate-180'
                                                        : ''
                                                )}
                                            />
                                        </button>
                                        <Separator />
                                        {expandedSections.categories && (
                                            <div className="mt-2 space-y-0 px-2">
                                                <div>
                                                    <button
                                                        onClick={() =>
                                                            handleFilterChange('categoryId')(null)
                                                        }
                                                        className={cn(
                                                            'hover:bg-morpheus-blue-lighter flex h-12 w-full items-center justify-start rounded-none p-4 text-lg hover:text-white',
                                                            categoryId == null
                                                                ? 'font-semibold text-morpheus-blue-dark bg-gray-50'
                                                                : 'text-neutral-400'
                                                        )}
                                                    >
                                                        <span>{t('common.all') || 'All'}</span>
                                                    </button>
                                                    <Separator />
                                                </div>
                                                {categories.map((category) => (
                                                    <div
                                                        key={
                                                            category.xcategprodid
                                                        }
                                                    >
                                                        <button
                                                            onClick={() =>
                                                                handleFilterChange(
                                                                    'categoryId'
                                                                )(
                                                                    category.xcategprodid
                                                                )
                                                            }
                                                            className={cn(
                                                                'hover:bg-morpheus-blue-lighter flex h-12 w-full items-center justify-start rounded-none p-4 text-lg hover:text-white',
                                                                categoryId ===
                                                                    category.xcategprodid
                                                                    ? 'font-semibold text-morpheus-blue-dark bg-gray-50'
                                                                    : 'text-neutral-400'
                                                            )}
                                                        >
                                                            {
                                                                category.xcategprodintitule
                                                            }
                                                        </button>
                                                        <Separator />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Boutiques */}
                                {boutiques.length > 0 && (
                                    <div>
                                        <button
                                            onClick={() =>
                                                setExpandedSections((prev) => ({
                                                    ...prev,
                                                    creators: !prev.creators,
                                                }))
                                            }
                                            className="hover:bg-morpheus-blue-lighter flex h-12 w-full items-center justify-between rounded-none p-4 text-lg text-neutral-400 hover:text-white"
                                        >
                                            <span className="flex-1 text-left">
                                                {t('shop.creators')}
                                            </span>
                                            <ChevronDown
                                                className={cn(
                                                    'size-5 transition-transform',
                                                    expandedSections.creators
                                                        ? 'rotate-180'
                                                        : ''
                                                )}
                                            />
                                        </button>
                                        <Separator />
                                        {expandedSections.creators && (
                                            <div className="mt-2 space-y-0 px-2">
                                                <div>
                                                    <button
                                                        onClick={() =>
                                                            handleFilterChange('boutiqueId')(null)
                                                        }
                                                        className={cn(
                                                            'hover:bg-morpheus-blue-lighter flex h-12 w-full items-center justify-start rounded-none p-4 text-lg hover:text-white',
                                                            boutiqueId == null
                                                                ? 'font-semibold text-morpheus-blue-dark bg-gray-50'
                                                                : 'text-neutral-400'
                                                        )}
                                                    >
                                                        <span>{t('common.all') || 'All'}</span>
                                                    </button>
                                                    <Separator />
                                                </div>

                                                {boutiques.map((boutique) => (
                                                    <div
                                                        key={
                                                            boutique.yboutiqueid
                                                        }
                                                    >
                                                        <button
                                                            onClick={() =>
                                                                handleFilterChange(
                                                                    'boutiqueId'
                                                                )(
                                                                    boutique.yboutiqueid
                                                                )
                                                            }
                                                            className={cn(
                                                                'hover:bg-morpheus-blue-lighter flex h-12 w-full items-center justify-start rounded-none p-4 text-lg hover:text-white',
                                                                boutiqueId ===
                                                                    boutique.yboutiqueid
                                                                    ? 'font-semibold text-morpheus-blue-dark bg-gray-50'
                                                                    : 'text-neutral-400'
                                                            )}
                                                        >
                                                            {boutique.yboutiqueintitule ||
                                                                boutique.yboutiquecode}
                                                        </button>
                                                        <Separator />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Colors */}
                                {colors.length > 0 && (
                                    <div>
                                        <button
                                            onClick={() =>
                                                setExpandedSections((prev) => ({
                                                    ...prev,
                                                    colors: !prev.colors,
                                                }))
                                            }
                                            className="hover:bg-morpheus-blue-lighter flex h-12 w-full items-center justify-between rounded-none p-4 text-lg text-neutral-400 hover:text-white"
                                        >
                                            <span className="flex-1 text-left">
                                                {t('shop.colors')}
                                            </span>
                                            <ChevronDown
                                                className={cn(
                                                    'size-5 transition-transform',
                                                    expandedSections.colors
                                                        ? 'rotate-180'
                                                        : ''
                                                )}
                                            />
                                        </button>
                                        <Separator />
                                        {expandedSections.colors && (
                                            <div className="mt-2 space-y-0 px-2">
                                                <div>
                                                    <button
                                                        onClick={() =>
                                                            handleFilterChange('colorId')(null)
                                                        }
                                                        className={cn(
                                                            'hover:bg-morpheus-blue-lighter flex h-12 w-full items-center justify-start rounded-none p-4 text-lg hover:text-white',
                                                            colorId == null
                                                                ? 'font-semibold text-morpheus-blue-dark bg-gray-50'
                                                                : 'text-neutral-400'
                                                        )}
                                                    >
                                                        <span>{t('common.all') || 'All'}</span>
                                                    </button>
                                                    <Separator />
                                                </div>

                                                {colors.map((color) => (
                                                    <div key={color.xcouleurid}>
                                                        <button
                                                            onClick={() =>
                                                                handleFilterChange(
                                                                    'colorId'
                                                                )(
                                                                    color.xcouleurid
                                                                )
                                                            }
                                                            className={cn(
                                                                'hover:bg-morpheus-blue-lighter flex h-12 w-full items-center justify-start gap-3 rounded-none p-4 text-lg hover:text-white',
                                                                colorId ===
                                                                    color.xcouleurid
                                                                    ? 'font-semibold text-morpheus-blue-dark bg-gray-50'
                                                                    : 'text-neutral-400'
                                                            )}
                                                        >
                                                            <span>
                                                                {
                                                                    color.xcouleurintitule
                                                                }
                                                            </span>
                                                        </button>
                                                        <Separator />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Sizes */}
                                {sizes.length > 0 && (
                                    <div>
                                        <button
                                            onClick={() =>
                                                setExpandedSections((prev) => ({
                                                    ...prev,
                                                    sizes: !prev.sizes,
                                                }))
                                            }
                                            className="hover:bg-morpheus-blue-lighter flex h-12 w-full items-center justify-between rounded-none p-4 text-lg text-neutral-400 hover:text-white"
                                        >
                                            <span className="flex-1 text-left">
                                                {t('shop.sizes')}
                                            </span>
                                            <ChevronDown
                                                className={cn(
                                                    'size-5 transition-transform',
                                                    expandedSections.sizes
                                                        ? 'rotate-180'
                                                        : ''
                                                )}
                                            />
                                        </button>
                                        <Separator />
                                        {expandedSections.sizes && (
                                            <div className="mt-2 space-y-0 px-2">
                                                <div>
                                                    <button
                                                        onClick={() =>
                                                            handleFilterChange('sizeId')(null)
                                                        }
                                                        className={cn(
                                                            'hover:bg-morpheus-blue-lighter flex h-12 w-full items-center justify-start rounded-none p-4 text-lg hover:text-white',
                                                            sizeId == null
                                                                ? 'font-semibold text-morpheus-blue-dark bg-gray-50'
                                                                : 'text-neutral-400'
                                                        )}
                                                    >
                                                        <span>{t('common.all') || 'All'}</span>
                                                    </button>
                                                    <Separator />
                                                </div>

                                                {sizes.map((size) => (
                                                    <div key={size.xtailleid}>
                                                        <button
                                                            onClick={() =>
                                                                handleFilterChange(
                                                                    'sizeId'
                                                                )(
                                                                    size.xtailleid
                                                                )
                                                            }
                                                            className={cn(
                                                                'hover:bg-morpheus-blue-lighter flex h-12 w-full items-center justify-start rounded-none p-4 text-lg hover:text-white',
                                                                sizeId ===
                                                                    size.xtailleid
                                                                    ? 'font-semibold text-morpheus-blue-dark bg-gray-50'
                                                                    : 'text-neutral-400'
                                                            )}
                                                        >
                                                            <span>
                                                                {
                                                                    size.xtailleintitule
                                                                }
                                                            </span>
                                                        </button>
                                                        <Separator />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Price Range */}
                                <div>
                                    <button
                                        onClick={() =>
                                            setExpandedSections((prev) => ({
                                                ...prev,
                                                priceRange: !prev.priceRange,
                                            }))
                                        }
                                        className="hover:bg-morpheus-blue-lighter flex h-12 w-full items-center justify-between rounded-none p-4 text-lg text-neutral-400 hover:text-white"
                                    >
                                        <span className="flex-1 text-left">
                                            {t('shop.price')}
                                        </span>
                                        <ChevronDown
                                            className={cn(
                                                'size-5 transition-transform',
                                                expandedSections.priceRange
                                                    ? 'rotate-180'
                                                    : ''
                                            )}
                                        />
                                    </button>
                                    <Separator />
                                    {expandedSections.priceRange && (
                                        <div className="mt-2 space-y-4 px-2">
                                            {/* Price Range Display
                                            <div className="flex items-center justify-between text-sm text-gray-600">
                                                <span>
                                                    {displayPrices.min !== null
                                                        ? formatPrice(
                                                              displayPrices.min
                                                          )
                                                        : formatPrice(
                                                              convertedPriceRange.min
                                                          )}
                                                </span>
                                                <span>-</span>
                                                <span>
                                                    {displayPrices.max !== null
                                                        ? formatPrice(
                                                              displayPrices.max
                                                          )
                                                        : formatPrice(
                                                              convertedPriceRange.max
                                                          )}
                                                </span>
                                            </div> */}

                                            {/* Slider */}
                                            <div className="px-2">
                                                {/* <Slider
                                                    value={[
                                                        Math.max(
                                                            convertedPriceRange.min,
                                                            Math.min(
                                                                convertedPriceRange.max
                                                            )
                                                        ),
                                                       ,
                                                    ]}
                                                    onValueChange={
                                                        handleSliderChange
                                                    }
                                                    min={
                                                        convertedPriceRange.min
                                                    }
                                                    max={
                                                        convertedPriceRange.max
                                                    }
                                                    step={
                                                        convertedPriceRange.decimals ===
                                                        0
                                                            ? 1
                                                            : Math.pow(
                                                                  10,
                                                                  -convertedPriceRange.decimals
                                                              )
                                                    }
                                                    className="w-full"
                                                /> */}
                                            </div>

                                            {/* Manual Input Fields */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                                        {t('shop.priceMin')} (
                                                        {currentCurrency?.xdevisecodealpha ||
                                                            'EUR'}
                                                        )
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step={
                                                            convertedPriceRange.decimals ===
                                                                0
                                                                ? '1'
                                                                : Math.pow(
                                                                    10,
                                                                    -convertedPriceRange.decimals
                                                                ).toString()
                                                        }
                                                        placeholder={convertedPriceRange.min.toString()}
                                                        value={inputValues.min}
                                                        onChange={(e) =>
                                                            handleMinInputChange(
                                                                e.target.value
                                                            )
                                                        }
                                                        className={cn(
                                                            'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none',
                                                            displayPrices.min !==
                                                                null &&
                                                                displayPrices.max !==
                                                                null &&
                                                                displayPrices.min >
                                                                displayPrices.max
                                                                ? 'border-red-300 focus:border-red-400'
                                                                : 'border-gray-300 focus:border-gray-400'
                                                        )}
                                                    />
                                                    {displayPrices.min !==
                                                        null &&
                                                        displayPrices.max !==
                                                        null &&
                                                        displayPrices.min >
                                                        displayPrices.max && (
                                                            <p className="mt-1 text-xs text-red-500">
                                                                {t(
                                                                    'shop.priceMinError'
                                                                )}
                                                            </p>
                                                        )}
                                                </div>
                                                <div>
                                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                                        {t('shop.priceMax')} (
                                                        {currentCurrency?.xdevisecodealpha ||
                                                            'EUR'}
                                                        )
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step={
                                                            convertedPriceRange.decimals ===
                                                                0
                                                                ? '1'
                                                                : Math.pow(
                                                                    10,
                                                                    -convertedPriceRange.decimals
                                                                ).toString()
                                                        }
                                                        placeholder={convertedPriceRange.max.toString()}
                                                        value={inputValues.max}
                                                        onChange={(e) =>
                                                            handleMaxInputChange(
                                                                e.target.value
                                                            )
                                                        }
                                                        className={cn(
                                                            'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none',
                                                            displayPrices.min !==
                                                                null &&
                                                                displayPrices.max !==
                                                                null &&
                                                                displayPrices.max <
                                                                displayPrices.min
                                                                ? 'border-red-300 focus:border-red-400'
                                                                : 'border-gray-300 focus:border-gray-400'
                                                        )}
                                                    />
                                                    {displayPrices.min !==
                                                        null &&
                                                        displayPrices.max !==
                                                        null &&
                                                        displayPrices.max <
                                                        displayPrices.min && (
                                                            <p className="mt-1 text-xs text-red-500">
                                                                {t(
                                                                    'shop.priceMaxError'
                                                                )}
                                                            </p>
                                                        )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    {/* Footer */}
                    <div className="mt-2 px-6 pb-4">
                        <Separator className="mb-4" />
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setQueryState({
                                        boutiqueId: null,
                                        categoryId: null,
                                        search: '',
                                        sortBy: 'default',
                                        colorId: null,
                                        sizeId: null,
                                        minPrice: null,
                                        maxPrice: null,
                                    })
                                }}
                                className="outline-morpheus-blue-dark hover:from-morpheus-blue-light hover:to-morpheus-blue-dark text-morpheus-blue-dark flex-1 rounded-none bg-gradient-to-r p-4 text-lg outline transition-all duration-300 hover:text-white"
                            >
                                {t('shop.clearAll')}
                            </button>
                            <button
                                onClick={() => setShowFilterSheet(false)}
                                className="from-morpheus-blue-light to-morpheus-blue-dark hover:border-morpheus-blue-dark hover:text-morpheus-blue-dark flex-1 rounded-none bg-gradient-to-r p-4 text-lg text-white transition-all duration-300 hover:border hover:from-white hover:to-white"
                            >
                                {t('shop.apply')}
                            </button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Product Details Modal */}
            {showProductDetails && selectedProduct && (
                <ProductDetailsPage
                    productData={selectedProduct}
                    onClose={() => {
                        setShowProductDetails(false)
                        setSelectedProduct(null)
                    }}
                    extraTop
                />
            )}

            {/* Footer */}
            <Footer />
        </div>
    )
}

export default function ShopPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center bg-white">
                    <div className="border-t-morpheus-gold-light h-16 w-16 animate-spin rounded-full border-4 border-gray-300"></div>
                </div>
            }
        >
            <ShopContent />
        </Suspense>
    )
}
