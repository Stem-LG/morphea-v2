"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface ModernSidebarProps {
    isOpen: boolean;
    isCollapsed: boolean;
    onToggle: () => void;
    onCollapse: () => void;
    userRole: "admin" | "store_admin";
}

export function ModernSidebar({ isOpen, isCollapsed, onToggle, onCollapse, userRole }: ModernSidebarProps) {
    const { t } = useLanguage();
    const pathname = usePathname();
    const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);

    // Toggle dropdown state
    const toggleDropdown = (itemId: string) => {
        setOpenDropdowns((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]));
    };

    // Define menu items based on user role
    const getMenuItems = () => {
        const baseItems = [
            {
                id: "dashboard",
                label: t("admin.dashboard"),
                icon: LayoutDashboard,
                href: "/admin",
                roles: ["admin", "store_admin"],
            },
            {
                id: "events",
                label: t("admin.eventManagement"),
                icon: CalendarDays,
                href: "/admin/events",
                roles: ["admin", "store_admin"],
            },
            {
                id: "designer-assignments",
                label: t("admin.designerAssignments.title"),
                icon: Users,
                href: "/admin/designer-assignments",
                roles: ["admin"],
            },
            {
                id: "boutiques",
                label: t("admin.storeManagement"),
                icon: Store,
                href: "/admin/stores",
                roles: ["admin", "store_admin"],
            },
            {
                id: "orders",
                label: t("admin.orders.title"),
                icon: ShoppingBag,
                href: "/admin/orders",
                roles: ["admin"],
            },
            {
                id: "produit",
                label: t("admin.productManagement"),
                icon: Package,
                roles: ["admin"],
                isDropdown: true,
                children: [
                    {
                        id: "approvals",
                        label: t("admin.pendingProducts") || "Pending Products",
                        icon: CheckCircle,
                        href: "/admin/approvals",
                        roles: ["admin"],
                    },
                    {
                        id: "approved-products",
                        label: t("admin.approvedProducts") || "Approved Products",
                        icon: Package,
                        href: "/admin/products",
                        roles: ["admin"],
                    },
                    {
                        id: "rejected-products",
                        label: t("admin.rejectedProducts") || "Rejected Products",
                        icon: Package,
                        href: "/admin/products/rejected",
                        roles: ["admin"],
                    },
                    {
                        id: "categories",
                        label: t("admin.categoryManagement"),
                        icon: FolderTree,
                        href: "/admin/categories",
                        roles: ["admin"],
                    },
                ],
            },
            {
                id: "currencies",
                label: t("admin.currencyManagement"),
                icon: DollarSign,
                href: "/admin/currencies",
                roles: ["admin"],
            },
            {
                id: "users",
                label: t("admin.userManagement"),
                icon: Users,
                href: "/admin/users",
                roles: ["admin"],
            },
            {
                id: "tour",
                label: t("admin.virtualTourAdmin"),
                icon: Eye,
                href: "/admin/tour",
                roles: ["admin"],
            },
        ];

        return baseItems.filter((item) => item.roles.includes(userRole));
    };

    const menuItems = getMenuItems();

    // Check if any child of a dropdown is active
    const isDropdownActive = (item: any) => {
        if (!item.children) return false;
        return item.children.some((child: any) => {
            if (child.href === "/admin") {
                return pathname === "/admin";
            }
            return pathname === child.href || pathname.startsWith(child.href + "/");
        });
    };

    return (
        <>
            {/* Mobile menu button */}
            <div className="lg:hidden fixed top-20 left-4 z-50">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onToggle}
                    className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-[#695029] hover:to-[#d4c066] text-white border-morpheus-gold-light shadow-2xl"
                >
                    {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>
            </div>

            {/* Sidebar */}
            <div
                className={`
                fixed lg:sticky top-16 left-0 z-50
                ${isCollapsed ? "w-16" : "w-64"} h-[calc(100vh-4rem)]
                bg-gradient-to-b from-morpheus-blue-dark to-morpheus-blue-light
                border-r border-slate-700/50 shadow-2xl
                transform ${isOpen ? "translate-x-0" : "-translate-x-full"}
                lg:translate-x-0 transition-all duration-300 ease-in-out
                `}
            >
                {/* Header */}
                <div className="p-4 border-b border-slate-700/50">
                    <div className="flex items-center justify-between">
                        {!isCollapsed && (
                            <Link href="/admin">
                                <h1 className="text-xl font-bold bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light bg-clip-text text-transparent">
                                    {t("admin.adminPanel")}
                                </h1>
                            </Link>
                        )}

                        <div className="flex gap-1">
                            {/* Collapse/Expand button - desktop only */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onCollapse}
                                className="hidden lg:flex text-gray-400 hover:text-white hover:bg-slate-700/50 p-2"
                                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
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
                                className="lg:hidden text-gray-400 hover:text-white hover:bg-slate-700/50 p-2"
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
                        const Icon = item.icon;

                        // Handle dropdown items
                        if (item.isDropdown) {
                            const isDropdownOpen = openDropdowns.includes(item.id);
                            const hasActiveChild = isDropdownActive(item);
                            const isDropdownItemActive = item.href ? (() => {
                                if (item.href === "/admin") {
                                    return pathname === "/admin";
                                }
                                return pathname === item.href;
                            })() : false;

                            const isActive = hasActiveChild || isDropdownItemActive;

                            return (
                                <div key={key}>
                                    {/* Dropdown trigger */}
                                    {item.href ? (
                                        <Button
                                            variant="ghost"
                                            className={`w-full rounded-none h-12 ${
                                                isCollapsed ? "justify-center" : "justify-start"
                                            } transition-all duration-200 ${
                                                isActive
                                                    ? "bg-gradient-to-r from-morpheus-gold-dark/20 to-morpheus-gold-light/20 text-morpheus-gold-light border border-morpheus-gold-light/30"
                                                    : "text-gray-300 hover:text-white hover:bg-slate-700/50"
                                            }`}
                                            title={isCollapsed ? item.label : undefined}
                                            asChild
                                        >
                                            <Link href={item.href} className="flex items-center w-full">
                                                <Icon
                                                    className={`h-5 w-5 ${isCollapsed ? "" : "mr-3"} ${
                                                        isActive ? "text-morpheus-gold-light" : ""
                                                    }`}
                                                />
                                                {!isCollapsed && (
                                                    <>
                                                        <span
                                                            className={`flex-1 text-left ${
                                                                isActive ? "text-morpheus-gold-light font-medium" : ""
                                                            }`}
                                                        >
                                                            {item.label}
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="p-0 h-auto hover:bg-transparent"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                toggleDropdown(item.id);
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
                                            className={`w-full rounded-none h-12 ${
                                                isCollapsed ? "justify-center" : "justify-start"
                                            } transition-all duration-200 ${
                                                isActive
                                                    ? "bg-gradient-to-r from-morpheus-gold-dark/20 to-morpheus-gold-light/20 text-morpheus-gold-light border border-morpheus-gold-light/30"
                                                    : "text-gray-300 hover:text-white hover:bg-slate-700/50"
                                            }`}
                                            title={isCollapsed ? item.label : undefined}
                                            onClick={() => !isCollapsed && toggleDropdown(item.id)}
                                        >
                                            <Icon
                                                className={`h-5 w-5 ${isCollapsed ? "" : "mr-3"} ${
                                                    isActive ? "text-morpheus-gold-light" : ""
                                                }`}
                                            />
                                            {!isCollapsed && (
                                                <>
                                                    <span
                                                        className={`flex-1 text-left ${
                                                            isActive ? "text-morpheus-gold-light font-medium" : ""
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
                                    {!isCollapsed && isDropdownOpen && item.children && (
                                        <div className="border-l border-slate-600/50 ml-4">
                                            {item.children.map((child: any, childKey: number) => {
                                                const ChildIcon = child.icon;

                                                // More precise active state logic for children
                                                const isChildActive = (() => {
                                                    if (child.href === "/admin") {
                                                        return pathname === "/admin";
                                                    }
                                                    if (pathname === child.href) {
                                                        return true;
                                                    }
                                                    // Special case for /admin/products - only active for exact match
                                                    // to avoid conflict with /admin/products/rejected
                                                    if (child.href === "/admin/products") {
                                                        return pathname === "/admin/products";
                                                    }
                                                    if (pathname.startsWith(child.href + "/")) {
                                                        return true;
                                                    }
                                                    return false;
                                                })();

                                                return (
                                                    <Button
                                                        key={childKey}
                                                        variant="ghost"
                                                        className={`w-full rounded-none h-10 justify-start pl-8 pr-4 transition-all duration-200 ${
                                                            isChildActive
                                                                ? "bg-gradient-to-r from-morpheus-gold-dark/20 to-morpheus-gold-light/20 text-morpheus-gold-light border border-morpheus-gold-light/30"
                                                                : "text-gray-300 hover:text-white hover:bg-slate-700/50"
                                                        }`}
                                                        asChild
                                                    >
                                                        <Link
                                                            href={child.href}
                                                            className="flex items-center w-full overflow-hidden"
                                                        >
                                                            <ChildIcon
                                                                className={`h-4 w-4 mr-3 flex-shrink-0 ${
                                                                    isChildActive ? "text-morpheus-gold-light" : ""
                                                                }`}
                                                            />
                                                            <span
                                                                className={`truncate ${
                                                                    isChildActive
                                                                        ? "text-morpheus-gold-light font-medium"
                                                                        : ""
                                                                }`}
                                                            >
                                                                {child.label}
                                                            </span>
                                                        </Link>
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        // Handle regular menu items
                        const isActive = (() => {
                            // Dashboard should only be active on exact match
                            if (item.href === "/admin") {
                                return pathname === "/admin";
                            }

                            // For other routes, check exact match or if it's a sub-route
                            if (pathname === item.href) {
                                return true;
                            }

                            // Check if current path is a sub-route of this menu item
                            if (pathname.startsWith(item.href + "/")) {
                                return true;
                            }

                            return false;
                        })();

                        return (
                            <Button
                                key={key}
                                variant="ghost"
                                className={`w-full rounded-none h-12 ${
                                    isCollapsed ? "justify-center" : "justify-start"
                                } transition-all duration-200 ${
                                    isActive
                                        ? "bg-gradient-to-r from-morpheus-gold-dark/20 to-morpheus-gold-light/20 text-morpheus-gold-light border border-morpheus-gold-light/30"
                                        : "text-gray-300 hover:text-white hover:bg-slate-700/50"
                                }`}
                                title={isCollapsed ? item.label : undefined}
                                asChild
                            >
                                <Link key={item.id} href={item.href}>
                                    <Icon
                                        className={`h-5 w-5 ${isCollapsed ? "" : "mr-3"} ${
                                            isActive ? "text-morpheus-gold-light" : ""
                                        }`}
                                    />
                                    {!isCollapsed && (
                                        <span className={isActive ? "text-morpheus-gold-light font-medium" : ""}>
                                            {item.label}
                                        </span>
                                    )}
                                </Link>
                            </Button>
                        );
                    })}
                </nav>
            </div>
        </>
    );
}
