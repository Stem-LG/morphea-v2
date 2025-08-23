'use client'

import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { CurrencySwitcher } from '@/app/_components/nav_bar/currency-switcher'
import { CartDialog } from '@/app/_components/cart-dialog'
import { WishlistDialog } from '@/app/_components/wishlist-dialog'
import { useCart } from '@/app/_hooks/cart/useCart'
import { useWishlist } from '@/app/_hooks/wishlist/useWishlist'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useRef, useEffect, Fragment } from 'react'
import { useNotifications } from '@/app/_hooks/use-notifications'
import { ProductDetailsPage } from '../../main/_components/product-details-page'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { MenuIcon } from '../../_icons/menu_icon'
import { AdminIcon } from '../../_icons/admin_icon'
import { WishlistIcon } from '../../_icons/wishlist_icon'
import { CartIcon } from '../../_icons/cart_icon'
import { SearchIcon } from '../../_icons/search_icon'
import { AccountIcon } from '../../_icons/account_icon'
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetFooter,
    SheetTitle,
} from '@/components/ui/sheet'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LanguageSwitcher } from './language-switcher'
import { NavBarIconButton } from './navbar_icon_button'
import { Separator } from '@/components/ui/separator'
import { ChevronRight, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
            <nav className="fixed top-0 z-50 flex h-24 w-full bg-white/40 px-12">
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
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <NavBarIconButton>
                                <AccountIcon />
                            </NavBarIconButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            side="bottom"
                            align="end"
                            className="w-48"
                        >
                            <DropdownMenuLabel>
                                {currentUser && !currentUser.is_anonymous
                                    ? 'Mon compte'
                                    : 'Compte invité'}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <LanguageSwitcher />
                            <CurrencySwitcher />
                            <DropdownMenuSeparator />

                            {currentUser && !currentUser.is_anonymous ? (
                                <>
                                    <DropdownMenuItem>
                                        <Link href="/account/profile">
                                            {t('profile')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Link href="/account/orders">
                                            {t('orders')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Link href="/account/addresses">
                                            {t('addresses')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Link href="/auth/logout">
                                            {t('logout')}
                                        </Link>
                                    </DropdownMenuItem>
                                </>
                            ) : (
                                <>
                                    <DropdownMenuItem>
                                        <Link href="/auth/sign-up">
                                            {t('register')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Link href="/auth/login">
                                            {' '}
                                            {t('login')}{' '}
                                        </Link>
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
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

            <NavBarSheet
                isMenuOpen={isMenuOpen}
                setIsMenuOpen={setIsMenuOpen}
            />

            <div className="h-24" />
        </>
    )
}

function NavBarSheet({
    isMenuOpen,
    setIsMenuOpen,
}: {
    isMenuOpen: boolean
    setIsMenuOpen: any
}) {
    const navbarItems = [
        { name: 'Visite Virtuelle', href: '/main' },
        { name: 'Acceuil', href: '/' },
        { name: 'Nouveauté', href:'/shop' },
        { name: 'Categories', subItems: ['hh'] },
        { name: 'A Propos', href: '/about' },
        { name: 'Contactez-Nous', href: '/contact' },
    ]

    const navbarFooterItems = [
        { name: 'Mon Compte', href: '/profile' },
        { name: 'Favoris', onclick: () => {} },
        { name: 'Mes Commandes', href: '/orders' },
    ]

    return (
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTitle />
            <SheetContent side="left" className="bg-white">
                <SheetClose>
                    <div className="absolute top-10 right-7">
                        <XIcon className="size-5" />
                    </div>
                </SheetClose>
                <div className="flex items-center justify-center py-4 text-3xl">
                    <h1 className="font-recia font-medium">Menu</h1>
                </div>
                <Separator />
                <div className="flex flex-col px-6">
                    {navbarItems.map((item) => {
                        const hasChildren =
                            item.subItems && item.subItems.length > 0

                        const hasHref = !!item.href

                        return (
                            <Fragment key={item.name}>
                                <Button
                                    variant="ghost"
                                    className="font-supreme hover:bg-morpheus-blue-lighter h-14 justify-between rounded-none text-xl text-neutral-400 hover:text-white"
                                    asChild={hasHref}
                                >
                                    {hasHref ? (
                                        <Link href={item.href!}>
                                            {item.name}
                                        </Link>
                                    ) : (
                                        <>
                                            <span className='ml-1'>{item.name}</span>
                                            {hasChildren && (
                                                <ChevronRight className="size-6" />
                                            )}
                                        </>
                                    )}
                                </Button>
                                <Separator />
                            </Fragment>
                        )
                    })}
                </div>
                <SheetFooter className="">
                    <div className="flex flex-col px-2">
                        {navbarFooterItems.map((item) => {
                            const hasOnClick = !!item.onclick
                            const hasHref = !!item.href

                            return (
                                <Fragment key={item.name}>
                                    <Button
                                        variant="ghost"
                                        className={cn(
                                            'font-supreme h-12 justify-start rounded-none text-lg text-neutral-400',
                                            hasOnClick && 'w-full text-left'
                                        )}
                                        onClick={item.onclick}
                                        asChild={hasHref}
                                    >
                                        {hasHref ? (
                                            <Link href={item.href!}>
                                                {item.name}
                                            </Link>
                                        ) : (
                                            item.name
                                        )}
                                    </Button>
                                    <Separator />
                                </Fragment>
                            )
                        })}
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
