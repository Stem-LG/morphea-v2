"use client";
import React from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LoadingScreen } from "@/app/admin/_components/loading-screen";
import { AccessDenied } from "@/app/admin/_components/access-denied";
import { ProductForm } from "../_components/product-form";

export default function NewProductPage() {
    const params = useParams();
    const storeId = params.storeId as string;
    const { data: user, isLoading } = useAuth();

    // Show loading screen while checking authentication
    if (isLoading) {
        return <LoadingScreen />;
    }

    // Check if user has admin or store_admin role
    const userMetadata = user?.app_metadata as { roles?: string[]; assigned_stores?: number[] };
    const roles = userMetadata?.roles || [];
    const assignedStores = userMetadata?.assigned_stores || [];

    // Check access permissions
    const hasAccess =
        roles.includes("admin") || (roles.includes("store_admin") && assignedStores.includes(parseInt(storeId)));

    console.log(roles);

    if (!hasAccess) {
        return <AccessDenied />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light">
            <div className="p-6">
                <div className="bg-gradient-to-br from-morpheus-blue-dark/20 to-morpheus-blue-light/20 border border-slate-700/50 shadow-2xl rounded-lg">
                    <ProductForm storeId={storeId} />
                </div>
            </div>
        </div>
    );
}
