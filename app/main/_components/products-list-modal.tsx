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
        <div className="fixed top-16 right-0 bottom-0 left-0 z-[60] bg-black/50 p-2 backdrop-blur-sm sm:p-4">
            <div className="relative mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl">
                {/* Header */}
                <div className="relative flex items-center justify-between border-b border-gray-200 p-4 sm:p-6">
                    <div className="min-w-0 flex-1">
                        <h2 className="font-recia mb-1 text-xl font-extrabold text-[#053340] sm:mb-2 sm:text-2xl lg:text-3xl">
                            Catalogue des Produits
                        </h2>
                        <p className="font-supreme hidden text-xs tracking-wide text-gray-600 sm:block sm:text-sm">
                            Parcourez notre collection de produits exclusifs
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="group relative flex-shrink-0 p-2 text-gray-500 transition-all duration-300 hover:rotate-90 hover:text-[#053340]"
                    >
                        <div className="absolute inset-0 scale-0 rounded-full bg-gray-100 transition-transform duration-300 group-hover:scale-100"></div>
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
                <div className="custom-scrollbar flex-1 overflow-y-auto bg-gray-50 p-3 sm:p-6">
                    {isLoading ? (
                        /* Loading State */
                        <div className="flex flex-col items-center justify-center space-y-4 py-12">
                            <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-[#053340]"></div>
                            <div className="text-center">
                                <h3 className="font-recia mb-2 text-lg font-semibold text-[#053340] sm:text-xl">
                                    Chargement des produits...
                                </h3>
                                <p className="font-supreme text-sm text-gray-600 sm:text-base">
                                    Récupération des produits liés à cette zone
                                    d&apos;information
                                </p>
                            </div>
                        </div>
                    ) : productsList && productsList.length > 0 ? (
                        /* Product Cards - Clean Layout */
                        <div className="mb-6 space-y-3 sm:space-y-4">
                            {productsList?.map((product) => (
                                <div
                                    key={product.id}
                                    className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md"
                                >
                                    <div className="relative flex flex-col items-center space-y-4 p-4 sm:flex-row sm:space-y-0 sm:space-x-6 sm:p-6">
                                        {/* Product Image */}
                                        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 transition-colors duration-300 sm:h-32 sm:w-32 lg:h-36 lg:w-36">
                                            <Image
                                                src={product.image}
                                                fill
                                                className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                                                alt={product.name}
                                            />
                                        </div>

                                        {/* Product Information */}
                                        <div className="min-w-0 flex-1 text-center sm:text-left">
                                            <h3 className="font-recia mb-2 text-lg font-bold text-[#053340] transition-colors duration-300 sm:mb-3 sm:text-xl lg:text-2xl">
                                                {product.name}
                                            </h3>

                                            <p className="font-supreme mb-3 line-clamp-2 text-xs text-gray-600 sm:mb-4 sm:text-sm">
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
                                                                <span className="font-bold text-[#053340]">
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
                                                            <span className="font-bold text-[#053340]">
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
                                                className="font-supreme group/btn relative w-full overflow-hidden rounded-lg bg-[#053340] px-4 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:bg-[#053340]/90 hover:shadow-xl sm:w-auto sm:px-6 sm:py-4 lg:px-8"
                                            >
                                                <span className="relative z-10 text-sm sm:text-base">
                                                    Voir
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* No Products State */
                        <div className="flex flex-col items-center justify-center space-y-4 py-12">
                            <div className="mb-4 text-6xl">🏪</div>
                            <div className="text-center">
                                <h3 className="font-recia mb-2 text-lg font-semibold text-[#053340] sm:text-xl">
                                    Aucun produit associé
                                </h3>
                                <p className="font-supreme text-sm text-gray-600 sm:text-base">
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
