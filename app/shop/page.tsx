'use client'

import { Suspense, useState, useCallback, useEffect } from 'react'
import { X, ChevronDown } from 'lucide-react'
import { useQueryStates, parseAsInteger, parseAsString } from 'nuqs'
import { useLanguage } from '@/hooks/useLanguage'
import { useShopProductsInfinite } from './_hooks/use-shop-products'
import {
    useShopBoutiques,
    useShopCategories,
    useShopColors,
    useShopSizes,
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
        <rect
            x="24.829"
            y="10.4019"
            width="12.1711"
            height="10.1982"
            rx="2"
            fill={isActive ? '#E8D07A' : '#D9D9D9'}
        />
        <rect
            x="24.829"
            y="10.4019"
            width="12.1711"
            height="10.1982"
            rx="2"
            fill={isActive ? '#E8D07A' : '#D9D9D9'}
        />
        <rect
            x="12.4144"
            y="10.4019"
            width="12.1711"
            height="10.1982"
            rx="2"
            fill={isActive ? '#E8D07A' : '#D9D9D9'}
        />
        <rect
            width="12.1711"
            height="10.1982"
            rx="2"
            fill={isActive ? '#E8D07A' : '#D9D9D9'}
        />
        <rect
            y="10.4014"
            width="12.1711"
            height="10.1982"
            rx="2"
            fill={isActive ? '#E8D07A' : '#D9D9D9'}
        />
        <rect
            y="20.8027"
            width="12.1711"
            height="10.1982"
            rx="2"
            fill={isActive ? '#E8D07A' : '#D9D9D9'}
        />
        <rect
            x="24.829"
            y="20.8027"
            width="12.1711"
            height="10.1982"
            rx="2"
            fill={isActive ? '#E8D07A' : '#D9D9D9'}
        />
        <rect
            x="12.4144"
            y="20.8027"
            width="12.1711"
            height="10.1982"
            rx="2"
            fill={isActive ? '#E8D07A' : '#D9D9D9'}
        />
        <rect
            x="12.4144"
            width="12.1711"
            height="10.1982"
            rx="2"
            fill={isActive ? '#E8D07A' : '#D9D9D9'}
        />
        <rect
            x="24.829"
            width="12.1711"
            height="10.1982"
            rx="2"
            fill={isActive ? '#E8D07A' : '#D9D9D9'}
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
        <rect
            x="12.5172"
            y="10.4019"
            width="12.2718"
            height="10.1974"
            rx="2"
            fill={isActive ? '#E8D07A' : '#D9D9D9'}
        />
        <rect
            width="12.2718"
            height="10.1974"
            rx="2"
            fill={isActive ? '#E8D07A' : '#D9D9D9'}
        />
        <rect
            y="10.4014"
            width="12.2718"
            height="10.1974"
            rx="2"
            fill={isActive ? '#E8D07A' : '#D9D9D9'}
        />
        <rect
            y="20.8027"
            width="12.2718"
            height="10.1974"
            rx="2"
            fill={isActive ? '#E8D07A' : '#D9D9D9'}
        />
        <rect
            x="12.5172"
            y="20.8027"
            width="12.2718"
            height="10.1974"
            rx="2"
            fill={isActive ? '#E8D07A' : '#D9D9D9'}
        />
        <rect
            x="12.5172"
            width="12.2718"
            height="10.1974"
            rx="2"
            fill={isActive ? '#E8D07A' : '#D9D9D9'}
        />
        <rect
            x="25.0344"
            y="10.4019"
            width="12.2718"
            height="10.1974"
            rx="2"
            fill={isActive ? '#E8D07A' : '#D9D9D9'}
        />
        <rect
            x="25.0344"
            y="10.4019"
            width="12.2718"
            height="10.1974"
            rx="2"
            fill={isActive ? '#E8D07A' : '#D9D9D9'}
        />
        <rect
            x="25.0344"
            y="20.8027"
            width="12.2718"
            height="10.1974"
            rx="2"
            fill={isActive ? '#E8D07A' : '#D9D9D9'}
        />
        <rect
            x="25.0344"
            width="12.2718"
            height="10.1974"
            rx="2"
            fill={isActive ? '#E8D07A' : '#D9D9D9'}
        />
        <rect
            x="37.5518"
            y="10.4019"
            width="12.2718"
            height="10.1974"
            rx="2"
            fill={isActive ? '#E8D07A' : '#D9D9D9'}
        />
        <rect
            x="37.5518"
            y="10.4019"
            width="12.2718"
            height="10.1974"
            rx="2"
            fill={isActive ? '#E8D07A' : '#D9D9D9'}
        />
        <rect
            x="37.5518"
            y="20.8027"
            width="12.2718"
            height="10.1974"
            rx="2"
            fill={isActive ? '#E8D07A' : '#D9D9D9'}
        />
        <rect
            x="37.5518"
            width="12.2718"
            height="10.1974"
            rx="2"
            fill={isActive ? '#E8D07A' : '#D9D9D9'}
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
            stroke="#B27C64"
            strokeLinecap="round"
        />
        <path
            d="M4.66663 8.1665L9.33329 8.1665"
            stroke="#B27C64"
            strokeLinecap="round"
        />
        <path
            d="M19.8333 19.8335L23.3333 19.8335"
            stroke="#B27C64"
            strokeLinecap="round"
        />
        <path
            d="M4.66663 19.8335L14 19.8335"
            stroke="#B27C64"
            strokeLinecap="round"
        />
        <circle
            cx="11.6667"
            cy="8.16683"
            r="2.33333"
            transform="rotate(90 11.6667 8.16683)"
            stroke="#B27C64"
            strokeLinecap="round"
        />
        <circle
            cx="17.5"
            cy="19.8333"
            r="2.33333"
            transform="rotate(90 17.5 19.8333)"
            stroke="#B27C64"
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
            fill="#B27C64"
        />
        <path
            d="M18.6667 25.6665L18.3131 26.0201L18.6667 26.3736L19.0202 26.0201L18.6667 25.6665ZM19.1667 8.1665C19.1667 7.89036 18.9428 7.6665 18.6667 7.6665C18.3905 7.6665 18.1667 7.89036 18.1667 8.1665L18.6667 8.1665L19.1667 8.1665ZM14 20.9998L13.6464 21.3534L18.3131 26.0201L18.6667 25.6665L19.0202 25.313L14.3536 20.6463L14 20.9998ZM18.6667 25.6665L19.0202 26.0201L23.6869 21.3534L23.3333 20.9998L22.9798 20.6463L18.3131 25.313L18.6667 25.6665ZM18.6667 25.6665L19.1667 25.6665L19.1667 8.1665L18.6667 8.1665L18.1667 8.1665L18.1667 25.6665L18.6667 25.6665Z"
            fill="#B27C64"
        />
    </svg>
)

