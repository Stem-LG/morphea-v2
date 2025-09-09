"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { createClient } from "@/lib/client";
import { Database } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, User, Users, ArrowLeft, ArrowRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type VisitorFormData = {
    name: string;
    email: string;
    phone: string;
    address: string;
    selectedVisitorType: string; // Changed from visitorTypes object to single string
};

const VISITOR_FORM_STORAGE_KEY = "morpheus_visitor_form_skipped";

const STEPS = [
    {
        id: 1,
        title: "basicInformation",
        icon: User,
        description: "personalDetails",
    },
    {
        id: 2,
        title: "visitorTypes",
        icon: Users,
        description: "selectAllThatApply",
    },
];

export default function VisitorFormDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [visitorTypeSearch, setVisitorTypeSearch] = useState("");
    const [formData, setFormData] = useState<VisitorFormData>({
        name: "",
        email: "",
        phone: "",
        address: "",
        selectedVisitorType: "", // Default to empty string (no selection)
    });

    const { data: currentUser } = useAuth();
    const { t } = useLanguage();
    const supabase = createClient();

    useEffect(() => {
        const checkVisitorFormConditions = () => {
            // Check if user has already skipped the form
            const hasSkipped = localStorage.getItem(VISITOR_FORM_STORAGE_KEY);
            
            // Check if cookies have been accepted or rejected using the cookie consent system
            const cookiePreferences = localStorage.getItem('cookie-preferences');
            
            let cookiesDecisionMade = false;
            
            if (cookiePreferences) {
                try {
                    const preferences = JSON.parse(cookiePreferences);
                    // Check if user has made any decision (accepted all, rejected all, or customized preferences)
                    cookiesDecisionMade = preferences.analytics !== undefined || 
                                       preferences.marketing !== undefined || 
                                       preferences.functional !== undefined;
                } catch (error) {
                    console.error('Error parsing cookie preferences:', error);
                }
            }
            
            console.log('Visitor Form Debug:', {
                hasSkipped: !!hasSkipped,
                currentUser: !!currentUser,
                cookiesDecisionMade,
                cookiePreferences
            });
            
            // Only show the visitor form if:
            // 1. User hasn't skipped it before
            // 2. User is logged in
            // 3. Cookie decision has been made (accepted or rejected)
            // 4. Dialog is not already open
            if (!hasSkipped && currentUser && cookiesDecisionMade && !isOpen) {
                console.log('✅ Showing visitor form dialog - all conditions met');
                // Add a small delay to ensure the page has loaded
                const timer = setTimeout(() => {
                    setIsOpen(true);
                }, 500);

                return timer;
            } else {
                console.log('❌ Not showing visitor form dialog:', { 
                    hasSkipped: !!hasSkipped, 
                    currentUser: !!currentUser, 
                    cookiesDecisionMade,
                    isOpen 
                });
            }
            return null;
        };

        // Check conditions on mount and when currentUser changes
        const timer = checkVisitorFormConditions();

        // Poll for cookie preferences changes since storage event doesn't work in same tab
        const pollInterval = setInterval(() => {
            const currentPreferences = localStorage.getItem('cookie-preferences');
            if (currentPreferences) {
                try {
                    const preferences = JSON.parse(currentPreferences);
                    const cookiesDecisionMade = preferences.analytics !== undefined || 
                                              preferences.marketing !== undefined || 
                                              preferences.functional !== undefined;
                    
                    const hasSkipped = localStorage.getItem(VISITOR_FORM_STORAGE_KEY);
                    
                    if (!hasSkipped && currentUser && cookiesDecisionMade && !isOpen) {
                        console.log('✅ Cookie decision detected via polling, showing visitor form');
                        setTimeout(() => {
                            setIsOpen(true);
                        }, 500);
                        clearInterval(pollInterval); // Stop polling once we show the dialog
                    }
                } catch (error) {
                    console.error('Error parsing cookie preferences in poll:', error);
                }
            }
        }, 500); // Check every 500ms

        // Listen for custom events dispatched by the cookie consent system
        const handleCookieConsentChange = () => {
            console.log('Cookie consent event received, checking visitor form conditions');
            clearInterval(pollInterval); // Stop polling if we get an event
            setTimeout(() => {
                checkVisitorFormConditions();
            }, 300);
        };

        window.addEventListener('cookieConsentChanged', handleCookieConsentChange);

        return () => {
            if (timer) clearTimeout(timer);
            clearInterval(pollInterval);
            window.removeEventListener('cookieConsentChanged', handleCookieConsentChange);
        };
    }, [currentUser, isOpen]);

    const handleSkip = () => {
        localStorage.setItem(VISITOR_FORM_STORAGE_KEY, "true");
        setIsOpen(false);
    };

    const handleSubmit = async () => {
        if (!currentUser || !formData.name.trim()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Generate a unique visitor code (keep it short to avoid database constraints)
            const visitorCode = `V${Date.now().toString().slice(-8)}`;

            // Get the next available ID (simplified approach)
            const { data: existingVisitors } = await supabase
                .schema("morpheus")
                .from("yvisiteur")
                .select("yvisiteurid")
                .order("yvisiteurid", { ascending: false })
                .limit(1);

            const nextId = existingVisitors && existingVisitors.length > 0 ? existingVisitors[0].yvisiteurid + 1 : 1;

            const visitorData: Database["morpheus"]["Tables"]["yvisiteur"]["Insert"] = {
                yvisiteurid: nextId,
                yuseridfk: currentUser.id,
                yvisiteurcode: visitorCode,
                yvisiteurnom: formData.name.trim(),
                yvisiteuremail: formData.email.trim() || null,
                yvisiteurtelephone: formData.phone.trim() || null,
                yvisiteuradresse: formData.address.trim() || null,
                yvisiteurboolacheteurluxe: formData.selectedVisitorType === "acheteurluxe" ? "1" : "0",
                yvisiteurboolacheteurpro: formData.selectedVisitorType === "acheteurpro" ? "1" : "0",
                yvisiteurboolartisan: formData.selectedVisitorType === "artisan" ? "1" : "0",
                yvisiteurboolclientprive: formData.selectedVisitorType === "clientprive" ? "1" : "0",
                yvisiteurboolcollectionneur: formData.selectedVisitorType === "collectionneur" ? "1" : "0",
                yvisiteurboolcreateur: formData.selectedVisitorType === "createur" ? "1" : "0",
                yvisiteurboolculturel: formData.selectedVisitorType === "culturel" ? "1" : "0",
                yvisiteurboolgrandpublic: formData.selectedVisitorType === "grandpublic" ? "1" : "0",
                yvisiteurboolinfluenceur: formData.selectedVisitorType === "influenceur" ? "1" : "0",
                yvisiteurboolinvestisseur: formData.selectedVisitorType === "investisseur" ? "1" : "0",
                yvisiteurbooljournaliste: formData.selectedVisitorType === "journaliste" ? "1" : "0",
                yvisiteurboolpressespecialisee: formData.selectedVisitorType === "pressespecialisee" ? "1" : "0",
                yvisiteurboolvip: formData.selectedVisitorType === "vip" ? "1" : "0",
            };

            const { error } = await supabase.schema("morpheus").from("yvisiteur").insert(visitorData);

            if (error) {
                console.error("Error submitting visitor form:", error);
                alert(t("visitorForm.errorSubmitting"));
                return;
            }

            // Mark as completed so they don't see it again
            localStorage.setItem(VISITOR_FORM_STORAGE_KEY, "true");
            setIsOpen(false);

            // Show success message
            alert(t("visitorForm.thankYou"));
        } catch (error) {
            console.error("Error submitting visitor form:", error);
            alert(t("visitorForm.errorSubmitting"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: keyof Omit<VisitorFormData, "visitorTypes">, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleVisitorTypeChange = (type: string) => {
        setFormData((prev) => ({
            ...prev,
            selectedVisitorType: type,
        }));
    };

    const isStep1Valid = () => {
        return formData.name.trim().length > 0;
    };

    const canProceedToNextStep = () => {
        if (currentStep === 1) return isStep1Valid();
        return true;
    };

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

    const handleNext = () => {
        if (canProceedToNextStep() && currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const StepIndicator = ({
        step,
        isActive,
        isCompleted,
    }: {
        step: (typeof STEPS)[0];
        isActive: boolean;
        isCompleted: boolean;
    }) => {
        const Icon = step.icon;

        return (
            <div className="flex items-center space-x-3">
                <div
                    className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                        isCompleted
                            ? "bg-[#063846] border-[#063846] text-white"
                            : isActive
                            ? "border-[#063846] text-[#063846] bg-[#063846]/10"
                            : "border-slate-300 text-slate-400"
                    )}
                >
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                    <h3
                        className={cn(
                            "text-sm font-medium transition-colors duration-300",
                            isActive ? "text-[#063846]" : "text-slate-600"
                        )}
                    >
                        {t(`visitorForm.${step.title}`)}
                    </h3>
                    <p className="text-xs text-slate-500">{t(`visitorForm.${step.description}`)}</p>
                </div>
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="w-[95vw] h-[95vh] sm:w-full sm:h-auto sm:max-w-6xl bg-white border border-slate-200 shadow-xl p-0 overflow-hidden">
                <div className="flex flex-col h-full sm:h-auto overflow-hidden">
                    {/* Header */}
                    <DialogHeader className="border-b border-slate-200 pb-4 sm:pb-6 px-4 sm:px-6 pt-6 flex-shrink-0">
                        <div className="text-left">
                            <DialogTitle className="font-recia text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#05141D] mb-2 sm:mb-4 leading-tight">
                                {t("visitorForm.title")}
                            </DialogTitle>
                            <p className="font-supreme text-base sm:text-lg text-[#063846]">
                                {t("visitorForm.subtitle")}
                            </p>
                        </div>
                    </DialogHeader>

                    {/* Mobile Step Progress */}
                    <div className="lg:hidden px-4 sm:px-6 py-4 border-b border-slate-200 bg-slate-50 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="text-sm font-medium text-[#063846]">
                                    Étape {currentStep} sur {STEPS.length}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {STEPS.map((step) => (
                                    <div
                                        key={step.id}
                                        className={`w-2 h-2 rounded-full ${
                                            currentStep >= step.id ? 'bg-[#063846]' : 'bg-slate-300'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex lg:flex-row min-h-0">
                        {/* Left Side - Step Indicator - Desktop only */}
                        <div className="hidden lg:flex lg:w-80 p-8 border-r border-slate-200 overflow-y-auto flex-shrink-0">
                            <div className="space-y-6">
                                {STEPS.map((step) => (
                                    <StepIndicator
                                        key={step.id}
                                        step={step}
                                        isActive={currentStep === step.id}
                                        isCompleted={currentStep > step.id}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Form Content */}
                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 sm:pb-6">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <h2 className="text-xl sm:text-2xl font-bold text-[#05141D]">
                                            {currentStep === 1 && t("visitorForm.basicInformation")}
                                            {currentStep === 2 && t("visitorForm.visitorTypes")}
                                        </h2>
                                        <p className="text-slate-600 text-sm sm:text-base">
                                            {currentStep === 1 && t("visitorForm.personalDetails")}
                                            {currentStep === 2 && t("visitorForm.selectAllThatApply")}
                                        </p>
                                    </div>

                                    {/* Step 1: Basic Information */}
                                    {currentStep === 1 && (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name" className="text-[#05141D] text-sm font-medium">
                                                        {t("visitorForm.nameRequired")}
                                                        {formData.name.trim() && <span className="text-green-500 ml-1">✓</span>}
                                                    </Label>
                                                    <Input
                                                        id="name"
                                                        type="text"
                                                        required
                                                        value={formData.name}
                                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                                        className={`bg-white border-slate-300 text-[#05141D] placeholder:text-slate-400 h-11 text-base focus:border-[#063846] focus:ring-[#063846] rounded-md transition-colors ${formData.name.trim() ? 'border-green-300 focus:border-green-500' : ''
                                                            }`}
                                                        placeholder={t("visitorForm.namePlaceholder")}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="email" className="text-[#05141D] text-sm font-medium">
                                                        {t("visitorForm.email")}
                                                        {formData.email.trim() && formData.email.includes('@') && <span className="text-green-500 ml-1">✓</span>}
                                                    </Label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                                        className={`bg-white border-slate-300 text-[#05141D] placeholder:text-slate-400 h-11 text-base focus:border-[#063846] focus:ring-[#063846] rounded-md transition-colors ${formData.email.trim() && formData.email.includes('@') ? 'border-green-300 focus:border-green-500' : ''
                                                            }`}
                                                        placeholder={t("visitorForm.emailPlaceholder")}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="phone" className="text-[#05141D] text-sm font-medium">
                                                        {t("visitorForm.phone")}
                                                        {formData.phone.trim() && <span className="text-green-500 ml-1">✓</span>}
                                                    </Label>
                                                    <Input
                                                        id="phone"
                                                        type="tel"
                                                        value={formData.phone}
                                                        onChange={(e) => handleInputChange("phone", e.target.value)}
                                                        className={`bg-white border-slate-300 text-[#05141D] placeholder:text-slate-400 h-11 text-base focus:border-[#063846] focus:ring-[#063846] rounded-md transition-colors ${formData.phone.trim() ? 'border-green-300 focus:border-green-500' : ''
                                                            }`}
                                                        placeholder={t("visitorForm.phonePlaceholder")}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="address" className="text-[#05141D] text-sm font-medium">
                                                        {t("visitorForm.address")}
                                                        {formData.address.trim() && <span className="text-green-500 ml-1">✓</span>}
                                                    </Label>
                                                    <Input
                                                        id="address"
                                                        type="text"
                                                        value={formData.address}
                                                        onChange={(e) => handleInputChange("address", e.target.value)}
                                                        className={`bg-white border-slate-300 text-[#05141D] placeholder:text-slate-400 h-11 text-base focus:border-[#063846] focus:ring-[#063846] rounded-md transition-colors ${formData.address.trim() ? 'border-green-300 focus:border-green-500' : ''
                                                            }`}
                                                        placeholder={t("visitorForm.addressPlaceholder")}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 2: Visitor Types */}
                                    {currentStep === 2 && (
                                        <div className="space-y-4">
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

                                            {/* Selected type display */}
                                            {formData.selectedVisitorType && (
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-[#063846] border-[#063846]">
                                                        {filteredVisitorTypes.find(type => type.key === formData.selectedVisitorType)?.label || formData.selectedVisitorType} sélectionné
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
                                                                    type="radio"
                                                                    name="visitorType"
                                                                    value={key}
                                                                    checked={formData.selectedVisitorType === key}
                                                                    onChange={(e) => handleVisitorTypeChange(e.target.value)}
                                                                    className="w-4 h-4 text-[#063846] bg-white border-slate-300 focus:ring-[#063846] focus:ring-1 transition-colors"
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
                                    )}
                                </div>
                            </div>

                            {/* Navigation Buttons */}
                            <div className="border-t border-slate-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-white flex-shrink-0">
                                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                                    <div className="flex gap-2 sm:gap-3 order-2 sm:order-1">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleSkip}
                                            disabled={isSubmitting}
                                            className="flex-1 sm:flex-initial border-slate-300 text-slate-600 hover:text-slate-800 hover:border-slate-400 text-xs sm:text-sm px-3 sm:px-4 py-3 sm:py-2"
                                        >
                                            {t("visitorForm.skipForNow")}
                                        </Button>
                                    </div>

                                    <div className="flex gap-2 sm:gap-3 order-1 sm:order-2">
                                        {currentStep > 1 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handlePrevious}
                                                disabled={isSubmitting}
                                                className="flex-1 sm:flex-initial border-slate-300 text-slate-600 hover:text-slate-800 hover:border-slate-400 text-xs sm:text-sm px-3 sm:px-4 py-3 sm:py-2"
                                            >
                                                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                                {t("common.back")}
                                            </Button>
                                        )}

                                        {currentStep < STEPS.length ? (
                                            <Button
                                                type="button"
                                                onClick={handleNext}
                                                disabled={!canProceedToNextStep() || isSubmitting}
                                                className="flex-1 sm:flex-initial bg-gradient-to-r from-[#05141D] to-[#063846] hover:from-[#04111a] hover:to-[#052d37] text-white shadow-lg transition-all duration-300 hover:shadow-xl rounded-md text-xs sm:text-sm px-3 sm:px-4 py-3 sm:py-2"
                                            >
                                                {t("common.back") === "Back" ? "Next" : "Suivant"}
                                                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                                            </Button>
                                        ) : (
                                            <Button
                                                type="button"
                                                onClick={handleSubmit}
                                                disabled={isSubmitting || !formData.name.trim()}
                                                className="flex-1 sm:flex-initial bg-gradient-to-r from-[#05141D] to-[#063846] hover:from-[#04111a] hover:to-[#052d37] text-white shadow-lg transition-all duration-300 hover:shadow-xl rounded-md text-xs sm:text-sm px-3 sm:px-4 py-3 sm:py-2"
                                            >
                                                {isSubmitting ? t("visitorForm.submitting") : t("visitorForm.submit")}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}