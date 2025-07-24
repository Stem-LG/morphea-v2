"use client";

import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { useLanguage } from "@/hooks/useLanguage";
import { useState } from "react";
import Link from "next/link";

export default function WishlistPage() {
    const { wishlist, removeFromWishlist, isLoading } = useWishlist();
    const { addToCart } = useCart();
    const { t } = useLanguage();
    const [processingItems, setProcessingItems] = useState<Set<number>>(new Set());

    const handleRemoveFromWishlist = async (productId: number) => {
        setProcessingItems((prev) => new Set(prev).add(productId));
        try {
            await removeFromWishlist(productId);
        } finally {
            setProcessingItems((prev) => {
                const newSet = new Set(prev);
                newSet.delete(productId);
                return newSet;
            });
        }
    };

    const handleAddToCart = async (productId: number) => {
        setProcessingItems((prev) => new Set(prev).add(productId));
        try {
            await addToCart({ productId, quantity: 1 });
            // Optionally remove from wishlist after adding to cart
            // await removeFromWishlist(productId);
        } finally {
            setProcessingItems((prev) => {
                const newSet = new Set(prev);
                newSet.delete(productId);
                return newSet;
            });
        }
    };

    const handleMoveToCart = async (productId: number) => {
        setProcessingItems((prev) => new Set(prev).add(productId));
        try {
            await addToCart({ productId, quantity: 1 });
            await removeFromWishlist(productId);
        } finally {
            setProcessingItems((prev) => {
                const newSet = new Set(prev);
                newSet.delete(productId);
                return newSet;
            });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-morpheus-blue-dark via-morpheus-blue-light to-morpheus-blue-dark">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="w-12 h-12 border-4 border-morpheus-gold-dark border-t-morpheus-gold-light animate-spin rounded-full"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-morpheus-blue-dark via-morpheus-blue-light to-morpheus-blue-dark">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold font-parisienne bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light bg-clip-text text-transparent mb-4">
                        {t('wishlist.title')}
                    </h1>
                    <p className="text-gray-300">
                        {wishlist.length} {wishlist.length === 1 ? t('wishlist.oneItem') : t('wishlist.multipleItems')} {t('wishlist.savedForLater')}
                    </p>
                </div>

                {wishlist.length === 0 ? (
                    /* Empty Wishlist */
                    <div className="text-center py-16">
                        <div className="w-24 h-24 bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-semibold text-white mb-4">{t('wishlist.empty')}</h2>
                        <p className="text-gray-300 mb-8">{t('wishlist.emptyDescription')}</p>
                        <Link
                            href="/main"
                            className="inline-block bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white px-8 py-3 font-semibold hover:from-morpheus-gold-light hover:to-morpheus-gold-dark transition-all duration-300"
                        >
                            {t('wishlist.startShopping')}
                        </Link>
                    </div>
                ) : (
                    /* Wishlist Items Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wishlist.map((item) => (
                            <div
                                key={item.ywishlistid}
                                className="bg-gradient-to-br from-morpheus-blue-dark/60 to-morpheus-blue-light/40 border border-morpheus-gold-dark/30 backdrop-blur-sm overflow-hidden group hover:border-morpheus-gold-light/50 transition-all duration-300"
                            >
                                {/* Product Image */}
                                <div className="relative aspect-square bg-gradient-to-br from-morpheus-gold-dark/10 to-morpheus-gold-light/10">
                                    {/* Note: No image URL available in current schema */}
                                    {false ? (
                                        <img
                                            src=""
                                            alt={item.yvarprod?.yprod?.yprodintitule || "Product"}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <svg
                                                className="w-16 h-16 text-morpheus-gold-light/50"
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
                                        </div>
                                    )}

                                    {/* Remove from Wishlist Button */}
                                    <button
                                        onClick={() => handleRemoveFromWishlist(item.yvarprodidfk)}
                                        disabled={processingItems.has(item.yvarprodidfk)}
                                        className="absolute top-2 right-2 w-8 h-8 bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={t('wishlist.removeFromWishlist')}
                                    >
                                        {processingItems.has(item.yvarprodidfk) ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                                        ) : (
                                            <svg
                                                className="w-4 h-4"
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
                                        )}
                                    </button>

                                    {/* Date Added Badge */}
                                    <div className="absolute bottom-2 left-2 bg-morpheus-blue-dark/80 text-white text-xs px-2 py-1 rounded">
                                        {t('wishlist.added')} {item.sysdate ? new Date(item.sysdate).toLocaleDateString() : ''}
                                    </div>
                                </div>

                                {/* Product Details */}
                                <div className="p-4">
                                    <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">
                                        {item.yvarprod?.yvarprodintitule || item.yvarprod?.yprod?.yprodintitule || t('wishlist.unknownProduct')}
                                    </h3>

                                    {item.yvarprod?.yprod?.yproddetailstech && (
                                        <p className="text-gray-300 text-sm mb-3 line-clamp-3">
                                            {item.yvarprod.yprod.yproddetailstech}
                                        </p>
                                    )}

                                    {/* Price */}
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-morpheus-gold-light font-bold text-lg">
                                            ${(item.yvarprod?.yvarprodprixpromotion || item.yvarprod?.yvarprodprixcatalogue || 99).toFixed(2)}
                                        </span>
                                        {item.yvarprod?.yvarprodprixpromotion && (
                                            <span className="text-gray-400 line-through text-sm">
                                                ${item.yvarprod.yvarprodprixcatalogue.toFixed(2)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Product Variants */}
                                    <div className="flex items-center gap-2 mb-4 text-sm text-gray-300">
                                        {item.yvarprod?.xcouleur && (
                                            <span className="bg-morpheus-blue-dark/40 px-2 py-1 rounded">
                                                {item.yvarprod.xcouleur.xcouleurintitule}
                                            </span>
                                        )}
                                        {item.yvarprod?.xtaille && (
                                            <span className="bg-morpheus-blue-dark/40 px-2 py-1 rounded">
                                                {item.yvarprod.xtaille.xtailleintitule}
                                            </span>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => handleAddToCart(item.yvarprodidfk)}
                                            disabled={processingItems.has(item.yvarprodidfk)}
                                            className="w-full bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white py-2 px-4 font-medium hover:from-morpheus-gold-light hover:to-morpheus-gold-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {processingItems.has(item.yvarprodidfk) ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                                                    {t('wishlist.processing')}
                                                </div>
                                            ) : (
                                                t('wishlist.addToCart')
                                            )}
                                        </button>

                                        <button
                                            onClick={() => handleMoveToCart(item.yvarprodidfk)}
                                            disabled={processingItems.has(item.yvarprodidfk)}
                                            className="w-full bg-gradient-to-r from-morpheus-gold-dark/20 to-morpheus-gold-light/20 border border-morpheus-gold-dark/40 text-morpheus-gold-light py-2 px-4 font-medium hover:from-morpheus-gold-dark/30 hover:to-morpheus-gold-light/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {t('wishlist.moveToCart')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Continue Shopping Button */}
                {wishlist.length > 0 && (
                    <div className="text-center mt-12">
                        <Link
                            href="/main"
                            className="inline-block bg-gradient-to-r from-morpheus-gold-dark/20 to-morpheus-gold-light/20 border border-morpheus-gold-dark/40 text-morpheus-gold-light px-8 py-3 font-medium hover:from-morpheus-gold-dark/30 hover:to-morpheus-gold-light/30 transition-all duration-300"
                        >
                            {t('wishlist.continueShopping')}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
