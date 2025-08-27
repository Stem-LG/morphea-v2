"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/hooks/useLanguage";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useMemo } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";

type PasswordRequirement = {
    label: string;
    met: boolean;
};

export function UpdatePasswordForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const { t } = useLanguage();

    // Password validation
    const passwordRequirements = useMemo((): PasswordRequirement[] => {
        return [
            {
                label: t("auth.passwordMinLength"),
                met: password.length >= 8,
            },
            {
                label: t("auth.passwordUppercase"),
                met: /[A-Z]/.test(password),
            },
            {
                label: t("auth.passwordNumber"),
                met: /\d/.test(password),
            },
            {
                label: t("auth.passwordSpecialChar"),
                met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
            },
        ];
    }, [password, t]);

    const isPasswordValid = passwordRequirements.every((req) => req.met);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        const supabase = createClient();
        setIsLoading(true);
        setError(null);

        if (!isPasswordValid) {
            setError(t("auth.passwordRequirementsNotMet"));
            setIsLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            // Update this route to redirect to an authenticated route. The user already has an active session.
            router.push("/main");
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : t("auth.errorOccurred"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={cn("flex flex-col gap-8 w-full max-w-5xl mx-auto", className)} {...props}>
            {/* Welcome header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#05141D] to-[#063846] rounded-full mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <h1 className="font-recia text-4xl md:text-5xl font-extrabold text-[#05141D] mb-4 leading-tight">
                    {t("auth.resetYourPassword")}
                </h1>
                <p className="font-supreme text-lg text-[#063846] max-w-md mx-auto">
                    {t("auth.pleaseEnterNewPassword")}
                </p>
            </div>

            {/* Form Card */}
            <div className="bg-white/90 backdrop-blur-sm border border-slate-200 shadow-xl overflow-hidden rounded-lg transform transition-all duration-300 hover:shadow-2xl">
                <form onSubmit={handleUpdatePassword} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-[#05141D] text-sm font-medium">
                            {t("auth.newPassword")}
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder={t("auth.newPasswordPlaceholder")}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-white border-slate-300 text-[#05141D] placeholder:text-slate-400 h-11 text-base focus:border-[#063846] focus:ring-[#063846] rounded-md transition-colors pr-20"
                            />

                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                                {password.length > 0 && (
                                    <div className="text-sm">
                                        {isPasswordValid ? (
                                            <Check className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <X className="h-4 w-4 text-red-500" />
                                        )}
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-slate-400 hover:text-[#063846] transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Progress bars for password strength */}
                        {password.length > 0 && (
                            <div className="space-y-1">
                                {passwordRequirements.map((requirement, index) => (
                                    <div key={index} className="flex items-center gap-2 text-xs">
                                        {requirement.met ? (
                                            <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                                        ) : (
                                            <X className="h-3 w-3 text-red-500 flex-shrink-0" />
                                        )}
                                        <span className={requirement.met ? "text-green-600" : "text-red-600"}>
                                            {requirement.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>
                    )}

                    <Button
                        type="submit"
                        disabled={isLoading || !isPasswordValid}
                        className="w-full bg-gradient-to-r from-[#05141D] to-[#063846] hover:from-[#04111a] hover:to-[#052d37] text-white h-11 text-base font-semibold shadow-lg transition-all duration-300 hover:shadow-xl rounded-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                {t("auth.saving")}
                            </div>
                        ) : (
                            t("auth.saveNewPassword")
                        )}
                    </Button>

                    <div className="text-center">
                        <p className="text-slate-600">
                            {t("auth.alreadyHaveAccount")}{" "}
                            <Link
                                href="/auth/login"
                                className="text-[#05141D] hover:text-[#063846] font-semibold underline underline-offset-4 transition-colors"
                            >
                                {t("auth.signIn")}
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
                    {t("auth.backToMorpheusMall")}
                </Link>
            </div>
        </div>
    );
}
