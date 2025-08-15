"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/hooks/useLanguage";
import { useWebsiteUrl } from "@/hooks/use-website-url";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { CheckCircle, XCircle, AlertCircle, Users } from "lucide-react";

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
            {/* Header */}
            <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-2">{t("auth.joinTheFuture")}</h2>
            </div>

            {/* Form Card */}
            <div className="bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light border border-slate-700 shadow-2xl overflow-hidden rounded-lg">
                <form onSubmit={handleSignUp} className="h-full">
                    <div className="flex flex-col lg:flex-row h-full max-h-[80vh]">
                        {/* Left Side - Registration Form */}
                        <div className="flex-1 p-8 overflow-y-auto">
                            <div className="space-y-6">
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
                                                    <CheckCircle className="h-5 w-5 text-green-400" />
                                                ) : (
                                                    <AlertCircle className="h-5 w-5 text-amber-400" />
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
                                                    <CheckCircle className="h-5 w-5 text-green-400" />
                                                ) : (
                                                    <XCircle className="h-5 w-5 text-red-400" />
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
                                    <div className="bg-red-500/20 border border-red-400 text-red-200 px-4 py-3 rounded">{error}</div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={isLoading || !isFormValid}
                                    className="w-full bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-[#695029] hover:to-[#d4c066] text-white h-12 text-lg font-semibold shadow-2xl transition-all duration-300 hover:scale-105 rounded-none disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
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

                                <div className="text-center">
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
                        </div>

                        {/* Separator - Only visible on desktop */}
                        {showVisitorForm && (
                            <div className="hidden lg:block">
                                <Separator orientation="vertical" className="h-full bg-morpheus-gold-dark/30" />
                            </div>
                        )}

                        {/* Mobile Separator */}
                        {showVisitorForm && (
                            <div className="lg:hidden px-8">
                                <div className="flex items-center gap-4 my-6">
                                    <Separator className="flex-1 bg-morpheus-gold-dark/30" />
                                    <div className="flex items-center gap-2 text-morpheus-gold-light font-medium">
                                        <Users className="w-4 h-4" />
                                        <span className="text-sm">Informations supplémentaires</span>
                                    </div>
                                    <Separator className="flex-1 bg-morpheus-gold-dark/30" />
                                </div>
                            </div>
                        )}

                        {/* Right Side - Visitor Form */}
                        {showVisitorForm && (
                            <div className="flex-1 p-8 overflow-y-auto">
                                <div className="space-y-6">
                                    {/* Desktop Header */}
                                    <div className="hidden lg:block">
                                        <div className="flex items-center gap-2 text-morpheus-gold-light font-medium mb-4">
                                            <Users className="w-5 h-5" />
                                            <span className="text-lg">Informations supplémentaires</span>
                                        </div>
                                        <p className="text-gray-300 text-sm mb-6">
                                            Aidez-nous à mieux vous connaître
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="text-white text-sm font-medium">
                                                Téléphone
                                            </Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={visitorData.phone}
                                                onChange={(e) => setVisitorData(prev => ({ ...prev, phone: e.target.value }))}
                                                className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 h-10 text-sm focus:border-morpheus-gold-light focus:ring-morpheus-gold-light rounded-none"
                                                placeholder="Entrez votre numéro de téléphone"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="address" className="text-white text-sm font-medium">
                                                Adresse
                                            </Label>
                                            <Input
                                                id="address"
                                                type="text"
                                                value={visitorData.address}
                                                onChange={(e) => setVisitorData(prev => ({ ...prev, address: e.target.value }))}
                                                className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 h-10 text-sm focus:border-morpheus-gold-light focus:ring-morpheus-gold-light rounded-none"
                                                placeholder="Entrez votre adresse"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <Label className="text-white text-sm font-medium">
                                                    Vos intérêts
                                                </Label>
                                                <p className="text-gray-400 text-xs mt-1">
                                                    {"Sélectionnez tout ce qui s'applique"}
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                                                {[
                                                    { key: "grandpublic", label: "Grand Public" },
                                                    { key: "clientprive", label: "Client Privé" },
                                                    { key: "acheteurluxe", label: "Acheteur de Luxe" },
                                                    { key: "acheteurpro", label: "Acheteur Professionnel" },
                                                    { key: "artisan", label: "Artisan" },
                                                    { key: "createur", label: "Créateur/Designer" },
                                                    { key: "collectionneur", label: "Collectionneur" },
                                                    { key: "investisseur", label: "Investisseur" },
                                                    { key: "influenceur", label: "Influenceur" },
                                                    { key: "journaliste", label: "Journaliste" },
                                                    { key: "pressespecialisee", label: "Presse Spécialisée" },
                                                    { key: "culturel", label: "Professionnel Culturel" },
                                                    { key: "vip", label: "VIP" },
                                                ].map(({ key, label }) => (
                                                    <label
                                                        key={key}
                                                        className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-morpheus-blue-dark/30 transition-colors"
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
                                                            className="w-3 h-3 text-morpheus-gold-light bg-morpheus-blue-dark border-morpheus-gold-dark/30 rounded focus:ring-morpheus-gold-light focus:ring-1"
                                                        />
                                                        <span className="text-gray-300 text-xs">
                                                            {label}
                                                        </span>
                                                    </label>
                                                ))}
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
                    className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2"
                >
                    {t("auth.backToMorpheusMall")}
                </Link>
            </div>
        </div>
    );
}