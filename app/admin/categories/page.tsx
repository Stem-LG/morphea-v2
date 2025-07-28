"use client";
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { AccessDenied } from "../_components/access-denied";
import { LoadingScreen } from "../_components/loading-screen";
import { CategoryManagement } from "./_components/category-management";

export default function CategoriesPage() {
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
        <CategoryManagement />
    );
}