"use client";

import { LogoutButton } from "@/components/logout-button";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { LanguageSwitcher } from "@/components/language-switcher";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function NavBar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const { t } = useLanguage();

    // Auth state with error handling
    const authQuery = useAuth();
    const { data: user, error, isLoading } = authQuery || { data: null, error: null, isLoading: true };

    // Handle client-side hydration
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Determine auth state safely
    const getAuthState = () => {
        if (!isClient) return { user: null, loading: true };

        if (isLoading) return { user: null, loading: true };

        // Handle auth session missing error (normal when not logged in)
        if (error?.message?.includes("Auth session missing") || error?.name === "AuthSessionMissingError") {
            return { user: null, loading: false };
        }

        // Handle other errors
        if (error) {
            console.error("Auth error:", error);
            return { user: null, loading: false };
        }

        return { user: user || null, loading: false };
    };

    const { user: currentUser, loading } = getAuthState();

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-morpheus-blue-dark via-morpheus-blue-dark/95 to-morpheus-blue-light/90 backdrop-blur-md shadow-lg shadow-black/30">
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-morpheus-gold-dark via-morpheus-gold-light to-morpheus-gold-dark"></div>
                
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex flex-row items-center justify-center group">
                            <img src="/logo.png" alt="Morpheus Mall Logo" className="h-10 w-auto hidden md:block mr-2 group-hover:scale-105 transition-transform duration-300" />
                            <Link href="/" className="flex items-center space-x-2">
                                <span className="px-2 text-3xl font-bold font-parisienne bg-gradient-to-r from-morpheus-gold-dark via-morpheus-gold-light to-morpheus-gold-dark bg-clip-text text-transparent drop-shadow-lg hover:drop-shadow-2xl transition-all duration-300">
                                    Morpheus Mall
                                </span>
                            </Link>
                        </div>

                        {/* Navigation Links */}
                        <div className="hidden md:flex items-center space-x-6">
                            <Link
                                href="/protected"
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

                            {/* Divider */}
                            <div className="h-6 w-px bg-morpheus-gold-dark/30"></div>

                            {/* Language Switcher */}
                            <LanguageSwitcher />

                            {/* Auth Section */}
                            {loading ? (
                                <div className="flex items-center space-x-2">
                                    <div className="w-5 h-5 border-2 border-morpheus-gold-dark border-t-morpheus-gold-light animate-spin rounded-full"></div>
                                    <span className="text-gray-300 text-sm">{t("nav.loading")}</span>
                                </div>
                            ) : currentUser ? (
                                <LogoutButton />
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
                                    href="/protected"
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

                                {/* Mobile Language Switcher */}
                                <div className="px-4 py-3">
                                    <LanguageSwitcher />
                                </div>

                                {/* Mobile Auth Section */}
                                <div className="border-t border-morpheus-gold-dark/20 pt-2 mt-2">
                                    {loading ? (
                                        <div className="flex items-center justify-center px-4 py-3">
                                            <div className="w-5 h-5 border-2 border-morpheus-gold-dark border-t-morpheus-gold-light animate-spin rounded-full"></div>
                                            <span className="text-gray-300 text-sm ml-2">{t("nav.loading")}</span>
                                        </div>
                                    ) : currentUser ? (
                                        <div className="px-4 py-3">
                                            <LogoutButton />
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
        </>
    );
}