function ShopContent() {
    const { t } = useLanguage()

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
        sortBy: parseAsString.withDefault('newest'),
        columns: parseAsInteger.withDefault(3),
        colorId: parseAsInteger,
        sizeId: parseAsInteger,
        minPrice: parseAsInteger,
        maxPrice: parseAsInteger,
    })

    const [showFilterSheet, setShowFilterSheet] = useState(false)

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

    // Handle filter changes (no pagination needed)
    const handleFilterChange = useCallback(
        (key: string) => (value: any) => {
            setQueryState({ [key]: value })
        },
        [setQueryState]
    )

    const hasActiveFilters = Boolean(boutiqueId || categoryId || search)

    // Infinite scroll detection
    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + document.documentElement.scrollTop >=
                    document.documentElement.offsetHeight - 1000 &&
                hasNextPage &&
                !isFetchingNextPage
            ) {
                fetchNextPage()
            }
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
                    {/* Grid toggle buttons - Hidden on mobile and small screens */}
                    <div className="hidden items-center gap-1 lg:flex">
                        <button
                            onClick={() => setQueryState({ columns: 3 })}
                            className="rounded-lg p-2 transition-opacity hover:opacity-70"
                            title="3 colonnes"
                        >
                            <ThreeColumnIcon
                                className="h-6 w-8"
                                isActive={columns === 3}
                            />
                        </button>
                        <button
                            onClick={() => setQueryState({ columns: 4 })}
                            className="rounded-lg p-2 transition-opacity hover:opacity-70"
                            title="4 colonnes"
                        >
                            <FourColumnIcon
                                className="h-6 w-10"
                                isActive={columns === 4}
                            />
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <main>
                    {/* Products Grid */}
                    {isLoadingProducts ? (
                        <div className="flex h-64 items-center justify-center">
                            <div className="border-t-morpheus-gold-light h-16 w-16 animate-spin rounded-full border-4 border-gray-300"></div>
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
                                                sortBy: 'newest',
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
            <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transform">
                <button
                    onClick={() => setShowFilterSheet(true)}
                    className="flex items-center gap-3 rounded-full border border-gray-200 bg-white px-8 py-4 text-gray-600 shadow-lg transition-all hover:bg-gray-50 hover:shadow-xl"
                >
                    <FilterIcon className="h-6 w-6" />
                    <span className="font-medium text-gray-700">Filtrer</span>
                    <SortIcon className="h-6 w-6" />
                    <span className="font-medium text-gray-700">Trier</span>
                </button>
            </div>

            {/* Filter Sheet */}
            <Sheet open={showFilterSheet} onOpenChange={setShowFilterSheet}>
                <SheetTitle />
                <SheetContent side="right" className="bg-white">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-200 p-6">
                        <h2 className="text-xl font-medium text-gray-900">
                            Filtrer & Trier
                        </h2>
                        <SheetClose>
                            <div className="rounded-full p-2 transition-colors hover:bg-gray-100">
                                <X className="h-5 w-5" />
                            </div>
                        </SheetClose>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="space-y-1 p-6">
                            {/* Sort Options */}
                            <div className="mb-6">
                                <button
                                    onClick={() =>
                                        setExpandedSections((prev) => ({
                                            ...prev,
                                            sort: !prev.sort,
                                        }))
                                    }
                                    className="flex w-full items-center justify-between py-3 text-left"
                                >
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Trier Par
                                    </h3>
                                    <ChevronDown
                                        className={cn(
                                            'h-5 w-5 text-gray-400 transition-transform',
                                            expandedSections.sort
                                                ? 'rotate-180'
                                                : ''
                                        )}
                                    />
                                </button>
                                {expandedSections.sort && (
                                    <div className="mt-2 space-y-2">
                                        <button
                                            onClick={() =>
                                                handleFilterChange('sortBy')(
                                                    'newest'
                                                )
                                            }
                                            className={cn(
                                                'w-full rounded-lg px-4 py-3 text-left transition-colors',
                                                sortBy === 'newest'
                                                    ? 'bg-black text-white'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                            )}
                                        >
                                            <span>Plus récent</span>
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleFilterChange('sortBy')(
                                                    'price_asc'
                                                )
                                            }
                                            className={cn(
                                                'w-full rounded-lg px-4 py-3 text-left transition-colors',
                                                sortBy === 'price_asc'
                                                    ? 'bg-black text-white'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                            )}
                                        >
                                            <span>Prix croissant</span>
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleFilterChange('sortBy')(
                                                    'price_desc'
                                                )
                                            }
                                            className={cn(
                                                'w-full rounded-lg px-4 py-3 text-left transition-colors',
                                                sortBy === 'price_desc'
                                                    ? 'bg-black text-white'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                            )}
                                        >
                                            <span>Prix décroissant</span>
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleFilterChange('sortBy')(
                                                    'alphabetical'
                                                )
                                            }
                                            className={cn(
                                                'w-full rounded-lg px-4 py-3 text-left transition-colors',
                                                sortBy === 'alphabetical'
                                                    ? 'bg-black text-white'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                            )}
                                        >
                                            <span>Alphabétique</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Filter Categories */}
                            <div className="space-y-4">
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
                                            className="flex w-full items-center justify-between py-3 text-left"
                                        >
                                            <h3 className="text-lg font-medium text-gray-900">
                                                Catégories
                                            </h3>
                                            <ChevronDown
                                                className={cn(
                                                    'h-5 w-5 text-gray-400 transition-transform',
                                                    expandedSections.categories
                                                        ? 'rotate-180'
                                                        : ''
                                                )}
                                            />
                                        </button>
                                        {expandedSections.categories && (
                                            <div className="mt-2 space-y-2">
                                                {categories.map((category) => (
                                                    <button
                                                        key={
                                                            category.xcategprodid
                                                        }
                                                        onClick={() =>
                                                            handleFilterChange(
                                                                'categoryId'
                                                            )(
                                                                category.xcategprodid
                                                            )
                                                        }
                                                        className={cn(
                                                            'w-full rounded-lg px-4 py-3 text-left transition-colors',
                                                            categoryId ===
                                                                category.xcategprodid
                                                                ? 'bg-black text-white'
                                                                : 'text-gray-700 hover:bg-gray-50'
                                                        )}
                                                    >
                                                        {
                                                            category.xcategprodintitule
                                                        }
                                                    </button>
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
                                            className="flex w-full items-center justify-between py-3 text-left"
                                        >
                                            <h3 className="text-lg font-medium text-gray-900">
                                                Créateurs
                                            </h3>
                                            <ChevronDown
                                                className={cn(
                                                    'h-5 w-5 text-gray-400 transition-transform',
                                                    expandedSections.creators
                                                        ? 'rotate-180'
                                                        : ''
                                                )}
                                            />
                                        </button>
                                        {expandedSections.creators && (
                                            <div className="mt-2 space-y-2">
                                                {boutiques.map((boutique) => (
                                                    <button
                                                        key={
                                                            boutique.yboutiqueid
                                                        }
                                                        onClick={() =>
                                                            handleFilterChange(
                                                                'boutiqueId'
                                                            )(
                                                                boutique.yboutiqueid
                                                            )
                                                        }
                                                        className={cn(
                                                            'w-full rounded-lg px-4 py-3 text-left transition-colors',
                                                            boutiqueId ===
                                                                boutique.yboutiqueid
                                                                ? 'bg-black text-white'
                                                                : 'text-gray-700 hover:bg-gray-50'
                                                        )}
                                                    >
                                                        {boutique.yboutiqueintitule ||
                                                            boutique.yboutiquecode}
                                                    </button>
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
                                            className="flex w-full items-center justify-between py-3 text-left"
                                        >
                                            <h3 className="text-lg font-medium text-gray-900">
                                                Couleurs
                                            </h3>
                                            <ChevronDown
                                                className={cn(
                                                    'h-5 w-5 text-gray-400 transition-transform',
                                                    expandedSections.colors
                                                        ? 'rotate-180'
                                                        : ''
                                                )}
                                            />
                                        </button>
                                        {expandedSections.colors && (
                                            <div className="mt-2 space-y-2">
                                                {colors.map((color) => (
                                                    <button
                                                        key={color.xcouleurid}
                                                        onClick={() =>
                                                            handleFilterChange(
                                                                'colorId'
                                                            )(color.xcouleurid)
                                                        }
                                                        className={cn(
                                                            'flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors',
                                                            colorId ===
                                                                color.xcouleurid
                                                                ? 'bg-black text-white'
                                                                : 'text-gray-700 hover:bg-gray-50'
                                                        )}
                                                    >
                                                        <div
                                                            className="h-4 w-4 rounded-full border border-gray-300"
                                                            style={{
                                                                backgroundColor:
                                                                    color.xcouleurhexa,
                                                            }}
                                                        />
                                                        <span>
                                                            {
                                                                color.xcouleurintitule
                                                            }
                                                        </span>
                                                    </button>
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
                                            className="flex w-full items-center justify-between py-3 text-left"
                                        >
                                            <h3 className="text-lg font-medium text-gray-900">
                                                Tailles
                                            </h3>
                                            <ChevronDown
                                                className={cn(
                                                    'h-5 w-5 text-gray-400 transition-transform',
                                                    expandedSections.sizes
                                                        ? 'rotate-180'
                                                        : ''
                                                )}
                                            />
                                        </button>
                                        {expandedSections.sizes && (
                                            <div className="mt-2 space-y-2">
                                                {sizes.map((size) => (
                                                    <button
                                                        key={size.xtailleid}
                                                        onClick={() =>
                                                            handleFilterChange(
                                                                'sizeId'
                                                            )(size.xtailleid)
                                                        }
                                                        className={cn(
                                                            'w-full rounded-lg px-4 py-3 text-left transition-colors',
                                                            sizeId ===
                                                                size.xtailleid
                                                                ? 'bg-black text-white'
                                                                : 'text-gray-700 hover:bg-gray-50'
                                                        )}
                                                    >
                                                        <span>
                                                            {
                                                                size.xtailleintitule
                                                            }
                                                        </span>
                                                    </button>
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
                                        className="flex w-full items-center justify-between py-3 text-left"
                                    >
                                        <h3 className="text-lg font-medium text-gray-900">
                                            Prix
                                        </h3>
                                        <ChevronDown
                                            className={cn(
                                                'h-5 w-5 text-gray-400 transition-transform',
                                                expandedSections.priceRange
                                                    ? 'rotate-180'
                                                    : ''
                                            )}
                                        />
                                    </button>
                                    {expandedSections.priceRange && (
                                        <div className="mt-2 space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                                        Prix min
                                                    </label>
                                                    <input
                                                        type="number"
                                                        placeholder="0"
                                                        value={minPrice || ''}
                                                        onChange={(e) => {
                                                            const value = e
                                                                .target.value
                                                                ? parseInt(
                                                                      e.target
                                                                          .value
                                                                  )
                                                                : null
                                                            setQueryState({
                                                                minPrice: value,
                                                            })
                                                        }}
                                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                                        Prix max
                                                    </label>
                                                    <input
                                                        type="number"
                                                        placeholder="1000"
                                                        value={maxPrice || ''}
                                                        onChange={(e) => {
                                                            const value = e
                                                                .target.value
                                                                ? parseInt(
                                                                      e.target
                                                                          .value
                                                                  )
                                                                : null
                                                            setQueryState({
                                                                maxPrice: value,
                                                            })
                                                        }}
                                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 p-6">
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setQueryState({
                                        boutiqueId: null,
                                        categoryId: null,
                                        search: '',
                                        sortBy: 'newest',
                                        colorId: null,
                                        sizeId: null,
                                        minPrice: null,
                                        maxPrice: null,
                                    })
                                }}
                                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-gray-700 transition-colors hover:bg-gray-50"
                            >
                                Effacer tout
                            </button>
                            <button
                                onClick={() => setShowFilterSheet(false)}
                                className="flex-1 rounded-lg bg-black px-4 py-3 text-white transition-colors hover:bg-gray-800"
                            >
                                Appliquer
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
