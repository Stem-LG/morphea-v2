"use client";

import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { useLanguage } from "@/hooks/useLanguage";
import { useState } from "react";
import { WishlistDropdown } from "./wishlist-dropdown";
import { CartDropdown } from "./cart-dropdown";

interface ActivitySummaryProps {
    onProductClick?: (productData: {
        id: number;
        name: string;
        description: string;
        image: string;
        backgroundColor?: string;
        models: Array<{
            url: string;
            color: string;
            id: number;
        }>;
    }) => void;
}

export function ActivitySummary({ onProductClick }: ActivitySummaryProps) {
    const { wishlist, isLoading: wishlistLoading } = useWishlist();
    const { cart, isLoading: cartLoading } = useCart();
    const { t } = useLanguage();
    
    const [showWishlistDropdown, setShowWishlistDropdown] = useState(false);
    const [showCartDropdown, setShowCartDropdown] = useState(false);

    const wishlistCount = wishlist.length;
    const cartItemCount = cart.reduce((sum, item) => sum + item.yquantite, 0);
    const cartUniqueCount = cart.length;

    // Get recent activity (last 3 items from both wishlist and cart)
    const recentWishlistItems = wishlist.slice(0, 2);
    const recentCartItems = cart.slice(0, 2);

    const handleViewWishlist = () => {
        setShowWishlistDropdown(true);
        setShowCartDropdown(false);
    };

    const handleViewCart = () => {
        setShowCartDropdown(true);
        setShowWishlistDropdown(false);
    };

    return (
        <div className="space-y-6">
            {/* Activity Summary Header */}
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold font-parisienne bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light bg-clip-text text-transparent">
                    Activity Summary
                </h2>
                <p className="text-gray-300 text-sm">
                    Your recent shopping activity and saved items
                </p>
            </div>

            {/* Activity Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Wishlist Card */}
                <div className="relative bg-gradient-to-br from-morpheus-blue-dark/60 to-morpheus-blue-light/40 border border-morpheus-gold-dark/30 p-6 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-white font-semibold">Wishlist</h3>
                                <p className="text-gray-300 text-sm">Saved for later</p>
                            </div>
                        </div>
                        <div className="text-right">
                            {wishlistLoading ? (
                                <div className="w-6 h-6 border-2 border-morpheus-gold-dark border-t-morpheus-gold-light animate-spin rounded-full"></div>
                            ) : (
                                <span className="text-2xl font-bold text-morpheus-gold-light">
                                    {wishlistCount}
                                </span>
                            )}
                            <p className="text-gray-400 text-xs">items</p>
                        </div>
                    </div>

                    {/* Recent Wishlist Items */}
                    {recentWishlistItems.length > 0 && (
                        <div className="space-y-2 mb-4">
                            <p className="text-gray-300 text-xs font-medium">Recent additions:</p>
                            {recentWishlistItems.map((item) => (
                                <div key={item.id} className="flex items-center gap-2 text-xs">
                                    <div className="w-2 h-2 bg-morpheus-gold-light rounded-full flex-shrink-0"></div>
                                    <span className="text-gray-300 truncate">
                                        {item.yproduit?.yproduitintitule || 'Unknown Product'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* View Wishlist Button */}
                    {wishlistCount > 0 ? (
                        <button
                            onClick={handleViewWishlist}
                            className="w-full bg-gradient-to-r from-morpheus-gold-dark/20 to-morpheus-gold-light/20 border border-morpheus-gold-dark/40 text-morpheus-gold-light py-2 px-4 font-medium hover:from-morpheus-gold-dark/30 hover:to-morpheus-gold-light/30 transition-all duration-300 text-sm"
                        >
                            View All Items
                        </button>
                    ) : (
                        <div className="text-center text-gray-400 text-sm py-2">
                            No items in wishlist yet
                        </div>
                    )}

                    {/* Wishlist Dropdown */}
                    <WishlistDropdown
                        isOpen={showWishlistDropdown}
                        onClose={() => setShowWishlistDropdown(false)}
                        onProductClick={onProductClick}
                    />
                </div>

                {/* Cart Card */}
                <div className="relative bg-gradient-to-br from-morpheus-blue-dark/60 to-morpheus-blue-light/40 border border-morpheus-gold-dark/30 p-6 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-white font-semibold">Shopping Cart</h3>
                                <p className="text-gray-300 text-sm">Ready to purchase</p>
                            </div>
                        </div>
                        <div className="text-right">
                            {cartLoading ? (
                                <div className="w-6 h-6 border-2 border-morpheus-gold-dark border-t-morpheus-gold-light animate-spin rounded-full"></div>
                            ) : (
                                <>
                                    <span className="text-2xl font-bold text-morpheus-gold-light">
                                        {cartItemCount}
                                    </span>
                                    {cartUniqueCount !== cartItemCount && (
                                        <div className="text-xs text-gray-400">
                                            ({cartUniqueCount} unique)
                                        </div>
                                    )}
                                </>
                            )}
                            <p className="text-gray-400 text-xs">items</p>
                        </div>
                    </div>

                    {/* Recent Cart Items */}
                    {recentCartItems.length > 0 && (
                        <div className="space-y-2 mb-4">
                            <p className="text-gray-300 text-xs font-medium">Recent additions:</p>
                            {recentCartItems.map((item) => (
                                <div key={item.id} className="flex items-center gap-2 text-xs">
                                    <div className="w-2 h-2 bg-morpheus-gold-light rounded-full flex-shrink-0"></div>
                                    <span className="text-gray-300 truncate">
                                        {item.yproduit?.yproduitintitule || 'Unknown Product'}
                                        {item.yquantite > 1 && (
                                            <span className="text-morpheus-gold-light ml-1">
                                                (×{item.yquantite})
                                            </span>
                                        )}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* View Cart Button */}
                    {cartUniqueCount > 0 ? (
                        <button
                            onClick={handleViewCart}
                            className="w-full bg-gradient-to-r from-morpheus-gold-dark/20 to-morpheus-gold-light/20 border border-morpheus-gold-dark/40 text-morpheus-gold-light py-2 px-4 font-medium hover:from-morpheus-gold-dark/30 hover:to-morpheus-gold-light/30 transition-all duration-300 text-sm"
                        >
                            View Cart
                        </button>
                    ) : (
                        <div className="text-center text-gray-400 text-sm py-2">
                            No items in cart yet
                        </div>
                    )}

                    {/* Cart Dropdown */}
                    <CartDropdown
                        isOpen={showCartDropdown}
                        onClose={() => setShowCartDropdown(false)}
                        onProductClick={onProductClick}
                    />
                </div>
            </div>

            {/* Recent Activity Timeline */}
            <div className="bg-gradient-to-br from-morpheus-blue-dark/60 to-morpheus-blue-light/40 border border-morpheus-gold-dark/30 p-6 backdrop-blur-sm">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-morpheus-gold-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Recent Activity
                </h3>

                {(recentWishlistItems.length === 0 && recentCartItems.length === 0) ? (
                    <div className="text-center text-gray-400 text-sm py-4">
                        No recent activity to display
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* Recent wishlist additions */}
                        {recentWishlistItems.map((item) => (
                            <div key={`wishlist-${item.id}`} className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-white">
                                        Added <span className="text-morpheus-gold-light font-medium">
                                            {item.yproduit?.yproduitintitule || 'Unknown Product'}
                                        </span> to wishlist
                                    </p>
                                    <p className="text-gray-400 text-xs">
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Recent cart additions */}
                        {recentCartItems.map((item) => (
                            <div key={`cart-${item.id}`} className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-white">
                                        Added <span className="text-morpheus-gold-light font-medium">
                                            {item.yproduit?.yproduitintitule || 'Unknown Product'}
                                        </span> to cart
                                        {item.yquantite > 1 && (
                                            <span className="text-gray-300"> (×{item.yquantite})</span>
                                        )}
                                    </p>
                                    <p className="text-gray-400 text-xs">
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}