"use client";

import { LogoutButton } from "@/components/logout-button";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function NavBar() {
    const { data: user, isLoading } = useAuth();

    return (
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
                        {user ? (
                            <LogoutButton />
                        ) : (
                            <>
                                <Link href="/auth/login" className="text-gray-300 hover:text-white transition-colors">
                                    Sign In
                                </Link>
                                <Link
                                    href="/auth/sign-up"
                                    className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-[#695029] hover:to-[#d4c066] text-white px-4 py-2 transition-all"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button className="text-gray-300 hover:text-white">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
