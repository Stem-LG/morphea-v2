"use client";
import React, { useState } from "react";
import { StoreSectionSelector } from "./store-section-selector";
import { ProductList } from "./product-list";
import { ProductForm } from "./product-form";
import type { ProductWithObjects } from "@/hooks/useProducts";

export function ProductManagement() {
    const [currentView, setCurrentView] = useState<"selector" | "list" | "form">("selector");
    const [selectedSection, setSelectedSection] = useState<{
        id: string;
        storeName: string;
        sectionTitle: string;
    } | null>(null);
    const [editingProduct, setEditingProduct] = useState<ProductWithObjects | undefined>(undefined);

    const handleSectionSelect = (sectionId: string, storeName: string, sectionTitle: string) => {
        setSelectedSection({ id: sectionId, storeName, sectionTitle });
        setCurrentView("list");
    };

    const handleEditProduct = (product: ProductWithObjects) => {
        setEditingProduct(product);
        setCurrentView("form");
    };

    const handleCreateProduct = () => {
        setEditingProduct(undefined);
        setCurrentView("form");
    };

    const handleBackToSelector = () => {
        setSelectedSection(null);
        setEditingProduct(undefined);
        setCurrentView("selector");
    };

    const handleBackToList = () => {
        setEditingProduct(undefined);
        setCurrentView("list");
    };

    const handleProductSaved = () => {
        setEditingProduct(undefined);
        setCurrentView("list");
    };

    if (currentView === "selector") {
        return (
            <StoreSectionSelector selectedSection={selectedSection?.id || null} onSectionSelect={handleSectionSelect} />
        );
    }

    if (currentView === "list" && selectedSection) {
        return (
            <ProductList
                sectionId={selectedSection.id}
                storeName={selectedSection.storeName}
                sectionTitle={selectedSection.sectionTitle}
                onEditProduct={handleEditProduct}
                onCreateProduct={handleCreateProduct}
                onBack={handleBackToSelector}
            />
        );
    }

    if (currentView === "form" && selectedSection) {
        return (
            <ProductForm
                product={editingProduct}
                sectionId={selectedSection.id}
                storeName={selectedSection.storeName}
                sectionTitle={selectedSection.sectionTitle}
                onBack={handleBackToList}
                onSave={handleProductSaved}
            />
        );
    }

    return null;
}
