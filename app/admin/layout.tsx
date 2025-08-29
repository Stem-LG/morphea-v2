'use client'
import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ModernSidebar } from './_components/modern-sidebar'
import { LoadingScreen } from './_components/loading-screen'
import { AccessDenied } from './_components/access-denied'

interface AdminV2LayoutProps {
    children: React.ReactNode
}

export default function AdminV2Layout({ children }: AdminV2LayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

    const { data: user, isLoading } = useAuth()

    // Show loading screen while checking authentication
    if (isLoading) {
        return <LoadingScreen />
    }

    // Check if user has admin or store_admin role
    const userMetadata = user?.app_metadata as { roles?: string[] }
    const roles = userMetadata?.roles || []
    const hasAccess = roles.includes('admin') || roles.includes('store_admin')

    if (!hasAccess) {
        return <AccessDenied />
    }

    return (
        <div className="flex min-h-[calc(100svh-6rem)] w-full bg-gradient-to-br from-white to-gray-50">
            {/* Modern Sidebar - Account for existing navbar */}
            <ModernSidebar
                isOpen={sidebarOpen}
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
                onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                userRole={roles.includes('admin') ? 'admin' : 'store_admin'}
            />

            {/* Main Content Area */}
            <div className={`w-full flex-1 transition-all duration-300`}>
                {/* Page Content - No duplicate top navigation */}
                <main className="w-full">
                    <div className="min-h-[calc(100vh-6rem)] w-full border border-gray-200/50 bg-gradient-to-br from-gray-50/50 to-white/50 shadow-2xl">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-900/20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    )
}
