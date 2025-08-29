'use client'
import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Store, ArrowLeft, Shield, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface StoreAccessGuardProps {
    storeId: string
    children: React.ReactNode
    fallback?: React.ReactNode
}

export function StoreAccessGuard({
    storeId,
    children,
    fallback,
}: StoreAccessGuardProps) {
    const { data: user, isLoading } = useAuth()
    const { t } = useLanguage()

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="p-6">
                <div className="flex h-64 items-center justify-center">
                    <div className="text-center">
                        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-500"></div>
                        <p className="text-lg text-gray-900">
                            Verifying access...
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // Check if user is authenticated
    if (!user) {
        return (
            <div className="p-6">
                <div className="flex h-64 items-center justify-center">
                    <Card className="max-w-md border-gray-200/50 bg-gradient-to-br from-gray-50/50 to-white/50 shadow-xl">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-600">
                                <Shield className="h-8 w-8 text-white" />
                            </div>
                            <CardTitle className="text-xl text-gray-900">
                                Authentication Required
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-center">
                            <p className="text-gray-600">
                                You must be logged in to access this store
                                management page.
                            </p>
                            <div className="flex flex-col gap-2">
                                <Link href="/auth/login">
                                    <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/admin">
                                    <Button
                                        variant="outline"
                                        className="w-full border-gray-300 text-gray-700 hover:bg-gray-100/50"
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to Dashboard
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    // Check user roles and store access
    const userMetadata = user.app_metadata as {
        roles?: string[]
        assigned_stores?: number[]
    }
    const roles = userMetadata?.roles || []
    const assignedStores = userMetadata?.assigned_stores || []

    const isAdmin = roles.includes('admin')
    const isStoreAdmin = roles.includes('store_admin')
    const hasStoreAccess =
        isAdmin || (isStoreAdmin && assignedStores.includes(parseInt(storeId)))

    // Check if user has any admin role
    if (!isAdmin && !isStoreAdmin) {
        return (
            <div className="p-6">
                <div className="flex h-64 items-center justify-center">
                    <Card className="max-w-md border-gray-200/50 bg-gradient-to-br from-gray-50/50 to-white/50 shadow-xl">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-600">
                                <AlertTriangle className="h-8 w-8 text-white" />
                            </div>
                            <CardTitle className="text-xl text-gray-900">
                                {t('admin.accessDenied')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-center">
                            <p className="text-gray-600">
                                You don&apos;t have permission to access the
                                admin panel. Please contact an administrator if
                                you believe this is an error.
                            </p>
                            <div className="flex flex-col gap-2">
                                <Link href="/main">
                                    <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600">
                                        {t('admin.backToMain')}
                                    </Button>
                                </Link>
                                <Link href="/auth/login">
                                    <Button
                                        variant="outline"
                                        className="w-full border-gray-300 text-gray-700 hover:bg-gray-100/50"
                                    >
                                        {t('admin.loginDifferentAccount')}
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    // Check if user has access to this specific store
    if (!hasStoreAccess) {
        return (
            <div className="p-6">
                <div className="flex h-64 items-center justify-center">
                    <Card className="max-w-md border-gray-200/50 bg-gradient-to-br from-gray-50/50 to-white/50 shadow-xl">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-orange-600">
                                <Store className="h-8 w-8 text-white" />
                            </div>
                            <CardTitle className="text-xl text-gray-900">
                                Store Access Denied
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-center">
                            <p className="text-gray-600">
                                You don&apos;t have access to manage this store.
                                {isStoreAdmin && (
                                    <span className="mt-2 block">
                                        You can only manage stores that have
                                        been assigned to you.
                                    </span>
                                )}
                            </p>
                            <div className="rounded-lg bg-gray-100 p-3 text-left">
                                <h4 className="mb-2 font-medium text-gray-900">
                                    Your Access Level:
                                </h4>
                                <div className="space-y-1 text-sm text-gray-600">
                                    <div className="flex justify-between">
                                        <span>Role:</span>
                                        <span className="text-blue-600 capitalize">
                                            {isAdmin ? 'Admin' : 'Store Admin'}
                                        </span>
                                    </div>
                                    {isStoreAdmin && (
                                        <div className="flex justify-between">
                                            <span>Assigned Stores:</span>
                                            <span className="text-blue-600">
                                                {assignedStores.length}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Link href="/admin/stores">
                                    <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        View Available Stores
                                    </Button>
                                </Link>
                                <Link href="/admin">
                                    <Button
                                        variant="outline"
                                        className="w-full border-gray-300 text-gray-700 hover:bg-gray-100/50"
                                    >
                                        Back to Dashboard
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    // User has access, render children or fallback
    return <>{fallback || children}</>
}

// Hook for checking store access in components
export function useStoreAccess(storeId: string) {
    const { data: user, isLoading } = useAuth()

    if (isLoading || !user) {
        return {
            hasAccess: false,
            isLoading,
            isAdmin: false,
            isStoreAdmin: false,
            assignedStores: [],
        }
    }

    const userMetadata = user.app_metadata as {
        roles?: string[]
        assigned_stores?: number[]
    }
    const roles = userMetadata?.roles || []
    const assignedStores = userMetadata?.assigned_stores || []

    const isAdmin = roles.includes('admin')
    const isStoreAdmin = roles.includes('store_admin')
    const hasAccess =
        isAdmin || (isStoreAdmin && assignedStores.includes(parseInt(storeId)))

    return {
        hasAccess,
        isLoading: false,
        isAdmin,
        isStoreAdmin,
        assignedStores,
        user,
    }
}
