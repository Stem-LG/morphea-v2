"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Package, BarChart3, TrendingUp, ShoppingBag } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardContent() {
    const { t } = useLanguage();
    const { data: user } = useAuth();

    const userMetadata = user?.app_metadata as { roles?: string[]; assigned_stores?: number[] };
    const roles = userMetadata?.roles || [];
    const isAdmin = roles.includes("admin");
    const assignedStores = userMetadata?.assigned_stores || [];

    // Mock data - in real implementation, this would come from API
    const dashboardStats = {
        totalStores: isAdmin ? 12 : assignedStores.length,
        totalProducts: isAdmin ? 1247 : 89,
        pendingApprovals: isAdmin ? 23 : 0,
        monthlyGrowth: 12.5,
    };

    return (
        <div className="p-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <Card className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50 shadow-xl">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-white">
                            <span className="text-sm font-medium">{t("admin.totalStores")}</span>
                            <Store className="h-5 w-5 text-morpheus-gold-light" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{dashboardStats.totalStores}</div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50 shadow-xl">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-white">
                            <span className="text-sm font-medium">{t("admin.totalProducts")}</span>
                            <Package className="h-5 w-5 text-morpheus-gold-light" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{dashboardStats.totalProducts}</div>
                    </CardContent>
                </Card>

                {isAdmin && (
                    <Card className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50 shadow-xl">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center justify-between text-white">
                                <span className="text-sm font-medium">{t("admin.pendingApprovals")}</span>
                                <ShoppingBag className="h-5 w-5 text-orange-400" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{dashboardStats.pendingApprovals}</div>
                        </CardContent>
                    </Card>
                )}

                <Card className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50 shadow-xl">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-white">
                            <span className="text-sm font-medium">{t("admin.monthlyGrowth")}</span>
                            <TrendingUp className="h-5 w-5 text-green-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">+{dashboardStats.monthlyGrowth}%</div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity - Placeholder */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-4">{t("admin.recentActivity")}</h2>
                <Card className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50 shadow-xl">
                    <CardContent className="p-6">
                        <div className="text-center py-8">
                            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-300 text-lg">{t("admin.recentActivityPlaceholder")}</p>
                            <p className="text-gray-400 text-sm mt-2">{t("admin.comingSoon")}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
