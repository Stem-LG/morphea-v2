'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ShoppingCart, Star, Eye } from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'
import { useLanguage } from '@/hooks/useLanguage'

// Custom Wishlist Icon
const WishlistIcon = ({
    className,
    filled = false,
}: {
    className?: string
    filled?: boolean
}) => (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <g clipPath="url(#clip0_96_453)">
            <path
                d="M1.18037 10.564C0.829719 10.2394 1.02019 9.65262 1.49448 9.59633L8.21491 8.79842C8.40821 8.77548 8.57611 8.65397 8.65764 8.47704L11.4922 2.32564C11.6923 1.89151 12.3088 1.89143 12.5089 2.32555L15.3435 8.47691C15.425 8.65384 15.5918 8.77568 15.7851 8.79862L22.5059 9.59633C22.9802 9.65262 23.1701 10.2396 22.8195 10.5642L17.8514 15.1639C17.7085 15.2962 17.6449 15.4931 17.6828 15.6842L19.0013 22.3285C19.0944 22.7975 18.5959 23.1608 18.1791 22.9273L12.2739 19.6176C12.104 19.5225 11.8977 19.5229 11.7278 19.6181L5.82196 22.9264C5.4052 23.1599 4.90573 22.7974 4.99881 22.3285L6.31752 15.6846C6.35546 15.4935 6.29199 15.2962 6.14908 15.1639L1.18037 10.564Z"
                stroke={filled ? '#E8D07A' : '#DDDDDD'}
                fill={filled ? '#E8D07A' : 'none'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </g>
        <defs>
            <clipPath id="clip0_96_453">
                <rect width="24" height="24" fill="white" />
            </clipPath>
        </defs>
    </svg>
)

// Sparks Animation Component
const SparksAnimation = ({ show }: { show: boolean }) => {
    if (!show) return null

    const sparks = Array.from({ length: 8 }, (_, i) => {
        const angle = (i * 45) * (Math.PI / 180)
        const distance = 40 + Math.random() * 20
        const x = Math.cos(angle) * distance
        const y = Math.sin(angle) * distance
        const delay = Math.random() * 200 // Random delay in ms
        const duration = 800 + Math.random() * 400 // Random duration in ms

        return (
            <div
                key={i}
                className="absolute h-1.5 w-1.5 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 rounded-full"
                style={{
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    animation: `sparkfly-${i} ${duration}ms ease-out ${delay}ms forwards`,
                }}
            />
        )
    })

    return (
        <>
            <div className="absolute inset-0 pointer-events-none overflow-visible">
                {sparks}
            </div>
            <style>{`
                @keyframes sparkfly-0 {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                    50% { transform: translate(calc(-50% + 45px), calc(-50% + 0px)) scale(1); opacity: 1; }
                    100% { transform: translate(calc(-50% + 45px), calc(-50% + 0px)) scale(0); opacity: 0; }
                }
                @keyframes sparkfly-1 {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                    50% { transform: translate(calc(-50% + 32px), calc(-50% + 32px)) scale(1); opacity: 1; }
                    100% { transform: translate(calc(-50% + 32px), calc(-50% + 32px)) scale(0); opacity: 0; }
                }
                @keyframes sparkfly-2 {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                    50% { transform: translate(calc(-50% + 0px), calc(-50% + 45px)) scale(1); opacity: 1; }
                    100% { transform: translate(calc(-50% + 0px), calc(-50% + 45px)) scale(0); opacity: 0; }
                }
                @keyframes sparkfly-3 {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                    50% { transform: translate(calc(-50% - 32px), calc(-50% + 32px)) scale(1); opacity: 1; }
                    100% { transform: translate(calc(-50% - 32px), calc(-50% + 32px)) scale(0); opacity: 0; }
                }
                @keyframes sparkfly-4 {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                    50% { transform: translate(calc(-50% - 45px), calc(-50% + 0px)) scale(1); opacity: 1; }
                    100% { transform: translate(calc(-50% - 45px), calc(-50% + 0px)) scale(0); opacity: 0; }
                }
                @keyframes sparkfly-5 {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                    50% { transform: translate(calc(-50% - 32px), calc(-50% - 32px)) scale(1); opacity: 1; }
                    100% { transform: translate(calc(-50% - 32px), calc(-50% - 32px)) scale(0); opacity: 0; }
                }
                @keyframes sparkfly-6 {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                    50% { transform: translate(calc(-50% + 0px), calc(-50% - 45px)) scale(1); opacity: 1; }
                    100% { transform: translate(calc(-50% + 0px), calc(-50% - 45px)) scale(0); opacity: 0; }
                }
                @keyframes sparkfly-7 {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                    50% { transform: translate(calc(-50% + 32px), calc(-50% - 32px)) scale(1); opacity: 1; }
                    100% { transform: translate(calc(-50% + 32px), calc(-50% - 32px)) scale(0); opacity: 0; }
                }
            `}</style>
        </>
    )
}
import { useAddToWishlist } from '@/app/_hooks/wishlist/useAddToWishlist'
import { useRemoveFromWishlist } from '@/app/_hooks/wishlist/useRemoveFromWishlist'
import { useIsInWishlist } from '@/app/_hooks/wishlist/useIsInWishlist'
import { cn } from '@/lib/utils'

interface ProductCardProps {
    product: {
        yprodid: number
        yprodintitule: string
        yproddetailstech: string
        ydesign?: {
            ydesignnom: string
            ydesignmarque: string
        }
        yvarprod?: Array<{
            yvarprodid: number
            yvarprodprixcatalogue: number
            yvarprodprixpromotion: number | null
            xdeviseidfk: number | null
            xcouleur?: {
                xcouleurhexa: string
                xcouleurintitule: string
            }
            xtaille?: {
                xtailleid: number
                xtailleintitule: string
            }
            yvarprodmedia?: Array<{
                ymedia: {
                    ymediaurl: string
                    ymediaboolvideo: boolean
                }
            }>
        }>
    }
    viewMode: 'grid' | 'list'
    onViewDetails: () => void
}

export function ProductCard({
    product,
    viewMode,
    onViewDetails,
}: ProductCardProps) {
    const { formatPrice, currencies } = useCurrency()
    const { t } = useLanguage()
    const [imageError, setImageError] = useState(false)
    const [hoveredColor, setHoveredColor] = useState<string | null>(null)
    const [isImageHovered, setIsImageHovered] = useState(false)
    const [showSparks, setShowSparks] = useState(false)

    // Wishlist hooks
    const addToWishlistMutation = useAddToWishlist()
    const removeFromWishlistMutation = useRemoveFromWishlist()

    // Get the first variant for pricing and media
    const firstVariant = product.yvarprod?.[0]
    
    // Advanced variant selection logic to handle all combinations
    const activeVariant = (() => {
        if (!product.yvarprod || product.yvarprod.length === 0) return null;
        
        // If hovering over color, prioritize color-based selection
        if (hoveredColor) {
            return product.yvarprod.find(
                (v) => v.xcouleur?.xcouleurhexa === hoveredColor
            ) || firstVariant;
        }
        
        // Default to first variant
        return firstVariant;
    })()

    // Check if current variant is in wishlist
    const { data: isInWishlist = false } = useIsInWishlist(
        activeVariant?.yvarprodid || 0
    )

    // Get images from the active variant
    const images =
        activeVariant?.yvarprodmedia
            ?.filter((media) => media.ymedia && !media.ymedia.ymediaboolvideo)
            .map((media) => media.ymedia?.ymediaurl)
            .filter(Boolean) || []

    const firstImage = images[0]
    const secondImage = images[1]

    // Get pricing info
    const pricing = activeVariant
        ? {
              catalogPrice: activeVariant.yvarprodprixcatalogue,
              promotionPrice: activeVariant.yvarprodprixpromotion,
              productCurrency: currencies.find(
                  (c) => c.xdeviseid === activeVariant.xdeviseidfk
              ),
              formattedCatalogPrice: formatPrice(
                  activeVariant.yvarprodprixcatalogue,
                  currencies.find(
                      (c) => c.xdeviseid === activeVariant.xdeviseidfk
                  )
              ),
              formattedPromotionPrice: activeVariant.yvarprodprixpromotion
                  ? formatPrice(
                        activeVariant.yvarprodprixpromotion,
                        currencies.find(
                            (c) => c.xdeviseid === activeVariant.xdeviseidfk
                        )
                    )
                  : null,
              hasDiscount: !!activeVariant.yvarprodprixpromotion,
              discountPercentage: activeVariant.yvarprodprixpromotion
                  ? Math.round(
                        ((activeVariant.yvarprodprixcatalogue -
                            activeVariant.yvarprodprixpromotion) /
                            activeVariant.yvarprodprixcatalogue) *
                            100
                    )
                  : 0,
          }
        : null

    // Get unique colors with availability info
    const uniqueColors = product.yvarprod?.reduce(
        (acc, variant) => {
            if (variant.xcouleur?.xcouleurhexa && variant.xcouleur?.xcouleurintitule) {
                const colorHex = variant.xcouleur.xcouleurhexa
                const existingColor = acc.find((c) => c.hex === colorHex)
                
                if (!existingColor) {
                    acc.push({
                        hex: colorHex,
                        name: variant.xcouleur.xcouleurintitule,
                        hasSize: !!variant.xtaille?.xtailleid,
                        variantCount: 1
                    })
                } else {
                    existingColor.variantCount++
                    if (variant.xtaille?.xtailleid) existingColor.hasSize = true
                }
            }
            return acc
        },
        [] as Array<{ hex: string; name: string; hasSize: boolean; variantCount: number }>
    )
    
    // Get unique sizes with availability info
    const uniqueSizes = product.yvarprod?.reduce(
        (acc, variant) => {
            if (variant.xtaille?.xtailleid && variant.xtaille?.xtailleintitule) {
                const sizeId = variant.xtaille.xtailleid
                const existing = acc.find(s => s.id === sizeId)
                
                if (!existing) {
                    acc.push({
                        id: sizeId,
                        name: variant.xtaille.xtailleintitule,
                        hasColor: !!(variant.xcouleur?.xcouleurhexa),
                        variantCount: 1
                    })
                } else {
                    existing.variantCount++
                    if (variant.xcouleur?.xcouleurhexa) existing.hasColor = true
                }
            }
            return acc
        },
        [] as Array<{ id: number; name: string; hasColor: boolean; variantCount: number }>
    )

    // Handle wishlist actions
    const handleWishlistClick = () => {
        if (!activeVariant) return

        // Trigger spark animation
        setShowSparks(true)
        setTimeout(() => setShowSparks(false), 1200) // Reset after animation completes

        if (isInWishlist) {
            removeFromWishlistMutation.mutate({
                yvarprodidfk: activeVariant.yvarprodid,
            })
        } else {
            addToWishlistMutation.mutate({
                yvarprodidfk: activeVariant.yvarprodid,
            })
        }
    }

    if (viewMode === 'list') {
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
                <div className="flex gap-6">
                    {/* Image */}
                    <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                        {firstImage && !imageError ? (
                            <Image
                                src={firstImage}
                                alt={product.yprodintitule}
                                fill
                                className="object-contain p-2"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-400">
                                <ShoppingCart className="h-8 w-8" />
                            </div>
                        )}
                        {pricing?.hasDiscount && (
                            <div className="absolute top-2 left-2 rounded-md bg-gradient-to-r from-red-500 to-red-600 px-2 py-1 text-xs font-medium text-white">
                                -{pricing.discountPercentage}%
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1 pr-4">
                                {product.ydesign && (
                                    <p className="text-morpheus-gold-light mb-1 text-xs font-medium">
                                        {product.ydesign.ydesignmarque}
                                    </p>
                                )}
                                <h3 className="truncate text-lg font-semibold text-gray-900">
                                    {product.yprodintitule}
                                </h3>
                                <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                                    {product.yproddetailstech}
                                </p>

                                {/* Colors */}
                                {uniqueColors && uniqueColors.length > 0 && (
                                    <div className="mt-3 flex gap-2">
                                        {uniqueColors
                                            .slice(0, 5)
                                            .map((color, idx) => (
                                                <div
                                                    key={idx}
                                                    className="relative border-morpheus-gold-dark/40 h-6 w-6 rounded-full border-2 shadow-sm cursor-pointer transition-all duration-200 hover:scale-110"
                                                    style={{
                                                        backgroundColor: color.hex,
                                                    }}
                                                    title={`${color.name} (${color.variantCount} variant${color.variantCount > 1 ? 's' : ''})`}
                                                    onMouseEnter={() => setHoveredColor(color.hex)}
                                                    onMouseLeave={() => setHoveredColor(null)}
                                                >
                                                    {/* Small indicators for additional options */}
                                                    {color.hasSize && (
                                                        <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-morpheus-gold-light border border-white"></div>
                                                    )}
                                                </div>
                                            ))}
                                        {uniqueColors.length > 5 && (
                                            <span className="text-morpheus-gold-light/70 ml-1 self-center text-xs">
                                                +{uniqueColors.length - 5}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Sizes (if available) */}
                                {uniqueSizes && uniqueSizes.length > 0 && (
                                    <div className="mt-3">
                                        <p className="text-xs text-gray-500 mb-1">Sizes:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {uniqueSizes
                                                .slice(0, 4)
                                                .map((size, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md cursor-pointer transition-all duration-200 hover:bg-blue-200"
                                                        title={`${size.name} (${size.variantCount} variant${size.variantCount > 1 ? 's' : ''})`}
                                                    >
                                                        {size.name}
                                                        {size.variantCount > 1 && (
                                                            <span className="ml-1 text-xs text-blue-500">({size.variantCount})</span>
                                                        )}
                                                    </span>
                                                ))}
                                            {uniqueSizes.length > 4 && (
                                                <span className="text-morpheus-gold-light/70 ml-1 self-center text-xs">
                                                    +{uniqueSizes.length - 4}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Price */}
                            <div className="text-right">
                                {pricing && (
                                    <>
                                        {pricing.hasDiscount ? (
                                            <div>
                                                <p className="from-morpheus-gold-dark to-morpheus-gold-light bg-gradient-to-r bg-clip-text text-xl font-bold text-transparent">
                                                    {
                                                        pricing.formattedPromotionPrice
                                                    }
                                                </p>
                                                <p className="text-sm text-gray-400 line-through">
                                                    {
                                                        pricing.formattedCatalogPrice
                                                    }
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="from-morpheus-gold-dark to-morpheus-gold-light bg-gradient-to-r bg-clip-text text-xl font-bold text-transparent">
                                                {pricing.formattedCatalogPrice}
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 flex gap-3">
                            <button
                                onClick={onViewDetails}
                                className="from-morpheus-gold-dark to-morpheus-gold-light hover:from-morpheus-gold-light hover:to-morpheus-gold-dark flex-1 rounded-lg bg-gradient-to-r px-4 py-2 text-sm font-medium text-white shadow-md transition-all duration-300"
                            >
                                {t('shop.viewDetails')}
                            </button>
                            <button
                                onClick={handleWishlistClick}
                                disabled={
                                    addToWishlistMutation.isPending ||
                                    removeFromWishlistMutation.isPending
                                }
                                className={cn(
                                    'rounded-lg border p-2 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50',
                                    'bg-morpheus-blue-dark/40 border-morpheus-gold-dark/30 text-morpheus-gold-light hover:bg-morpheus-blue-dark/60 hover:text-white'
                                )}
                                title={
                                    isInWishlist
                                        ? t('shop.removeFromWishlist')
                                        : t('shop.addToWishlist')
                                }
                            >
                                <WishlistIcon
                                    className="h-5 w-5"
                                    filled={isInWishlist}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Always use the new minimal grid design
    return (
        <div className="group relative bg-white">
            {/* Image */}
            <div
                className="relative aspect-[3/4] cursor-pointer overflow-hidden bg-gray-100"
                onClick={onViewDetails}
                onMouseEnter={() => setIsImageHovered(true)}
                onMouseLeave={() => setIsImageHovered(false)}
            >
                {firstImage && !imageError ? (
                    <>
                        {/* First Image */}
                        <Image
                            src={firstImage}
                            alt={product.yprodintitule}
                            fill
                            className={cn(
                                'object-cover transition-all duration-500',
                                secondImage && isImageHovered
                                    ? 'scale-105 opacity-0'
                                    : 'opacity-100 group-hover:scale-105'
                            )}
                            onError={() => setImageError(true)}
                        />

                        {/* Second Image (if available) */}
                        {secondImage && (
                            <Image
                                src={secondImage}
                                alt={`${product.yprodintitule} - Image 2`}
                                fill
                                className={cn(
                                    'object-cover transition-all duration-500',
                                    isImageHovered
                                        ? 'scale-105 opacity-100'
                                        : 'scale-100 opacity-0'
                                )}
                                onError={() => setImageError(true)}
                            />
                        )}
                    </>
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                        <ShoppingCart className="h-12 w-12" />
                    </div>
                )}

                {/* Wishlist Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        handleWishlistClick()
                    }}
                    disabled={
                        addToWishlistMutation.isPending ||
                        removeFromWishlistMutation.isPending
                    }
                    className={cn(
                        'absolute top-4 right-4 z-10 rounded-full p-2 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50',
                        'text-white hover:text-yellow-300'
                    )}
                >
                    <WishlistIcon className="h-5 w-5" filled={isInWishlist} />
                    <SparksAnimation show={showSparks} />
                </button>

                {/* Quick View on Hover */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <button
                        onClick={onViewDetails}
                        className="rounded-full bg-white px-6 py-2 text-sm font-medium text-gray-900 shadow-lg transition-all duration-300 hover:bg-gray-50"
                    >
                        {t('shop.quickView')}
                    </button>
                </div>
            </div>

            {/* Product Info */}
            <div className="mt-4 text-center">
                <h3 className="line-clamp-2 text-sm font-medium text-gray-900">
                    {product.yprodintitule}
                </h3>

                {/* Price */}
                {pricing && (
                    <div className="mt-2">
                        {pricing.hasDiscount ? (
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-sm font-medium text-gray-900">
                                    {pricing.formattedPromotionPrice}
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                    {pricing.formattedCatalogPrice}
                                </span>
                            </div>
                        ) : (
                            <span className="text-sm font-medium text-gray-900">
                                {pricing.formattedCatalogPrice}
                            </span>
                        )}
                    </div>
                )}

                {/* Colors */}
                {uniqueColors && uniqueColors.length > 0 && (
                    <div className="mt-3 flex justify-center gap-1">
                        {uniqueColors
                            .slice(0, 4)
                            .map((color, idx) => (
                                <div
                                    key={idx}
                                    className="relative h-4 w-4 rounded-full border border-gray-300 shadow-sm cursor-pointer transition-all duration-200 hover:scale-125"
                                    style={{
                                        backgroundColor: color.hex,
                                    }}
                                    title={`${color.name} (${color.variantCount} variant${color.variantCount > 1 ? 's' : ''})`}
                                    onMouseEnter={() => setHoveredColor(color.hex)}
                                    onMouseLeave={() => setHoveredColor(null)}
                                >
                                    {/* Small indicators for additional options */}
                                    {color.hasSize && (
                                        <div className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-morpheus-gold-light border border-white"></div>
                                    )}
                                </div>
                            ))}
                        {uniqueColors.length > 4 && (
                            <span className="text-xs text-gray-500 self-center ml-1">
                                +{uniqueColors.length - 4}
                            </span>
                        )}
                    </div>
                )}

            </div>
        </div>
    )
}
