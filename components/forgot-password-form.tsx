"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/hooks/useLanguage";
import { useWebsiteUrl } from "@/hooks/use-website-url";
import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function ForgotPasswordForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useLanguage();
    const { data: websiteUrl, isLoading: isLoadingWebsiteUrl } = useWebsiteUrl();

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        const supabase = createClient();
        setIsLoading(true);
        setError(null);

        try {
            // The url which will be included in the email. This URL needs to be configured in your redirect URLs in the Supabase dashboard at https://supabase.com/dashboard/project/_/auth/url-configuration
            const redirectUrl = websiteUrl && !isLoadingWebsiteUrl 
                ? `${websiteUrl}/auth/update-password`
                : `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/update-password`;

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: redirectUrl,
            });
            if (error) throw error;
            setSuccess(true);
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : t("auth.errorOccurred"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={cn("flex flex-col gap-8 w-full max-w-2xl mx-auto", className)} {...props}>
            {/* Welcome header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#05141D] to-[#063846] rounded-full mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <h1 className="font-recia text-4xl md:text-5xl font-extrabold text-[#05141D] mb-4 leading-tight">
                    {success ? t("auth.checkYourEmail") : t("auth.resetPassword")}
                </h1>
                <p className="font-supreme text-lg text-[#063846] max-w-md mx-auto">
                    {success ? t("auth.passwordResetSent") : t("auth.resetPasswordSubtitle")}
                </p>
            </div>

            {/* Form Card */}
            <div className="bg-white/90 backdrop-blur-sm border border-slate-200 shadow-xl overflow-hidden rounded-lg transform transition-all duration-300 hover:shadow-2xl">
                {success ? (
                    <div className="p-8">
                        <div className="text-center space-y-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-slate-600 text-lg">{t("auth.passwordResetInstructions")}</p>
                            <div className="pt-4">
                                <Link
                                    href="/auth/login"
                                    className="inline-flex items-center gap-2 bg-[#063846] hover:bg-[#05141D] text-white px-6 py-3 rounded-md font-semibold transition-colors"
                                >
                                    <span>{t("auth.signIn")}</span>
                                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleForgotPassword} className="p-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-[#05141D] text-sm font-medium">
                                    {t("auth.email")}
                                    {email.trim() && email.includes('@') && <span className="text-green-500 ml-1">✓</span>}
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder={t("auth.emailPlaceholder")}
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`bg-white border-slate-300 text-[#05141D] placeholder:text-slate-400 h-11 text-base focus:border-[#063846] focus:ring-[#063846] rounded-md transition-colors ${email.trim() && email.includes('@') ? 'border-green-300 focus:border-green-500' : ''
                                        }`}
                                />
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>
                            )}

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-[#05141D] to-[#063846] hover:from-[#04111a] hover:to-[#052d37] text-white h-11 text-base font-semibold shadow-lg transition-all duration-300 hover:shadow-xl rounded-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>{t("auth.sending")}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <span>{t("auth.sendResetEmail")}</span>
                                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </div>
                                )}
                            </Button>

                            <div className="text-center">
                                <p className="text-slate-600">
                                    {t("auth.alreadyHaveAccount")}{" "}
                                    <Link
                                        href="/auth/login"
                                        className="text-[#063846] hover:text-[#05141D] font-semibold underline underline-offset-2 transition-colors"
                                    >
                                        {t("auth.signIn")}
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </form>
                )}
            </div>

            {/* Back to home */}
            <div className="text-center">
                <Link
                    href="/"
                    className="text-slate-500 hover:text-[#05141D] transition-colors inline-flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>{t("auth.backToMorpheusMall")}</span>
                </Link>
            </div>
        </div>
    );
}
