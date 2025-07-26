"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    Store, 
    Package, 
    BarChart3, 
    TrendingUp, 
    Users, 
    ShoppingBag,
    Plus,
    ArrowRight
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export function DashboardContent() {
    const { t } = useLanguage();
    const { data: user } = useAuth();
    
    const userMetadata = user?.app_metadata as { roles?: string[], assigned_stores?: number[] };
    const roles = userMetadata?.roles || [];
    const isAdmin = roles.includes('admin');
    const isStoreAdmin = roles.includes('store_admin');
    const assignedStores = userMetadata?.assigned_stores || [];

    // Mock data - in real implementation, this would come from API
    const dashboardStats = {
        totalStores: isAdmin ? 12 : assignedStores.length,
        totalProducts: isAdmin ? 1247 : 89,
        pendingApprovals: isAdmin ? 23 : 0,
        monthlyGrowth: 12.5
    };

    const quickActions = [
        {
            title: t('admin.manageStores'),
            description: t('admin.manageStoresDesc'),
            icon: Store,
            href: '/admin/stores',
            color: 'from-blue-500 to-blue-600',
            available: true
        },
        {
            title: t('admin.addProduct'),
            description: t('admin.addProductDesc'),
            icon: Plus,
            href: '/admin/stores',
            color: 'from-green-500 to-green-600',
            available: true
        },
        {
            title: t('admin.viewAnalytics'),
            description: t('admin.viewAnalyticsDesc'),
            icon: BarChart3,
            href: '/admin/analytics',
            color: 'from-purple-500 to-purple-600',
            available: true
        },
        {
            title: t('admin.manageUsers'),
            description: t('admin.manageUsersDesc'),
            icon: Users,
            href: '/admin/users',
            color: 'from-orange-500 to-orange-600',
            available: isAdmin
        }
    ].filter(action => action.available);

    return (
        <div className="p-6 space-y-6">
            {/* Welcome Header */}
            <div className="text-center lg:text-left">
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                    {t('admin.welcomeBack')}, {user?.email?.split('@')[0] || 'Admin'}
                </h1>
                <p className="text-lg text-gray-300">
                    {isAdmin ? t('admin.adminDashboardSubtitle') : t('admin.storeAdminDashboardSubtitle')}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <Card className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50 shadow-xl">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-white">
                            <span className="text-sm font-medium">{t('admin.totalStores')}</span>
                            <Store className="h-5 w-5 text-morpheus-gold-light" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white mb-1">
                            {dashboardStats.totalStores}
                        </div>
                        <p className="text-sm text-gray-300">
                            {isAdmin ? t('admin.acrossAllMalls') : t('admin.assignedToYou')}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50 shadow-xl">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-white">
                            <span className="text-sm font-medium">{t('admin.totalProducts')}</span>
                            <Package className="h-5 w-5 text-morpheus-gold-light" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white mb-1">
                            {dashboardStats.totalProducts}
                        </div>
                        <p className="text-sm text-gray-300">
                            {t('admin.activeProducts')}
                        </p>
                    </CardContent>
                </Card>

                {isAdmin && (
                    <Card className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50 shadow-xl">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center justify-between text-white">
                                <span className="text-sm font-medium">{t('admin.pendingApprovals')}</span>
                                <ShoppingBag className="h-5 w-5 text-orange-400" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white mb-1">
                                {dashboardStats.pendingApprovals}
                            </div>
                            <p className="text-sm text-gray-300">
                                {t('admin.awaitingReview')}
                            </p>
                        </CardContent>
                    </Card>
                )}

                <Card className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50 shadow-xl">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-white">
                            <span className="text-sm font-medium">{t('admin.monthlyGrowth')}</span>
                            <TrendingUp className="h-5 w-5 text-green-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white mb-1">
                            +{dashboardStats.monthlyGrowth}%
                        </div>
                        <p className="text-sm text-gray-300">
                            {t('admin.fromLastMonth')}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-4">{t('admin.quickActions')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    {quickActions.map((action, index) => {
                        const Icon = action.icon;
                        return (
                            <Link key={index} href={action.href}>
                                <Card className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer group">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-3 text-white">
                                            <div className={`w-10 h-10 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center`}>
                                                <Icon className="h-5 w-5 text-white" />
                                            </div>
                                            <span className="text-lg">{action.title}</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-300 mb-4">
                                            {action.description}
                                        </p>
                                        <div className="flex items-center text-morpheus-gold-light group-hover:text-morpheus-gold-dark transition-colors">
                                            <span className="text-sm font-medium">{t('admin.getStarted')}</span>
                                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Recent Activity - Placeholder */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-4">{t('admin.recentActivity')}</h2>
                <Card className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50 shadow-xl">
                    <CardContent className="p-6">
                        <div className="text-center py-8">
                            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-300 text-lg">
                                {t('admin.recentActivityPlaceholder')}
                            </p>
                            <p className="text-gray-400 text-sm mt-2">
                                {t('admin.comingSoon')}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}