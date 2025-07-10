"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, MapPin } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { TourData } from "@/app/_consts/tourdata";
import { useStores } from "@/app/admin/_hooks/use-stores";

interface StoreSelectorProps {
    selectedStore: string | null;
    onStoreSelect: (storeId: string, storeName: string) => void;
    tourData: TourData;
}

export function StoreSelector({ selectedStore, onStoreSelect }: StoreSelectorProps) {
    const { t } = useLanguage();
    
    const { data: stores, isLoading, error } = useStores();

    if (isLoading) {
        return (
            <div className="p-4 lg:p-6">
                <h2 className="text-2xl lg:text-3xl font-bold mb-4 lg:mb-6">{t('admin.selectStore')}</h2>
                <div className="text-center py-8">
                    <p className="text-gray-600">Loading stores...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 lg:p-6">
                <h2 className="text-2xl lg:text-3xl font-bold mb-4 lg:mb-6">{t('admin.selectStore')}</h2>
                <div className="text-center py-8">
                    <p className="text-red-600">Error loading stores: {error.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-6">
            <h2 className="text-2xl lg:text-3xl font-bold mb-4 lg:mb-6">{t('admin.selectStore')}</h2>

            {!stores || stores.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-600">{t('admin.noStoresAvailable')}</p>
                </div>
            ) : (
                <div className="grid gap-4 lg:gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {stores.map((store: any) => (
                        <Card key={store.yboutiqueid} className="border-2 hover:shadow-lg transition-shadow cursor-pointer">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                                    <Store className="h-4 w-4 lg:h-5 lg:w-5" />
                                    {store.yboutiqueintitule || store.yboutiquecode}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <MapPin className="h-3 w-3 lg:h-4 lg:w-4" />
                                        <span>{store.categories?.length || 0} categor{(store.categories?.length || 0) !== 1 ? 'ies' : 'y'}</span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {store.yboutiqueadressemall}
                                    </div>
                                    <Button
                                        variant={selectedStore === store.yboutiqueid.toString() ? "default" : "outline"}
                                        className="w-full"
                                        onClick={() => onStoreSelect(store.yboutiqueid.toString(), store.yboutiqueintitule || store.yboutiquecode)}
                                    >
                                        {selectedStore === store.yboutiqueid.toString() ? t('admin.selected') : t('admin.selectStore')}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
