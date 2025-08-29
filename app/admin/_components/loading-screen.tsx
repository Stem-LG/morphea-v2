'use client'
import React from 'react'
import { useLanguage } from '@/hooks/useLanguage'

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
                    <div className="mb-4 flex items-center justify-center">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-500"></div>
                    </div>
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
