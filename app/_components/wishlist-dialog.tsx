'use client'

import { useLanguage } from '@/hooks/useLanguage'
import { useCurrency } from '@/hooks/useCurrency'
import { useWishlist } from '@/app/_hooks/wishlist/useWishlist'
import { useRemoveFromWishlist } from '@/app/_hooks/wishlist/useRemoveFromWishlist'
import { useAddToCart } from '@/app/_hooks/cart/useAddToCart'
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
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'

interface WishlistDialogProps {
    isOpen: boolean
    onClose: () => void
}

export function WishlistDialog({ isOpen, onClose }: WishlistDialogProps) {
    const { t } = useLanguage()
    const { data: wishlistItems = [], isLoading } = useWishlist()
    const removeFromWishlistMutation = useRemoveFromWishlist()
    const addToCartMutation = useAddToCart()
    const { formatPrice, currencies } = useCurrency()

    const handleRemoveFromWishlist = (ywishlistid: number) => {
        removeFromWishlistMutation.mutate({ ywishlistid })
    }

    const handleMoveToCart = (item: any) => {
        if (!item.yvarprod) return

        // Add to cart first
        addToCartMutation.mutate(
            {
                yvarprodidfk: item.yvarprod.yvarprodid,
                ypanierqte: 1,
            },
            {
                onSuccess: () => {
                    // Remove from wishlist after successful cart addition
                    removeFromWishlistMutation.mutate({
                        ywishlistid: item.ywishlistid,
                    })
                },
            }
        )
    }

    const handleMoveAllToCart = async () => {
        if (wishlistItems.length === 0) return

        // Process items sequentially to avoid race conditions
        for (const item of wishlistItems) {
            if (!item.yvarprod) continue

            try {
                // Add to cart first
                await addToCartMutation.mutateAsync({
                    yvarprodidfk: item.yvarprod.yvarprodid,
                    ypanierqte: 1,
                })

                // Then remove from wishlist
                await removeFromWishlistMutation.mutateAsync({
                    ywishlistid: item.ywishlistid,
                })
            } catch (error) {
                console.error(
                    `Failed to move item ${item.ywishlistid} to cart:`,
                    error
                )
                // Continue with other items even if one fails
            }
        }
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

    return (
        <Credenza open={isOpen} onOpenChange={onClose}>
            <CredenzaContent className="max-h-[80vh] max-w-2xl border border-gray-200 bg-white shadow-2xl">
                <CredenzaHeader className="border-b border-gray-100 pb-4">
                    <CredenzaTitle className="flex items-center gap-3 text-[#053340]">
                        <div className="rounded-lg bg-gray-50 p-2">
                            <Heart className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="font-recia text-2xl font-extrabold">
                                {t('wishlist.title') || 'Wishlist'}
                            </span>
                            {wishlistItems.length > 0 && (
                                <span className="font-supreme rounded-full bg-red-500 px-3 py-1 text-sm font-medium text-white">
                                    {wishlistItems.length}
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
                    ) : wishlistItems.length === 0 ? (
                        <div className="py-12 text-center">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 p-4">
                                <Heart className="h-10 w-10 text-red-400" />
                            </div>
                            <h3 className="font-recia mb-3 text-xl font-extrabold text-[#053340]">
                                {t('wishlist.empty') ||
                                    'Your wishlist is empty'}
                            </h3>
                            <p className="font-supreme text-lg text-gray-600">
                                {t('wishlist.emptyMessage') ||
                                    'Save items you love for later'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {wishlistItems.map((item) => (
                                <div
                                    key={item.ywishlistid}
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
                                                <Heart className="h-6 w-6" />
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

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                handleMoveToCart(item)
                                            }
                                            disabled={
                                                addToCartMutation.isPending ||
                                                removeFromWishlistMutation.isPending
                                            }
                                            className="flex items-center gap-1 border-gray-300 bg-white text-[#053340] hover:border-[#053340] hover:bg-gray-100"
                                        >
                                            <ShoppingCart className="h-3 w-3" />
                                            {t('wishlist.addToCart') ||
                                                'Add to Cart'}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleRemoveFromWishlist(
                                                    item.ywishlistid
                                                )
                                            }
                                            disabled={
                                                removeFromWishlistMutation.isPending
                                            }
                                            className="p-2 text-red-500 hover:bg-red-50 hover:text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CredenzaBody>

                {wishlistItems.length > 0 && (
                    <CredenzaFooter className="flex gap-3 border-t border-gray-100 bg-transparent pt-6">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="font-supreme flex-1 border-gray-300 bg-white font-medium text-[#053340] hover:border-[#053340] hover:bg-gray-50"
                        >
                            {t('wishlist.continueShopping') ||
                                'Continue Shopping'}
                        </Button>
                        <Button
                            onClick={() => handleMoveAllToCart()}
                            disabled={
                                addToCartMutation.isPending ||
                                removeFromWishlistMutation.isPending
                            }
                            className="font-supreme flex-1 bg-[#053340] font-semibold text-white shadow-lg transition-all hover:bg-[#053340]/90 hover:shadow-xl"
                        >
                            {t('wishlist.moveAllToCart') || 'Move All to Cart'}
                        </Button>
                    </CredenzaFooter>
                )}
            </CredenzaContent>
        </Credenza>
    )
}
