'use client'

import { useAuth, useLogout, useUserRoles } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { CurrencySwitcher } from '@/app/_components/nav_bar/currency-switcher'
import { CartDialog } from '@/app/_components/cart-dialog'
import { WishlistDialog } from '@/app/_components/wishlist-dialog'
import { NotificationsDialog } from '@/app/_components/notifications-dialog'
import { useCart } from '@/app/_hooks/cart/useCart'
import { useWishlist } from '@/app/_hooks/wishlist/useWishlist'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, Fragment, useMemo } from 'react'
import { useNotifications } from '@/app/_hooks/use-notifications'
import { useScrollDirection } from '@/hooks/use-scroll-direction'
import { ProductDetailsPage } from '../../main/_components/product-details-page'
import { SearchDialog } from '@/app/_components/search-dialog'
import Image from 'next/image'

import { MenuIcon } from '../../_icons/menu_icon'
import { AdminIcon } from '../../_icons/admin_icon'
import { WishlistIcon } from '../../_icons/wishlist_icon'
import { CartIcon } from '../../_icons/cart_icon'
import { SearchIcon } from '../../_icons/search_icon'
import { AccountIcon } from '../../_icons/account_icon'
import { NotificationIcon } from '../../_icons/notification_icon'
import {
    Sheet,
    SheetClose,
    SheetContent,
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
import { ChevronRight, XIcon, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCategories } from '@/hooks/useCategories'
import { organizeCategoriesIntoTree } from '@/app/admin/categories/_components/category-tree-utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'

export default function NavBar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [isWishlistOpen, setIsWishlistOpen] = useState(false)
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const { t } = useLanguage()
    const router = useRouter()
    const { isVisible } = useScrollDirection()
    // const loadMoreRef = useRef<HTMLDivElement>(null)

    const {
        data: currentUser,
        //  isLoading
    } = useAuth()
    const { logout } = useLogout()
    const { hasAdminAccess } = useUserRoles()
    const { data: cartItems = [] } = useCart()
    const { data: wishlistItems = [] } = useWishlist()

    const cartItemCount = cartItems.length
    const wishlistItemCount = wishlistItems.length

    // Notifications - only get unreadCount for the badge
    console.log('NavBar - currentUser:', currentUser)
    console.log('NavBar - userId:', currentUser?.id)
    const { unreadCount } = useNotifications(currentUser?.id || '')

    // // Intersection Observer for infinite scroll
    // useEffect(() => {
    //     if (
    //         !loadMoreRef.current ||
    //         !hasNextPage ||
    //         notifFetchingNext ||
    //         notifLoading
    //     )
    //         return

    //     const observer = new IntersectionObserver(
    //         (entries) => {
    //             if (
    //                 entries[0].isIntersecting &&
    //                 hasNextPage &&
    //                 !notifFetchingNext &&
    //                 !notifLoading
    //             ) {
    //                 fetchNextPage()
    //             }
    //         },
    //         { threshold: 0.1 }
    //     )

    //     observer.observe(loadMoreRef.current)

    //     return () => observer.disconnect()
    // }, [hasNextPage, notifFetchingNext, notifLoading, fetchNextPage])

    return (
        <>
            <nav
                className={`fixed top-0 z-[80] flex h-18 w-full bg-[#bbbbbb77] px-4 transition-transform duration-300 ease-in-out md:h-18 md:px-6 lg:px-12 ${
                    isVisible ? 'translate-y-0' : '-translate-y-full'
                }`}
            >
                <div className="flex flex-1 items-center justify-start">
                    <NavBarIconButton
                        variant="leading"
                        onClick={() => setIsMenuOpen(true)}
                    >
                        <MenuIcon />
                    </NavBarIconButton>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <Link
                        href={{
                            pathname: '/',
                        }}
                    >
                        <Image
                            src="/images/morph_logo.webp"
                            alt="Morph Logo"
                            height={70}
                            width={228}
                        />
                    </Link>
                </div>
                <div className="flex flex-1 md:hidden" />
                <div className="hidden flex-1 items-center justify-end gap-2 md:flex">
                    {hasAdminAccess && (
                        <NavBarIconButton onClick={() => router.push('/admin')}>
                            <AdminIcon />
                        </NavBarIconButton>
                    )}
                    {currentUser && !currentUser.is_anonymous && (
                        <div className="relative">
                            <NavBarIconButton
                                onClick={() => setIsNotificationsOpen(true)}
                            >
                                <NotificationIcon />
                            </NavBarIconButton>
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </div>
                    )}
                    <div className="relative">
                        <NavBarIconButton
                            onClick={() => setIsWishlistOpen(true)}
                        >
                            <WishlistIcon />
                        </NavBarIconButton>
                        {wishlistItemCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                                {wishlistItemCount > 9
                                    ? '9+'
                                    : wishlistItemCount}
                            </span>
                        )}
                    </div>
                    <div className="relative">
                        <NavBarIconButton onClick={() => setIsCartOpen(true)}>
                            <CartIcon />
                        </NavBarIconButton>
                        {cartItemCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                                {cartItemCount > 9 ? '9+' : cartItemCount}
                            </span>
                        )}
                    </div>
                    <NavBarIconButton onClick={() => setIsSearchOpen(true)}>
                        <SearchIcon />
                    </NavBarIconButton>
                    <DropdownMenu modal={false}>
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
                                    ? t('nav.account')
                                    : t('nav.guestAccount')}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <LanguageSwitcher />
                            <CurrencySwitcher />
                            <DropdownMenuSeparator />

                            {currentUser && !currentUser.is_anonymous ? (
                                <>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/profile"
                                            className="w-full"
                                        >
                                            {t('nav.profile')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/my-orders"
                                            className="w-full"
                                        >
                                            {t('orders.myOrders')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <button
                                            onClick={logout}
                                            className="w-full text-left"
                                        >
                                            {t('common.logout')}
                                        </button>
                                    </DropdownMenuItem>
                                </>
                            ) : (
                                <>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/auth/sign-up"
                                            className="w-full"
                                        >
                                            {t('auth.signUp')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/auth/login"
                                            className="w-full"
                                        >
                                            {' '}
                                                                                        {t('auth.signIn')} {' '}
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
            <NotificationsDialog
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
            />
            <SearchDialog
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                onProductSelect={setSelectedProduct}
            />

            {selectedProduct && (
                <ProductDetailsPage
                    productData={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    extraTop
                />
            )}

            <NavBarSheet
                isMenuOpen={isMenuOpen}
                setIsMenuOpen={setIsMenuOpen}
                hasAdminAccess={hasAdminAccess}
                currentUser={currentUser}
                logout={logout}
                t={t}
                setIsCartOpen={setIsCartOpen}
                setIsWishlistOpen={setIsWishlistOpen}
            />

            <div className="h-18 bg-white" />
        </>
    )
}

// Component for rendering category navigation with subcategories in tree view
function CategoryNavigation({
    onCategoryClick,
}: {
    onCategoryClick?: () => void
}) {
    const { data: categories, isLoading } = useCategories()
    const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
        new Set()
    )

    if (isLoading) {
        return (
            <div className="py-4">
                <div className="animate-pulse space-y-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 rounded bg-gray-200" />
                    ))}
                </div>
            </div>
        )
    }

    if (!categories || categories.length === 0) {
        return null
    }

    const categoryTree = organizeCategoriesIntoTree(
        categories.map((cat) => ({ ...cat, yprod: [{ count: 0 }] }))
    )

    const toggleCategory = (categoryId: number) => {
        setExpandedCategories((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId)
            } else {
                newSet.add(categoryId)
            }
            return newSet
        })
    }

    const renderCategory = (category: any, depth: number = 0) => {
        const hasChildren = category.children && category.children.length > 0
        const isExpanded = expandedCategories.has(category.xcategprodid)
        const paddingLeft = depth * 16 + 24 // 16px per level + base padding

        return (
            <div key={category.xcategprodid}>
                {hasChildren ? (
                    <Collapsible
                        open={isExpanded}
                        onOpenChange={() =>
                            toggleCategory(category.xcategprodid)
                        }
                    >
                        <CollapsibleTrigger asChild>
                            <Button
                                variant="ghost"
                                className="hover:text-morpheus-blue-dark h-12 w-full justify-between rounded-none text-lg text-neutral-600 transition-all duration-200 hover:bg-gray-50"
                                style={{ paddingLeft: `${paddingLeft}px` }}
                            >
                                <span className="flex-1 text-left">
                                    {category.xcategprodintitule}
                                </span>
                                <ChevronDown
                                    className={`size-5 transition-transform duration-200 ${
                                        isExpanded ? 'rotate-180' : ''
                                    }`}
                                />
                            </Button>
                        </CollapsibleTrigger>
                        <Separator />
                        <CollapsibleContent className="space-y-0">
                            {category.children.map((child: any) =>
                                renderCategory(child, depth + 1)
                            )}
                        </CollapsibleContent>
                    </Collapsible>
                ) : (
                    <>
                        <Button
                            variant="ghost"
                            className="hover:text-morpheus-blue-dark h-12 w-full justify-start rounded-none text-lg text-neutral-600 transition-all duration-200 hover:bg-gray-50"
                            style={{ paddingLeft: `${paddingLeft}px` }}
                            asChild
                        >
                            <Link
                                href={`/shop?categoryId=${category.xcategprodid}`}
                                onClick={onCategoryClick}
                            >
                                {category.xcategprodintitule}
                            </Link>
                        </Button>
                        <Separator />
                    </>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-0">
            {categoryTree.map((category) => renderCategory(category))}
        </div>
    )
}

type NavbarItem = {
    name: string
    href?: string
    action?: () => void
}

function NavBarSheet({
    isMenuOpen,
    setIsMenuOpen,
    hasAdminAccess,
    currentUser,
    logout,
    t,
    setIsCartOpen,
    setIsWishlistOpen,
}: {
    isMenuOpen: boolean
    setIsMenuOpen: any
    hasAdminAccess: boolean
    currentUser: any
    logout: () => void
    t: (key: string) => string
    setIsCartOpen: (open: boolean) => void
    setIsWishlistOpen: (open: boolean) => void
}) {
    const [showCategories, setShowCategories] = useState(false)

    const navbarItems: NavbarItem[] = [
        { name: t('nav.virtualTours'), href: '/main' },
        { name: t('nav.home'), href: '/' },
        { name: t('nav.newProducts'), href: '/shop' },
        {
            name: t('nav.categories'),
            action: () => setShowCategories(!showCategories),
        },
        {
            name: t('nav.about'),
            href: '/a-lorigine-de-morphea',
        },
        { name: t('nav.contactUs'), href: 'mailto:contact@morpheus-sa.com' },
    ]

    const navbarFooterItems = useMemo(() => {
        const isAuthenticated = currentUser && !currentUser.is_anonymous

        if (!isAuthenticated) {
            // For anonymous users: show cart, favourites, login and register
            return [
                {
                    name: t('nav.favorites'),
                    onclick: () => {
                        setIsWishlistOpen(true)
                        setIsMenuOpen(false)
                    },
                },
                {
                    name: t('nav.cart'),
                    onclick: () => {
                        setIsCartOpen(true)
                        setIsMenuOpen(false)
                    },
                },
                { name: t('auth.signIn'), href: '/auth/login' },
                { name: t('auth.signUp'), href: '/auth/sign-up' },
            ]
        } else {
            // For authenticated users: show all account-related items
            return [
                { name: t('nav.myAccount'), href: '/profile' },
                {
                    name: t('nav.favorites'),
                    onclick: () => {
                        setIsWishlistOpen(true)
                        setIsMenuOpen(false)
                    },
                },
                {
                    name: t('nav.cart'),
                    onclick: () => {
                        setIsCartOpen(true)
                        setIsMenuOpen(false)
                    },
                },
                { name: t('nav.myOrders'), href: '/orders' },
                ...(hasAdminAccess
                    ? [{ name: t('nav.administration'), href: '/admin' }]
                    : []),
                {
                    name: t('common.logout'),
                    onclick: () => {
                        logout()
                        setIsMenuOpen(false)
                    },
                },
            ]
        }
    }, [currentUser, hasAdminAccess, t])

    return (
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTitle />
            <SheetContent
                side="left"
                className="flex h-full w-[min(400px,90vw)] bg-white transition-all duration-300 sm:max-w-[90vw]"
            >
                {/* Close button - positioned relative to the entire sheet */}
                <SheetClose>
                    <div className="absolute top-10 right-7 z-10">
                        <XIcon className="size-5" />
                    </div>
                </SheetClose>

                <div className="flex h-full w-full">
                    {/* Main Navigation Column */}
                    <div className="flex h-full w-full flex-col overflow-hidden">
                        {/* Fixed Header */}
                        <div className="flex-shrink-0">
                            <div className="flex items-center justify-center py-4 text-3xl">
                                <h1 className="font-recia font-medium">Menu</h1>
                            </div>
                            <Separator />
                        </div>

                        {/* Scrollable Content Area */}
                        <ScrollArea className="flex-1 overflow-hidden">
                            <div className="flex flex-col px-6 pb-4">
                                {/* Navbar Items */}
                                {navbarItems.map((item) => {
                                    const hasHref = !!item.href
                                    const hasAction = !!item.action
                                    const isCategories =
                                        item.name === 'Categories'

                                    return (
                                        <Fragment key={item.name}>
                                            <Button
                                                variant="ghost"
                                                className="font-supreme hover:bg-morpheus-blue-lighter h-14 justify-between rounded-none text-lg text-neutral-400 hover:text-white"
                                                asChild={hasHref}
                                                onClick={
                                                    hasAction
                                                        ? item.action
                                                        : hasHref
                                                          ? () =>
                                                                setIsMenuOpen(
                                                                    false
                                                                )
                                                          : undefined
                                                }
                                            >
                                                {hasHref ? (
                                                    <Link href={item.href!}>
                                                        {item.name[0].toUpperCase() +
                                                            item.name
                                                                .toLowerCase()
                                                                .slice(1)}
                                                    </Link>
                                                ) : (
                                                    <>
                                                        <span className="ml-1">
                                                            {item.name[0] +
                                                                item.name
                                                                    .toLowerCase()
                                                                    .slice(1)}
                                                        </span>
                                                        {isCategories &&
                                                            (showCategories ? (
                                                                <ChevronDown className="size-6" />
                                                            ) : (
                                                                <ChevronRight className="size-6" />
                                                            ))}
                                                    </>
                                                )}
                                            </Button>
                                            <Separator />
                                            {isCategories && showCategories && (
                                                <div className="mb-4">
                                                    <CategoryNavigation
                                                        onCategoryClick={() =>
                                                            setIsMenuOpen(false)
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </Fragment>
                                    )
                                })}

                                {/* Footer Items - Combined with same styling */}
                                {navbarFooterItems.map((item) => {
                                    const hasHref = !!item.href

                                    return (
                                        <Fragment key={item.name}>
                                            <Button
                                                variant="ghost"
                                                className="font-supreme hover:bg-morpheus-blue-lighter h-14 justify-start rounded-none text-lg text-neutral-400 hover:text-white"
                                                onClick={
                                                    item.onclick ||
                                                    (hasHref
                                                        ? () =>
                                                              setIsMenuOpen(
                                                                  false
                                                              )
                                                        : undefined)
                                                }
                                                asChild={hasHref}
                                            >
                                                {hasHref ? (
                                                    <Link href={item.href!}>
                                                        {item.name[0].toUpperCase() +
                                                            item.name
                                                                .toLowerCase()
                                                                .slice(1)}
                                                    </Link>
                                                ) : (
                                                    item.name[0].toUpperCase() +
                                                    item.name
                                                        .toLowerCase()
                                                        .slice(1)
                                                )}
                                            </Button>
                                            <Separator />
                                        </Fragment>
                                    )
                                })}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
