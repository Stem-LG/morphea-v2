"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { StoreSelector } from "@/app/admin/_components/store-section-selector";
import { CategorySelector } from "@/app/admin/_components/category-selector";
import { useStores } from "@/app/admin/_hooks/use-stores";

export function ProductsPageClient() {
    const [selectedStore, setSelectedStore] = useState<{id: string, name: string} | null>(null);
    const { data: stores, isLoading, error } = useStores();
    const router = useRouter();

    const handleStoreSelect = (storeId: string, storeName: string) => {
        setSelectedStore({ id: storeId, name: storeName });
    };

    const handleCategorySelect = (categoryId: string, categoryName: string) => {
        // Navigate to the category-specific page with query params
        const params = new URLSearchParams({
            storeId: selectedStore!.id,
            storeName: selectedStore!.name,
            categoryId,
            categoryName
        });
        router.push(`/admin/products/${selectedStore!.id}/${categoryId}?${params.toString()}`);
    };

    const handleBackToStores = () => {
        setSelectedStore(null);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-morpheus-gold-dark mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading stores...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <p className="text-red-600">Error loading stores: {error.message}</p>
                </div>
            </div>
        );
    }

    // Show category selector if a store is selected
    if (selectedStore) {
        const store = stores?.find((s: any) => s.yboutiqueid.toString() === selectedStore.id);
        const categories = store?.categories || [];

        return (
            <CategorySelector
                storeId={selectedStore.id}
                storeName={selectedStore.name}
                categories={categories}
                onCategorySelect={handleCategorySelect}
                onBack={handleBackToStores}
            />
        );
    }

    // Show store selector by default
    return (
        <StoreSelector
            selectedStore={selectedStore?.id || null}
            onStoreSelect={handleStoreSelect}
            tourData={{ scenes: [] }}
        />
    );
}