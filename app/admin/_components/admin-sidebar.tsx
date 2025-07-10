"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BarChart3, Package, Menu, X } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface AdminSidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

export function AdminSidebar({ isOpen, onToggle }: AdminSidebarProps) {
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
                w-64 h-screen bg-gray-900 text-white p-4
                transform ${isOpen ? "translate-x-0" : "-translate-x-full"}
                lg:translate-x-0 transition-transform duration-200 ease-in-out
            `}
            >
                <div className="mb-8 pt-8 lg:pt-0">
                    <h1 className="text-2xl font-bold">{t('admin.adminPanel')}</h1>
                </div>

                <nav className="space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.id} href={item.href}>
                                <Button
                                    variant={isActive ? "secondary" : "ghost"}
                                    className={`w-full justify-start text-left ${
                                        isActive
                                            ? "bg-gray-700 text-white"
                                            : "text-gray-300 hover:text-white hover:bg-gray-800"
                                    }`}
                                >
                                    <Icon className="mr-3 h-4 w-4" />
                                    {item.label}
                                </Button>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </>
    );
}
