"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/hooks/useLanguage";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { refetch } = useAuth();
    const { t } = useLanguage();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const supabase = createClient();
        setError(null);
        setIsSubmitting(true); // Start loading

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            // Wait for auth state to be refreshed and ensure user is authenticated
            const { data: user } = await refetch();
            // Only navigate if we have a valid user
            if (user && window != undefined) {
                window.location.href = "/main";
            } else {
                console.log("not redirecting due to error");
                throw new Error(t("auth.errorOccurred"));
            }
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : t("auth.errorOccurred"));
        } finally {
            setIsSubmitting(false); // Stop loading
        }
    };

    return (
        <div className={cn("flex flex-col gap-8 w-full max-w-5xl mx-auto", className)} {...props}>
            {/* Welcome header */}
            <div className="text-center mb-8">
               
                <h1 className="font-recia text-4xl md:text-5xl font-extrabold text-[#05141D] mb-4 leading-tight">
                    {t("auth.welcomeBack")}
                </h1>
                <p className="font-supreme text-lg text-[#063846] max-w-md mx-auto">
                    {t("auth.signInSubtitle")}
                </p>
            </div>

            {/* Form Card */}
            <div className="bg-white/90 backdrop-blur-sm border border-slate-200 shadow-xl overflow-hidden rounded-lg transform transition-all duration-300 hover:shadow-2xl">
                <form onSubmit={handleLogin} className="p-8 space-y-6">
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

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-[#05141D] text-sm font-medium">
                                {t("auth.password")}
                                {password.trim() && <span className="text-green-500 ml-1">✓</span>}
                            </Label>
                            <Link
                                href="/auth/forgot-password"
                                className="text-[#063846] hover:text-[#05141D] font-semibold underline underline-offset-2 transition-colors text-sm"
                            >
                                {t("auth.forgotPassword")}
                            </Link>
                        </div>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder={t("auth.passwordPlaceholder")}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`bg-white border-slate-300 text-[#05141D] placeholder:text-slate-400 h-11 text-base focus:border-[#063846] focus:ring-[#063846] rounded-md pr-20 transition-colors ${password.trim() ? 'border-green-300 focus:border-green-500' : ''
                                    }`}
                            />

                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {!showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-[#05141D] to-[#063846] hover:from-[#04111a] hover:to-[#052d37] text-white h-11 text-base font-semibold shadow-lg transition-all duration-300 hover:shadow-xl rounded-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>{t("auth.signingIn")}</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <span>{t("auth.signIn")}</span>
                                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        )}
                    </Button>

                    <div className="text-center">
                        <p className="text-slate-600">
                            {t("auth.dontHaveAccount")}{" "}
                            <Link
                                href="/auth/sign-up"
                                className="text-[#063846] hover:text-[#05141D] font-semibold underline underline-offset-2 transition-colors"
                            >
                                {t("auth.signUp")}
                            </Link>
                        </p>
                    </div>
                </form>
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
                    {t("auth.backToHome")}
                </Link>
            </div>
        </div>
    );
}
