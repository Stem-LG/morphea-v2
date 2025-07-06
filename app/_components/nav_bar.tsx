"use client";

import { LogoutButton } from "@/components/logout-button";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useState } from "react";

export default function NavBar() {
    const { data: user } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light backdrop-blur-sm border-b border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center space-x-2">
                            <span className="p-4 text-2xl font-bold font-parisienne bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light bg-clip-text text-transparent">
                                Morpheus Mall
                            </span>
                        </Link>

                        {/* Navigation Links */}
                        <div className="hidden md:flex items-center space-x-8">
                            <Link href="/shop" className="text-gray-300 hover:text-white transition-colors">
                                Shop
                            </Link>
                            <Link href="/virtual-tours" className="text-gray-300 hover:text-white transition-colors">
                                Virtual Tours
                            </Link>
                            <Link href="/3d-products" className="text-gray-300 hover:text-white transition-colors">
                                3D Products
                            </Link>
                            <Link href="/admin" className="text-gray-300 hover:text-white transition-colors">
                                Admin
                            </Link>
                            {user ? (
                                <LogoutButton />
                            ) : (
                                <>
                                    <Link
                                        href="/auth/login"
                                        className="text-gray-300 hover:text-white transition-colors"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/auth/sign-up"
                                        className="bg-gradient-to-r from-[#785730] to-[#e9d079] hover:from-[#695029] hover:to-[#d4c066] text-white px-4 py-2 transition-all"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button
                                className="text-gray-300 hover:text-white"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
                            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gradient-to-br from-[#000c18] to-[#083543] border-t border-slate-700">
                                <Link
                                    href="/shop"
                                    className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Shop
                                </Link>
                                <Link
                                    href="/virtual-tours"
                                    className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Virtual Tours
                                </Link>
                                <Link
                                    href="/3d-products"
                                    className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    3D Products
                                </Link>
                                <Link
                                    href="/admin"
                                    className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Admin
                                </Link>
                                {user ? (
                                    <div className="px-3 py-2">
                                        <LogoutButton />
                                    </div>
                                ) : (
                                    <>
                                        <Link
                                            href="/auth/login"
                                            className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium transition-colors"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            Sign In
                                        </Link>
                                        <Link
                                            href="/auth/sign-up"
                                            className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-[#695029] hover:to-[#d4c066] text-white px-4 py-2 transition-all"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            Get Started
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </nav>
            <div className="h-16"/>
        </>
    );
}
