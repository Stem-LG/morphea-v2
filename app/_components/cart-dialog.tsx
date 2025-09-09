'use client'

import { useLanguage } from '@/hooks/useLanguage'
import { useCurrency } from '@/hooks/useCurrency'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/app/_hooks/cart/useCart'
import { useUpdateCart } from '@/app/_hooks/cart/useUpdateCart'
import { useDeleteFromCart } from '@/app/_hooks/cart/useDeleteFromCart'
import {
    Credenza,
    CredenzaContent,
    CredenzaHeader,
    CredenzaTitle,
    CredenzaBody,
    CredenzaFooter,
} from '@/components/ui/credenza'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { CartIcon } from '../_icons/cart_icon'

interface CartDialogProps {
    isOpen: boolean
    onClose: () => void
}

export function CartDialog({ isOpen, onClose }: CartDialogProps) {
    const { t } = useLanguage()
    const router = useRouter()
    const { data: currentUser } = useAuth()
    const { data: cartItems = [], isLoading } = useCart()
    const updateCartMutation = useUpdateCart()
    const deleteFromCartMutation = useDeleteFromCart()
    const { formatPrice, currencies, convertPrice } = useCurrency()

    const handleQuantityChange = (ypanierid: number, newQuantity: number) => {
        if (newQuantity <= 0) {
            deleteFromCartMutation.mutate({ ypanierid })
        } else {
            updateCartMutation.mutate({ ypanierid, ypanierqte: newQuantity })
        }
    }

    const handleRemoveItem = (ypanierid: number) => {
        deleteFromCartMutation.mutate({ ypanierid })
    }

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            if (!item.yvarprod) return total

            // Find the product's base currency
            const productCurrency = currencies.find(
                (c) => c.xdeviseid === item.yvarprod?.xdeviseidfk
            )
            const price =
                item.yvarprod.yvarprodprixpromotion ||
                item.yvarprod.yvarprodprixcatalogue ||
                0

            // Convert price from product currency to current currency
            const convertedPrice = convertPrice(price, productCurrency)

            return total + convertedPrice * item.ypanierqte
        }, 0)
    }

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

    const handleCheckout = () => {
        // Check if user is anonymous
        if (!currentUser || currentUser.is_anonymous) {
            // Redirect to login page for anonymous users
            onClose()
            router.push('/auth/login')
            return
        }

        // Navigate to order page for authenticated users
        onClose()
        router.push('/order')
    }

    return (
        <Credenza open={isOpen} onOpenChange={onClose}>
            <CredenzaContent className="max-h-[80vh] max-w-2xl border border-gray-200 bg-white shadow-2xl">
                <CredenzaHeader className="border-b border-gray-100 pb-4">
                    <CredenzaTitle className="flex items-center gap-3 text-[#053340]">
                        <div className="rounded-lg bg-gray-50 p-2">
                            <CartIcon className="h-5 w-5 fill-[#053340]" />
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="font-recia text-2xl font-extrabold">
                                {t('cart.title') || 'Shopping Cart'}
                            </span>
                            {cartItems.length > 0 && (
                                <span className="font-supreme rounded-full bg-[#053340] px-3 py-1 text-sm font-medium text-white">
                                    {cartItems.length}
                                </span>
                            )}
                        </div>
                    </CredenzaTitle>
                </CredenzaHeader>

                <CredenzaBody className="max-h-96 overflow-y-auto bg-transparent pt-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#053340] border-t-transparent"></div>
                        </div>
                    ) : cartItems.length === 0 ? (
                        <div className="py-12 text-center">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 p-4">
                                <CartIcon className="h-10 w-10 fill-[#053340]" />
                            </div>
                            <h3 className="font-recia mb-3 text-xl font-extrabold text-[#053340]">
                                {t('cart.empty') || 'Your cart is empty'}
                            </h3>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cartItems.map((item) => (
                                <div
                                    key={item.ypanierid}
                                    className="flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition-colors hover:bg-gray-50"
                                >
                                    {/* Product Image */}
                                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                                        {(item.yvarprod as any)
                                            ?.yvarprodmedia?.[0]?.ymedia
                                            ?.ymediaurl ? (
                                            <Image
                                                src={
                                                    (item.yvarprod as any)
                                                        .yvarprodmedia[0].ymedia
                                                        .ymediaurl
                                                }
                                                alt={
                                                    item.yvarprod
                                                        ?.yvarprodintitule ||
                                                    'Product'
                                                }
                                                width={64}
                                                height={64}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-gray-400">
                                                <CartIcon className="h-6 w-6 fill-[#053340]" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Details */}
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-supreme truncate text-lg font-semibold text-[#053340]">
                                            {item.yvarprod?.yvarprodintitule ||
                                                'Unknown Product'}
                                        </h4>
                                        <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                                            {item.yvarprod?.xcouleur && (
                                                <span className="flex items-center gap-1">
                                                    <div
                                                        className="h-3 w-3 rounded-full border"
                                                        style={{
                                                            backgroundColor:
                                                                item.yvarprod
                                                                    .xcouleur
                                                                    .xcouleurhexa,
                                                        }}
                                                    />
                                                    {
                                                        item.yvarprod.xcouleur
                                                            .xcouleurintitule
                                                    }
                                                </span>
                                            )}
                                            {item.yvarprod?.xtaille && (
                                                <span>
                                                    •{' '}
                                                    {
                                                        item.yvarprod.xtaille
                                                            .xtailleintitule
                                                    }
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="font-supreme text-lg font-bold text-[#053340]">
                                                    {getFormattedItemPrice(
                                                        item
                                                    )}
                                                </span>
                                                {getFormattedOriginalPrice(
                                                    item
                                                ) && (
                                                    <span className="text-sm text-gray-400 line-through">
                                                        {getFormattedOriginalPrice(
                                                            item
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                handleQuantityChange(
                                                    item.ypanierid,
                                                    item.ypanierqte - 1
                                                )
                                            }
                                            disabled={
                                                updateCartMutation.isPending ||
                                                deleteFromCartMutation.isPending
                                            }
                                            className="h-8 w-8 border-gray-300 bg-white p-0 text-[#053340] hover:border-[#053340] hover:bg-gray-100"
                                        >
                                            <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="font-supreme w-8 text-center font-semibold text-[#053340]">
                                            {item.ypanierqte}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
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
                                            className="h-8 w-8 border-gray-300 bg-white p-0 text-[#053340] hover:border-[#053340] hover:bg-gray-100"
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>

                                    {/* Remove Button */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            handleRemoveItem(item.ypanierid)
                                        }
                                        disabled={
                                            deleteFromCartMutation.isPending
                                        }
                                        className="p-2 text-red-500 hover:bg-red-50 hover:text-red-600"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CredenzaBody>

                {cartItems.length > 0 && (
                    <CredenzaFooter className="flex flex-col gap-4 border-t border-gray-100 bg-transparent pt-6">
                        <div className="flex flex-1 items-center gap-2">
                            <span className="font-supreme text-lg font-semibold text-gray-600">
                                {t('cart.total') || 'Total'}
                            </span>
                            <span className="font-supreme text-lg font-extrabold text-[#053340]">
                                {formatPrice(calculateTotal())}
                            </span>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="font-supreme flex-1 border-gray-300 bg-white font-medium text-[#053340] hover:border-[#053340] hover:bg-gray-50"
                            >
                                {t('cart.continueShopping') ||
                                    'Continue Shopping'}
                            </Button>
                            <Button
                                onClick={handleCheckout}
                                className="font-supreme flex-1 bg-[#053340] font-semibold text-white shadow-lg transition-all hover:bg-[#053340]/90 hover:shadow-xl"
                            >
                                {t('cart.checkout') || 'Proceed to Payment'}
                            </Button>
                        </div>
                    </CredenzaFooter>
                )}
            </CredenzaContent>
        </Credenza>
    )
}
