"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/useLanguage";
import { useWebsiteUrl } from "@/hooks/use-website-url";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { CheckCircle, XCircle, AlertCircle, Users, Search, Eye, EyeOff, Loader2 } from "lucide-react";

type PasswordRequirement = {
    label: string;
    met: boolean;
};

type VisitorFormData = {
    phone: string;
    address: string;
    visitorTypes: {
        acheteurluxe: boolean;
        acheteurpro: boolean;
        artisan: boolean;
        clientprive: boolean;
        collectionneur: boolean;
        createur: boolean;
        culturel: boolean;
        grandpublic: boolean;
        influenceur: boolean;
        investisseur: boolean;
        journaliste: boolean;
        pressespecialisee: boolean;
        vip: boolean;
    };
};

interface EnhancedSignupWithVisitorProps extends React.ComponentPropsWithoutRef<"div"> {
    showVisitorForm?: boolean;
}

export function EnhancedSignupWithVisitor({
    className,
    showVisitorForm = false,
    ...props
}: EnhancedSignupWithVisitorProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);
    const [visitorTypeSearch, setVisitorTypeSearch] = useState("");

    // Visitor form data
    const [visitorData, setVisitorData] = useState<VisitorFormData>({
        phone: "",
        address: "",
        visitorTypes: {
            acheteurluxe: false,
            acheteurpro: false,
            artisan: false,
            clientprive: false,
            collectionneur: false,
            createur: false,
            culturel: false,
            grandpublic: false,
            influenceur: false,
            investisseur: false,
            journaliste: false,
            pressespecialisee: false,
            vip: false,
        },
    });

    const router = useRouter();
    const { t } = useLanguage();
    const { data: websiteUrl, isLoading: isLoadingWebsiteUrl } = useWebsiteUrl();

    // Local visitor data state
    const [existingVisitorData, setExistingVisitorData] = useState<any>(null);
    const [isLoadingVisitor, setIsLoadingVisitor] = useState(false);

    // Fetch existing visitor data safely
    useEffect(() => {
        const fetchVisitorData = async () => {
            try {
                setIsLoadingVisitor(true);
                const supabase = createClient();

                // Get current user safely
                const { data: currentUserData, error: userError } = await supabase.auth.getUser();

                // If there's an auth error, just continue without prefilling
                if (userError || !currentUserData?.user) {
                    setIsLoadingVisitor(false);
                    return;
                }

                // Try to fetch visitor data
                const { data, error } = await supabase
                    .schema('morpheus')
                    .from('yvisiteur')
                    .select('yvisiteurid, yvisiteurnom, yvisiteuremail, yvisiteurtelephone, yvisiteuradresse')
                    .eq('yuseridfk', currentUserData.user.id)
                    .order('yvisiteurid', { ascending: false })
                    .limit(1);

                if (!error && data && data.length > 0) {
                    setExistingVisitorData(data[0]);
                }
            } catch (error) {
                // Silently handle errors - just don't prefill
                console.log('Could not fetch visitor data:', error);
            } finally {
                setIsLoadingVisitor(false);
            }
        };

        fetchVisitorData();
    }, []);

    // Prefill form with visitor data when available
    useEffect(() => {
        if (existingVisitorData && !isLoadingVisitor) {
            if (existingVisitorData.yvisiteurnom && !name) {
                setName(existingVisitorData.yvisiteurnom);
            }
            if (existingVisitorData.yvisiteuremail && !email) {
                setEmail(existingVisitorData.yvisiteuremail);
            }
        }
    }, [existingVisitorData, isLoadingVisitor, name, email]);

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

    // Check if visitor form is properly filled when displayed
    const isVisitorFormValid = !showVisitorForm || (
        visitorData.phone.trim() &&
        visitorData.address.trim() &&
        Object.values(visitorData.visitorTypes).some(type => type) // At least one visitor type selected
    );

    const isFormValid = name.trim() && email.trim() && isPasswordValid && passwordsMatch && acceptedTerms && isVisitorFormValid;

    // Filter visitor types based on search
    const filteredVisitorTypes = useMemo(() => {
        const visitorTypeOptions = [
            { key: "grandpublic", label: "Grand Public", category: "General" },
            { key: "clientprive", label: "Client Privé", category: "General" },
            { key: "acheteurluxe", label: "Acheteur de Luxe", category: "Acheteur" },
            { key: "acheteurpro", label: "Acheteur Professionnel", category: "Acheteur" },
            { key: "artisan", label: "Artisan", category: "Créatif" },
            { key: "createur", label: "Créateur/Designer", category: "Créatif" },
            { key: "collectionneur", label: "Collectionneur", category: "Spécialisé" },
            { key: "investisseur", label: "Investisseur", category: "Finance" },
            { key: "influenceur", label: "Influenceur", category: "Média" },
            { key: "journaliste", label: "Journaliste", category: "Média" },
            { key: "pressespecialisee", label: "Presse Spécialisée", category: "Média" },
            { key: "culturel", label: "Professionnel Culturel", category: "Culture" },
            { key: "vip", label: "VIP", category: "Spécialisé" },
        ];

        if (!visitorTypeSearch.trim()) return visitorTypeOptions;

        return visitorTypeOptions.filter(option =>
            option.label.toLowerCase().includes(visitorTypeSearch.toLowerCase()) ||
            option.category.toLowerCase().includes(visitorTypeSearch.toLowerCase())
        );
    }, [visitorTypeSearch]);

    const handleVisitorTypeChange = (type: keyof VisitorFormData["visitorTypes"], checked: boolean) => {
        setVisitorData(prev => ({
            ...prev,
            visitorTypes: {
                ...prev.visitorTypes,
                [type]: checked,
            },
        }));
    };

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
            const redirectUrl = websiteUrl && !isLoadingWebsiteUrl
                ? `${websiteUrl}/main`
                : `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/main`;

            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: redirectUrl,
                    data: {
                        full_name: name.trim(),
                    },
                },
            });

            if (signUpError) throw signUpError;

            // Handle visitor data creation or update
            if (signUpData.user) {
                if (existingVisitorData && currentUser) {
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
                            .eq("yvisiteurid", existingVisitorData.yvisiteurid);
                    } catch (updateError) {
                        console.error("Error updating visitor record:", updateError);
                    }
                } else if (showVisitorForm) {
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
                                yvisiteurtelephone: visitorData.phone.trim() || null,
                                yvisiteuradresse: visitorData.address.trim() || null,
                                yvisiteurboolacheteurluxe: visitorData.visitorTypes.acheteurluxe ? "1" : "0",
                                yvisiteurboolacheteurpro: visitorData.visitorTypes.acheteurpro ? "1" : "0",
                                yvisiteurboolartisan: visitorData.visitorTypes.artisan ? "1" : "0",
                                yvisiteurboolclientprive: visitorData.visitorTypes.clientprive ? "1" : "0",
                                yvisiteurboolcollectionneur: visitorData.visitorTypes.collectionneur ? "1" : "0",
                                yvisiteurboolcreateur: visitorData.visitorTypes.createur ? "1" : "0",
                                yvisiteurboolculturel: visitorData.visitorTypes.culturel ? "1" : "0",
                                yvisiteurboolgrandpublic: visitorData.visitorTypes.grandpublic ? "1" : "0",
                                yvisiteurboolinfluenceur: visitorData.visitorTypes.influenceur ? "1" : "0",
                                yvisiteurboolinvestisseur: visitorData.visitorTypes.investisseur ? "1" : "0",
                                yvisiteurbooljournaliste: visitorData.visitorTypes.journaliste ? "1" : "0",
                                yvisiteurboolpressespecialisee: visitorData.visitorTypes.pressespecialisee ? "1" : "0",
                                yvisiteurboolvip: visitorData.visitorTypes.vip ? "1" : "0",
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
                    Create your account and tell us more about yourself
                </p>
            </div>

            {/* Form Card */}
            <div className="bg-white/90 backdrop-blur-sm border border-slate-200 shadow-xl overflow-hidden rounded-lg transform transition-all duration-300 hover:shadow-2xl">
                <form onSubmit={handleSignUp} className="h-full">
                    <div className="flex flex-col lg:flex-row h-full max-h-[80vh]">
                        {/* Left Side - Registration Form */}
                        <div className="flex-1 p-8 overflow-y-auto">
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
                        </div>

                        {/* Separator - Only visible on desktop */}
                        {showVisitorForm && (
                            <div className="hidden lg:block">
                                <Separator orientation="vertical" className="h-full bg-slate-300" />
                            </div>
                        )}

                        {/* Mobile Separator */}
                        {showVisitorForm && (
                            <div className="lg:hidden px-8">
                                <div className="flex items-center gap-4 my-6">
                                    <Separator className="flex-1 bg-slate-300" />
                                    <div className="flex items-center gap-2 text-[#063846] font-medium">
                                        <Users className="w-4 h-4" />
                                        <span className="text-sm">Informations supplémentaires</span>
                                    </div>
                                    <Separator className="flex-1 bg-slate-300" />
                                </div>
                            </div>
                        )}

                        {/* Right Side - Visitor Form */}
                        {showVisitorForm && (
                            <div className="flex-1 p-8 overflow-y-auto">
                                <div className="space-y-6">
                                    {/* Desktop Header */}
                                    <div className="hidden lg:block">
                                        <div className="flex items-center gap-2 text-[#063846] font-medium mb-4">
                                            <Users className="w-5 h-5" />
                                            <span className="text-lg">Informations supplémentaires</span>
                                        </div>
                                        <p className="text-slate-600 text-sm mb-6">
                                            Aidez-nous à mieux vous connaître
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="text-[#05141D] text-sm font-medium">
                                                Téléphone
                                                {visitorData.phone.trim() && <span className="text-green-500 ml-1">✓</span>}
                                            </Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={visitorData.phone}
                                                onChange={(e) => setVisitorData(prev => ({ ...prev, phone: e.target.value }))}
                                                className={`bg-white border-slate-300 text-[#05141D] placeholder:text-slate-400 h-10 text-sm focus:border-[#063846] focus:ring-[#063846] rounded-md transition-colors ${visitorData.phone.trim() ? 'border-green-300 focus:border-green-500' : ''
                                                    }`}
                                                placeholder="Entrez votre numéro de téléphone"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="address" className="text-[#05141D] text-sm font-medium">
                                                Adresse
                                                {visitorData.address.trim() && <span className="text-green-500 ml-1">✓</span>}
                                            </Label>
                                            <Input
                                                id="address"
                                                type="text"
                                                value={visitorData.address}
                                                onChange={(e) => setVisitorData(prev => ({ ...prev, address: e.target.value }))}
                                                className={`bg-white border-slate-300 text-[#05141D] placeholder:text-slate-400 h-10 text-sm focus:border-[#063846] focus:ring-[#063846] rounded-md transition-colors ${visitorData.address.trim() ? 'border-green-300 focus:border-green-500' : ''
                                                    }`}
                                                placeholder="Entrez votre adresse"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <Label className="text-[#05141D] text-sm font-medium">
                                                    Vos intérêts
                                                </Label>
                                                <p className="text-slate-500 text-xs mt-1">
                                                    {"Sélectionnez tout ce qui s'applique"}
                                                </p>
                                            </div>

                                            {/* Search for visitor types */}
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                                                <Input
                                                    type="text"
                                                    placeholder="Rechercher un type de profil..."
                                                    value={visitorTypeSearch}
                                                    onChange={(e) => setVisitorTypeSearch(e.target.value)}
                                                    className="pl-10 bg-white border-slate-300 text-[#05141D] placeholder:text-slate-400 h-9 text-sm focus:border-[#063846] focus:ring-[#063846] rounded-md"
                                                />
                                            </div>

                                            {/* Selected types count */}
                                            {Object.values(visitorData.visitorTypes).some(type => type) && (
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-[#063846] border-[#063846]">
                                                        {Object.values(visitorData.visitorTypes).filter(Boolean).length} sélectionné(s)
                                                    </Badge>
                                                </div>
                                            )}

                                            <div className="border border-slate-200 rounded-md p-3 bg-slate-50 max-h-64 overflow-y-auto">
                                                {filteredVisitorTypes.length === 0 ? (
                                                    <p className="text-slate-500 text-sm text-center py-4">
                                                        Aucun profil trouvé pour "{visitorTypeSearch}"
                                                    </p>
                                                ) : (
                                                    <div className="space-y-1">
                                                        {filteredVisitorTypes.map(({ key, label, category }) => (
                                                            <label
                                                                key={key}
                                                                className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-slate-100 transition-colors group"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={
                                                                        visitorData.visitorTypes[
                                                                        key as keyof VisitorFormData["visitorTypes"]
                                                                        ]
                                                                    }
                                                                    onChange={(e) =>
                                                                        handleVisitorTypeChange(
                                                                            key as keyof VisitorFormData["visitorTypes"],
                                                                            e.target.checked
                                                                        )
                                                                    }
                                                                    className="w-4 h-4 text-[#063846] bg-white border-slate-300 rounded focus:ring-[#063846] focus:ring-1 transition-colors"
                                                                />
                                                                <div className="flex-1">
                                                                    <span className="text-slate-700 text-sm font-medium block">
                                                                        {label}
                                                                    </span>
                                                                    <span className="text-slate-500 text-xs">
                                                                        {category}
                                                                    </span>
                                                                </div>
                                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <div className="w-2 h-2 bg-[#063846] rounded-full"></div>
                                                                </div>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
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