'use client'

import { LogoutButton } from '@/components/logout-button'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { LanguageSwitcher } from '@/components/language-switcher'
import { CurrencySwitcher } from '@/components/currency-switcher'
import { CartDialog } from '@/app/_components/cart-dialog'
import { WishlistDialog } from '@/app/_components/wishlist-dialog'
import { useCart } from '@/app/_hooks/cart/useCart'
import { useWishlist } from '@/app/_hooks/wishlist/useWishlist'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useRef, useEffect } from 'react'
import { Bell, ExternalLink, ShieldUser } from 'lucide-react'
import { useNotifications } from '@/app/_hooks/use-notifications'
import { ProductDetailsPage } from '../main/_components/product-details-page'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { MenuIcon } from '../_icons/menu_icon'
import { AdminIcon } from '../_icons/admin_icon'
import { WishlistIcon } from '../_icons/wishlist_icon'
import { CartIcon } from '../_icons/cart_icon'
import { SearchIcon } from '../_icons/search_icon'
import { AccountIcon } from '../_icons/account_icon'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { Sheet, SheetContent } from '@/components/ui/sheet'

export default function NavBar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [isWishlistOpen, setIsWishlistOpen] = useState(false)
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const { t } = useLanguage()
    const router = useRouter()
    const loadMoreRef = useRef<HTMLDivElement>(null)

    const { data: currentUser, isLoading } = useAuth()
    const { data: cartItems = [] } = useCart()
    const { data: wishlistItems = [] } = useWishlist()

    const userRoles = useMemo(() => {
        return currentUser?.app_metadata?.roles || []
    }, [currentUser])

    const cartItemCount = cartItems.length
    const wishlistItemCount = wishlistItems.length

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
    } = useNotifications(currentUser?.id || '')

    const handleNotificationClick = (notification: any) => {
        // Mark notification as read if it's unread
        if (!notification.yest_lu) {
            markAsSeen(notification.ynotificationid)
        }

        // Navigate to the link if it exists
        if (notification.ylien) {
            router.push(notification.ylien)
            setIsNotificationsOpen(false) // Close the notification dropdown
        }
    }

    // Intersection Observer for infinite scroll
    useEffect(() => {
        if (
            !loadMoreRef.current ||
            !hasNextPage ||
            notifFetchingNext ||
            notifLoading
        )
            return

        const observer = new IntersectionObserver(
            (entries) => {
                if (
                    entries[0].isIntersecting &&
                    hasNextPage &&
                    !notifFetchingNext &&
                    !notifLoading
                ) {
                    fetchNextPage()
                }
            },
            { threshold: 0.1 }
        )

        observer.observe(loadMoreRef.current)

        return () => observer.disconnect()
    }, [hasNextPage, notifFetchingNext, notifLoading, fetchNextPage])

    return (
        <>
            <nav className="fixed top-0 z-50 flex h-24 w-full bg-white/30 px-12">
                <div className="flex flex-1 items-center justify-start">
                    <NavBarIconButton
                        variant="leading"
                        onClick={() => setIsMenuOpen(true)}
                    >
                        <MenuIcon />
                    </NavBarIconButton>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <Image
                        src="/images/morph_logo.webp"
                        alt="Morph Logo"
                        height={77}
                        width={228}
                    />
                </div>
                <div className="flex flex-1 items-center justify-end gap-4">
                    <NavBarIconButton onClick={() => router.push('/admin')}>
                        <AdminIcon />
                    </NavBarIconButton>
                    <NavBarIconButton onClick={() => setIsWishlistOpen(true)}>
                        <WishlistIcon />
                    </NavBarIconButton>
                    <NavBarIconButton onClick={() => setIsCartOpen(true)}>
                        <CartIcon />
                    </NavBarIconButton>
                    <NavBarIconButton>
                        <SearchIcon />
                    </NavBarIconButton>
                    <NavBarIconButton>
                        <AccountIcon />
                    </NavBarIconButton>
                </div>
            </nav>

            <CartDialog
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
            />
            <WishlistDialog
                isOpen={isWishlistOpen}
                onClose={() => setIsWishlistOpen(false)}
            />

            {selectedProduct && (
                <ProductDetailsPage
                    productData={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}

            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetContent side="left"></SheetContent>
            </Sheet>
        </>
    )
}

function NavBarIconButton({
    onClick,
    variant = 'trailing',
    children,
}: {
    onClick?: () => void
    variant?: 'leading' | 'trailing'
    children: React.ReactNode
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'stroke-morpheus-blue-dark flex cursor-pointer items-center justify-center transition duration-300 hover:stroke-white',
                variant === 'leading' ? 'size-9' : 'size-10'
            )}
        >
            {children}
        </button>
    )
}
