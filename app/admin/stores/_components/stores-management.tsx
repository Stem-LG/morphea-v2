"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Store,
    MapPin,
    Package,
    Users,
    BarChart3,
    ArrowRight,
    Plus
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useStores } from "@/app/admin/_hooks/use-stores";
import { useMultipleStoreStatsClient } from "@/hooks/useStoreStatsClient";
import Link from "next/link";

export function StoresManagement() {
    const { t } = useLanguage();
    const { data: user } = useAuth();
    const { data: stores, isLoading, error } = useStores();
    
    const userMetadata = user?.app_metadata as { roles?: string[], assigned_stores?: number[] };
    const roles = userMetadata?.roles || [];
    const isAdmin = roles.includes('admin') || roles.includes('store_admin');

    // Filter stores based on user role
    const accessibleStores = isAdmin
        ? stores
        // : []
        : stores //testing only

    // Get store IDs for fetching statistics
    const storeIds = accessibleStores?.map((store: any) => store.yboutiqueid) || [];
    
    // Fetch statistics for all accessible stores
    const { data: storeStats, isLoading: statsLoading } = useMultipleStoreStatsClient(storeIds);

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-morpheus-gold-light/30 border-t-morpheus-gold-light mx-auto mb-4"></div>
                        <p className="text-white text-lg">{t('admin.loadingStores')}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <p className="text-red-400 text-lg">{t('admin.errorLoadingStores')}: {error.message}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                        {t('admin.storeManagement')}
                    </h1>
                    <p className="text-lg text-gray-300">
                        {isAdmin 
                            ? t('admin.manageAllStores') 
                            : `${accessibleStores.length} ${t('admin.assignedStores')}`
                        }
                    </p>
                </div>
                
                {isAdmin && (
                    <Button className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-[#695029] hover:to-[#d4c066] text-white font-semibold shadow-2xl transition-all duration-300 hover:scale-105">
                        <Plus className="h-4 w-4 mr-2" />
                        {t('admin.addNewStore')}
                    </Button>
                )}
            </div>

            {/* Stores Grid */}
            {!accessibleStores || accessibleStores.length === 0 ? (
                <div className="text-center py-12">
                    <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">
                        {t('admin.noStoresAvailable')}
                    </h3>
                    <p className="text-gray-300 mb-6">
                        {isAdmin 
                            ? t('admin.noStoresDescription') 
                            : t('admin.noAssignedStoresDescription')
                        }
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {accessibleStores.map((store: any) => (
                        <Card 
                            key={store.yboutiqueid} 
                            className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
                        >
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-3 text-white">
                                    <div className="w-10 h-10 bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light rounded-lg flex items-center justify-center">
                                        <Store className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            {store.yboutiqueintitule || store.yboutiquecode}
                                        </h3>
                                        <p className="text-sm text-gray-300 font-normal">
                                            {store.yboutiquecode}
                                        </p>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Store Info */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <MapPin className="h-4 w-4" />
                                        <span>{store.yboutiqueadressemall || t('admin.noAddress')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <Package className="h-4 w-4" />
                                        <span>
                                            {store.categories?.length || 0} {t('admin.categories')}
                                        </span>
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-morpheus-blue-dark/30 p-3 rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Package className="h-4 w-4 text-morpheus-gold-light" />
                                            <span className="text-xs text-gray-300">{t('admin.products')}</span>
                                        </div>
                                        <div className="text-lg font-bold text-white">
                                            {statsLoading ? (
                                                <div className="animate-pulse bg-gray-600 h-6 w-8 rounded"></div>
                                            ) : (
                                                storeStats?.[store.yboutiqueid]?.totalProducts || 0
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-morpheus-blue-dark/30 p-3 rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <BarChart3 className="h-4 w-4 text-green-400" />
                                            <span className="text-xs text-gray-300">{t('admin.sales')}</span>
                                        </div>
                                        <div className="text-lg font-bold text-white">
                                            {statsLoading ? (
                                                <div className="animate-pulse bg-gray-600 h-6 w-8 rounded"></div>
                                            ) : (
                                                storeStats?.[store.yboutiqueid]?.sales || 0
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="pt-2">
                                    <Link href={`/adminv2/stores/${store.yboutiqueid}`}>
                                        <Button
                                            variant="outline"
                                            className="w-full border-slate-600 text-white hover:bg-slate-700/50 group-hover:border-morpheus-gold-light/50"
                                        >
                                            {t('admin.manageStore')}
                                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
