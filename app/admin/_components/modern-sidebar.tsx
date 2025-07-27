"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    Store,
    Package,
    BarChart3,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    Users,
    CheckCircle,
    Eye,
    CalendarDays,
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
                id: "stores",
                label: t("admin.storeManagement"),
                icon: Store,
                href: "/admin/stores",
                roles: ["admin", "store_admin"],
            },
            {
                id: "approvals",
                label: "Product Approvals",
                icon: CheckCircle,
                href: "/admin/approvals",
                roles: ["admin"],
            },
            {
                id: "products",
                label: t("admin.productManagement"),
                icon: Package,
                href: "/admin/products",
                roles: ["admin"],
            },
            {
                id: "analytics",
                label: t("admin.analytics"),
                icon: BarChart3,
                href: "/admin/analytics",
                roles: ["admin", "store_admin"],
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

                        // More precise active state logic
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
                            // But make sure we don't match shorter paths (e.g., /adminv2 shouldn't match /adminv2/stores)
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
