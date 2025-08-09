"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/hooks/useLanguage";
import { useVisitorData } from "@/hooks/useVisitorData";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

type PasswordRequirement = {
    label: string;
    met: boolean;
};

export function SignUpForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { t } = useLanguage();
    const { visitorData, isLoading: isLoadingVisitor } = useVisitorData();

    // Prefill form with visitor data when available
    useEffect(() => {
        if (visitorData && !isLoadingVisitor) {
            if (visitorData.yvisiteurnom && !name) {
                setName(visitorData.yvisiteurnom);
            }
            if (visitorData.yvisiteuremail && !email) {
                setEmail(visitorData.yvisiteuremail);
            }
        }
    }, [visitorData, isLoadingVisitor, name, email]);

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
    const passwordsMatch = password === repeatPassword && repeatPassword.length > 0;
    const isFormValid = name.trim() && email.trim() && isPasswordValid && passwordsMatch && acceptedTerms;

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        const supabase = createClient();
        setIsLoading(true);
        setError(null);

        if (!name.trim()) {
            setError(t("auth.nameRequired"));
            setIsLoading(false);
            return;
        }

        if (!email.trim()) {
            setError(t("auth.emailIsRequired"));
            setIsLoading(false);
            return;
        }

        if (!isPasswordValid) {
            setError(t("auth.passwordRequirementsNotMet"));
            setIsLoading(false);
            return;
        }

        if (password !== repeatPassword) {
            setError(t("auth.passwordsDoNotMatch"));
            setIsLoading(false);
            return;
        }

        if (!acceptedTerms) {
            setError(t("auth.termsAndConditionsRequired"));
            setIsLoading(false);
            return;
        }

        try {
            // Get current user (should be anonymous)
            const { data: currentUserData } = await supabase.auth.getUser();
            const currentUser = currentUserData?.user;

            // Sign up with email and password
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/main`,
                    data: {
                        full_name: name.trim(),
                    },
                },
            });

            if (signUpError) throw signUpError;

            // If we had visitor data and a current anonymous user, update the visitor record
            if (visitorData && currentUser && signUpData.user) {
                try {
                    await supabase
                        .schema("morpheus")
                        .from("yvisiteur")
                        .update({
                            yuseridfk: signUpData.user.id,
                            yvisiteurnom: name.trim(),
                            yvisiteuremail: email,
                        })
                        .eq("yvisiteurid", visitorData.yvisiteurid);
                } catch (updateError) {
                    console.error("Error updating visitor record:", updateError);
                    // Don't fail the signup if visitor update fails
                }
            }

            router.push("/auth/sign-up-success");
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : t("auth.errorOccurred"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={cn("flex flex-col gap-8 max-w-6xl mx-auto", className)} {...props}>
            {/* Header */}
            <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-2">{t("auth.joinTheFuture")}</h2>
            </div>

            {/* Form Card */}
            <div className="bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light border border-slate-700 p-8 shadow-2xl">
                <form onSubmit={handleSignUp} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-white text-lg font-medium">
                            {t("auth.name")}
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder={t("auth.namePlaceholder")}
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 h-12 text-lg focus:border-morpheus-gold-light focus:ring-morpheus-gold-light rounded-none"
                        />
                    </div>

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
                        <Label htmlFor="password" className="text-white text-lg font-medium">
                            {t("auth.password")}
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type="password"
                                placeholder={t("auth.createPasswordPlaceholder")}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 h-12 text-lg focus:border-morpheus-gold-light focus:ring-morpheus-gold-light rounded-none pr-12"
                            />

                            {/* Password validation icon */}
                            {password.length > 0 && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    {isPasswordValid ? (
                                        <div className="group relative">
                                            <CheckCircle className="h-5 w-5 text-green-400" />
                                            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-slate-800 text-white text-sm rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                                {t("auth.passwordRequirementsMet")}
                                                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="group relative">
                                            <AlertCircle className="h-5 w-5 text-amber-400" />
                                            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-slate-800 text-white text-sm rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 max-w-xs">
                                                <div className="text-xs mb-1 font-medium">
                                                    {t("auth.passwordRequirements")}:
                                                </div>
                                                <ul className="space-y-1">
                                                    {passwordRequirements.map((requirement, index) => (
                                                        <li key={index} className="flex items-center gap-2 text-xs">
                                                            <span
                                                                className={`w-3 h-3 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                                    requirement.met
                                                                        ? "bg-green-500 text-white"
                                                                        : "bg-slate-600 text-gray-400"
                                                                }`}
                                                            >
                                                                {requirement.met ? "✓" : "○"}
                                                            </span>
                                                            <span
                                                                className={
                                                                    requirement.met
                                                                        ? "text-green-400"
                                                                        : "text-gray-400"
                                                                }
                                                            >
                                                                {requirement.label}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="repeat-password" className="text-white text-lg font-medium">
                            {t("auth.confirmPassword")}
                        </Label>
                        <div className="relative">
                            <Input
                                id="repeat-password"
                                type="password"
                                placeholder={t("auth.repeatPasswordPlaceholder")}
                                required
                                value={repeatPassword}
                                onChange={(e) => setRepeatPassword(e.target.value)}
                                className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 h-12 text-lg focus:border-morpheus-gold-light focus:ring-morpheus-gold-light rounded-none pr-12"
                            />

                            {/* Password confirmation icon */}
                            {repeatPassword.length > 0 && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    {passwordsMatch ? (
                                        <div className="group relative">
                                            <CheckCircle className="h-5 w-5 text-green-400" />
                                            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-slate-800 text-white text-sm rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                                {t("auth.passwordsMatch")}
                                                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="group relative">
                                            <XCircle className="h-5 w-5 text-red-400" />
                                            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-slate-800 text-white text-sm rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                                {t("auth.passwordsDoNotMatchTooltip")}
                                                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Terms and Conditions Checkbox */}
                    <div className="space-y-2">
                        <div className="flex items-start gap-3">
                            <Checkbox
                                id="terms"
                                checked={acceptedTerms}
                                onCheckedChange={(checked) => setAcceptedTerms(!!checked)}
                                className="mt-1 border-slate-600 data-[state=checked]:bg-morpheus-gold-light data-[state=checked]:border-morpheus-gold-light focus-visible:ring-morpheus-gold-light/50"
                            />
                            <Label htmlFor="terms" className="text-sm text-gray-300 leading-relaxed cursor-pointer">
                                {t("auth.agreeToTerms")}{" "}
                                <Link
                                    href="/terms-and-conditions"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-morpheus-gold-light hover:text-[#d4c066] font-semibold underline underline-offset-2 transition-colors"
                                >
                                    {t("auth.termsAndConditions")}
                                </Link>
                            </Label>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-400 text-red-200 px-4 py-3 mt-6">{error}</div>
                    )}

                    <Button
                        type="submit"
                        disabled={isLoading || !isFormValid}
                        onClick={(e) => {
                            if (!isFormValid && !isLoading) {
                                e.preventDefault();
                                setError(t("auth.pleaseCompleteAllFields"));
                            }
                        }}
                        className="w-full bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-[#695029] hover:to-[#d4c066] text-white h-12 text-lg font-semibold shadow-2xl transition-all duration-300 hover:scale-105 rounded-none disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 mt-6"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <img src="/loading.gif" alt="Loading" className="h-5 w-5" />
                                {t("auth.creatingAccount")}
                            </div>
                        ) : (
                            t("auth.createAccount")
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
    )
}

