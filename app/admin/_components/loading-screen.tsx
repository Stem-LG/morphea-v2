"use client";
import React from "react";
import { useLanguage } from "@/hooks/useLanguage";

export function LoadingScreen() {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light flex items-center justify-center">
            <div className="text-center">
                {/* Logo */}
                <div className="mb-8">
                    <h1 className="text-4xl font-extrabold text-white mb-2">
                        <span className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light bg-clip-text text-transparent">
                            {t("auth.morpheusMall")}
                        </span>
                    </h1>
                    <p className="text-lg text-gray-300">{t("admin.adminPanel")}</p>
                </div>

                {/* Loading Animation */}
                <div className="bg-gradient-to-br from-morpheus-blue-dark/20 to-morpheus-blue-light/20 border border-slate-700/50 p-8 shadow-2xl">
                    <div className="flex items-center justify-center mb-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-morpheus-gold-light/30 border-t-morpheus-gold-light"></div>
                    </div>
                    <p className="text-white text-lg font-medium mb-2">
                        {t('admin.loadingSystem')}
                    </p>
                    <p className="text-gray-300 text-sm">
                        {t('admin.pleaseWait')}
                    </p>
                </div>
            </div>
        </div>
    );
}