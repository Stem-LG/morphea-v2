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
        if (error?.message?.includes('Auth session missing') || error?.name === 'AuthSessionMissingError') {
            return { user: null, loading: false };
        }
        
        // Handle other errors
        if (error) {
            console.error('Auth error:', error);
            return { user: null, loading: false };
        }
        
        return { user: user || null, loading: false };
    };
    
    const { user: currentUser, loading } = getAuthState();
    
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light backdrop-blur-sm border-b border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex flex-row items-center justify-center">
                            <img src="/logo.png" alt="Morpheus Mall Logo" className="h-8 w-auto hidden md:block" />
                            <Link href="/" className="flex items-center space-x-2">
                                <span className="p-4 text-2xl font-bold font-parisienne bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light bg-clip-text text-transparent">
                                    Morpheus Mall
                                </span>
                            </Link>
                        </div>

                        {/* Navigation Links */}
                        <div className="hidden md:flex items-center space-x-8">
                            <Link href="/shop" className="text-gray-300 hover:text-white transition-colors">
                                {t('nav.boutique')}
                            </Link>
                            <Link href="/virtual-tours" className="text-gray-300 hover:text-white transition-colors">
                                {t('nav.virtualTours')}
                            </Link>
                            <Link href="/3d-products" className="text-gray-300 hover:text-white transition-colors">
                                {t('nav.products3d')}
                            </Link>
                            <Link href="/admin" className="text-gray-300 hover:text-white transition-colors">
                                {t('nav.administration')}
                            </Link>
                            
                            {/* Language Switcher */}
                            <LanguageSwitcher />
                            
                            {/* Auth Section */}
                            {loading ? (
                                <div className="flex items-center space-x-2">
                                    <div className="w-5 h-5 border-2 border-morpheus-gold-dark border-t-morpheus-gold-light animate-spin rounded-full"></div>
                                    <span className="text-gray-300 text-sm">{t('nav.loading')}</span>
                                </div>
                            ) : currentUser ? (
                                <LogoutButton />
                            ) : (
                                <>
                                    <Link
                                        href="/auth/login"
                                        className="text-gray-300 hover:text-white transition-colors"
                                    >
                                        {t('nav.login')}
                                    </Link>
                                    <Link
                                        href="/auth/sign-up"
                                        className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-[#695029] hover:to-[#d4c066] text-white px-4 py-2 transition-all rounded-none"
                                    >
                                        {t('nav.signup')}
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button
                                className="text-gray-300 hover:text-white transition-colors"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                aria-label="Toggle mobile menu"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        <div className="md:hidden">
                            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light border-t border-slate-700">
                                <Link
                                    href="/shop"
                                    className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium transition-colors"
                                    onClick={closeMobileMenu}
                                >
                                    {t('nav.boutique')}
                                </Link>
                                <Link
                                    href="/virtual-tours"
                                    className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium transition-colors"
                                    onClick={closeMobileMenu}
                                >
                                    {t('nav.virtualTours')}
                                </Link>
                                <Link
                                    href="/3d-products"
                                    className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium transition-colors"
                                    onClick={closeMobileMenu}
                                >
                                    {t('nav.products3d')}
                                </Link>
                                <Link
                                    href="/admin"
                                    className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium transition-colors"
                                    onClick={closeMobileMenu}
                                >
                                    {t('nav.administration')}
                                </Link>
                                
                                {/* Mobile Language Switcher */}
                                <div className="px-3 py-2">
                                    <LanguageSwitcher />
                                </div>
                                
                                {/* Mobile Auth Section */}
                                <div className="border-t border-slate-600 pt-2 mt-2">
                                    {loading ? (
                                        <div className="flex items-center justify-center px-3 py-2">
                                            <div className="w-5 h-5 border-2 border-morpheus-gold-dark border-t-morpheus-gold-light animate-spin rounded-full"></div>
                                            <span className="text-gray-300 text-sm ml-2">{t('nav.loading')}</span>
                                        </div>
                                    ) : currentUser ? (
                                        <div className="px-3 py-2">
                                            <LogoutButton />
                                        </div>
                                    ) : (
                                        <>
                                            <Link
                                                href="/auth/login"
                                                className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium transition-colors"
                                                onClick={closeMobileMenu}
                                            >
                                                {t('nav.login')}
                                            </Link>
                                            <Link
                                                href="/auth/sign-up"
                                                className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-[#695029] hover:to-[#d4c066] text-white block px-3 py-2 mx-3 my-2 text-center transition-all rounded-none"
                                                onClick={closeMobileMenu}
                                            >
                                                {t('nav.signup')}
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </nav>
            <div className="h-16"/>
        </>
    );
}
