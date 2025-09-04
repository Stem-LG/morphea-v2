'use client'

import { useAuth, useLogout, useUserRoles } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { CurrencySwitcher } from '@/app/_components/nav_bar/currency-switcher'
import { CartDialog } from '@/app/_components/cart-dialog'
import { WishlistDialog } from '@/app/_components/wishlist-dialog'
import { NotificationsDialog } from '@/app/_components/notifications-dialog'
// import { useCart } from '@/app/_hooks/cart/useCart'
// import { useWishlist } from '@/app/_hooks/wishlist/useWishlist'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, Fragment, useMemo } from 'react'
import { useNotifications } from '@/app/_hooks/use-notifications'
import { useScrollDirection } from '@/hooks/use-scroll-direction'
import { ProductDetailsPage } from '../../main/_components/product-details-page'
import Image from 'next/image'
import { cn } from '@/lib/utils'
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
import { CategoryImageHeader } from './category-image-header'

export default function NavBar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [isWishlistOpen, setIsWishlistOpen] = useState(false)
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
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
    // const { data: cartItems = [] } = useCart()
    // const { data: wishlistItems = [] } = useWishlist()

    // const cartItemCount = cartItems.length
    // const wishlistItemCount = wishlistItems.length

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
                className={`fixed top-0 z-50 flex h-18 w-full bg-[#bbbbbb77] px-4 transition-transform duration-300 ease-in-out md:h-18 md:px-6 lg:px-12 ${
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
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/profile"
                                            className="w-full"
                                        >
                                            {t('profile')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/my-orders"
                                            className="w-full"
                                        >
                                            {t('orders')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <button
                                            onClick={logout}
                                            className="w-full text-left"
                                        >
                                            {t('logout')}
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
                                            {t('register')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/auth/login"
                                            className="w-full"
                                        >
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
            <NotificationsDialog
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
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
                hasAdminAccess={hasAdminAccess}
                currentUser={currentUser}
                logout={logout}
                t={t}
                setIsCartOpen={setIsCartOpen}
                setIsWishlistOpen={setIsWishlistOpen}
            />

            <div className="h-24 bg-white" />
        </>
    )
}

// Component for rendering category navigation with subcategories
function CategoryNavigation({
    onCategoryClick,
    onParentCategoryClick,
}: {
    onCategoryClick?: () => void
    onParentCategoryClick?: (category: any) => void
}) {
    const { data: categories, isLoading } = useCategories()

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

    const renderCategory = (category: any) => {
        const hasChildren = category.children && category.children.length > 0

        return (
            <div key={category.xcategprodid}>
                {hasChildren ? (
                    <Button
                        variant="ghost"
                        className="hover:text-morpheus-blue-dark h-12 w-full justify-between rounded-none text-lg text-neutral-600 hover:bg-gray-50"
                        onClick={() => onParentCategoryClick?.(category)}
                    >
                        <span className="flex-1 text-left">
                            {category.xcategprodintitule}
                        </span>
                        <ChevronRight className="size-5" />
                    </Button>
                ) : (
                    <Button
                        variant="ghost"
                        className="hover:text-morpheus-blue-dark h-12 w-full justify-start rounded-none text-lg text-neutral-600 hover:bg-gray-50"
                        asChild
                    >
                        <Link
                            href={`/shop?category=${category.xcategprodid}`}
                            onClick={onCategoryClick}
                        >
                            {category.xcategprodintitule}
                        </Link>
                    </Button>
                )}
                <Separator />
            </div>
        )
    }

    return (
        <div>
            {/* Category Tree */}
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
    const [selectedParentCategory, setSelectedParentCategory] =
        useState<any>(null)
    const [showSubcategories, setShowSubcategories] = useState(false)

    const handleParentCategoryClick = (category: any) => {
        setSelectedParentCategory(category)
        setShowSubcategories(true)
    }

    const handleBackToCategories = () => {
        setShowSubcategories(false)
        setSelectedParentCategory(null)
    }

    const navbarItems: NavbarItem[] = [
        { name: 'Visite Virtuelle', href: '/main' },
        { name: 'Acceuil', href: '/' },
        { name: 'Nouveauté', href: '/shop' },
        {
            name: 'Categories',
            action: () => setShowCategories(!showCategories),
        },
        { name: 'A Propos', href: '/about' },
        { name: 'Contactez-Nous', href: '/contact' },
    ]

    const navbarFooterItems = useMemo(() => {
        const isAuthenticated = currentUser && !currentUser.is_anonymous

        if (!isAuthenticated) {
            // For anonymous users: show cart, favourites, login and register
            return [
                {
                    name: 'Favoris',
                    onclick: () => {
                        setIsWishlistOpen(true)
                        setIsMenuOpen(false)
                    },
                },
                {
                    name: 'Panier',
                    onclick: () => {
                        setIsCartOpen(true)
                        setIsMenuOpen(false)
                    },
                },
                { name: t('login'), href: '/auth/login' },
                { name: t('register'), href: '/auth/sign-up' },
            ]
        } else {
            // For authenticated users: show all account-related items
            return [
                { name: 'Mon Compte', href: '/profile' },
                {
                    name: 'Favoris',
                    onclick: () => {
                        setIsWishlistOpen(true)
                        setIsMenuOpen(false)
                    },
                },
                {
                    name: 'Panier',
                    onclick: () => {
                        setIsCartOpen(true)
                        setIsMenuOpen(false)
                    },
                },
                { name: 'Mes Commandes', href: '/orders' },
                ...(hasAdminAccess
                    ? [{ name: 'Administration', href: '/admin' }]
                    : []),
                {
                    name: t('logout'),
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
                className={`flex h-full bg-white transition-all duration-300 ${
                    showSubcategories
                        ? 'w-[min(400px,90vw)] sm:w-[min(800px,90vw)] sm:max-w-[90vw]'
                        : 'w-[min(400px,90vw)] sm:max-w-[90vw]'
                }`}
            >
                {/* Close button - positioned relative to the entire sheet */}
                <SheetClose>
                    <div className="absolute top-10 right-7 z-10">
                        <XIcon className="size-5" />
                    </div>
                </SheetClose>

                <div className="flex h-full w-full">
                    {/* Main Navigation Column */}
                    <div
                        className={`flex h-full flex-col overflow-hidden ${
                            showSubcategories
                                ? 'hidden sm:flex sm:w-[min(400px,50%)] sm:border-r sm:border-gray-200'
                                : 'w-full'
                        }`}
                    >
                        {/* Fixed Header */}
                        <div className="flex-shrink-0">
                            <div className="flex items-center justify-center py-4 text-3xl">
                                <h1 className="font-recia font-medium">Menu</h1>
                            </div>
                            <Separator />
                        </div>

                        {/* Scrollable Content Area */}
                        <ScrollArea className="flex-1 overflow-hidden">
                            <div className="flex flex-col px-6">
                                {navbarItems.map((item) => {
                                    const hasHref = !!item.href
                                    const hasAction = !!item.action
                                    const isCategories =
                                        item.name === 'Categories'

                                    return (
                                        <Fragment key={item.name}>
                                            <Button
                                                variant="ghost"
                                                className="font-supreme hover:bg-morpheus-blue-lighter h-14 justify-between rounded-none text-xl text-neutral-400 hover:text-white"
                                                asChild={hasHref}
                                                onClick={
                                                    hasAction
                                                        ? item.action
                                                        : hasHref
                                                        ? () => setIsMenuOpen(false)
                                                        : undefined
                                                }
                                            >
                                                {hasHref ? (
                                                    <Link href={item.href!}>
                                                        {item.name}
                                                    </Link>
                                                ) : (
                                                    <>
                                                        <span className="ml-1">
                                                            {item.name}
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
                                                        onParentCategoryClick={
                                                            handleParentCategoryClick
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </Fragment>
                                    )
                                })}
                            </div>
                        </ScrollArea>

                        {/* Footer Items within Scrollable Area */}
                        <div className="mt-2 px-6 pb-4">
                            <Separator className="mb-4" />
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
                                                    hasOnClick &&
                                                        'w-full text-left'
                                                )}
                                                onClick={
                                                    item.onclick ||
                                                    (hasHref ? () => setIsMenuOpen(false) : undefined)
                                                }
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
                        </div>
                    </div>

                    {/* Subcategory Column - Only visible when a parent category is selected */}
                    {showSubcategories && selectedParentCategory && (
                        <div className="relative -top-4 left-[1px] flex h-full w-full flex-col overflow-hidden sm:w-[min(400px,50%)]">
                            {/* Category Image Header */}
                            <div className="flex-shrink-0">
                                <CategoryImageHeader
                                    category={selectedParentCategory}
                                    onBack={handleBackToCategories}
                                />
                            </div>

                            {/* Scrollable Subcategories */}
                            <ScrollArea className="flex-1 overflow-hidden">
                                <div className="flex flex-col px-6 py-4">
                                    {selectedParentCategory?.children?.map(
                                        (subcategory: any) => (
                                            <Fragment
                                                key={subcategory.xcategprodid}
                                            >
                                                <Button
                                                    variant="ghost"
                                                    className="font-supreme hover:bg-morpheus-blue-lighter h-14 justify-start rounded-none text-xl text-neutral-400 hover:text-white"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/shop?category=${subcategory.xcategprodid}`}
                                                        onClick={() => {
                                                            setIsMenuOpen(false)
                                                            setShowSubcategories(
                                                                false
                                                            )
                                                        }}
                                                    >
                                                        {
                                                            subcategory.xcategprodintitule
                                                        }
                                                    </Link>
                                                </Button>
                                                <Separator />
                                            </Fragment>
                                        )
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
