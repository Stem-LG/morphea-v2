"use client";
import React from "react";
import { AdminV2Layout } from "../_components/admin-v2-layout";
import { ProductApprovals } from "./_components/product-approvals";
import { useAuth } from "@/hooks/useAuth";
import { AccessDenied } from "../_components/access-denied";
import { LoadingScreen } from "../_components/loading-screen";

export default function ApprovalsPage() {
    const { data: user, isLoading } = useAuth();
    
    if (isLoading) {
        return <LoadingScreen />;
    }

    // Check if user has admin role
    const userMetadata = user?.app_metadata as { roles?: string[] };
    const roles = userMetadata?.roles || [];
    const isAdmin = roles.includes('admin');

    if (!isAdmin) {
        return <AccessDenied />;
    }

    return (
        <AdminV2Layout>
            <ProductApprovals />
        </AdminV2Layout>
    );
}