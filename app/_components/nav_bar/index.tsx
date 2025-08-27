'use client'

import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { CurrencySwitcher } from '@/app/_components/nav_bar/currency-switcher'
import { CartDialog } from '@/app/_components/cart-dialog'
import { WishlistDialog } from '@/app/_components/wishlist-dialog'
// import { useCart } from '@/app/_hooks/cart/useCart'
// import { useWishlist } from '@/app/_hooks/wishlist/useWishlist'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, Fragment } from 'react'
// import { useNotifications } from '@/app/_hooks/use-notifications'
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

export default function NavBar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [isWishlistOpen, setIsWishlistOpen] = useState(false)
    // const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const { t } = useLanguage()
    const router = useRouter()
    // const loadMoreRef = useRef<HTMLDivElement>(null)

    const {
        data: currentUser,
        //  isLoading
    } = useAuth()
    // const { data: cartItems = [] } = useCart()
    // const { data: wishlistItems = [] } = useWishlist()

    // const userRoles = useMemo(() => {
    //     return currentUser?.app_metadata?.roles || []
    // }, [currentUser])

    // const cartItemCount = cartItems.length
    // const wishlistItemCount = wishlistItems.length

    // Notifications
    // const {
    //     notifications,
    //     unreadCount,
    //     hasNextPage,
    //     fetchNextPage,
    //     isLoading: notifLoading,
    //     isFetchingNextPage: notifFetchingNext,
    //     isError: notifError,
    //     markAsSeen,
    //     markAllAsSeen,
    // } = useNotifications(currentUser?.id || '')

    // const handleNotificationClick = (notification: any) => {
    //     // Mark notification as read if it's unread
    //     if (!notification.yest_lu) {
    //         markAsSeen(notification.ynotificationid)
    //     }

    //     // Navigate to the link if it exists
    //     if (notification.ylien) {
    //         router.push(notification.ylien)
    //         setIsNotificationsOpen(false) // Close the notification dropdown
    //     }
    // }

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
            <nav className="fixed top-0 z-50 flex h-18 w-full bg-white/40 px-4 md:h-24 md:px-6 lg:px-12">
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
                <div className="flex flex-1 md:hidden" />
                <div className="hidden flex-1 items-center justify-end gap-4 md:flex">
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

// Component for rendering category navigation with subcategories
function CategoryNavigation({
    onCategoryClick,
}: {
    onCategoryClick?: () => void
}) {
    const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
        new Set()
    )
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

    const toggleCategory = (categoryId: number) => {
        const newExpanded = new Set(expandedCategories)
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId)
        } else {
            newExpanded.add(categoryId)
        }
        setExpandedCategories(newExpanded)
    }

    const renderCategory = (category: any, level: number = 0) => {
        const hasChildren = category.children && category.children.length > 0
        const isExpanded = expandedCategories.has(category.xcategprodid)
        const paddingLeft = level * 16

        return (
            <div key={category.xcategprodid}>
                {hasChildren ? (
                    <Button
                        variant="ghost"
                        className="hover:text-morpheus-blue-dark h-12 w-full justify-between rounded-none text-lg text-neutral-600 hover:bg-gray-50"
                        onClick={() => toggleCategory(category.xcategprodid)}
                        style={{ paddingLeft: `${paddingLeft + 24}px` }}
                    >
                        <span className="flex-1 text-left">
                            {category.xcategprodintitule}
                        </span>
                        {isExpanded ? (
                            <ChevronDown className="size-5" />
                        ) : (
                            <ChevronRight className="size-5" />
                        )}
                    </Button>
                ) : (
                    <Button
                        variant="ghost"
                        className="hover:text-morpheus-blue-dark h-12 w-full justify-start rounded-none text-lg text-neutral-600 hover:bg-gray-50"
                        asChild
                        style={{ paddingLeft: `${paddingLeft + 24}px` }}
                    >
                        <Link
                            href={`/shop?category=${category.xcategprodid}`}
                            onClick={onCategoryClick}
                        >
                            {category.xcategprodintitule}
                        </Link>
                    </Button>
                )}
                {hasChildren && isExpanded && (
                    <div className="bg-gray-50">
                        {category.children.map((child: any) =>
                            renderCategory(child, level + 1)
                        )}
                    </div>
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
}: {
    isMenuOpen: boolean
    setIsMenuOpen: any
}) {
    const [showCategories, setShowCategories] = useState(false)

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

    const navbarFooterItems = [
        { name: 'Mon Compte', href: '/profile' },
        { name: 'Favoris', onclick: () => {} },
        { name: 'Panier', onclick: () => {} },
        { name: 'Mes Commandes', href: '/orders' },
        { name: 'Administration', href: '/admin' },
    ]

    return (
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTitle />
            <SheetContent side="left" className="flex h-full flex-col bg-white">
                <SheetClose>
                    <div className="absolute top-10 right-7 z-10">
                        <XIcon className="size-5" />
                    </div>
                </SheetClose>

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
                            const isCategories = item.name === 'Categories'

                            return (
                                <Fragment key={item.name}>
                                    <Button
                                        variant="ghost"
                                        className="font-supreme hover:bg-morpheus-blue-lighter h-14 justify-between rounded-none text-xl text-neutral-400 hover:text-white"
                                        asChild={hasHref}
                                        onClick={
                                            hasAction ? item.action : undefined
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
                                            />
                                        </div>
                                    )}
                                </Fragment>
                            )
                        })}
                    </div>

                    {/* Footer Items within Scrollable Area */}
                    <div className="mt-8 px-6 pb-4">
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
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}
