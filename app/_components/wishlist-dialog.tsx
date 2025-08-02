"use client";

import { useLanguage } from "@/hooks/useLanguage";
import { useWishlist } from "@/app/_hooks/wishlist/useWishlist";
import { useRemoveFromWishlist } from "@/app/_hooks/wishlist/useRemoveFromWishlist";
import { useAddToCart } from "@/app/_hooks/cart/useAddToCart";
import {
    Credenza,
    CredenzaContent,
    CredenzaHeader,
    CredenzaTitle,
    CredenzaBody,
    CredenzaFooter,
} from "@/components/ui/credenza";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";

interface WishlistDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function WishlistDialog({ isOpen, onClose }: WishlistDialogProps) {
    const { t } = useLanguage();
    const { data: wishlistItems = [], isLoading } = useWishlist();
    const removeFromWishlistMutation = useRemoveFromWishlist();
    const addToCartMutation = useAddToCart();

    const handleRemoveFromWishlist = (ywishlistid: number) => {
        removeFromWishlistMutation.mutate({ ywishlistid });
    };

    const handleAddToCart = (item: any) => {
        if (!item.yvarprod) return;
        
        addToCartMutation.mutate({
            yvarprodidfk: item.yvarprod.yvarprodid,
            ypanierqte: 1,
        });
    };

    const handleMoveToCart = (item: any) => {
        if (!item.yvarprod) return;
        
        // Add to cart first
        addToCartMutation.mutate({
            yvarprodidfk: item.yvarprod.yvarprodid,
            ypanierqte: 1,
        }, {
            onSuccess: () => {
                // Remove from wishlist after successful cart addition
                removeFromWishlistMutation.mutate({ ywishlistid: item.ywishlistid });
            }
        });
    };

    return (
        <Credenza open={isOpen} onOpenChange={onClose}>
            <CredenzaContent className="max-w-2xl max-h-[80vh] bg-gradient-to-br from-morpheus-blue-dark via-morpheus-blue-dark/95 to-morpheus-blue-light/90 backdrop-blur-md border border-morpheus-gold-dark/20">
                <CredenzaHeader>
                    <CredenzaTitle className="flex items-center gap-2 text-white">
                        <Heart className="w-5 h-5 text-red-400" />
                        {t("wishlist.title") || "Wishlist"}
                        {wishlistItems.length > 0 && (
                            <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full">
                                {wishlistItems.length}
                            </span>
                        )}
                    </CredenzaTitle>
                </CredenzaHeader>

                <CredenzaBody className="max-h-96 overflow-y-auto bg-transparent">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="w-8 h-8 border-2 border-red-400 border-t-transparent animate-spin rounded-full"></div>
                        </div>
                    ) : wishlistItems.length === 0 ? (
                        <div className="text-center py-8">
                            <Heart className="w-16 h-16 mx-auto text-red-400/50 mb-4" />
                            <h3 className="text-lg font-medium text-white mb-2">
                                {t("wishlist.empty") || "Your wishlist is empty"}
                            </h3>
                            <p className="text-gray-300">
                                {t("wishlist.emptyMessage") || "Save items you love for later"}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {wishlistItems.map((item) => (
                                <div
                                    key={item.ywishlistid}
                                    className="flex items-center gap-4 p-4 border border-morpheus-gold-dark/20 rounded-lg bg-white/5 backdrop-blur-sm"
                                >
                                    {/* Product Image */}
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        {(item.yvarprod as any)?.yvarprodmedia?.[0]?.ymedia?.ymediaurl ? (
                                            <Image
                                                src={(item.yvarprod as any).yvarprodmedia[0].ymedia.ymediaurl}
                                                alt={item.yvarprod?.yvarprodintitule || "Product"}
                                                width={64}
                                                height={64}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <Heart className="w-6 h-6" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Details */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-white truncate">
                                            {item.yvarprod?.yvarprodintitule || "Unknown Product"}
                                        </h4>
                                        <div className="flex items-center gap-2 text-sm text-gray-300">
                                            {item.yvarprod?.xcouleur && (
                                                <span className="flex items-center gap-1">
                                                    <div
                                                        className="w-3 h-3 rounded-full border"
                                                        style={{ backgroundColor: item.yvarprod.xcouleur.xcouleurhexa }}
                                                    />
                                                    {item.yvarprod.xcouleur.xcouleurintitule}
                                                </span>
                                            )}
                                            {item.yvarprod?.xtaille && (
                                                <span>• {item.yvarprod.xtaille.xtailleintitule}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="font-semibold text-morpheus-gold-dark">
                                                ${(item.yvarprod?.yvarprodprixpromotion || item.yvarprod?.yvarprodprixcatalogue || 0).toFixed(2)}
                                            </span>
                                            {item.yvarprod?.yvarprodprixpromotion && item.yvarprod?.yvarprodprixcatalogue && (
                                                <span className="text-sm text-gray-300 line-through">
                                                    ${item.yvarprod.yvarprodprixcatalogue.toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleAddToCart(item)}
                                            disabled={addToCartMutation.isPending}
                                            className="flex items-center gap-1 border-morpheus-gold-dark/30 text-white hover:bg-morpheus-gold-dark/20"
                                        >
                                            <ShoppingCart className="w-3 h-3" />
                                            {t("wishlist.addToCart") || "Add to Cart"}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveFromWishlist(item.ywishlistid)}
                                            disabled={removeFromWishlistMutation.isPending}
                                            className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CredenzaBody>

                {wishlistItems.length > 0 && (
                    <CredenzaFooter className="flex gap-2 bg-transparent">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 border-morpheus-gold-dark/30 text-white hover:bg-morpheus-gold-dark/20"
                        >
                            {t("wishlist.continueShopping") || "Continue Shopping"}
                        </Button>
                        <Button
                            onClick={() => {
                                // Move all items to cart
                                wishlistItems.forEach(item => handleMoveToCart(item));
                            }}
                            disabled={addToCartMutation.isPending || removeFromWishlistMutation.isPending}
                            className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white"
                        >
                            {t("wishlist.moveAllToCart") || "Move All to Cart"}
                        </Button>
                    </CredenzaFooter>
                )}
            </CredenzaContent>
        </Credenza>
    );
}
