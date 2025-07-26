"use client";
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { ModernSidebar } from "./modern-sidebar";
import { LoadingScreen } from "./loading-screen";
import { AccessDenied } from "./access-denied";

interface AdminV2LayoutProps {
    children: React.ReactNode;
}

export function AdminV2Layout({ children }: AdminV2LayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { data: user, isLoading } = useAuth();
    const { t } = useLanguage();

    // Show loading screen while checking authentication
    if (isLoading) {
        return <LoadingScreen />;
    }

    // Check if user has admin or store_admin role
    const userMetadata = user?.app_metadata as { roles?: string[] };
    const roles = userMetadata?.roles || [];
    const hasAccess = roles.includes('user') || roles.includes('store_admin');

    if (!hasAccess) {
        return <AccessDenied />;
    }

    return (
        <div className="bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light flex min-h-[calc(100svh-4rem)] w-full">
            {/* Modern Sidebar - Account for existing navbar */}
            <ModernSidebar
                isOpen={sidebarOpen}
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
                onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                userRole={roles.includes('admin') ? 'admin' : 'store_admin'}
            />

            {/* Main Content Area */}
            <div className={`flex-1 w-full transition-all duration-300`}>
                {/* Page Content - No duplicate top navigation */}
                <main className="w-full">
                    <div className="w-full bg-gradient-to-br from-morpheus-blue-dark/20 to-morpheus-blue-light/20 border border-slate-700/50 shadow-2xl min-h-[calc(100vh-4rem)]">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}