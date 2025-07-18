"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BarChart3, Package, Users, Menu, X, CheckCircle, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface AdminSidebarProps {
    isOpen: boolean;
    isCollapsed: boolean;
    onToggle: () => void;
    onCollapse: () => void;
}

export function AdminSidebar({ isOpen, isCollapsed, onToggle, onCollapse }: AdminSidebarProps) {
    const { t } = useLanguage();
    const pathname = usePathname();
    
    const menuItems = [
        {
            id: "dashboard",
            label: t('admin.dashboard'),
            icon: BarChart3,
            href: "/admin",
        },
        {
            id: "products",
            label: t('admin.productManagement'),
            icon: Package,
            href: "/admin/products",
        },
        {
            id: "approvals",
            label: "Product Approvals",
            icon: CheckCircle,
            href: "/admin/approvals",
        },
        {
            id: "users",
            label: "User Management",
            icon: Users,
            href: "/admin/users",
        },
        {
            id: "tour",
            label: "Virtual Tour Admin",
            icon: Eye,
            href: "/admin/tour",
        },
    ];

    return (
        <>
            {/* Mobile menu button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <Button variant="outline" size="sm" onClick={onToggle} className="bg-white shadow-md">
                    {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>
            </div>

            {/* Overlay for mobile */}
            {isOpen && <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onToggle} />}

            {/* Sidebar */}
            <div
                className={`
                fixed lg:sticky inset-y-0 left-0 z-50
                ${isCollapsed ? 'w-16' : 'w-64'} h-screen bg-gray-900 text-white p-4
                transform ${isOpen ? "translate-x-0" : "-translate-x-full"}
                lg:translate-x-0 transition-all duration-200 ease-in-out
            `}
            >
                <div className="mb-8 pt-8 lg:pt-0 flex justify-between items-center">
                    {!isCollapsed && <h1 className="text-2xl font-bold">{t('admin.adminPanel')}</h1>}
                    <div className="flex gap-1">
                        {/* Collapse/Expand button - only visible on desktop */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onCollapse}
                            className="hidden lg:flex text-gray-400 hover:text-white hover:bg-gray-800 p-1"
                            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                        </Button>
                        {/* Close button - only visible on mobile */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onToggle}
                            className="lg:hidden text-gray-400 hover:text-white hover:bg-gray-800 p-1"
                            aria-label="Close sidebar"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <nav className="space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.id} href={item.href}>
                                <Button
                                    variant={isActive ? "secondary" : "ghost"}
                                    className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start'} text-left ${
                                        isActive
                                            ? "bg-gray-700 text-white"
                                            : "text-gray-300 hover:text-white hover:bg-gray-800"
                                    }`}
                                    title={isCollapsed ? item.label : undefined}
                                >
                                    <Icon className={`h-4 w-4 ${isCollapsed ? '' : 'mr-3'}`} />
                                    {!isCollapsed && item.label}
                                </Button>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </>
    );
}
