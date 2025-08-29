'use client'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Store,
    Package,
    TrendingUp,
    ShoppingBag,
    Loader2,
    AlertCircle,
    Eye,
    EyeOff,
    Users,
    BarChart3,
    X,
} from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { useAuth } from '@/hooks/useAuth'
import { useDashboardStats } from './_hooks/use-dashboard-stats'
import { SceneAnalyticsChart } from './_components/scene-analytics-chart'

export default function DashboardContent() {
    const { t } = useLanguage()
    const { data: user } = useAuth()
    const {
        totalStores,
        totalProducts,
        pendingApprovals,
        rejectedProducts,
        approvedVisibleProducts,
        approvedInvisibleProducts,
        totalVisitors,
        totalViews,
        totalScenes,
        averageViews,
        isLoading,
        error,
    } = useDashboardStats()

    const userMetadata = user?.app_metadata as {
        roles?: string[]
        assigned_stores?: number[]
    }
    const roles = userMetadata?.roles || []
    const isAdmin = roles.includes('admin')

    // Loading skeleton component
    const LoadingSkeleton = () => (
        <div className="flex items-center justify-center">
            <Loader2 className="text-morpheus-gold-light h-6 w-6 animate-spin" />
        </div>
    )

    // Error display component
    const ErrorDisplay = () => (
        <div className="flex items-center justify-center text-red-400">
            <AlertCircle className="mr-2 h-5 w-5" />
            <span className="text-sm">Error loading data</span>
        </div>
    )

    // Content display component that handles loading/error states
    const StatValue = ({
        value,
        isLoading,
        error,
    }: {
        value: number | string
        isLoading: boolean
        error: Error | null
    }) => {
        if (isLoading) return <LoadingSkeleton />
        if (error) return <ErrorDisplay />
        return <div className="text-2xl font-bold text-gray-900">{value}</div>
    }

    return (
        <div className="space-y-6 p-6">
            {/* First Row - Store/Product Stats */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6 lg:gap-6">
                <Card className="border-gray-200/50 bg-gradient-to-br from-gray-50/50 to-white/50 shadow-xl">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-gray-900">
                            <span className="text-sm font-medium">
                                {t('admin.totalStores')}
                            </span>
                            <Store className="text-morpheus-gold-light h-5 w-5" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <StatValue
                            value={totalStores}
                            isLoading={isLoading}
                            error={error}
                        />
                    </CardContent>
                </Card>

                <Card className="border-gray-200/50 bg-gradient-to-br from-gray-50/50 to-white/50 shadow-xl">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-gray-900">
                            <span className="text-sm font-medium">
                                {t('admin.totalProducts')}
                            </span>
                            <Package className="text-morpheus-gold-light h-5 w-5" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <StatValue
                            value={totalProducts}
                            isLoading={isLoading}
                            error={error}
                        />
                    </CardContent>
                </Card>

                <Card className="border-gray-200/50 bg-gradient-to-br from-gray-50/50 to-white/50 shadow-xl">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-gray-900">
                            <span className="text-sm font-medium">
                                {t('admin.productsPendingApproval')}
                            </span>
                            <ShoppingBag className="h-5 w-5 text-orange-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <StatValue
                            value={pendingApprovals}
                            isLoading={isLoading}
                            error={error}
                        />
                    </CardContent>
                </Card>

                <Card className="border-gray-200/50 bg-gradient-to-br from-gray-50/50 to-white/50 shadow-xl">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-gray-900">
                            <span className="text-sm font-medium">
                                {t('admin.rejectedProducts')}
                            </span>
                            <X className="h-5 w-5 text-red-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <StatValue
                            value={rejectedProducts}
                            isLoading={isLoading}
                            error={error}
                        />
                    </CardContent>
                </Card>

                <Card className="border-gray-200/50 bg-gradient-to-br from-gray-50/50 to-white/50 shadow-xl">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-gray-900">
                            <span className="text-sm font-medium">
                                {t('admin.approvedVisibleProducts')}
                            </span>
                            <Eye className="h-5 w-5 text-green-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <StatValue
                            value={approvedVisibleProducts}
                            isLoading={isLoading}
                            error={error}
                        />
                    </CardContent>
                </Card>

                <Card className="border-gray-200/50 bg-gradient-to-br from-gray-50/50 to-white/50 shadow-xl">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-gray-900">
                            <span className="text-sm font-medium">
                                {t('admin.approvedInvisibleProducts')}
                            </span>
                            <EyeOff className="h-5 w-5 text-gray-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <StatValue
                            value={approvedInvisibleProducts}
                            isLoading={isLoading}
                            error={error}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Second Row - Visitor/View Stats */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                <Card className="border-gray-200/50 bg-gradient-to-br from-gray-50/50 to-white/50 shadow-xl">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-gray-900">
                            <span className="text-sm font-medium">
                                {t('admin.totalVisitors')}
                            </span>
                            <Users className="h-5 w-5 text-blue-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <StatValue
                            value={totalVisitors}
                            isLoading={isLoading}
                            error={error}
                        />
                    </CardContent>
                </Card>

                <Card className="border-gray-200/50 bg-gradient-to-br from-gray-50/50 to-white/50 shadow-xl">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-gray-900">
                            <span className="text-sm font-medium">
                                {t('admin.totalViews')}
                            </span>
                            <TrendingUp className="h-5 w-5 text-purple-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <StatValue
                            value={totalViews}
                            isLoading={isLoading}
                            error={error}
                        />
                    </CardContent>
                </Card>

                <Card className="border-gray-200/50 bg-gradient-to-br from-gray-50/50 to-white/50 shadow-xl">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-gray-900">
                            <span className="text-sm font-medium">
                                {t('admin.totalScenes')}
                            </span>
                            <BarChart3 className="h-5 w-5 text-indigo-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <StatValue
                            value={totalScenes}
                            isLoading={isLoading}
                            error={error}
                        />
                    </CardContent>
                </Card>

                <Card className="border-gray-200/50 bg-gradient-to-br from-gray-50/50 to-white/50 shadow-xl">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-gray-900">
                            <span className="text-sm font-medium">
                                {t('admin.averageViews')}
                            </span>
                            <TrendingUp className="h-5 w-5 text-yellow-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <StatValue
                            value={averageViews}
                            isLoading={isLoading}
                            error={error}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Scene Analytics */}
            <SceneAnalyticsChart />
        </div>
    )
}
