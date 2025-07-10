"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StoreSectionSelector } from "@/app/admin/_components/store-section-selector";
import { getTourData, TourData } from "@/app/_consts/tourdata";
import { useLanguage } from "@/hooks/useLanguage";

export function ProductsPageClient() {
    const [tourData, setTourData] = useState<TourData>({ scenes: [] });
    const [isLoadingTourData, setIsLoadingTourData] = useState(true);
    const { t } = useLanguage();
    const router = useRouter();

    // Fetch tour data on component mount
    useEffect(() => {
        const fetchTourData = async () => {
            try {
                setIsLoadingTourData(true);
                const data = await getTourData();
                setTourData(data);
            } catch (error) {
                console.error('Failed to fetch tour data:', error);
            } finally {
                setIsLoadingTourData(false);
            }
        };

        fetchTourData();
    }, []);

    const handleSectionSelect = (sectionId: string, storeName: string, sectionTitle: string) => {
        // Navigate to the section-specific page with query params
        const params = new URLSearchParams({
            sectionId,
            storeName,
            sectionTitle
        });
        router.push(`/admin/products/${sectionId}?${params.toString()}`);
    };

    if (isLoadingTourData) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-morpheus-gold-dark mx-auto mb-4"></div>
                    <p className="text-gray-600">{t('admin.loadingTourData')}</p>
                </div>
            </div>
        );
    }

    return (
        <StoreSectionSelector 
            selectedSection={null} 
            onSectionSelect={handleSectionSelect}
            tourData={tourData}
        />
    );
}