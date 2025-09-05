"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/hooks/useLanguage";
import { useVisitorData } from "@/hooks/useVisitorData";
import { useWebsiteUrl } from "@/hooks/use-website-url";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

type PasswordRequirement = {
    label: string;
    met: boolean;
};

export function SignUpForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { t } = useLanguage();
    const { visitorData, isLoading: isLoadingVisitor } = useVisitorData();
    const { data: websiteUrl, isLoading: isLoadingWebsiteUrl } = useWebsiteUrl();

    // Prefill form with visitor data when available
    useEffect(() => {
        if (visitorData && !isLoadingVisitor) {
            if (visitorData.yvisiteurnom && !firstName && !lastName) {
                const nameParts = visitorData.yvisiteurnom.trim().split(' ');
                if (nameParts.length >= 2) {
                    setFirstName(nameParts[0]);
                    setLastName(nameParts.slice(1).join(' '));
                } else {
                    setFirstName(visitorData.yvisiteurnom);
                }
            }
            if (visitorData.yvisiteuremail && !email) {
                setEmail(visitorData.yvisiteuremail);
            }
        }
    }, [visitorData, isLoadingVisitor, firstName, lastName, email]);

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
    const isFormValid = firstName.trim() && lastName.trim() && email.trim() && isPasswordValid && passwordsMatch && acceptedTerms;

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        const supabase = createClient();
        setIsLoading(true);
        setError(null);

        if (!firstName.trim()) {
            setError(t("auth.firstNameRequired"));
            setIsLoading(false);
            return;
        }

        if (!lastName.trim()) {
            setError(t("auth.lastNameRequired"));
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
            const redirectUrl = websiteUrl && !isLoadingWebsiteUrl
                ? `${websiteUrl}/main`
                : `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/main`;

            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: redirectUrl,
                    data: {
                        full_name: `${firstName.trim()} ${lastName.trim()}`,
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
                            yvisiteurnom: `${firstName.trim()} ${lastName.trim()}`,
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
        <div className={cn("flex flex-col gap-8 max-w-lg mx-auto", className)} {...props}>
            {/* Welcome header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#05141D] to-[#063846] rounded-full mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                </div>
                <h1 className="font-recia text-4xl md:text-5xl font-extrabold text-[#05141D] mb-4 leading-tight">
                    {t("auth.joinTheFuture")}
                </h1>
                <p className="font-supreme text-lg text-[#063846] max-w-md mx-auto">
                    {t("auth.signUpSubtitle")}
                </p>
            </div>

            {/* Form Card */}
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg p-8 shadow-xl">
                <form onSubmit={handleSignUp} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-[#05141D] text-sm font-medium">
                                {t("auth.firstName")}
                            </Label>
                            <Input
                                id="firstName"
                                type="text"
                                placeholder={t("auth.firstNamePlaceholder")}
                                required
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="bg-white border-slate-300 text-[#05141D] placeholder:text-slate-400 h-11 text-base focus:border-[#063846] focus:ring-[#063846] rounded-md"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-[#05141D] text-sm font-medium">
                                {t("auth.lastName")}
                            </Label>
                            <Input
                                id="lastName"
                                type="text"
                                placeholder={t("auth.lastNamePlaceholder")}
                                required
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="bg-white border-slate-300 text-[#05141D] placeholder:text-slate-400 h-11 text-base focus:border-[#063846] focus:ring-[#063846] rounded-md"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-[#05141D] text-sm font-medium">
                            {t("auth.email")}
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder={t("auth.emailPlaceholder")}
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-white border-slate-300 text-[#05141D] placeholder:text-slate-400 h-11 text-base focus:border-[#063846] focus:ring-[#063846] rounded-md"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-[#05141D] text-sm font-medium">
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
                                className="bg-white border-slate-300 text-[#05141D] placeholder:text-slate-400 h-11 text-base focus:border-[#063846] focus:ring-[#063846] rounded-md pr-12"
                            />

                            {/* Password validation icon */}
                            {password.length > 0 && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    {isPasswordValid ? (
                                        <div className="group relative">
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-slate-900 text-white text-sm rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                                {t("auth.passwordRequirementsMet")}
                                                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="group relative">
                                            <AlertCircle className="h-5 w-5 text-amber-500" />
                                            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-slate-900 text-white text-sm rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 max-w-xs">
                                                <div className="text-xs mb-1 font-medium">
                                                    {t("auth.passwordRequirements")}:
                                                </div>
                                                <ul className="space-y-1">
                                                    {passwordRequirements.map((requirement, index) => (
                                                        <li key={index} className="flex items-center gap-2 text-xs">
                                                            <span
                                                                className={`w-3 h-3 rounded-full flex items-center justify-center flex-shrink-0 ${requirement.met
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
                                                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="repeat-password" className="text-[#05141D] text-sm font-medium">
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
                                className="bg-white border-slate-300 text-[#05141D] placeholder:text-slate-400 h-11 text-base focus:border-[#063846] focus:ring-[#063846] rounded-md pr-12"
                            />

                            {/* Password confirmation icon */}
                            {repeatPassword.length > 0 && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    {passwordsMatch ? (
                                        <div className="group relative">
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-slate-900 text-white text-sm rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                                {t("auth.passwordsMatch")}
                                                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="group relative">
                                            <XCircle className="h-5 w-5 text-red-500" />
                                            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-slate-900 text-white text-sm rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                                {t("auth.passwordsDoNotMatchTooltip")}
                                                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
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
                                className="mt-1 border-slate-300 data-[state=checked]:bg-[#063846] data-[state=checked]:border-[#063846] focus-visible:ring-[#063846]/50"
                            />
                            <Label htmlFor="terms" className="text-sm text-slate-600 leading-relaxed cursor-pointer">
                                {t("auth.agreeToTerms")}{" "}
                            </Label>
                        </div>
                        <Link
                            href="/terms-and-conditions"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#063846] hover:text-[#05141D] font-semibold underline underline-offset-2 transition-colors text-sm"
                        >
                            {t("auth.termsAndConditions")}
                        </Link>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mt-6">{error}</div>
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
                        className="w-full bg-gradient-to-r from-[#05141D] to-[#063846] hover:from-[#04111a] hover:to-[#052d37] text-white h-11 text-base font-semibold shadow-lg transition-all duration-300 hover:shadow-xl rounded-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg mt-6"
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
    )
}

