"use client";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import { AdminV2Layout } from "../../_components/admin-v2-layout";
import { ProductsList } from "./_components/products-list";
import { CategoriesList } from "./_components/categories-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Package,
    Grid3X3,
    ArrowLeft,
    Store,
    BarChart3,
    Users,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useStores } from "@/app/admin/_hooks/use-stores";
import { useStoreStatsClient } from "@/hooks/useStoreStatsClient";
import Link from "next/link";

type TabType = "products" | "categories";

export default function StoreManagementPage() {
    const params = useParams();
    const storeId = params.storeId as string;
    const [activeTab, setActiveTab] = useState<TabType>("products");
    const { t } = useLanguage();
    const { data: user } = useAuth();
    const { data: stores, isLoading: storesLoading } = useStores();
    const { data: storeStats, isLoading: statsLoading } = useStoreStatsClient(storeId);

    // Check if user is admin
    const userMetadata = user?.app_metadata as { roles?: string[] };
    const roles = userMetadata?.roles || [];
    const isAdmin = roles.includes('admin');

    // Get store information
    const store = stores?.find((s: any) => s.yboutiqueid.toString() === storeId);

    // Ensure store admins can't access categories tab
    React.useEffect(() => {
        if (!isAdmin && activeTab === "categories") {
            setActiveTab("products");
        }
    }, [isAdmin, activeTab]);

    // Loading state
    if (storesLoading) {
        return (
            <AdminV2Layout>
                <div className="p-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-morpheus-gold-light/30 border-t-morpheus-gold-light mx-auto mb-4"></div>
                            <p className="text-white text-lg">{t('admin.loadingStores')}</p>
                        </div>
                    </div>
                </div>
            </AdminV2Layout>
        );
    }

    // Store not found
    if (!store) {
        return (
            <AdminV2Layout>
                <div className="p-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-white mb-2">
                                Store Not Found
                            </h3>
                            <p className="text-gray-300 mb-6">
                                The requested store could not be found.
                            </p>
                            <Link href="/admin/stores">
                                <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700/50">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    {t('admin.backToStores')}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </AdminV2Layout>
        );
    }

    return (
        <AdminV2Layout>
            <div className="w-full max-w-none p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/stores">
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-slate-600 text-white hover:bg-slate-700/50"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            {t('admin.backToStores')}
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                            {store.yboutiqueintitule || store.yboutiquecode}
                        </h1>
                        <p className="text-lg text-gray-300">
                            {t('admin.manageStore')} • {store.yboutiquecode}
                        </p>
                    </div>
                </div>
            </div>

            {/* Store Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-white text-sm font-medium">
                            <Package className="h-4 w-4 text-morpheus-gold-light" />
                            {t('admin.totalProducts')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {statsLoading ? '...' : (storeStats?.totalProducts || 0)}
                        </div>
                        <p className="text-xs text-gray-300 mt-1">
                            {statsLoading ? '...' : (storeStats?.approvedProducts || 0)} {t('admin.activeProducts')}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-white text-sm font-medium">
                            <Grid3X3 className="h-4 w-4 text-blue-400" />
                            {t('admin.categories')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {statsLoading ? '...' : (storeStats?.categories || 0)}
                        </div>
                        <p className="text-xs text-gray-300 mt-1">
                            {statsLoading ? '...' : (storeStats?.categories || 0)} active
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-white text-sm font-medium">
                            <BarChart3 className="h-4 w-4 text-green-400" />
                            {t('admin.sales')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {statsLoading ? '...' : (storeStats?.sales || 0)}
                        </div>
                        <p className="text-xs text-gray-300 mt-1">
                            {storeStats?.sales === 0 ? 'No sales system' : 'This month'}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-white text-sm font-medium">
                            <Users className="h-4 w-4 text-purple-400" />
                            Visitors
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {statsLoading ? '...' : (storeStats?.visitors || 0)}
                        </div>
                        <p className="text-xs text-gray-300 mt-1">
                            No visitor tracking
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-morpheus-blue-dark/30 p-1 rounded-lg w-fit">
                <Button
                    variant={activeTab === "products" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("products")}
                    className={`${
                        activeTab === "products"
                            ? "bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white"
                            : "text-gray-300 hover:text-white hover:bg-slate-700/50"
                    }`}
                >
                    <Package className="h-4 w-4 mr-2" />
                    {t('admin.products')}
                </Button>
                {/* Only show categories tab to admins */}
                {isAdmin && (
                    <Button
                        variant={activeTab === "categories" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setActiveTab("categories")}
                        className={`${
                            activeTab === "categories"
                                ? "bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white"
                                : "text-gray-300 hover:text-white hover:bg-slate-700/50"
                        }`}
                    >
                        <Grid3X3 className="h-4 w-4 mr-2" />
                        {t('admin.categories')}
                    </Button>
                )}
            </div>

            {/* Tab Content */}
            <div className="bg-gradient-to-br from-morpheus-blue-dark/20 to-morpheus-blue-light/20 border border-slate-700/50 rounded-lg">
                {activeTab === "products" && (
                    <ProductsList storeId={storeId} store={store} />
                )}
                {activeTab === "categories" && isAdmin && (
                    <CategoriesList storeId={storeId} store={store} />
                )}
                </div>
            </div>
        </AdminV2Layout>
    );
}