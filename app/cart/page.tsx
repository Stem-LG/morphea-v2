'use client'

import { useCart } from '@/app/_hooks/cart/useCart'
import { useUpdateCart } from '@/app/_hooks/cart/useUpdateCart'
import { useDeleteFromCart } from '@/app/_hooks/cart/useDeleteFromCart'
import { useLanguage } from '@/hooks/useLanguage'
import { useCurrency } from '@/hooks/useCurrency'
import { useDeliveryFee } from '@/hooks/use-delivery-fee'
import Link from 'next/link'

export default function CartPage() {
    const { data: cart = [], isLoading } = useCart()
    const updateCartMutation = useUpdateCart()
    const deleteFromCartMutation = useDeleteFromCart()
    const { t } = useLanguage()
    const { formatPrice, currencies } = useCurrency()
    const { data: deliveryFee = 10 } = useDeliveryFee()

    const totalItems = cart.reduce((sum, item) => sum + item.ypanierqte, 0)
    const { convertPrice } = useCurrency()
    const totalPrice = cart.reduce((sum, item) => {
        if (!item.yvarprod) return sum

        const productCurrency = currencies.find(
            (c) => c.xdeviseid === item.yvarprod?.xdeviseidfk
        )
        const price =
            item.yvarprod.yvarprodprixpromotion ||
            item.yvarprod.yvarprodprixcatalogue ||
            0
        const convertedPrice = convertPrice(price, productCurrency)

        return sum + convertedPrice * item.ypanierqte
    }, 0)

    // Helper function to get formatted price for an item
    const getFormattedItemPrice = (item: any) => {
        if (!item.yvarprod) return '$0.00'

        const productCurrency = currencies.find(
            (c) => c.xdeviseid === item.yvarprod?.xdeviseidfk
        )
        const price =
            item.yvarprod.yvarprodprixpromotion ||
            item.yvarprod.yvarprodprixcatalogue ||
            0

        return formatPrice(price, productCurrency)
    }

    // Helper function to get formatted original price for an item
    const getFormattedOriginalPrice = (item: any) => {
        if (
            !item.yvarprod?.yvarprodprixpromotion ||
            !item.yvarprod?.yvarprodprixcatalogue
        )
            return null

        const productCurrency = currencies.find(
            (c) => c.xdeviseid === item.yvarprod?.xdeviseidfk
        )
        return formatPrice(item.yvarprod.yvarprodprixcatalogue, productCurrency)
    }

    // Helper function to get formatted item total
    const getFormattedItemTotal = (item: any) => {
        if (!item.yvarprod) return '$0.00'

        const productCurrency = currencies.find(
            (c) => c.xdeviseid === item.yvarprod?.xdeviseidfk
        )
        const price =
            item.yvarprod.yvarprodprixpromotion ||
            item.yvarprod.yvarprodprixcatalogue ||
            0
        const convertedPrice = convertPrice(price, productCurrency)
        const total = convertedPrice * item.ypanierqte

        return formatPrice(total)
    }

    const handleQuantityChange = (itemId: number, newQuantity: number) => {
        if (newQuantity < 1) {
            deleteFromCartMutation.mutate({ ypanierid: itemId })
        } else {
            updateCartMutation.mutate({
                ypanierid: itemId,
                ypanierqte: newQuantity,
            })
        }
    }

    const handleRemoveItem = (itemId: number) => {
        deleteFromCartMutation.mutate({ ypanierid: itemId })
    }

    if (isLoading) {
        return (
            <div className="from-morpheus-blue-dark via-morpheus-blue-light to-morpheus-blue-dark min-h-screen bg-gradient-to-br">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex min-h-[400px] items-center justify-center">
                        <div className="border-morpheus-gold-dark border-t-morpheus-gold-light h-12 w-12 animate-spin rounded-full border-4"></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="from-morpheus-blue-dark via-morpheus-blue-light to-morpheus-blue-dark min-h-screen bg-gradient-to-br">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="font-parisienne from-morpheus-gold-dark to-morpheus-gold-light mb-4 bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent">
                        {t('cart.title')}
                    </h1>
                    <p className="text-gray-300">
                        {totalItems}{' '}
                        {totalItems === 1
                            ? t('cart.oneItem')
                            : t('cart.multipleItems')}{' '}
                        {t('cart.inYourCart')}
                    </p>
                </div>

                {cart.length === 0 ? (
                    /* Empty Cart */
                    <div className="py-16 text-center">
                        <div className="from-morpheus-gold-dark to-morpheus-gold-light mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r">
                            <svg
                                className="h-12 w-12 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                        </div>
                        <h2 className="mb-4 text-2xl font-semibold text-white">
                            {t('cart.empty')}
                        </h2>
                        <p className="mb-8 text-gray-300">
                            {t('cart.emptyDescription')}
                        </p>
                        <Link
                            href="/main"
                            className="from-morpheus-gold-dark to-morpheus-gold-light hover:from-morpheus-gold-light hover:to-morpheus-gold-dark inline-block bg-gradient-to-r px-8 py-3 font-semibold text-white transition-all duration-300"
                        >
                            {t('cart.continueShopping')}
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Cart Items */}
                        <div className="space-y-4 lg:col-span-2">
                            {cart.map((item) => (
                                <div
                                    key={item.ypanierid}
                                    className="from-morpheus-blue-dark/60 to-morpheus-blue-light/40 border-morpheus-gold-dark/30 border bg-gradient-to-br p-6 backdrop-blur-sm"
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Product Image */}
                                        <div className="from-morpheus-gold-dark/20 to-morpheus-gold-light/20 border-morpheus-gold-dark/40 flex h-20 w-20 flex-shrink-0 items-center justify-center border bg-gradient-to-br">
                                            {/* Note: No image URL available in current schema */}
                                            {false ? (
                                                <img
                                                    src=""
                                                    alt={
                                                        item.yvarprod?.yprod
                                                            ?.yprodintitule ||
                                                        'Product'
                                                    }
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <svg
                                                    className="text-morpheus-gold-light h-8 w-8"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                    />
                                                </svg>
                                            )}
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-1">
                                            <h3 className="mb-1 text-lg font-semibold text-white">
                                                {item.yvarprod
                                                    ?.yvarprodintitule ||
                                                    t('cart.unknownProduct')}
                                            </h3>
                                            <div className="flex items-center gap-4">
                                                <span className="text-morpheus-gold-light font-semibold">
                                                    {getFormattedItemPrice(
                                                        item
                                                    )}
                                                </span>
                                                {getFormattedOriginalPrice(
                                                    item
                                                ) && (
                                                    <span className="text-sm text-gray-300 line-through">
                                                        {getFormattedOriginalPrice(
                                                            item
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mt-1 flex items-center gap-2 text-sm text-gray-300">
                                                {item.yvarprod?.xcouleur && (
                                                    <span className="flex items-center gap-1">
                                                        <div
                                                            className="h-3 w-3 rounded-full border"
                                                            style={{
                                                                backgroundColor:
                                                                    item
                                                                        .yvarprod
                                                                        .xcouleur
                                                                        .xcouleurhexa,
                                                            }}
                                                        />
                                                        {
                                                            item.yvarprod
                                                                .xcouleur
                                                                .xcouleurintitule
                                                        }
                                                    </span>
                                                )}
                                                {item.yvarprod?.xtaille && (
                                                    <span>
                                                        •{' '}
                                                        {
                                                            item.yvarprod
                                                                .xtaille
                                                                .xtailleintitule
                                                        }
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() =>
                                                    handleQuantityChange(
                                                        item.ypanierid,
                                                        item.ypanierqte - 1
                                                    )
                                                }
                                                disabled={
                                                    updateCartMutation.isPending ||
                                                    deleteFromCartMutation.isPending ||
                                                    item.ypanierqte <= 1
                                                }
                                                className="from-morpheus-gold-dark/20 to-morpheus-gold-light/20 border-morpheus-gold-dark/40 text-morpheus-gold-light hover:from-morpheus-gold-dark/30 hover:to-morpheus-gold-light/30 flex h-8 w-8 items-center justify-center rounded border bg-gradient-to-r transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                -
                                            </button>
                                            <span className="min-w-[2rem] text-center font-semibold text-white">
                                                {updateCartMutation.isPending ? (
                                                    <div className="border-morpheus-gold-dark border-t-morpheus-gold-light mx-auto h-4 w-4 animate-spin rounded-full border-2"></div>
                                                ) : (
                                                    item.ypanierqte
                                                )}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    handleQuantityChange(
                                                        item.ypanierid,
                                                        item.ypanierqte + 1
                                                    )
                                                }
                                                disabled={
                                                    updateCartMutation.isPending ||
                                                    deleteFromCartMutation.isPending
                                                }
                                                className="from-morpheus-gold-dark/20 to-morpheus-gold-light/20 border-morpheus-gold-dark/40 text-morpheus-gold-light hover:from-morpheus-gold-dark/30 hover:to-morpheus-gold-light/30 flex h-8 w-8 items-center justify-center rounded border bg-gradient-to-r transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                +
                                            </button>
                                        </div>

                                        {/* Remove Button */}
                                        <button
                                            onClick={() =>
                                                handleRemoveItem(item.ypanierid)
                                            }
                                            disabled={
                                                deleteFromCartMutation.isPending
                                            }
                                            className="text-red-400 transition-colors duration-300 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                                            title={t('cart.removeFromCart')}
                                        >
                                            <svg
                                                className="h-5 w-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Item Total */}
                                    <div className="border-morpheus-gold-dark/30 mt-4 border-t pt-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-300">
                                                {t('cart.itemTotal')}
                                            </span>
                                            <span className="text-morpheus-gold-light font-semibold">
                                                {getFormattedItemTotal(item)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="from-morpheus-blue-dark/60 to-morpheus-blue-light/40 border-morpheus-gold-dark/30 sticky top-4 border bg-gradient-to-br p-6 backdrop-blur-sm">
                                <h2 className="mb-6 text-xl font-semibold text-white">
                                    {t('cart.orderSummary')}
                                </h2>

                                <div className="mb-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-300">
                                            {t('cart.items')} ({totalItems}):
                                        </span>
                                        <span className="text-white">
                                            {formatPrice(totalPrice)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-300">
                                            {t('cart.shipping')}:
                                        </span>
                                        <span className="text-white">
                                            {formatPrice(deliveryFee)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-300">
                                            {t('cart.tax')}:
                                        </span>
                                        <span className="text-white">
                                            {t('cart.calculatedAtCheckout')}
                                        </span>
                                    </div>
                                    <div className="border-morpheus-gold-dark/30 border-t pt-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-semibold text-white">
                                                {t('cart.total')}
                                            </span>
                                            <span className="text-morpheus-gold-light text-xl font-bold">
                                                {formatPrice(totalPrice)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button className="from-morpheus-gold-dark to-morpheus-gold-light hover:from-morpheus-gold-light hover:to-morpheus-gold-dark mb-4 w-full bg-gradient-to-r px-6 py-3 font-semibold text-white transition-all duration-300">
                                    {t('cart.proceedToCheckout')}
                                </button>

                                <Link
                                    href="/main"
                                    className="from-morpheus-gold-dark/20 to-morpheus-gold-light/20 border-morpheus-gold-dark/40 text-morpheus-gold-light hover:from-morpheus-gold-dark/30 hover:to-morpheus-gold-light/30 block w-full border bg-gradient-to-r px-6 py-3 text-center font-medium transition-all duration-300"
                                >
                                    {t('cart.continueShopping')}
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
