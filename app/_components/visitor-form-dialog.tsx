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
import { PhoneInput } from "@/components/ui/phone-input";
import { CheckCircle, User, Users, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type VisitorFormData = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    selectedVisitorType: string;
    profileQuestion: string;
    sourceQuestion: string;
    interestQuestion: string;
    specialtyQuestion: string;
    expectationQuestion: string;
};

export const VISITOR_FORM_STORAGE_KEY = "morpheus_visitor_form_skipped";

const STEPS = [
    {
        id: 1,
        title: "basicInformation",
        icon: User,
        description: "personalDetails",
    },
    {
        id: 2,
        title: "profileQuestion",
        icon: Users,
        description: "selectProfile",
    },
    {
        id: 3,
        title: "sourceQuestion",
        icon: Users,
        description: "howHeard",
    },
    {
        id: 4,
        title: "interestQuestion",
        icon: Users,
        description: "mainInterest",
    },
    {
        id: 5,
        title: "specialtyQuestion",
        icon: Users,
        description: "specialty",
    },
    {
        id: 6,
        title: "expectationQuestion",
        icon: Users,
        description: "expectation",
    },
];

export default function VisitorFormDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<VisitorFormData>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        selectedVisitorType: "",
        profileQuestion: "",
        sourceQuestion: "",
        interestQuestion: "",
        specialtyQuestion: "",
        expectationQuestion: "",
    });

    const { data: currentUser } = useAuth();
    const { t } = useLanguage();
    const supabase = createClient();

    useEffect(() => {
        // Check if user has already skipped the form
        const hasSkipped = localStorage.getItem(VISITOR_FORM_STORAGE_KEY);

        if (currentUser && !hasSkipped) {

            console.log("Checking visitor data for user:", currentUser.email);

            supabase.from("yvisiteur").select("*").eq("yvisiteuremail", currentUser.email).then(({ data, error }) => {
                if (error) {
                    console.error("Error checking visitor data:", error);
                    return;
                }

                if (data && data.length > 0) {
                    // User already has visitor data, do not show the form
                    return;
                }

                console.log("we're showing the form because:", data);

                // Show the visitor form dialog 
                setIsOpen(true);
            });

            return null;
        }

    }, [currentUser]);

    const handleSkip = () => {
        localStorage.setItem(VISITOR_FORM_STORAGE_KEY, "true");
        setIsOpen(false);
    };

    const handleSubmit = async () => {
        if (!currentUser || !formData.firstName.trim() || !formData.lastName.trim()) {
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
                yvisiteurnom: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
                yvisiteuremail: formData.email.trim() || null,
                yvisiteurtelephone: formData.phone.trim() || null,
                yvisiteuradresse: formData.address.trim() || null,
                profile_question: (formData.profileQuestion.trim() || null) as any,
                source_question: (formData.sourceQuestion.trim() || null) as any,
                interest_question: (formData.interestQuestion.trim() || null) as any,
                specialty_question: (formData.specialtyQuestion.trim() || null) as any,
                expectation_question: (formData.expectationQuestion.trim() || null) as any,
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

    const handleInputChange = (field: keyof Omit<VisitorFormData, "selectedVisitorType">, value: string) => {
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
        const hasFirstName = formData.firstName.trim().length > 0;
        const hasLastName = formData.lastName.trim().length > 0;
        const hasValidEmail = formData.email.trim().length > 0 && formData.email.includes('@');
        return hasFirstName && hasLastName && hasValidEmail;
    };

    const isStep2Valid = () => formData.profileQuestion.trim().length > 0;
    const isStep3Valid = () => formData.sourceQuestion.trim().length > 0;
    const isStep4Valid = () => formData.interestQuestion.trim().length > 0;
    const isStep5Valid = () => formData.specialtyQuestion.trim().length > 0;
    const isStep6Valid = () => formData.expectationQuestion.trim().length > 0;

    const canProceedToNextStep = () => {
        switch (currentStep) {
            case 1:
                return isStep1Valid();
            case 2:
                return isStep2Valid();
            case 3:
                return isStep3Valid();
            case 4:
                return isStep4Valid();
            case 5:
                return isStep5Valid();
            case 6:
                return isStep6Valid();
            default:
                return true;
        }
    };


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
                                        className={`w-2 h-2 rounded-full ${currentStep >= step.id ? 'bg-[#063846]' : 'bg-slate-300'
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
                                            {currentStep === 2 && "1. Vous êtes ?"}
                                            {currentStep === 3 && "2. Comment avez-vous entendu parler de Morphea ?"}
                                            {currentStep === 4 && "3. Quel est votre principal intérêt sur Morphea ?"}
                                            {currentStep === 5 && "4. Dans quel domaine évoluez-vous ?"}
                                            {currentStep === 6 && "5. Quel type d'expérience recherchez-vous sur Morphea ?"}
                                        </h2>
                                        <p className="text-slate-600 text-sm sm:text-base">
                                            {currentStep === 1 && t("visitorForm.personalDetails")}
                                            {currentStep === 2 && "Identifier le profil professionnel ou personnel"}
                                            {currentStep === 3 && "Mesurer les canaux de communication efficaces"}
                                            {currentStep === 4 && "Cerner les attentes utilisateur"}
                                            {currentStep === 5 && "Affiner le profil professionnel / secteur"}
                                            {currentStep === 6 && "Adapter l'offre de contenu et les recommandations"}
                                        </p>
                                    </div>

                                    {/* Step 1: Basic Information */}
                                    {currentStep === 1 && (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="firstName" className="text-[#05141D] text-sm font-medium">
                                                        {t("profile.firstName")} *
                                                        {formData.firstName.trim() && <span className="text-green-500 ml-1">✓</span>}
                                                    </Label>
                                                    <Input
                                                        id="firstName"
                                                        type="text"
                                                        required
                                                        value={formData.firstName}
                                                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                                                        className={`bg-white border-slate-300 text-[#05141D] placeholder:text-slate-400 h-11 text-base focus:border-[#063846] focus:ring-[#063846] rounded-md transition-colors ${formData.firstName.trim() ? 'border-green-300 focus:border-green-500' : ''
                                                            }`}
                                                        placeholder={t("auth.firstNamePlaceholder")}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="lastName" className="text-[#05141D] text-sm font-medium">
                                                        {t("profile.lastName")} *
                                                        {formData.lastName.trim() && <span className="text-green-500 ml-1">✓</span>}
                                                    </Label>
                                                    <Input
                                                        id="lastName"
                                                        type="text"
                                                        required
                                                        value={formData.lastName}
                                                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                                                        className={`bg-white border-slate-300 text-[#05141D] placeholder:text-slate-400 h-11 text-base focus:border-[#063846] focus:ring-[#063846] rounded-md transition-colors ${formData.lastName.trim() ? 'border-green-300 focus:border-green-500' : ''
                                                            }`}
                                                        placeholder={t("auth.lastNamePlaceholder")}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="email" className="text-[#05141D] text-sm font-medium">
                                                        {t("visitorForm.email")} *
                                                        {formData.email.trim() && formData.email.includes('@') && <span className="text-green-500 ml-1">✓</span>}
                                                    </Label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        required
                                                        value={formData.email}
                                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                                        className={`bg-white border-slate-300 text-[#05141D] placeholder:text-slate-400 h-11 text-base focus:border-[#063846] focus:ring-[#063846] rounded-md transition-colors ${formData.email.trim() && formData.email.includes('@') ? 'border-green-300 focus:border-green-500' : formData.email.trim() ? 'border-red-300 focus:border-red-500' : ''
                                                            }`}
                                                        placeholder={t("visitorForm.emailPlaceholder")}
                                                    />
                                                    {formData.email.trim() && !formData.email.includes('@') && (
                                                        <p className="text-xs text-red-500 mt-1">{t("visitorForm.emailInvalid")}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="phone" className="text-[#05141D] text-sm font-medium">
                                                        {t("visitorForm.phone")}
                                                        {formData.phone.trim() && <span className="text-green-500 ml-1">✓</span>}
                                                    </Label>
                                                    <PhoneInput
                                                        value={formData.phone}
                                                        onChange={(value) => handleInputChange("phone", value || "")}
                                                        defaultCountry="FR"
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

                                    {/* Step 2: Profile Question */}
                                    {currentStep === 2 && (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                {[
                                                    { value: 'student', label: 'Étudiant' },
                                                    { value: 'pro', label: 'Professionnel du secteur mode / design' },
                                                    { value: 'designer', label: 'Designer de mode' },
                                                    { value: 'artist', label: 'Artiste / Artisan' },
                                                    { value: 'project_lead', label: 'Porteur de projet' },
                                                    { value: 'curious', label: 'Curieux / Passionné d\'art et de design' },
                                                    { value: 'representative', label: 'Représentant d\'institution ou de marque' },
                                                    { value: 'other', label: 'Autre' },
                                                ].map(({ value, label }) => (
                                                    <label key={value} className="group flex cursor-pointer items-center space-x-3 rounded-lg border border-slate-200 p-4 transition-all hover:border-[#063846] hover:bg-slate-50">
                                                        <input
                                                            type="radio"
                                                            name="profileQuestion"
                                                            value={value}
                                                            checked={formData.profileQuestion === value}
                                                            onChange={(e) => setFormData((prev) => ({ ...prev, profileQuestion: e.target.value }))}
                                                            className="h-5 w-5 border-slate-300 bg-white text-[#063846] transition-colors focus:ring-2 focus:ring-[#063846]"
                                                        />
                                                        <span className="text-base font-medium text-slate-700">{label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 3: Source Question */}
                                    {currentStep === 3 && (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                {[
                                                    { value: 'linkedin', label: 'LinkedIn' },
                                                    { value: 'facebook', label: 'Facebook' },
                                                    { value: 'instagram', label: 'Instagram' },
                                                    { value: 'word', label: 'Bouche à oreille' },
                                                    { value: 'news', label: 'Presse spécialisée' },
                                                    { value: 'event', label: 'Événement / salon' },
                                                    { value: 'other', label: 'Autre' },
                                                ].map(({ value, label }) => (
                                                    <label key={value} className="group flex cursor-pointer items-center space-x-3 rounded-lg border border-slate-200 p-4 transition-all hover:border-[#063846] hover:bg-slate-50">
                                                        <input
                                                            type="radio"
                                                            name="sourceQuestion"
                                                            value={value}
                                                            checked={formData.sourceQuestion === value}
                                                            onChange={(e) => setFormData((prev) => ({ ...prev, sourceQuestion: e.target.value }))}
                                                            className="h-5 w-5 border-slate-300 bg-white text-[#063846] transition-colors focus:ring-2 focus:ring-[#063846]"
                                                        />
                                                        <span className="text-base font-medium text-slate-700">{label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 4: Interest Question */}
                                    {currentStep === 4 && (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                {[
                                                    { value: 'discover', label: 'Découvrir des créateurs et leurs créations' },
                                                    { value: 'sell', label: 'Vendre mes créations' },
                                                    { value: 'buy', label: 'Acheter des pièces uniques' },
                                                    { value: 'participate', label: 'Participer à des événements immersifs' },
                                                    { value: 'inspiration', label: 'M\'inspirer pour un projet personnel ou professionnel' },
                                                    { value: 'explore', label: 'Explorer un nouveau type d\'expérience digitale' },
                                                    { value: 'other', label: 'Autre' },
                                                ].map(({ value, label }) => (
                                                    <label key={value} className="group flex cursor-pointer items-center space-x-3 rounded-lg border border-slate-200 p-4 transition-all hover:border-[#063846] hover:bg-slate-50">
                                                        <input
                                                            type="radio"
                                                            name="interestQuestion"
                                                            value={value}
                                                            checked={formData.interestQuestion === value}
                                                            onChange={(e) => setFormData((prev) => ({ ...prev, interestQuestion: e.target.value }))}
                                                            className="h-5 w-5 border-slate-300 bg-white text-[#063846] transition-colors focus:ring-2 focus:ring-[#063846]"
                                                        />
                                                        <span className="text-base font-medium text-slate-700">{label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 5: Specialty Question */}
                                    {currentStep === 5 && (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                {[
                                                    { value: 'fashion', label: 'Mode' },
                                                    { value: 'design', label: 'Design d\'objet' },
                                                    { value: 'artist', label: 'Artisanat / Métiers d\'art' },
                                                    { value: 'visual_art', label: 'Arts visuels' },
                                                    { value: 'marketing', label: 'Communication / Marketing' },
                                                    { value: 'teaching', label: 'Enseignement / Formation' },
                                                    { value: 'development', label: 'Développement technologique / 3D / VR' },
                                                    { value: 'other', label: 'Autre' },
                                                ].map(({ value, label }) => (
                                                    <label key={value} className="group flex cursor-pointer items-center space-x-3 rounded-lg border border-slate-200 p-4 transition-all hover:border-[#063846] hover:bg-slate-50">
                                                        <input
                                                            type="radio"
                                                            name="specialtyQuestion"
                                                            value={value}
                                                            checked={formData.specialtyQuestion === value}
                                                            onChange={(e) => setFormData((prev) => ({ ...prev, specialtyQuestion: e.target.value }))}
                                                            className="h-5 w-5 border-slate-300 bg-white text-[#063846] transition-colors focus:ring-2 focus:ring-[#063846]"
                                                        />
                                                        <span className="text-base font-medium text-slate-700">{label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 6: Expectation Question */}
                                    {currentStep === 6 && (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                {[
                                                    { value: 'art', label: 'Une expérience artistique et immersive' },
                                                    { value: 'display', label: 'Une vitrine pour mes créations' },
                                                    { value: 'networking', label: 'Un espace de networking créatif' },
                                                    { value: 'buy_sell', label: 'Une plateforme pour vendre ou acheter des œuvres' },
                                                    { value: 'inspiration', label: 'Une source d\'inspiration culturelle' },
                                                    { value: 'opportunity', label: 'Une opportunité de collaboration ou de visibilité' },
                                                    { value: 'other', label: 'Autre' },
                                                ].map(({ value, label }) => (
                                                    <label key={value} className="group flex cursor-pointer items-center space-x-3 rounded-lg border border-slate-200 p-4 transition-all hover:border-[#063846] hover:bg-slate-50">
                                                        <input
                                                            type="radio"
                                                            name="expectationQuestion"
                                                            value={value}
                                                            checked={formData.expectationQuestion === value}
                                                            onChange={(e) => setFormData((prev) => ({ ...prev, expectationQuestion: e.target.value }))}
                                                            className="h-5 w-5 border-slate-300 bg-white text-[#063846] transition-colors focus:ring-2 focus:ring-[#063846]"
                                                        />
                                                        <span className="text-base font-medium text-slate-700">{label}</span>
                                                    </label>
                                                ))}
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
                                                disabled={isSubmitting || !formData.firstName.trim() || !formData.lastName.trim()}
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