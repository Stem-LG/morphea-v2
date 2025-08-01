"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { createClient } from "@/lib/client";
import { Database } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, User, Users, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type VisitorFormData = {
    name: string;
    email: string;
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

const VISITOR_FORM_STORAGE_KEY = "morpheus_visitor_form_skipped";

const STEPS = [
    {
        id: 1,
        title: "basicInformation",
        icon: User,
        description: "Personal details",
    },
    {
        id: 2,
        title: "visitorTypes",
        icon: Users,
        description: "Select all that apply",
    },
];

export default function VisitorFormDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<VisitorFormData>({
        name: "",
        email: "",
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

    const { data: currentUser } = useAuth();
    const { t } = useLanguage();
    const supabase = createClient();

    useEffect(() => {
        // Check if user has already skipped the form
        const hasSkipped = localStorage.getItem(VISITOR_FORM_STORAGE_KEY);

        // Only show dialog if user hasn't skipped and we have a user
        if (!hasSkipped && currentUser) {
            // Add a small delay to ensure the page has loaded
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [currentUser]);

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
                yvisiteurboolacheteurluxe: formData.visitorTypes.acheteurluxe ? "1" : "0",
                yvisiteurboolacheteurpro: formData.visitorTypes.acheteurpro ? "1" : "0",
                yvisiteurboolartisan: formData.visitorTypes.artisan ? "1" : "0",
                yvisiteurboolclientprive: formData.visitorTypes.clientprive ? "1" : "0",
                yvisiteurboolcollectionneur: formData.visitorTypes.collectionneur ? "1" : "0",
                yvisiteurboolcreateur: formData.visitorTypes.createur ? "1" : "0",
                yvisiteurboolculturel: formData.visitorTypes.culturel ? "1" : "0",
                yvisiteurboolgrandpublic: formData.visitorTypes.grandpublic ? "1" : "0",
                yvisiteurboolinfluenceur: formData.visitorTypes.influenceur ? "1" : "0",
                yvisiteurboolinvestisseur: formData.visitorTypes.investisseur ? "1" : "0",
                yvisiteurbooljournaliste: formData.visitorTypes.journaliste ? "1" : "0",
                yvisiteurboolpressespecialisee: formData.visitorTypes.pressespecialisee ? "1" : "0",
                yvisiteurboolvip: formData.visitorTypes.vip ? "1" : "0",
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

    const handleVisitorTypeChange = (type: keyof VisitorFormData["visitorTypes"], checked: boolean) => {
        setFormData((prev) => ({
            ...prev,
            visitorTypes: {
                ...prev.visitorTypes,
                [type]: checked,
            },
        }));
    };

    const isStep1Valid = () => {
        return formData.name.trim().length > 0;
    };

    const canProceedToNextStep = () => {
        if (currentStep === 1) return isStep1Valid();
        return true;
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
                            ? "bg-morpheus-gold-light border-morpheus-gold-light text-white"
                            : isActive
                            ? "border-morpheus-gold-light text-morpheus-gold-light bg-morpheus-gold-light/10"
                            : "border-gray-400 text-gray-400"
                    )}
                >
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                    <h3
                        className={cn(
                            "text-sm font-medium transition-colors duration-300",
                            isActive ? "text-morpheus-gold-light" : "text-gray-300"
                        )}
                    >
                        {t(`visitorForm.${step.title}`)}
                    </h3>
                    <p className="text-xs text-gray-400">{step.description}</p>
                </div>
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light border-morpheus-gold-dark/30">
                <DialogHeader className="border-b border-morpheus-gold-dark/20 pb-6">
                    <DialogTitle className="text-2xl font-bold text-morpheus-gold-light">
                        {t("visitorForm.title")}
                    </DialogTitle>
                    <p className="text-gray-300 mt-2">{t("visitorForm.subtitle")}</p>
                </DialogHeader>

                <div className="flex gap-8 overflow-y-auto">
                    {/* Step Indicator Sidebar */}
                    <div className="w-64 flex-shrink-0 space-y-6 py-6">
                        {STEPS.map((step) => (
                            <StepIndicator
                                key={step.id}
                                step={step}
                                isActive={currentStep === step.id}
                                isCompleted={currentStep > step.id}
                            />
                        ))}
                    </div>

                    {/* Form Content */}
                    <div className="flex-1 py-6 pr-6">
                        <Card className="bg-morpheus-blue-dark/30 border-morpheus-gold-dark/20">
                            <CardHeader>
                                <CardTitle className="text-lg text-morpheus-gold-light">
                                    {currentStep === 1 && t("visitorForm.basicInformation")}
                                    {currentStep === 2 && t("visitorForm.visitorTypes")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Step 1: Basic Information */}
                                {currentStep === 1 && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name" className="text-gray-300">
                                                    {t("visitorForm.nameRequired")}
                                                </Label>
                                                <Input
                                                    id="name"
                                                    type="text"
                                                    required
                                                    value={formData.name}
                                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                                    className="bg-morpheus-blue-dark/50 border-morpheus-gold-dark/30 text-white placeholder-gray-400 focus:border-morpheus-gold-light"
                                                    placeholder={t("visitorForm.namePlaceholder")}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-gray-300">
                                                    {t("visitorForm.email")}
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                                    className="bg-morpheus-blue-dark/50 border-morpheus-gold-dark/30 text-white placeholder-gray-400 focus:border-morpheus-gold-light"
                                                    placeholder={t("visitorForm.emailPlaceholder")}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="phone" className="text-gray-300">
                                                    {t("visitorForm.phone")}
                                                </Label>
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={(e) => handleInputChange("phone", e.target.value)}
                                                    className="bg-morpheus-blue-dark/50 border-morpheus-gold-dark/30 text-white placeholder-gray-400 focus:border-morpheus-gold-light"
                                                    placeholder={t("visitorForm.phonePlaceholder")}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="address" className="text-gray-300">
                                                    {t("visitorForm.address")}
                                                </Label>
                                                <Input
                                                    id="address"
                                                    type="text"
                                                    value={formData.address}
                                                    onChange={(e) => handleInputChange("address", e.target.value)}
                                                    className="bg-morpheus-blue-dark/50 border-morpheus-gold-dark/30 text-white placeholder-gray-400 focus:border-morpheus-gold-light"
                                                    placeholder={t("visitorForm.addressPlaceholder")}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Visitor Types */}
                                {currentStep === 2 && (
                                    <div className="space-y-4">
                                        <p className="text-gray-300 text-sm mb-4">
                                            Select all categories that describe you:
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {[
                                                { key: "grandpublic", labelKey: "grandpublic" },
                                                { key: "clientprive", labelKey: "clientprive" },
                                                { key: "acheteurluxe", labelKey: "acheteurluxe" },
                                                { key: "acheteurpro", labelKey: "acheteurpro" },
                                                { key: "artisan", labelKey: "artisan" },
                                                { key: "createur", labelKey: "createur" },
                                                { key: "collectionneur", labelKey: "collectionneur" },
                                                { key: "investisseur", labelKey: "investisseur" },
                                                { key: "influenceur", labelKey: "influenceur" },
                                                { key: "journaliste", labelKey: "journaliste" },
                                                { key: "pressespecialisee", labelKey: "pressespecialisee" },
                                                { key: "culturel", labelKey: "culturel" },
                                                { key: "vip", labelKey: "vip" },
                                            ].map(({ key, labelKey }) => (
                                                <label
                                                    key={key}
                                                    className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-morpheus-blue-dark/30 transition-colors"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            formData.visitorTypes[
                                                                key as keyof VisitorFormData["visitorTypes"]
                                                            ]
                                                        }
                                                        onChange={(e) =>
                                                            handleVisitorTypeChange(
                                                                key as keyof VisitorFormData["visitorTypes"],
                                                                e.target.checked
                                                            )
                                                        }
                                                        className="w-4 h-4 text-morpheus-gold-light bg-morpheus-blue-dark border-morpheus-gold-dark/30 rounded focus:ring-morpheus-gold-light focus:ring-2"
                                                    />
                                                    <span className="text-gray-300 text-sm">
                                                        {t(`visitorForm.visitorTypeLabels.${labelKey}`)}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between items-center mt-8 pt-6 border-t border-morpheus-gold-dark/20">
                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleSkip}
                                    disabled={isSubmitting}
                                    className="border-morpheus-gold-dark/30 text-gray-300 hover:text-white hover:border-morpheus-gold-light/50"
                                >
                                    {t("visitorForm.skipForNow")}
                                </Button>
                            </div>

                            <div className="flex gap-3">
                                {currentStep > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handlePrevious}
                                        disabled={isSubmitting}
                                        className="border-morpheus-gold-dark/30 text-gray-300 hover:text-white hover:border-morpheus-gold-light/50"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        {t("common.back")}
                                    </Button>
                                )}

                                {currentStep < STEPS.length ? (
                                    <Button
                                        type="button"
                                        onClick={handleNext}
                                        disabled={!canProceedToNextStep() || isSubmitting}
                                        className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white hover:from-morpheus-gold-light hover:to-morpheus-gold-dark"
                                    >
                                        {t("common.back") === "Back" ? "Next" : "Suivant"}
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={isSubmitting || !formData.name.trim()}
                                        className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white hover:from-morpheus-gold-light hover:to-morpheus-gold-dark"
                                    >
                                        {isSubmitting ? t("visitorForm.submitting") : t("visitorForm.submit")}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
