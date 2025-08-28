'use client'

import { useMemo, useState } from 'react'
import { ProductDetailsPage } from './product-details-page'
import { useSceneProducts } from '../_hooks/useSceneProducts'
import { useCurrency } from '@/hooks/useCurrency'
import Image from 'next/image'

interface ProductsListModalProps {
    isOpen: string | null
    onClose: () => void
    onProductDetailsChange?: (isOpen: boolean) => void
}

export default function ProductsListModal({
    isOpen,
    onClose,
    onProductDetailsChange,
}: ProductsListModalProps) {
    const infospotActionId = isOpen

    const [selectedProduct, setSelectedProduct] = useState<number | null>(null)
    const [showProductDetails, setShowProductDetails] = useState(false)

    const { data: productsData, isLoading } = useSceneProducts(infospotActionId)
    const { formatPrice, currencies } = useCurrency()

    const productsList = useMemo(() => {
        return productsData?.map((product) => {
            // Get the first variant for pricing and media
            const firstVariant = product.yvarprod?.[0]

            // Get the first picture media from the first variant
            const firstPicture = firstVariant?.yvarprodmedia?.find(
                (media) => media.ymedia && !media.ymedia.ymediaboolvideo
            )?.ymedia

            // Get product pricing info from first variant with currency conversion
            const pricing = firstVariant
                ? {
                      catalogPrice: firstVariant.yvarprodprixcatalogue,
                      promotionPrice: firstVariant.yvarprodprixpromotion,
                      // Find the product's base currency
                      productCurrency: currencies.find(
                          (c) => c.xdeviseid === firstVariant.xdeviseidfk
                      ),
                      // Format prices with proper currency conversion
                      formattedCatalogPrice: formatPrice(
                          firstVariant.yvarprodprixcatalogue,
                          currencies.find(
                              (c) => c.xdeviseid === firstVariant.xdeviseidfk
                          )
                      ),
                      formattedPromotionPrice:
                          firstVariant.yvarprodprixpromotion
                              ? formatPrice(
                                    firstVariant.yvarprodprixpromotion,
                                    currencies.find(
                                        (c) =>
                                            c.xdeviseid ===
                                            firstVariant.xdeviseidfk
                                    )
                                )
                              : null,
                  }
                : null

            return {
                id: product.yprodid,
                name: product.yprodintitule,
                description: product.yproddetailstech,
                image: firstPicture?.ymediaurl || '/logo.png',
                pricing: pricing,
            }
        })
    }, [productsData, currencies, formatPrice])

    if (!isOpen) return null
    return (
        <div className="fixed top-16 right-0 bottom-0 left-0 z-[60] bg-black/85 p-2 backdrop-blur-sm sm:p-4">
            <div className="from-morpheus-blue-dark via-morpheus-blue-light to-morpheus-blue-dark border-morpheus-gold-dark/30 relative mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-lg border-2 bg-gradient-to-br shadow-2xl shadow-black/50">
                {/* Decorative top border */}
                <div className="from-morpheus-gold-dark via-morpheus-gold-light to-morpheus-gold-dark absolute top-0 right-0 left-0 h-1 bg-gradient-to-r"></div>

                {/* Header */}
                <div className="border-morpheus-gold-dark/20 relative flex items-center justify-between border-b p-4 sm:p-6">
                    <div className="min-w-0 flex-1">
                        <h2 className="font-parisienne from-morpheus-gold-dark to-morpheus-gold-light mb-1 bg-gradient-to-r bg-clip-text text-xl font-bold text-transparent sm:mb-2 sm:text-2xl lg:text-3xl">
                            Catalogue des Produits
                        </h2>
                        <p className="hidden text-xs tracking-wide text-gray-300 sm:block sm:text-sm">
                            Parcourez notre collection de produits exclusifs
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="group hover:text-morpheus-gold-light relative flex-shrink-0 p-2 text-white/80 transition-all duration-300 hover:rotate-90"
                    >
                        <div className="bg-morpheus-gold-light/20 absolute inset-0 scale-0 rounded-full transition-transform duration-300 group-hover:scale-100"></div>
                        <svg
                            className="relative h-6 w-6 sm:h-8 sm:w-8"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="custom-scrollbar flex-1 overflow-y-auto p-3 sm:p-6">
                    {isLoading ? (
                        /* Loading State */
                        <div className="flex flex-col items-center justify-center space-y-4 py-12">
                            <div className="border-morpheus-gold-dark border-t-morpheus-gold-light h-16 w-16 animate-spin rounded-full border-4"></div>
                            <div className="text-center">
                                <h3 className="mb-2 text-lg font-semibold text-white sm:text-xl">
                                    Chargement des produits...
                                </h3>
                                <p className="text-sm text-gray-300 sm:text-base">
                                    Récupération des produits liés à cette zone
                                    d&apos;information
                                </p>
                            </div>
                        </div>
                    ) : productsList && productsList.length > 0 ? (
                        /* Product Cards - Simplified Layout */
                        <div className="mb-6 space-y-3 sm:space-y-4">
                            {productsList?.map((product) => (
                                <div
                                    key={product.id}
                                    className="group border-morpheus-gold-dark/30 from-morpheus-blue-dark/50 to-morpheus-blue-light/30 hover:border-morpheus-gold-light/60 hover:shadow-morpheus-gold-light/20 relative overflow-hidden rounded-lg border-2 bg-gradient-to-r backdrop-blur-sm transition-all duration-300 hover:shadow-xl"
                                >
                                    {/* Hover glow effect */}
                                    <div className="from-morpheus-gold-light/0 via-morpheus-gold-light/5 to-morpheus-gold-light/0 absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

                                    <div className="relative flex flex-col items-center space-y-4 p-4 sm:flex-row sm:space-y-0 sm:space-x-6 sm:p-6">
                                        {/* Product Image */}
                                        <div className="border-morpheus-gold-dark/20 group-hover:border-morpheus-gold-light/40 relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors duration-300 sm:h-32 sm:w-32 lg:h-36 lg:w-36">
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/95 to-white/90"></div>
                                            <Image
                                                src={product.image}
                                                fill
                                                className="relative object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                                                alt={product.name}
                                            />
                                        </div>

                                        {/* Product Information */}
                                        <div className="min-w-0 flex-1 text-center sm:text-left">
                                            <h3 className="group-hover:text-morpheus-gold-light mb-2 text-lg font-bold text-white transition-colors duration-300 sm:mb-3 sm:text-xl lg:text-2xl">
                                                {product.name}
                                            </h3>

                                            <p className="mb-3 line-clamp-2 text-xs text-gray-300 sm:mb-4 sm:text-sm">
                                                {product.description ||
                                                    'Découvrez ce produit exceptionnel dans notre collection exclusive.'}
                                            </p>

                                            {/* Pricing Information */}
                                            {product.pricing && (
                                                <div className="mb-3 sm:mb-4">
                                                    <div className="flex items-center justify-center gap-2 text-sm sm:justify-start">
                                                        {product.pricing
                                                            .formattedPromotionPrice ? (
                                                            <>
                                                                <span className="text-morpheus-gold-light font-bold">
                                                                    {
                                                                        product
                                                                            .pricing
                                                                            .formattedPromotionPrice
                                                                    }
                                                                </span>
                                                                <span className="text-xs text-gray-400 line-through">
                                                                    {
                                                                        product
                                                                            .pricing
                                                                            .formattedCatalogPrice
                                                                    }
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="text-morpheus-gold-light font-bold">
                                                                {
                                                                    product
                                                                        .pricing
                                                                        .formattedCatalogPrice
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* View Button */}
                                        <div className="w-full flex-shrink-0 sm:w-auto">
                                            <button
                                                onClick={() => {
                                                    setSelectedProduct(
                                                        product.id
                                                    )
                                                    setShowProductDetails(true)
                                                    onProductDetailsChange?.(
                                                        true
                                                    )
                                                }}
                                                className="from-morpheus-gold-dark to-morpheus-gold-light hover:shadow-morpheus-gold-light/30 group/btn relative w-full overflow-hidden rounded bg-gradient-to-r px-4 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 sm:w-auto sm:px-6 sm:py-4 lg:px-8"
                                            >
                                                <span className="relative z-10 text-sm sm:text-base">
                                                    Voir
                                                </span>
                                                <div className="from-morpheus-gold-light to-morpheus-gold-dark absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100"></div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Bottom accent line */}
                                    <div className="via-morpheus-gold-light absolute right-0 bottom-0 left-0 h-0.5 scale-x-0 transform bg-gradient-to-r from-transparent to-transparent transition-transform duration-500 group-hover:scale-x-100"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* No Products State */
                        <div className="flex flex-col items-center justify-center space-y-4 py-12">
                            <div className="mb-4 text-6xl">🏪</div>
                            <div className="text-center">
                                <h3 className="mb-2 text-lg font-semibold text-white sm:text-xl">
                                    Aucun produit associé
                                </h3>
                                <p className="text-sm text-gray-300 sm:text-base">
                                    Aucun produit n&apos;est actuellement lié à
                                    cette zone d&apos;information
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Product Details Modal */}
            {showProductDetails && selectedProduct && productsData && (
                <ProductDetailsPage
                    productData={
                        productsData.find((p) => p.yprodid === selectedProduct)!
                    }
                    onClose={() => {
                        setShowProductDetails(false)
                        onProductDetailsChange?.(false)
                    }}
                />
            )}
        </div>
    )
}
