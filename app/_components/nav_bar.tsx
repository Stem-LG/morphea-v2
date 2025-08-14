"use client";

import { LogoutButton } from "@/components/logout-button";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { LanguageSwitcher } from "@/components/language-switcher";
import { CurrencySwitcher } from "@/components/currency-switcher";
import { CartDialog } from "@/app/_components/cart-dialog";
import { WishlistDialog } from "@/app/_components/wishlist-dialog";
import { useCart } from "@/app/_hooks/cart/useCart";
import { useWishlist } from "@/app/_hooks/wishlist/useWishlist";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useRef, useEffect } from "react";
import { Bell, ExternalLink } from "lucide-react";
import { useNotifications } from "@/app/_hooks/use-notifications";
import { ProductDetailsPage } from "../main/_components/product-details-page";

export default function NavBar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const { t } = useLanguage();
    const router = useRouter();
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const { data: currentUser, isLoading } = useAuth();
    const { data: cartItems = [] } = useCart();
    const { data: wishlistItems = [] } = useWishlist();

    const userRoles = useMemo(() => {
        return currentUser?.app_metadata?.roles || [];
    }, [currentUser]);

    const cartItemCount = cartItems.length;
    const wishlistItemCount = wishlistItems.length;

    // Notifications
    const {
        notifications,
        unreadCount,
        hasNextPage,
        fetchNextPage,
        isLoading: notifLoading,
        isFetchingNextPage: notifFetchingNext,
        isError: notifError,
        markAsSeen,
        markAllAsSeen,
    } = useNotifications(currentUser?.id || "") as {
        notifications: any[];
        unreadCount: number;
        hasNextPage: boolean;
        fetchNextPage: () => void;
        isLoading: boolean;
        isFetchingNextPage: boolean;
        isError: boolean;
        markAsSeen: (id: string) => void;
        markAllAsSeen: () => void;
    };

    const handleNotificationClick = (notification: any) => {
        // Mark notification as read if it's unread
        if (!notification.yest_lu) {
            markAsSeen(notification.ynotificationid);
        }
        
        // Navigate to the link if it exists
        if (notification.ylien) {
            router.push(notification.ylien);
            setIsNotificationsOpen(false); // Close the notification dropdown
        }
    };

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        if (!loadMoreRef.current || !hasNextPage || notifFetchingNext || notifLoading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !notifFetchingNext && !notifLoading) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(loadMoreRef.current);

        return () => observer.disconnect();
    }, [hasNextPage, notifFetchingNext, notifLoading, fetchNextPage]);

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
                                href="/shop"
                                className="relative text-gray-300 hover:text-morpheus-gold-light transition-all duration-300 font-medium group"
                            >
                                {t("nav.shop")}
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light group-hover:w-full transition-all duration-300"></span>
                            </Link>

                            {(userRoles.includes("admin") || userRoles.includes("store_admin")) && (
                                <Link
                                    href="/admin"
                                    className="relative text-gray-300 hover:text-morpheus-gold-light transition-all duration-300 font-medium group"
                                >
                                    {t("nav.administration")}
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light group-hover:w-full transition-all duration-300"></span>
                                </Link>
                            )}

                            {/* Cart, Wishlist, Notifications - Only show when logged in (not anonymous) */}
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
                                            {wishlistItemCount > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                                                    {wishlistItemCount > 99 ? "99+" : wishlistItemCount}
                                                </span>
                                            )}
                                        </button>
                                        <WishlistDialog
                                            isOpen={isWishlistOpen}
                                            onClose={() => setIsWishlistOpen(false)}
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
                                            {cartItemCount > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                                                    {cartItemCount > 99 ? "99+" : cartItemCount}
                                                </span>
                                            )}
                                        </button>
                                        <CartDialog isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
                                    </div>

                                    {/* Notification Bell */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                            className="relative p-2 text-gray-300 hover:text-morpheus-gold-light transition-all duration-300 group"
                                            aria-label="Notifications"
                                        >
                                            <div className="absolute inset-0 bg-morpheus-gold-light/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                                            <Bell className="relative w-6 h-6" />
                                            {unreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                                                    {unreadCount > 99 ? "99+" : unreadCount}
                                                </span>
                                            )}
                                        </button>
                                        {/* Notification Dropdown */}
                                        {isNotificationsOpen && (
                                            <div className="absolute right-0 mt-3 w-[480px] sm:w-[420px] xs:w-[380px] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-600 z-50 overflow-hidden min-w-[380px]">
                                                {/* Header */}
                                                <div className="bg-gradient-to-r from-morpheus-blue-dark/5 to-morpheus-gold-light/5 px-6 py-4 border-b border-gray-200 dark:border-slate-600 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                                            <Bell className="w-5 h-5 text-morpheus-blue-dark dark:text-morpheus-gold-light flex-shrink-0" />
                                                            <h3 className="text-lg font-semibold text-morpheus-blue-dark dark:text-white">{t("notifications.title")}</h3>
                                                        </div>
                                                        {unreadCount > 0 && (
                                                            <button
                                                                className="text-sm px-3 py-1.5 rounded-lg bg-morpheus-gold-light/20 text-morpheus-blue-dark dark:text-morpheus-gold-light hover:bg-morpheus-gold-light/30 transition-colors font-medium flex-shrink-0 ml-2"
                                                                onClick={() => markAllAsSeen()}
                                                            >
                                                                {t("notifications.markAllRead")}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Notifications List */}
                                                <div
                                                    className="max-h-[420px] overflow-y-auto min-w-0"
                                                    onScroll={e => {
                                                        const el = e.currentTarget;
                                                        const threshold = 10;
                                                        const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
                                                        
                                                        if (isNearBottom && hasNextPage && !notifFetchingNext && !notifLoading) {
                                                            fetchNextPage();
                                                        }
                                                    }}
                                                >
                                                    {notifLoading ? (
                                                        <div className="flex flex-col items-center justify-center py-12 px-6 w-full">
                                                            <div className="w-8 h-8 border-2 border-morpheus-gold-dark border-t-transparent rounded-full animate-spin mb-3"></div>
                                                            <p className="text-gray-600 dark:text-gray-300 font-medium text-center">{t("notifications.loading")}</p>
                                                        </div>
                                                    ) : notifError ? (
                                                        <div className="flex flex-col items-center justify-center py-12 px-6 text-center w-full">
                                                            <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-3">
                                                                <Bell className="w-6 h-6 text-gray-400" />
                                                            </div>
                                                            <p className="text-gray-900 dark:text-white font-medium mb-1">{t("notifications.unableToLoad")}</p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">{t("notifications.tryAgainLater")}</p>
                                                        </div>
                                                    ) : notifications.length === 0 ? (
                                                        <div className="flex flex-col items-center justify-center py-12 px-6 text-center w-full">
                                                            <div className="w-16 h-16 bg-gradient-to-br from-morpheus-gold-light/20 to-morpheus-blue-dark/20 rounded-full flex items-center justify-center mb-4">
                                                                <Bell className="w-8 h-8 text-morpheus-gold-dark" />
                                                            </div>
                                                            <p className="text-gray-900 dark:text-white font-medium mb-1">{t("notifications.allCaughtUp")}</p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">{t("notifications.noNewNotifications")}</p>
                                                        </div>
                                                    ) : (
                                                        <div className="divide-y divide-gray-100 dark:divide-slate-700 w-full">
                                                            {notifications.map((n: any) => (
                                                                <div
                                                                    key={n.ynotificationid}
                                                                    onClick={() => handleNotificationClick(n)}
                                                                    className={`px-6 py-4 transition-colors w-full ${
                                                                        !n.yest_lu ? "bg-morpheus-gold-light/5 border-l-4 border-morpheus-gold-dark" : ""
                                                                    } ${n.ylien ? 'cursor-pointer hover:bg-morpheus-gold-light/10 dark:hover:bg-slate-700/70' : 'cursor-default hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}
                                                                >
                                                                    <div className="flex items-start gap-4 w-full">
                                                                        {/* Status Indicator */}
                                                                        <div className={`flex-shrink-0 mt-1 w-3 h-3 rounded-full ${
                                                                            !n.yest_lu ? 'bg-morpheus-gold-dark' : 'bg-gray-300 dark:bg-slate-500'
                                                                        }`}></div>
                                                                        
                                                                        {/* Content */}
                                                                        <div className="flex-1 min-w-0 w-full">
                                                                            <div className="flex items-start justify-between gap-2 mb-1 w-full">
                                                                                <div className="flex items-center gap-1 flex-1 min-w-0">
                                                                                    <h4 className={`font-medium text-sm leading-tight flex-1 min-w-0 ${
                                                                                        !n.yest_lu 
                                                                                            ? 'text-morpheus-blue-dark dark:text-white' 
                                                                                            : 'text-gray-700 dark:text-gray-200'
                                                                                    }`}>
                                                                                        {n.ytitre ?? t("notifications.defaultTitle")}
                                                                                    </h4>
                                                                                    {n.ylien && (
                                                                                        <ExternalLink className="w-3 h-3 text-morpheus-gold-dark flex-shrink-0" />
                                                                                    )}
                                                                                </div>
                                                                                <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                                                                                    {new Date(n.created_at).toLocaleDateString()}
                                                                                </span>
                                                                            </div>
                                                                            
                                                                            {n.ymessage && (
                                                                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed break-words">
                                                                                    {n.ymessage}
                                                                                </p>
                                                                            )}
                                                                            
                                                                            <div className="flex items-center justify-between w-full">
                                                                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                                                                    {new Date(n.created_at).toLocaleTimeString([], { 
                                                                                        hour: '2-digit', 
                                                                                        minute: '2-digit' 
                                                                                    })}
                                                                                </span>
                                                                                
                                                                                {!n.yest_lu && (
                                                                                    <button
                                                                                        className="text-xs px-3 py-1 rounded-md bg-morpheus-gold-light/20 text-morpheus-blue-dark dark:text-morpheus-gold-light hover:bg-morpheus-gold-light/30 transition-colors font-medium flex-shrink-0"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            markAsSeen(n.ynotificationid);
                                                                                        }}
                                                                                    >
                                                                                        {t("notifications.markAsRead")}
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    
                                                    {/* Load More Indicator */}
                                                    {notifFetchingNext && (
                                                        <div className="flex items-center justify-center py-4 border-t border-gray-100 dark:border-slate-700 w-full">
                                                            <div className="w-5 h-5 border-2 border-morpheus-gold-dark border-t-transparent rounded-full animate-spin mr-2"></div>
                                                            <span className="text-sm text-gray-500 dark:text-gray-400">{t("notifications.loadingMore")}</span>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Invisible trigger for infinite scroll */}
                                                    {hasNextPage && !notifFetchingNext && (
                                                        <div 
                                                            ref={loadMoreRef} 
                                                            className="h-4 w-full"
                                                            style={{ minHeight: '1px' }}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Divider */}
                            <div className="h-6 w-px bg-morpheus-gold-dark/30"></div>

                            {/* Language Switcher */}
                            <LanguageSwitcher />

                            {/* Currency Switcher */}
                            <CurrencySwitcher />

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
                                    href="/shop"
                                    className="text-gray-300 hover:text-morpheus-gold-light hover:bg-morpheus-gold-dark/10 block px-4 py-3 text-base font-medium transition-all duration-300 rounded"
                                    onClick={closeMobileMenu}
                                >
                                    {t("nav.shop")}
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
                                            className="text-gray-300 hover:text-morpheus-gold-light hover:bg-morpheus-gold-dark/10 flex items-center justify-between px-4 py-3 text-base font-medium transition-all duration-300 rounded w-full"
                                        >
                                            <div className="flex items-center">
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
                                            </div>
                                            {wishlistItemCount > 0 && (
                                                <span className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white text-xs font-bold rounded-full px-2 py-1 min-w-[20px] text-center">
                                                    {wishlistItemCount > 99 ? "99+" : wishlistItemCount}
                                                </span>
                                            )}
                                        </button>

                                        <button
                                            onClick={() => {
                                                setIsCartOpen(true);
                                                closeMobileMenu();
                                            }}
                                            className="text-gray-300 hover:text-morpheus-gold-light hover:bg-morpheus-gold-dark/10 flex items-center justify-between px-4 py-3 text-base font-medium transition-all duration-300 rounded w-full"
                                        >
                                            <div className="flex items-center">
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
                                            </div>
                                            {cartItemCount > 0 && (
                                                <span className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white text-xs font-bold rounded-full px-2 py-1 min-w-[20px] text-center">
                                                    {cartItemCount > 99 ? "99+" : cartItemCount}
                                                </span>
                                            )}
                                        </button>
                                    </>
                                )}
                                {/* Mobile Notification Bell */}
                                {currentUser && !currentUser.is_anonymous && (
                                    <button
                                        onClick={() => {
                                            setIsNotificationsOpen(true);
                                            closeMobileMenu();
                                        }}
                                        className="text-gray-300 hover:text-morpheus-gold-light hover:bg-morpheus-gold-dark/10 flex items-center justify-between px-4 py-3 text-base font-medium transition-all duration-300 rounded w-full"
                                    >
                                        <div className="flex items-center">
                                            <Bell className="w-5 h-5 mr-3" />
                                            {t("notifications.title")}
                                        </div>
                                        {unreadCount > 0 && (
                                            <span className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white text-xs font-bold rounded-full px-2 py-1 min-w-[20px] text-center">
                                                {unreadCount > 99 ? "99+" : unreadCount}
                                            </span>
                                        )}
                                    </button>
                                )}

                                {/* Mobile Language & Currency Switchers */}
                                <div className="px-4 py-3 space-y-3">
                                    <LanguageSwitcher />
                                    <CurrencySwitcher />
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

            {/* Mobile Notification Modal removed. Notifications now use dropdown only for all devices. */}

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
