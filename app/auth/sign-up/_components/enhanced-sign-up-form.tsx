"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/hooks/useLanguage";
import { useVisitorData } from "@/hooks/useVisitorData";
import { VisitorFormData } from "./visitor-form-side-panel";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { CheckCircle, XCircle, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

type PasswordRequirement = {
    label: string;
    met: boolean;
};

interface EnhancedSignUpFormProps extends React.ComponentPropsWithoutRef<"div"> {
    visitorFormData?: VisitorFormData;
}

export function EnhancedSignUpForm({ 
    className, 
    visitorFormData, 
    ...props 
}: EnhancedSignUpFormProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);
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

            // Handle visitor data creation or update
            if (signUpData.user) {
                if (visitorData && currentUser) {
                    // Update existing visitor record
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
                    }
                } else if (visitorFormData) {
                    // Create new visitor record with form data
                    try {
                        const visitorCode = `V${Date.now().toString().slice(-8)}`;
                        
                        // Get the next available ID
                        const { data: existingVisitors } = await supabase
                            .schema("morpheus")
                            .from("yvisiteur")
                            .select("yvisiteurid")
                            .order("yvisiteurid", { ascending: false })
                            .limit(1);

                        const nextId = existingVisitors && existingVisitors.length > 0 ? existingVisitors[0].yvisiteurid + 1 : 1;

                        await supabase
                            .schema("morpheus")
                            .from("yvisiteur")
                            .insert({
                                yvisiteurid: nextId,
                                yuseridfk: signUpData.user.id,
                                yvisiteurcode: visitorCode,
                                yvisiteurnom: name.trim(),
                                yvisiteuremail: email,
                                yvisiteurtelephone: visitorFormData.phone.trim() || null,
                                yvisiteuradresse: visitorFormData.address.trim() || null,
                                yvisiteurboolacheteurluxe: visitorFormData.visitorTypes.acheteurluxe ? "1" : "0",
                                yvisiteurboolacheteurpro: visitorFormData.visitorTypes.acheteurpro ? "1" : "0",
                                yvisiteurboolartisan: visitorFormData.visitorTypes.artisan ? "1" : "0",
                                yvisiteurboolclientprive: visitorFormData.visitorTypes.clientprive ? "1" : "0",
                                yvisiteurboolcollectionneur: visitorFormData.visitorTypes.collectionneur ? "1" : "0",
                                yvisiteurboolcreateur: visitorFormData.visitorTypes.createur ? "1" : "0",
                                yvisiteurboolculturel: visitorFormData.visitorTypes.culturel ? "1" : "0",
                                yvisiteurboolgrandpublic: visitorFormData.visitorTypes.grandpublic ? "1" : "0",
                                yvisiteurboolinfluenceur: visitorFormData.visitorTypes.influenceur ? "1" : "0",
                                yvisiteurboolinvestisseur: visitorFormData.visitorTypes.investisseur ? "1" : "0",
                                yvisiteurbooljournaliste: visitorFormData.visitorTypes.journaliste ? "1" : "0",
                                yvisiteurboolpressespecialisee: visitorFormData.visitorTypes.pressespecialisee ? "1" : "0",
                                yvisiteurboolvip: visitorFormData.visitorTypes.vip ? "1" : "0",
                            });
                    } catch (insertError) {
                        console.error("Error creating visitor record:", insertError);
                    }
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
        <div className={cn("flex flex-col gap-8 w-full max-w-5xl mx-auto", className)} {...props}>
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
                    Create your account and join our community
                </p>
            </div>

            {/* Form Card */}
            <div className="bg-white/90 backdrop-blur-sm border border-slate-200 shadow-xl overflow-hidden rounded-lg transform transition-all duration-300 hover:shadow-2xl">
                <form onSubmit={handleSignUp} className="p-8 space-y-6">
                    {isLoadingVisitor ? (
                        // Skeleton loading state
                        <div className="space-y-6 animate-pulse">
                            <div className="space-y-2">
                                <div className="h-4 w-16 bg-slate-300 rounded"></div>
                                <div className="h-11 w-full bg-slate-300 rounded-md"></div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 w-12 bg-slate-300 rounded"></div>
                                <div className="h-11 w-full bg-slate-300 rounded-md"></div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 w-20 bg-slate-300 rounded"></div>
                                <div className="h-11 w-full bg-slate-300 rounded-md"></div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 w-24 bg-slate-300 rounded"></div>
                                <div className="h-11 w-full bg-slate-300 rounded-md"></div>
                            </div>
                            <div className="h-11 w-full bg-slate-300 rounded-md"></div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="space-y-2">
                        <Label htmlFor="name" className="text-[#05141D] text-sm font-medium">
                            {t("auth.name")}
                            {name.trim() && <span className="text-green-500 ml-1">✓</span>}
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder={t("auth.namePlaceholder")}
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={`bg-white border-slate-300 text-[#05141D] placeholder:text-slate-400 h-11 text-base focus:border-[#063846] focus:ring-[#063846] rounded-md transition-colors ${name.trim() ? 'border-green-300 focus:border-green-500' : ''
                                }`}
                        />
                    </div>

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
                        <Label htmlFor="password" className="text-[#05141D] text-sm font-medium">
                            {t("auth.password")}
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder={t("auth.createPasswordPlaceholder")}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-white border-slate-300 text-[#05141D] placeholder:text-slate-400 h-11 text-base focus:border-[#063846] focus:ring-[#063846] rounded-md pr-20"
                            />

                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>

                                {/* Password validation icon */}
                                {password.length > 0 && (
                                    <div className="group relative">
                                        {isPasswordValid ? (
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        ) : (
                                            <AlertCircle className="h-5 w-5 text-amber-500" />
                                        )}

                                        {/* Enhanced tooltip */}
                                        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-slate-900 text-white text-sm rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 max-w-xs">
                                            <div className="text-xs mb-2 font-medium">
                                                {t("auth.passwordRequirements")}:
                                            </div>
                                            <div className="space-y-1">
                                                {passwordRequirements.map((requirement, index) => (
                                                    <div key={index} className="flex items-center gap-2 text-xs">
                                                        <span className={`w-2 h-2 rounded-full ${requirement.met ? "bg-green-500" : "bg-slate-500"}`}></span>
                                                        <span className={requirement.met ? "text-green-300" : "text-slate-300"}>
                                                            {requirement.label}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Progress bars for password strength */}
                        {password.length > 0 && (
                            <div className="space-y-1">
                                <div className="flex gap-1">
                                    {passwordRequirements.map((req, index) => (
                                        <div
                                            key={index}
                                            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${req.met ? "bg-green-500" : "bg-slate-200"
                                                }`}
                                        />
                                    ))}
                                </div>
                                <p className="text-xs text-slate-500">
                                    Sécurité: {passwordRequirements.filter(r => r.met).length}/{passwordRequirements.length}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="repeat-password" className="text-[#05141D] text-sm font-medium">
                            {t("auth.confirmPassword")}
                        </Label>
                        <div className="relative">
                            <Input
                                id="repeat-password"
                                type={showRepeatPassword ? "text" : "password"}
                                placeholder={t("auth.repeatPasswordPlaceholder")}
                                required
                                value={repeatPassword}
                                onChange={(e) => setRepeatPassword(e.target.value)}
                                className="bg-white border-slate-300 text-[#05141D] placeholder:text-slate-400 h-11 text-base focus:border-[#063846] focus:ring-[#063846] rounded-md pr-20"
                            />

                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showRepeatPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>

                                {/* Password confirmation icon */}
                                {repeatPassword.length > 0 && (
                                    <div className="group relative">
                                        {passwordsMatch ? (
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-red-500" />
                                        )}
                                        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-slate-900 text-white text-sm rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                            {passwordsMatch ? t("auth.passwordsMatch") : t("auth.passwordsDoNotMatchTooltip")}
                                            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Terms and Conditions Checkbox */}
                    <div className="space-y-2">
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-row gap-3 items-center">
                                <Checkbox
                                    id="terms"
                                    checked={acceptedTerms}
                                    onCheckedChange={(checked) => setAcceptedTerms(!!checked)}
                                    className="mt-1 border-slate-300 data-[state=checked]:bg-[#063846] data-[state=checked]:border-[#063846] focus-visible:ring-[#063846]/50"
                                />
                                <Label htmlFor="terms" className="text-sm text-slate-600 leading-relaxed cursor-pointer flex">
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
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>
                    )}

                    <Button
                        type="submit"
                        disabled={isLoading || !isFormValid}
                        className="w-full bg-gradient-to-r from-[#05141D] to-[#063846] hover:from-[#04111a] hover:to-[#052d37] text-white h-11 text-base font-semibold shadow-lg transition-all duration-300 hover:shadow-xl rounded-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>{t("auth.creatingAccount")}</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <span>{t("auth.createAccount")}</span>
                                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
                    )}
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
    )
}