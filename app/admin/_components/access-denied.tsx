"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Shield, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import Link from "next/link";

export function AccessDenied() {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light flex items-center justify-center">
            <div className="text-center max-w-md mx-auto px-4">
                {/* Logo */}
                <div className="mb-8">
                    <h1 className="text-4xl font-extrabold text-white mb-2">
                        <span className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light bg-clip-text text-transparent">
                            {t("auth.morpheusMall")}
                        </span>
                    </h1>
                    <p className="text-lg text-gray-300">{t("admin.adminPanel")}</p>
                </div>

                {/* Access Denied Card */}
                <div className="bg-gradient-to-br from-morpheus-blue-dark/20 to-morpheus-blue-light/20 border border-slate-700/50 p-8 shadow-2xl">
                    <div className="flex items-center justify-center mb-6">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                            <Shield className="h-8 w-8 text-red-400" />
                        </div>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-white mb-4">
                        {t('admin.accessDenied')}
                    </h2>
                    
                    <p className="text-gray-300 mb-6 leading-relaxed">
                        {t('admin.accessDeniedMessage')}
                    </p>
                    
                    <div className="space-y-3">
                        <Link href="/main">
                            <Button className="w-full bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-[#695029] hover:to-[#d4c066] text-white font-semibold shadow-2xl transition-all duration-300 hover:scale-105">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                {t('admin.backToMain')}
                            </Button>
                        </Link>
                        
                        <Link href="/auth/login">
                            <Button 
                                variant="outline" 
                                className="w-full border-slate-600 text-gray-300 hover:bg-slate-700/50 hover:text-white"
                            >
                                {t('admin.loginDifferentAccount')}
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Help Text */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-400">
                        {t('admin.needAccess')} {' '}
                        <a 
                            href="mailto:admin@morpheusmall.com" 
                            className="text-morpheus-gold-light hover:text-[#d4c066] underline underline-offset-4 transition-colors"
                        >
                            {t('admin.contactAdmin')}
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}