'use client'
import React from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { LoadingAnimation } from '@/app/_components/loading'

export function LoadingScreen() {
    const { t } = useLanguage()

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white to-gray-50">
            <div className="text-center">
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

                {/* Loading Animation */}
                <div className="border border-gray-200/50 bg-gradient-to-br from-gray-50/50 to-white/50 p-8 shadow-2xl">
                    <LoadingAnimation />
                    <p className="mb-2 text-lg font-medium text-gray-900">
                        {t('admin.loadingSystem')}
                    </p>
                    <p className="text-sm text-gray-600">
                        {t('admin.pleaseWait')}
                    </p>
                </div>
            </div>
        </div>
    )
}
