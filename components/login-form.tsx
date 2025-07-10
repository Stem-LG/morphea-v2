"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/hooks/useLanguage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false); // Add separate loading state for form
    const router = useRouter();
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
            await refetch(); // Refresh auth state
            router.push("/protected");
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : t("auth.errorOccurred"));
        } finally {
            setIsSubmitting(false); // Stop loading
        }
    };

    return (
        <div className={cn("flex flex-col gap-8", className)} {...props}>
            {/* Header */}
            <div className="text-center space-y-4">
                <Link href="/" className="inline-block">
                    <h1 className="text-4xl font-extrabold text-white">
                        <span className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light bg-clip-text text-transparent">
                            {t("auth.morpheusMall")}
                        </span>
                    </h1>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{t("auth.welcomeBack")}</h2>
                    <p className="text-lg text-gray-300">{t("auth.signInSubtitle")}</p>
                </div>
            </div>

            {/* Form Card */}
            <div className="bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light border border-slate-700 p-8 shadow-2xl">
                <form onSubmit={handleLogin} className="space-y-6">
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

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-white text-lg font-medium">
                                {t("auth.password")}
                            </Label>
                            <Link
                                href="/auth/forgot-password"
                                className="text-sm text-morpheus-gold-light hover:text-[#d4c066] underline underline-offset-4 transition-colors"
                            >
                                {t("auth.forgotPassword")}
                            </Link>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            placeholder={t("auth.passwordPlaceholder")}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 h-12 text-lg focus:border-morpheus-gold-light focus:ring-morpheus-gold-light rounded-none"
                        />
                    </div>

                    {error && <div className="bg-red-500/20 border border-red-400 text-red-200 px-4 py-3">{error}</div>}

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-[#695029] hover:to-[#d4c066] text-white h-12 text-lg font-semibold shadow-2xl transition-all duration-300 hover:scale-105 rounded-none disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {isSubmitting ? (
                            <div className="flex ihttps://b8cfjlonmr.ufs.sh/f/kMrcl2nedu5f9APFW3XTHWfiIbY80Ctps4LSDP7za1c2FRBwtems-center gap-2">
                                <img src="/loading.gif" alt="Loading" className="h-5 w-5" />
                                {t("auth.signingIn")}
                            </div>
                        ) : (
                            t("auth.signIn")
                        )}
                    </Button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-gray-300">
                        {t("auth.dontHaveAccount")}{" "}
                        <Link
                            href="/auth/sign-up"
                            className="text-morpheus-gold-light hover:text-[#d4c066] font-semibold underline underline-offset-4 transition-colors"
                        >
                            {t("auth.signUp")}
                        </Link>
                    </p>
                </div>
            </div>

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
