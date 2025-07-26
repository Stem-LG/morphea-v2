"use client";
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, ArrowLeft, Shield, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface StoreAccessGuardProps {
    storeId: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function StoreAccessGuard({ storeId, children, fallback }: StoreAccessGuardProps) {
    const { data: user, isLoading } = useAuth();
    const { t } = useLanguage();

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-morpheus-gold-light/30 border-t-morpheus-gold-light mx-auto mb-4"></div>
                        <p className="text-white text-lg">Verifying access...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Check if user is authenticated
    if (!user) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <Card className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50 shadow-xl max-w-md">
                        <CardHeader className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Shield className="h-8 w-8 text-white" />
                            </div>
                            <CardTitle className="text-white text-xl">
                                Authentication Required
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-center space-y-4">
                            <p className="text-gray-300">
                                You must be logged in to access this store management page.
                            </p>
                            <div className="flex flex-col gap-2">
                                <Link href="/auth/login">
                                    <Button className="w-full bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-[#695029] hover:to-[#d4c066] text-white">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/adminv2">
                                    <Button variant="outline" className="w-full border-slate-600 text-white hover:bg-slate-700/50">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to Dashboard
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Check user roles and store access
    const userMetadata = user.app_metadata as { roles?: string[], assigned_stores?: number[] };
    const roles = userMetadata?.roles || [];
    const assignedStores = userMetadata?.assigned_stores || [];
    
    const isAdmin = roles.includes('admin');
    const isStoreAdmin = roles.includes('store_admin');
    const hasStoreAccess = isAdmin || (isStoreAdmin && assignedStores.includes(parseInt(storeId)));

    // Check if user has any admin role
    if (!isAdmin && !isStoreAdmin) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <Card className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50 shadow-xl max-w-md">
                        <CardHeader className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="h-8 w-8 text-white" />
                            </div>
                            <CardTitle className="text-white text-xl">
                                {t('admin.accessDenied')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-center space-y-4">
                            <p className="text-gray-300">
                                You don't have permission to access the admin panel. Please contact an administrator if you believe this is an error.
                            </p>
                            <div className="flex flex-col gap-2">
                                <Link href="/main">
                                    <Button className="w-full bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-[#695029] hover:to-[#d4c066] text-white">
                                        {t('admin.backToMain')}
                                    </Button>
                                </Link>
                                <Link href="/auth/login">
                                    <Button variant="outline" className="w-full border-slate-600 text-white hover:bg-slate-700/50">
                                        {t('admin.loginDifferentAccount')}
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Check if user has access to this specific store
    if (!hasStoreAccess) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <Card className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50 shadow-xl max-w-md">
                        <CardHeader className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Store className="h-8 w-8 text-white" />
                            </div>
                            <CardTitle className="text-white text-xl">
                                Store Access Denied
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-center space-y-4">
                            <p className="text-gray-300">
                                You don't have access to manage this store. 
                                {isStoreAdmin && (
                                    <span className="block mt-2">
                                        You can only manage stores that have been assigned to you.
                                    </span>
                                )}
                            </p>
                            <div className="bg-morpheus-blue-dark/30 p-3 rounded-lg text-left">
                                <h4 className="text-white font-medium mb-2">Your Access Level:</h4>
                                <div className="space-y-1 text-sm text-gray-300">
                                    <div className="flex justify-between">
                                        <span>Role:</span>
                                        <span className="text-morpheus-gold-light capitalize">
                                            {isAdmin ? 'Admin' : 'Store Admin'}
                                        </span>
                                    </div>
                                    {isStoreAdmin && (
                                        <div className="flex justify-between">
                                            <span>Assigned Stores:</span>
                                            <span className="text-morpheus-gold-light">
                                                {assignedStores.length}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Link href="/adminv2/stores">
                                    <Button className="w-full bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-[#695029] hover:to-[#d4c066] text-white">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        View Available Stores
                                    </Button>
                                </Link>
                                <Link href="/adminv2">
                                    <Button variant="outline" className="w-full border-slate-600 text-white hover:bg-slate-700/50">
                                        Back to Dashboard
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // User has access, render children or fallback
    return <>{fallback || children}</>;
}

// Hook for checking store access in components
export function useStoreAccess(storeId: string) {
    const { data: user, isLoading } = useAuth();

    if (isLoading || !user) {
        return {
            hasAccess: false,
            isLoading,
            isAdmin: false,
            isStoreAdmin: false,
            assignedStores: []
        };
    }

    const userMetadata = user.app_metadata as { roles?: string[], assigned_stores?: number[] };
    const roles = userMetadata?.roles || [];
    const assignedStores = userMetadata?.assigned_stores || [];
    
    const isAdmin = roles.includes('admin');
    const isStoreAdmin = roles.includes('store_admin');
    const hasAccess = isAdmin || (isStoreAdmin && assignedStores.includes(parseInt(storeId)));

    return {
        hasAccess,
        isLoading: false,
        isAdmin,
        isStoreAdmin,
        assignedStores,
        user
    };
}