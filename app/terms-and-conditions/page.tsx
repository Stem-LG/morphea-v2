"use client";

import { useLanguage } from "@/hooks/useLanguage";
import Link from "next/link";

export default function TermsAndConditionsPage() {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light border border-slate-700 p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-white mb-4 font-parisienne">
                            {t("auth.termsAndConditions")}
                        </h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <div className="text-gray-300 space-y-6">
                            <div className="bg-slate-800/50 p-6 rounded border border-slate-600">
                                <p className="text-center text-gray-400 italic">{t("auth.termsContentPlaceholder")}</p>
                                <p className="text-center text-gray-400 italic mt-2">
                                    {t("auth.developmentPlaceholder")}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <Link
                            href="/auth/sign-up"
                            className="text-morpheus-gold-light hover:text-[#d4c066] font-semibold underline underline-offset-4 transition-colors"
                        >
                            {t("auth.backToSignUp")}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
