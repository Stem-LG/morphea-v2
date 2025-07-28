"use client";

import { LogoutButton } from "@/components/logout-button";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { LanguageSwitcher } from "@/components/language-switcher";
import { CartDropdown } from "@/components/cart-dropdown";
import { WishlistDropdown } from "@/components/wishlist-dropdown";
import ProductDetailsPage from "@/components/product-details-page";
import Link from "next/link";
import { useState } from "react";

export default function NavBar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<{
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
    } | null>(null);
    const { t } = useLanguage();

    const { data: currentUser, isLoading } = useAuth();

    const { cart } = useCart();
    const { wishlist } = useWishlist();

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const handleProductClick = (productData: typeof selectedProduct) => {
        setSelectedProduct(productData);
        setIsCartOpen(false);
        setIsWishlistOpen(false);
    };

    const totalCartItems = cart.reduce((sum, item) => sum + item.ypanierqte, 0);
    const totalWishlistItems = wishlist.length;

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-morpheus-blue-dark via-morpheus-blue-dark/95 to-morpheus-blue-light/90 backdrop-blur-md shadow-lg shadow-black/30">
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-morpheus-gold-dark via-morpheus-gold-light to-morpheus-gold-dark"></div>

                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center justify-center group">
                            <img
                                src="/logo.png"
                                alt="Morpheus Mall Logo"
                                className="h-10 w-auto hidden md:block mr-2 group-hover:scale-105 transition-transform duration-300"
                            />
                            <Link
                                href="/"
                                className="pt-2 flex items-center space-x-2 px-2 text-3xl font-bold font-brown-sugar tracking-wide bg-gradient-to-r from-morpheus-gold-dark via-morpheus-gold-light to-morpheus-gold-dark bg-clip-text text-transparent drop-shadow-lg hover:drop-shadow-2xl transition-all duration-300"
                            >
                                Morpheus Mall
                            </Link>
                        </div>

                        {/* Navigation Links */}
                        <div className="hidden md:flex items-center space-x-6">
                            <Link
                                href="/main"
                                className="relative text-gray-300 hover:text-morpheus-gold-light transition-all duration-300 font-medium group"
                            >
                                {t("nav.virtualTours")}
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light group-hover:w-full transition-all duration-300"></span>
                            </Link>

                            <Link
                                href="/admin"
                                className="relative text-gray-300 hover:text-morpheus-gold-light transition-all duration-300 font-medium group"
                            >
                                {t("nav.administration")}
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light group-hover:w-full transition-all duration-300"></span>
                            </Link>

                            {/* Cart & Wishlist - Only show when logged in (not anonymous) */}
                            {currentUser && !currentUser.is_anonymous && (
                                <>
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsWishlistOpen(!isWishlistOpen)}
                                            className="relative p-2 text-gray-300 hover:text-morpheus-gold-light transition-all duration-300 group"
                                        >
                                            <div className="absolute inset-0 bg-morpheus-gold-light/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                                            <svg
                                                className="relative w-6 h-6"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                                />
                                            </svg>
                                            {totalWishlistItems > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                                                    {totalWishlistItems}
                                                </span>
                                            )}
                                        </button>
                                        <WishlistDropdown
                                            isOpen={isWishlistOpen}
                                            onClose={() => setIsWishlistOpen(false)}
                                            onProductClick={handleProductClick}
                                        />
                                    </div>

                                    <div className="relative">
                                        <button
                                            onClick={() => setIsCartOpen(!isCartOpen)}
                                            className="relative p-2 text-gray-300 hover:text-morpheus-gold-light transition-all duration-300 group"
                                        >
                                            <div className="absolute inset-0 bg-morpheus-gold-light/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                                            <svg
                                                className="relative w-6 h-6"
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
                                            {totalCartItems > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-morpheus-gold-light text-morpheus-blue-dark text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                                                    {totalCartItems}
                                                </span>
                                            )}
                                        </button>
                                        <CartDropdown
                                            isOpen={isCartOpen}
                                            onClose={() => setIsCartOpen(false)}
                                            onProductClick={handleProductClick}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Divider */}
                            <div className="h-6 w-px bg-morpheus-gold-dark/30"></div>

                            {/* Language Switcher */}
                            <LanguageSwitcher />

                            {/* Auth Section */}
                            {isLoading ? (
                                <div className="flex items-center space-x-2">
                                    <div className="w-5 h-5 border-2 border-morpheus-gold-dark border-t-morpheus-gold-light animate-spin rounded-full"></div>
                                    <span className="text-gray-300 text-sm">{t("nav.loading")}</span>
                                </div>
                            ) : currentUser && !currentUser.is_anonymous ? (
                                <div className="flex items-center space-x-4">
                                    <Link
                                        href="/profile"
                                        className="relative p-2 text-gray-300 hover:text-morpheus-gold-light transition-all duration-300 group"
                                        title="Profile"
                                    >
                                        <div className="absolute inset-0 bg-morpheus-gold-light/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                                        <svg
                                            className="relative w-6 h-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                    </Link>
                                    <LogoutButton />
                                </div>
                            ) : (
                                <>
                                    <Link
                                        href="/auth/login"
                                        className="relative text-gray-300 hover:text-morpheus-gold-light transition-all duration-300 font-medium group"
                                    >
                                        {t("nav.login")}
                                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light group-hover:w-full transition-all duration-300"></span>
                                    </Link>
                                    <Link
                                        href="/auth/sign-up"
                                        className="relative overflow-hidden bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white px-6 py-2 font-semibold shadow-md hover:shadow-morpheus-gold-light/30 transition-all duration-300 rounded group"
                                    >
                                        <span className="relative z-10">{t("nav.signup")}</span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-morpheus-gold-light to-morpheus-gold-dark opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button
                                className="relative p-2 text-gray-300 hover:text-morpheus-gold-light transition-all duration-300 group"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                aria-label="Toggle mobile menu"
                            >
                                <div className="absolute inset-0 bg-morpheus-gold-light/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                                <svg className="relative w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Mobile menu */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden absolute top-full left-0 right-0 bg-gradient-to-br from-morpheus-blue-dark/98 to-morpheus-blue-light/95 backdrop-blur-md border-t border-morpheus-gold-dark/20 shadow-xl">
                            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                                <Link
                                    href="/main"
                                    className="text-gray-300 hover:text-morpheus-gold-light hover:bg-morpheus-gold-dark/10 block px-4 py-3 text-base font-medium transition-all duration-300 rounded"
                                    onClick={closeMobileMenu}
                                >
                                    {t("nav.virtualTours")}
                                </Link>

                                <Link
                                    href="/admin"
                                    className="text-gray-300 hover:text-morpheus-gold-light hover:bg-morpheus-gold-dark/10 block px-4 py-3 text-base font-medium transition-all duration-300 rounded"
                                    onClick={closeMobileMenu}
                                >
                                    {t("nav.administration")}
                                </Link>

                                {/* Mobile Cart & Wishlist - Only show when logged in (not anonymous) */}
                                {currentUser && !currentUser.is_anonymous && (
                                    <>
                                        <button
                                            onClick={() => {
                                                setIsWishlistOpen(true);
                                                closeMobileMenu();
                                            }}
                                            className="text-gray-300 hover:text-morpheus-gold-light hover:bg-morpheus-gold-dark/10 flex items-center px-4 py-3 text-base font-medium transition-all duration-300 rounded w-full"
                                        >
                                            <svg
                                                className="w-5 h-5 mr-3"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                                />
                                            </svg>
                                            Wishlist
                                            {totalWishlistItems > 0 && (
                                                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                                                    {totalWishlistItems}
                                                </span>
                                            )}
                                        </button>

                                        <button
                                            onClick={() => {
                                                setIsCartOpen(true);
                                                closeMobileMenu();
                                            }}
                                            className="text-gray-300 hover:text-morpheus-gold-light hover:bg-morpheus-gold-dark/10 flex items-center px-4 py-3 text-base font-medium transition-all duration-300 rounded w-full"
                                        >
                                            <svg
                                                className="w-5 h-5 mr-3"
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
                                            Cart
                                            {totalCartItems > 0 && (
                                                <span className="ml-auto bg-morpheus-gold-light text-morpheus-blue-dark text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                                                    {totalCartItems}
                                                </span>
                                            )}
                                        </button>
                                    </>
                                )}

                                {/* Mobile Language Switcher */}
                                <div className="px-4 py-3">
                                    <LanguageSwitcher />
                                </div>

                                {/* Mobile Auth Section */}
                                <div className="border-t border-slate-600 pt-2 mt-2">
                                    {isLoading ? (
                                        <div className="flex items-center justify-center px-3 py-2">
                                            <div className="w-5 h-5 border-2 border-morpheus-gold-dark border-t-morpheus-gold-light animate-spin rounded-full"></div>
                                            <span className="text-gray-300 text-sm ml-2">{t("nav.loading")}</span>
                                        </div>
                                    ) : currentUser && !currentUser.is_anonymous ? (
                                        <div className="space-y-2">
                                            <Link
                                                href="/profile"
                                                className="text-gray-300 hover:text-morpheus-gold-light hover:bg-morpheus-gold-dark/10 flex items-center px-4 py-3 text-base font-medium transition-all duration-300 rounded"
                                                onClick={closeMobileMenu}
                                            >
                                                <svg
                                                    className="w-5 h-5 mr-3"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                    />
                                                </svg>
                                                Profile
                                            </Link>
                                            <div className="px-4 py-3">
                                                <LogoutButton />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <Link
                                                href="/auth/login"
                                                className="text-gray-300 hover:text-morpheus-gold-light hover:bg-morpheus-gold-dark/10 block px-4 py-3 text-base font-medium transition-all duration-300 rounded"
                                                onClick={closeMobileMenu}
                                            >
                                                {t("nav.login")}
                                            </Link>
                                            <Link
                                                href="/auth/sign-up"
                                                className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-morpheus-gold-light hover:to-morpheus-gold-dark text-white block px-4 py-3 mx-3 my-2 text-center font-semibold transition-all duration-300 rounded shadow-md"
                                                onClick={closeMobileMenu}
                                            >
                                                {t("nav.signup")}
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-morpheus-gold-dark/50 to-transparent"></div>
            </nav>
            <div className="h-16" />

            {/* Product Details Dialog */}
            {selectedProduct && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => setSelectedProduct(null)}
                    />

                    {/* Dialog Content */}
                    <div className="relative w-full h-full max-w-7xl max-h-[95vh] mx-4">
                        <ProductDetailsPage productData={selectedProduct} onClose={() => setSelectedProduct(null)} />
                    </div>
                </div>
            )}
        </>
    );
}
