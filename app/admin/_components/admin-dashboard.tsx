"use client";
import React from "react";
import { useLanguage } from "@/hooks/useLanguage";

export function AdminDashboard() {
    const { t } = useLanguage();
    
    return (
        <div className="p-4 lg:p-6">
            <h2 className="text-2xl lg:text-3xl font-bold mb-4 lg:mb-6">{t('admin.dashboard')}</h2>
            <div className="bg-gray-100 rounded-lg p-6 lg:p-8 text-center text-gray-500">
                <p className="text-sm lg:text-base">{t('admin.dashboardContent')}</p>
            </div>
        </div>
    );
}
