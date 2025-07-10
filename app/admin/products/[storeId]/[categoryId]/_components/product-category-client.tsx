"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductList } from "@/app/admin/_components/product-list";
import { ProductForm } from "@/app/admin/_components/product-form";
import { useStores } from "@/app/admin/_hooks/use-stores";
import type { ProductWithObjects } from "@/hooks/useProducts";

interface ProductCategoryClientProps {
    storeId: string;
    categoryId: string;
    storeName: string;
    categoryName: string;
}

export function ProductCategoryClient({ 
    storeId, 
    categoryId, 
    storeName, 
    categoryName 
}: ProductCategoryClientProps) {
    const [currentView, setCurrentView] = useState<"list" | "form">("list");
    const [editingProduct, setEditingProduct] = useState<ProductWithObjects | undefined>(undefined);
    const { data: stores } = useStores();
    const router = useRouter();

    // Find the current store and category
    const currentStore = stores?.find((store: any) => store.yboutiqueid.toString() === storeId);
    const currentCategory = currentStore?.categories?.find((cat: any) => cat.id === categoryId);

    const handleEditProduct = (product: ProductWithObjects) => {
        setEditingProduct(product);
        setCurrentView("form");
    };

    const handleCreateProduct = () => {
        setEditingProduct(undefined);
        setCurrentView("form");
    };

    const handleBackToCategories = () => {
        router.push("/admin/products");
    };

    const handleBackToList = () => {
        setEditingProduct(undefined);
        setCurrentView("list");
    };

    const handleProductSaved = () => {
        setEditingProduct(undefined);
        setCurrentView("list");
    };

    if (currentView === "list") {
        return (
            <ProductList
                storeId={storeId}
                storeName={storeName}
                categoryId={categoryId}
                categoryName={categoryName}
                categoryProducts={currentCategory?.products || []}
                onEditProduct={handleEditProduct}
                onCreateProduct={handleCreateProduct}
                onBack={handleBackToCategories}
            />
        );
    }

    if (currentView === "form") {
        return (
            <ProductForm
                product={editingProduct}
                storeId={storeId}
                storeName={storeName}
                categoryId={categoryId}
                categoryName={categoryName}
                onBack={handleBackToList}
                onSave={handleProductSaved}
            />
        );
    }

    return null;
}