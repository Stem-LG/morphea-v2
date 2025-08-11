"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Package, TrendingUp, ShoppingBag, Loader2, AlertCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardStats } from "./_hooks/use-dashboard-stats";
import { SceneAnalyticsChart } from "./_components/scene-analytics-chart";

export default function DashboardContent() {
    const { t } = useLanguage();
    const { data: user } = useAuth();
    const { totalStores, totalProducts, pendingApprovals, totalVisitors, isLoading, error } = useDashboardStats();

    const userMetadata = user?.app_metadata as { roles?: string[]; assigned_stores?: number[] };
    const roles = userMetadata?.roles || [];
    const isAdmin = roles.includes("admin");

    // Loading skeleton component
    const LoadingSkeleton = () => (
        <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-morpheus-gold-light" />
        </div>
    );

    // Error display component
    const ErrorDisplay = () => (
        <div className="flex items-center justify-center text-red-400">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span className="text-sm">Error loading data</span>
        </div>
    );

    // Content display component that handles loading/error states
    const StatValue = ({ value, isLoading, error }: { value: number | string; isLoading: boolean; error: Error | null }) => {
        if (isLoading) return <LoadingSkeleton />;
        if (error) return <ErrorDisplay />;
        return <div className="text-2xl font-bold text-white">{value}</div>;
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
                        <StatValue value={totalStores} isLoading={isLoading} error={error} />
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
                        <StatValue value={totalProducts} isLoading={isLoading} error={error} />
                    </CardContent>
                </Card>

                {isAdmin && (
                    <Card className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50 shadow-xl">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center justify-between text-white">
                                <span className="text-sm font-medium">{t("admin.productsPendingApproval")}</span>
                                <ShoppingBag className="h-5 w-5 text-orange-400" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <StatValue value={pendingApprovals} isLoading={isLoading} error={error} />
                        </CardContent>
                    </Card>
                )}

                <Card className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50 shadow-xl">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-white">
                            <span className="text-sm font-medium">{t("admin.totalVisitors")}</span>
                            <TrendingUp className="h-5 w-5 text-green-400" />
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
            </div>

            {/* Scene Analytics */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-4">Scene View Analytics</h2>
                <SceneAnalyticsChart />
            </div>
        </div>
    );
}
