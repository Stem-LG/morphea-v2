"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductList } from "@/app/admin/_components/product-list";
import { ProductForm } from "@/app/admin/_components/product-form";
import type { ProductWithObjects } from "@/hooks/useProducts";

interface ProductSectionClientProps {
    sectionId: string;
    storeName: string;
    sectionTitle: string;
}

export function ProductSectionClient({ sectionId, storeName, sectionTitle }: ProductSectionClientProps) {
    const [currentView, setCurrentView] = useState<"list" | "form">("list");
    const [editingProduct, setEditingProduct] = useState<ProductWithObjects | undefined>(undefined);
    const router = useRouter();

    const handleEditProduct = (product: ProductWithObjects) => {
        setEditingProduct(product);
        setCurrentView("form");
    };

    const handleCreateProduct = () => {
        setEditingProduct(undefined);
        setCurrentView("form");
    };

    const handleBackToSelector = () => {
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
                sectionId={sectionId}
                storeName={storeName}
                sectionTitle={sectionTitle}
                onEditProduct={handleEditProduct}
                onCreateProduct={handleCreateProduct}
                onBack={handleBackToSelector}
            />
        );
    }

    if (currentView === "form") {
        return (
            <ProductForm
                product={editingProduct}
                sectionId={sectionId}
                storeName={storeName}
                sectionTitle={sectionTitle}
                onBack={handleBackToList}
                onSave={handleProductSaved}
            />
        );
    }

    return null;
}