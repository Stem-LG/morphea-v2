'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Shield, ArrowLeft } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import Link from 'next/link'

export function AccessDenied() {
    const { t } = useLanguage()

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white to-gray-50">
            <div className="mx-auto max-w-md px-4 text-center">
                {/* Logo */}
                <div className="mb-8">
                    <h1 className="mb-2 text-4xl font-extrabold text-gray-900">
                        <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                            {t('auth.morpheusMall')}
                        </span>
                    </h1>
                    <p className="text-lg text-gray-600">
                        {t('admin.adminPanel')}
                    </p>
                </div>

                {/* Access Denied Card */}
                <div className="border border-gray-200/50 bg-gradient-to-br from-gray-50/50 to-white/50 p-8 shadow-2xl">
                    <div className="mb-6 flex items-center justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
                            <Shield className="h-8 w-8 text-red-400" />
                        </div>
                    </div>

                    <h2 className="mb-4 text-2xl font-bold text-gray-900">
                        {t('admin.accessDenied')}
                    </h2>

                    <p className="mb-6 leading-relaxed text-gray-600">
                        {t('admin.accessDeniedMessage')}
                    </p>

                    <div className="space-y-3">
                        <Link href="/main">
                            <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 font-semibold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-blue-600">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {t('admin.backToMain')}
                            </Button>
                        </Link>

                        <Link href="/auth/login">
                            <Button
                                variant="outline"
                                className="mt-3 w-full border-gray-300 text-gray-700 hover:bg-gray-100/50 hover:text-gray-900"
                            >
                                {t('admin.loginDifferentAccount')}
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Help Text */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                        {t('admin.needAccess')}{' '}
                        <a
                            href="mailto:admin@morpheusmall.com"
                            className="text-blue-600 underline underline-offset-4 transition-colors hover:text-blue-700"
                        >
                            {t('admin.contactAdmin')}
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}
