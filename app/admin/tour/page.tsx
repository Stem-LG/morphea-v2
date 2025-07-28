"use client";
import { Suspense } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import TourAdminViewer from "../_components/tour-admin-viewer";

export default function TourAdminPage() {
    const { t } = useLanguage();

    return (

            <Suspense
                fallback={
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">{t("admin.loadingVirtualTourAdmin")}</p>
                        </div>
                    </div>
                }
            >
                <TourAdminViewer height="calc(100vh - 4rem)" className="w-full h-full" />
            </Suspense>
    );
}
