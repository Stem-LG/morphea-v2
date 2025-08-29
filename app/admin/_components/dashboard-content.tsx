'use client'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Store,
    Package,
    BarChart3,
    TrendingUp,
    Users,
    ShoppingBag,
    Plus,
    ArrowRight,
} from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

export function DashboardContent() {
    const { t } = useLanguage()
    const { data: user } = useAuth()

    const userMetadata = user?.app_metadata as {
        roles?: string[]
        assigned_stores?: number[]
    }
    const roles = userMetadata?.roles || []
    const isAdmin = roles.includes('admin')
    const assignedStores = userMetadata?.assigned_stores || []

    // Mock data - in real implementation, this would come from API
    const dashboardStats = {
        totalStores: isAdmin ? 12 : assignedStores.length,
        totalProducts: isAdmin ? 1247 : 89,
        pendingApprovals: isAdmin ? 23 : 0,
        monthlyGrowth: 12.5,
    }

    const quickActions = [
        {
            title: t('admin.manageStores'),
            description: t('admin.manageStoresDesc'),
            icon: Store,
            href: '/admin/stores',
            color: 'from-blue-500 to-blue-600',
            available: true,
        },
        {
            title: t('admin.addProduct'),
            description: t('admin.addProductDesc'),
            icon: Plus,
            href: '/admin/stores',
            color: 'from-green-500 to-green-600',
            available: true,
        },
        {
            title: t('admin.viewAnalytics'),
            description: t('admin.viewAnalyticsDesc'),
            icon: BarChart3,
            href: '/admin/analytics',
            color: 'from-purple-500 to-purple-600',
            available: true,
        },
        {
            title: t('admin.manageUsers'),
            description: t('admin.manageUsersDesc'),
            icon: Users,
            href: '/admin/users',
            color: 'from-orange-500 to-orange-600',
            available: isAdmin,
        },
    ].filter((action) => action.available)

    return (
        <div className="space-y-6 p-6">
            {/* Welcome Header */}
            <div className="text-center lg:text-left">
                <h1 className="mb-2 text-3xl font-bold text-gray-900 lg:text-4xl">
                    {t('admin.welcomeBack')},{' '}
                    {user?.email?.split('@')[0] || 'Admin'}
                </h1>
                <p className="text-lg text-gray-600">
                    {isAdmin
                        ? t('admin.adminDashboardSubtitle')
                        : t('admin.storeAdminDashboardSubtitle')}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                <Card className="border-gray-200/50 bg-gradient-to-br from-gray-50/50 to-white/50 shadow-xl">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-gray-900">
                            <span className="text-sm font-medium">
                                {t('admin.totalStores')}
                            </span>
                            <Store className="h-5 w-5 text-blue-600" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-1 text-2xl font-bold text-gray-900">
                            {dashboardStats.totalStores}
                        </div>
                        <p className="text-sm text-gray-600">
                            {isAdmin
                                ? t('admin.acrossAllMalls')
                                : t('admin.assignedToYou')}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-gray-200/50 bg-gradient-to-br from-gray-50/50 to-white/50 shadow-xl">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-gray-900">
                            <span className="text-sm font-medium">
                                {t('admin.totalProducts')}
                            </span>
                            <Package className="h-5 w-5 text-blue-600" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-1 text-2xl font-bold text-gray-900">
                            {dashboardStats.totalProducts}
                        </div>
                        <p className="text-sm text-gray-600">
                            {t('admin.activeProducts')}
                        </p>
                    </CardContent>
                </Card>

                {isAdmin && (
                    <Card className="border-gray-200/50 bg-gradient-to-br from-gray-50/50 to-white/50 shadow-xl">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center justify-between text-gray-900">
                                <span className="text-sm font-medium">
                                    {t('admin.pendingApprovals')}
                                </span>
                                <ShoppingBag className="h-5 w-5 text-orange-400" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-1 text-2xl font-bold text-gray-900">
                                {dashboardStats.pendingApprovals}
                            </div>
                            <p className="text-sm text-gray-600">
                                {t('admin.awaitingReview')}
                            </p>
                        </CardContent>
                    </Card>
                )}

                <Card className="border-gray-200/50 bg-gradient-to-br from-gray-50/50 to-white/50 shadow-xl">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-gray-900">
                            <span className="text-sm font-medium">
                                {t('admin.monthlyGrowth')}
                            </span>
                            <TrendingUp className="h-5 w-5 text-green-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-1 text-2xl font-bold text-gray-900">
                            +{dashboardStats.monthlyGrowth}%
                        </div>
                        <p className="text-sm text-gray-600">
                            {t('admin.fromLastMonth')}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="mb-4 text-2xl font-bold text-gray-900">
                    {t('admin.quickActions')}
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                    {quickActions.map((action, index) => {
                        const Icon = action.icon
                        return (
                            <Link key={index} href={action.href}>
                                <Card className="group cursor-pointer border-gray-200/50 bg-gradient-to-br from-gray-50/50 to-white/50 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-3 text-gray-900">
                                            <div
                                                className={`h-10 w-10 bg-gradient-to-r ${action.color} flex items-center justify-center rounded-lg`}
                                            >
                                                <Icon className="h-5 w-5 text-white" />
                                            </div>
                                            <span className="text-lg">
                                                {action.title}
                                            </span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="mb-4 text-gray-600">
                                            {action.description}
                                        </p>
                                        <div className="flex items-center text-blue-600 transition-colors group-hover:text-blue-700">
                                            <span className="text-sm font-medium">
                                                {t('admin.getStarted')}
                                            </span>
                                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        )
                    })}
                </div>
            </div>

            {/* Recent Activity - Placeholder */}
            <div>
                <h2 className="mb-4 text-2xl font-bold text-gray-900">
                    {t('admin.recentActivity')}
                </h2>
                <Card className="border-gray-200/50 bg-gradient-to-br from-gray-50/50 to-white/50 shadow-xl">
                    <CardContent className="p-6">
                        <div className="py-8 text-center">
                            <BarChart3 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                            <p className="text-lg text-gray-600">
                                {t('admin.recentActivityPlaceholder')}
                            </p>
                            <p className="mt-2 text-sm text-gray-500">
                                {t('admin.comingSoon')}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
