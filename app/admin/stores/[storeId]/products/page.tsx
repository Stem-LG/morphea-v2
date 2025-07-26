"use client";
import React from "react";
import { useParams } from "next/navigation";
import { ProductsList } from "../_components/products-list";
import { useStores } from "@/app/admin/_hooks/use-stores";

export default function StoreProductsPage() {
    const params = useParams();
    const storeId = params.storeId as string;
    const { data: stores } = useStores();
    
    // Find the current store
    const store = stores?.find((s: any) => s.yboutiqueid.toString() === storeId);
    
    if (!store) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <p className="text-white text-lg">Store not found</p>
                    </div>
                </div>
            </div>
        );
    }

    return <ProductsList storeId={storeId} store={store} />;
}