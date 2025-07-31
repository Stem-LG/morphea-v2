"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/hooks/useLanguage";
import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useLanguage();

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        const supabase = createClient();
        setIsLoading(true);
        setError(null);

        try {
            // The url which will be included in the email. This URL needs to be configured in your redirect URLs in the Supabase dashboard at https://supabase.com/dashboard/project/_/auth/url-configuration
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/update-password`,
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
        <div className={cn("flex flex-col gap-8", className)} {...props}>
            {success ? (
                <>
                    {/* Header */}
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-white mb-2 font-parisienne">
                            {t("auth.checkYourEmail")}
                        </h2>
                        <p className="text-lg text-gray-300">{t("auth.passwordResetSent")}</p>
                    </div>

                    {/* Success Card */}
                    <div className="bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light border border-slate-700 p-8 shadow-2xl">
                        <div className="text-center space-y-4">
                            <p className="text-gray-300 text-lg">{t("auth.passwordResetInstructions")}</p>
                            <div className="mt-8">
                                <Link
                                    href="/auth/login"
                                    className="text-morpheus-gold-light hover:text-[#d4c066] font-semibold underline underline-offset-4 transition-colors"
                                >
                                    {t("auth.signIn")}
                                </Link>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {/* Header */}
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-white mb-2 font-parisienne">
                            {t("auth.resetPassword")}
                        </h2>
                        <p className="text-lg text-gray-300">{t("auth.resetPasswordSubtitle")}</p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light border border-slate-700 p-8 shadow-2xl">
                        <form onSubmit={handleForgotPassword} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-white text-lg font-medium">
                                    {t("auth.email")}
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder={t("auth.emailPlaceholder")}
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 h-12 text-lg focus:border-morpheus-gold-light focus:ring-morpheus-gold-light rounded-none"
                                />
                            </div>

                            {error && (
                                <div className="bg-red-500/20 border border-red-400 text-red-200 px-4 py-3">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-[#695029] hover:to-[#d4c066] text-white h-12 text-lg font-semibold shadow-2xl transition-all duration-300 hover:scale-105 rounded-none disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <img src="/loading.gif" alt="Loading" className="h-5 w-5" />
                                        {t("auth.sending")}
                                    </div>
                                ) : (
                                    t("auth.sendResetEmail")
                                )}
                            </Button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-gray-300">
                                {t("auth.alreadyHaveAccount")}{" "}
                                <Link
                                    href="/auth/login"
                                    className="text-morpheus-gold-light hover:text-[#d4c066] font-semibold underline underline-offset-4 transition-colors"
                                >
                                    {t("auth.signIn")}
                                </Link>
                            </p>
                        </div>
                    </div>
                </>
            )}

            {/* Back to home */}
            <div className="text-center">
                <Link
                    href="/"
                    className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2"
                >
                    {t("auth.backToMorpheusMall")}
                </Link>
            </div>
        </div>
    );
}
