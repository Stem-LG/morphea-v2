"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { BarChart3, Package, Menu, X } from "lucide-react";

interface AdminSidebarProps {
    activeSection: string;
    onSectionChange: (section: string) => void;
    isOpen: boolean;
    onToggle: () => void;
}

export function AdminSidebar({ activeSection, onSectionChange, isOpen, onToggle }: AdminSidebarProps) {
    const menuItems = [
        {
            id: "dashboard",
            label: "Dashboard",
            icon: BarChart3,
        },
        {
            id: "products",
            label: "Product Management",
            icon: Package,
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
                    <h1 className="text-2xl font-bold">Admin Panel</h1>
                </div>

                <nav className="space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Button
                                key={item.id}
                                variant={activeSection === item.id ? "secondary" : "ghost"}
                                className={`w-full justify-start text-left ${
                                    activeSection === item.id
                                        ? "bg-gray-700 text-white"
                                        : "text-gray-300 hover:text-white hover:bg-gray-800"
                                }`}
                                onClick={() => onSectionChange(item.id)}
                            >
                                <Icon className="mr-3 h-4 w-4" />
                                {item.label}
                            </Button>
                        );
                    })}
                </nav>
            </div>
        </>
    );
}
