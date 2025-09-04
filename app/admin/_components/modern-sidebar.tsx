'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
    LayoutDashboard,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    Users,
    CheckCircle,
    Eye,
    CalendarDays,
    DollarSign,
    FolderTree,
    Package,
    Store,
    ShoppingBag,
    Settings,
} from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'

interface ModernSidebarProps {
    isOpen: boolean
    isCollapsed: boolean
    onToggle: () => void
    onCollapse: () => void
    userRole: 'admin' | 'store_admin'
}

export function ModernSidebar({
    isOpen,
    isCollapsed,
    onToggle,
    onCollapse,
    userRole,
}: ModernSidebarProps) {
    const { t } = useLanguage()
    const pathname = usePathname()
    const [openDropdowns, setOpenDropdowns] = useState<string[]>([])

    // Toggle dropdown state
    const toggleDropdown = (itemId: string) => {
        setOpenDropdowns((prev) =>
            prev.includes(itemId)
                ? prev.filter((id) => id !== itemId)
                : [...prev, itemId]
        )
    }

    // Define menu items based on user role
    const getMenuItems = () => {
        const baseItems = [
            {
                id: 'dashboard',
                label: t('admin.dashboard'),
                icon: LayoutDashboard,
                href: '/admin',
                roles: ['admin', 'store_admin'],
            },
            {
                id: 'events',
                label: t('admin.eventManagement'),
                icon: CalendarDays,
                href: '/admin/events',
                roles: ['admin', 'store_admin'],
            },
            {
                id: 'boutiques',
                label: t('admin.storeManagement'),
                icon: Store,
                href: '/admin/stores',
                roles: ['admin', 'store_admin'],
            },
            {
                id: 'designer-assignments',
                label: t('admin.designerAssignments.title'),
                icon: Users,
                href: '/admin/designer-assignments',
                roles: ['admin'],
            },
            {
                id: 'orders',
                label: t('admin.orders.title'),
                icon: ShoppingBag,
                href: '/admin/orders',
                roles: ['admin'],
            },
            {
                id: 'produit',
                label: t('admin.productManagement'),
                icon: Package,
                roles: ['admin'],
                isDropdown: true,
                children: [
                    {
                        id: 'approvals',
                        label: t('admin.pendingProducts') || 'Pending Products',
                        icon: CheckCircle,
                        href: '/admin/approvals',
                        roles: ['admin'],
                    },
                    {
                        id: 'approved-products',
                        label:
                            t('admin.approvedProducts') || 'Approved Products',
                        icon: Package,
                        href: '/admin/products',
                        roles: ['admin'],
                    },
                    {
                        id: 'rejected-products',
                        label:
                            t('admin.rejectedProducts') || 'Rejected Products',
                        icon: Package,
                        href: '/admin/products/rejected',
                        roles: ['admin'],
                    },
                    {
                        id: 'categories',
                        label: t('admin.categoryManagement'),
                        icon: FolderTree,
                        href: '/admin/categories',
                        roles: ['admin'],
                    },
                ],
            },
            {
                id: 'currencies',
                label: t('admin.currencyManagement'),
                icon: DollarSign,
                href: '/admin/currencies',
                roles: ['admin'],
            },
            {
                id: 'users',
                label: t('admin.userManagement'),
                icon: Users,
                href: '/admin/users',
                roles: ['admin'],
            },
            {
                id: 'tour',
                label: t('admin.virtualTourAdmin'),
                icon: Eye,
                href: '/admin/tour',
                roles: ['admin'],
            },
            {
                id: 'settings',
                label: t('admin.settings.title'),
                icon: Settings,
                href: '/admin/settings',
                roles: ['admin'],
            },
        ]

        return baseItems.filter((item) => item.roles.includes(userRole))
    }

    const menuItems = getMenuItems()

    // Check if any child of a dropdown is active
    const isDropdownActive = (item: any) => {
        if (!item.children) return false
        return item.children.some((child: any) => {
            if (child.href === '/admin') {
                return pathname === '/admin'
            }
            return (
                pathname === child.href || pathname.startsWith(child.href + '/')
            )
        })
    }

    return (
        <>
            {/* Mobile menu button */}
            <div className="fixed top-20 left-4 z-50 lg:hidden">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onToggle}
                    className="border-blue-500 bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-2xl hover:from-blue-700 hover:to-blue-600"
                >
                    {isOpen ? (
                        <X className="h-4 w-4" />
                    ) : (
                        <Menu className="h-4 w-4" />
                    )}
                </Button>
            </div>

            {/* Sidebar */}
            <div
                className={`fixed top-16 left-0 z-50 lg:sticky ${isCollapsed ? 'w-16' : 'w-64'} mh-[calc(100vh-6rem)] transform border-r border-gray-200/50 bg-gradient-to-b from-white to-gray-50 shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-all duration-300 ease-in-out lg:translate-x-0`}
            >
                {/* Header */}
                <div className="border-b border-gray-200/50 p-4">
                    <div className="flex items-center justify-between">
                        {!isCollapsed && (
                            <Link href="/admin">
                                <h1 className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-xl font-bold text-transparent">
                                    {t('admin.adminPanel')}
                                </h1>
                            </Link>
                        )}

                        <div className="flex gap-1">
                            {/* Collapse/Expand button - desktop only */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onCollapse}
                                className="hidden p-2 text-gray-600 hover:bg-gray-100/50 hover:text-gray-900 lg:flex"
                                aria-label={
                                    isCollapsed
                                        ? 'Expand sidebar'
                                        : 'Collapse sidebar'
                                }
                            >
                                {isCollapsed ? (
                                    <ChevronRight className="h-4 w-4" />
                                ) : (
                                    <ChevronLeft className="h-4 w-4" />
                                )}
                            </Button>

                            {/* Close button - mobile only */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onToggle}
                                className="p-2 text-gray-600 hover:bg-gray-100/50 hover:text-gray-900 lg:hidden"
                                aria-label="Close sidebar"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="py-4">
                    {menuItems.map((item, key) => {
                        const Icon = item.icon

                        // Handle dropdown items
                        if (item.isDropdown) {
                            const isDropdownOpen = openDropdowns.includes(
                                item.id
                            )
                            const hasActiveChild = isDropdownActive(item)
                            const isDropdownItemActive = item.href
                                ? (() => {
                                      if (item.href === '/admin') {
                                          return pathname === '/admin'
                                      }
                                      return pathname === item.href
                                  })()
                                : false

                            const isActive =
                                hasActiveChild || isDropdownItemActive

                            return (
                                <div key={key}>
                                    {/* Dropdown trigger */}
                                    {item.href ? (
                                        <Button
                                            variant="ghost"
                                            className={`h-12 w-full rounded-none ${
                                                isCollapsed
                                                    ? 'justify-center'
                                                    : 'justify-start'
                                            } transition-all duration-200 ${
                                                isActive
                                                    ? 'border border-blue-500/30 bg-gradient-to-r from-blue-600/20 to-blue-500/20 text-blue-600'
                                                    : 'text-gray-700 hover:bg-gray-100/50 hover:text-gray-900'
                                            }`}
                                            title={
                                                isCollapsed
                                                    ? item.label
                                                    : undefined
                                            }
                                            asChild
                                        >
                                            <Link
                                                href={item.href}
                                                className="flex w-full items-center"
                                            >
                                                <Icon
                                                    className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'} ${
                                                        isActive
                                                            ? 'text-blue-600'
                                                            : ''
                                                    }`}
                                                />
                                                {!isCollapsed && (
                                                    <>
                                                        <span
                                                            className={`flex-1 text-left ${
                                                                isActive
                                                                    ? 'font-medium text-blue-600'
                                                                    : ''
                                                            }`}
                                                        >
                                                            {item.label}
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-auto p-0 hover:bg-transparent"
                                                            onClick={(e) => {
                                                                e.preventDefault()
                                                                e.stopPropagation()
                                                                toggleDropdown(
                                                                    item.id
                                                                )
                                                            }}
                                                        >
                                                            {isDropdownOpen ? (
                                                                <ChevronUp className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronDown className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </>
                                                )}
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="ghost"
                                            className={`h-12 w-full rounded-none ${
                                                isCollapsed
                                                    ? 'justify-center'
                                                    : 'justify-start'
                                            } transition-all duration-200 ${
                                                isActive
                                                    ? 'border border-blue-500/30 bg-gradient-to-r from-blue-600/20 to-blue-500/20 text-blue-600'
                                                    : 'text-gray-700 hover:bg-gray-100/50 hover:text-gray-900'
                                            }`}
                                            title={
                                                isCollapsed
                                                    ? item.label
                                                    : undefined
                                            }
                                            onClick={() =>
                                                !isCollapsed &&
                                                toggleDropdown(item.id)
                                            }
                                        >
                                            <Icon
                                                className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'} ${
                                                    isActive
                                                        ? 'text-blue-600'
                                                        : ''
                                                }`}
                                            />
                                            {!isCollapsed && (
                                                <>
                                                    <span
                                                        className={`flex-1 text-left ${
                                                            isActive
                                                                ? 'font-medium text-blue-600'
                                                                : ''
                                                        }`}
                                                    >
                                                        {item.label}
                                                    </span>
                                                    {isDropdownOpen ? (
                                                        <ChevronUp className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4" />
                                                    )}
                                                </>
                                            )}
                                        </Button>
                                    )}

                                    {/* Dropdown content */}
                                    {!isCollapsed &&
                                        isDropdownOpen &&
                                        item.children && (
                                            <div className="ml-4 border-l border-gray-300/50">
                                                {item.children.map(
                                                    (
                                                        child: any,
                                                        childKey: number
                                                    ) => {
                                                        const ChildIcon =
                                                            child.icon

                                                        // More precise active state logic for children
                                                        const isChildActive =
                                                            (() => {
                                                                if (
                                                                    child.href ===
                                                                    '/admin'
                                                                ) {
                                                                    return (
                                                                        pathname ===
                                                                        '/admin'
                                                                    )
                                                                }
                                                                if (
                                                                    pathname ===
                                                                    child.href
                                                                ) {
                                                                    return true
                                                                }
                                                                // Special case for /admin/products - only active for exact match
                                                                // to avoid conflict with /admin/products/rejected
                                                                if (
                                                                    child.href ===
                                                                    '/admin/products'
                                                                ) {
                                                                    return (
                                                                        pathname ===
                                                                        '/admin/products'
                                                                    )
                                                                }
                                                                if (
                                                                    pathname.startsWith(
                                                                        child.href +
                                                                            '/'
                                                                    )
                                                                ) {
                                                                    return true
                                                                }
                                                                return false
                                                            })()

                                                        return (
                                                            <Button
                                                                key={childKey}
                                                                variant="ghost"
                                                                className={`h-10 w-full justify-start rounded-none pr-4 pl-8 transition-all duration-200 ${
                                                                    isChildActive
                                                                        ? 'border border-blue-500/30 bg-gradient-to-r from-blue-600/20 to-blue-500/20 text-blue-600'
                                                                        : 'text-gray-700 hover:bg-gray-100/50 hover:text-gray-900'
                                                                }`}
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={
                                                                        child.href
                                                                    }
                                                                    className="flex w-full items-center overflow-hidden"
                                                                >
                                                                    <ChildIcon
                                                                        className={`mr-3 h-4 w-4 flex-shrink-0 ${
                                                                            isChildActive
                                                                                ? 'text-blue-600'
                                                                                : ''
                                                                        }`}
                                                                    />
                                                                    <span
                                                                        className={`truncate ${
                                                                            isChildActive
                                                                                ? 'font-medium text-blue-600'
                                                                                : ''
                                                                        }`}
                                                                    >
                                                                        {
                                                                            child.label
                                                                        }
                                                                    </span>
                                                                </Link>
                                                            </Button>
                                                        )
                                                    }
                                                )}
                                            </div>
                                        )}
                                </div>
                            )
                        }

                        // Handle regular menu items
                        const isActive = (() => {
                            // Dashboard should only be active on exact match
                            if (item.href === '/admin') {
                                return pathname === '/admin'
                            }

                            // For other routes, check exact match or if it's a sub-route
                            if (pathname === item.href) {
                                return true
                            }

                            // Check if current path is a sub-route of this menu item
                            if (pathname.startsWith(item.href + '/')) {
                                return true
                            }

                            return false
                        })()

                        return (
                            <Button
                                key={key}
                                variant="ghost"
                                className={`h-12 w-full rounded-none ${
                                    isCollapsed
                                        ? 'justify-center'
                                        : 'justify-start'
                                } transition-all duration-200 ${
                                    isActive
                                        ? 'border border-blue-500/30 bg-gradient-to-r from-blue-600/20 to-blue-500/20 text-blue-600'
                                        : 'text-gray-700 hover:bg-gray-100/50 hover:text-gray-900'
                                }`}
                                title={isCollapsed ? item.label : undefined}
                                asChild
                            >
                                <Link key={item.id} href={item.href}>
                                    <Icon
                                        className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'} ${
                                            isActive ? 'text-blue-600' : ''
                                        }`}
                                    />
                                    {!isCollapsed && (
                                        <span
                                            className={
                                                isActive
                                                    ? 'font-medium text-blue-600'
                                                    : ''
                                            }
                                        >
                                            {item.label}
                                        </span>
                                    )}
                                </Link>
                            </Button>
                        )
                    })}
                </nav>
            </div>
        </>
    )
}
