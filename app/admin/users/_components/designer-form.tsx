"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, MapPin, Briefcase, Palette } from "lucide-react";

export interface DesignerFormData {
    ydesigncode: string;
    ydesigncontactemail: string;
    ydesigncontactpersonne: string;
    ydesigncontacttelephone: string;
    ydesignmarque: string;
    ydesignnom: string;
    ydesignpays: string;
    ydesignspecialite: string;
    ydesignactivitedate?: string;
    ydesigncouleur1codehexa?: string;
    ydesigncouleur1codervb?: string;
    ydesigncouleur1dsg?: string;
    ydesigncouleur2codehexa?: string;
    ydesigncouleur2codervb?: string;
    ydesigncouleur2dsg?: string;
    ydesigncouleur3codehexa?: string;
    ydesigncouleur3codervb?: string;
    ydesigncouleur3dsg?: string;
}

interface DesignerFormProps {
    userEmail: string;
    onFormChange: (data: DesignerFormData, isValid: boolean) => void;
    initialData?: Partial<DesignerFormData>;
    disabled?: boolean;
    step?: 'basic' | 'additional'; // New prop to control which fields to show
}

export function DesignerForm({ userEmail, onFormChange, initialData, disabled = false, step = 'basic' }: DesignerFormProps) {
    const { t } = useLanguage();
    
    const [formData, setFormData] = useState<DesignerFormData>({
        ydesigncode: "",
        ydesigncontactemail: userEmail,
        ydesigncontactpersonne: "",
        ydesigncontacttelephone: "",
        ydesignmarque: "",
        ydesignnom: "",
        ydesignpays: "",
        ydesignspecialite: "",
        ydesignactivitedate: new Date().toISOString().split('T')[0],
        ydesigncouleur1codehexa: "",
        ydesigncouleur1codervb: "",
        ydesigncouleur1dsg: "",
        ydesigncouleur2codehexa: "",
        ydesigncouleur2codervb: "",
        ydesigncouleur2dsg: "",
        ydesigncouleur3codehexa: "",
        ydesigncouleur3codervb: "",
        ydesigncouleur3dsg: "",
        ...initialData
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Generate designer code based on name and brand
    useEffect(() => {
        if (formData.ydesignnom && formData.ydesignmarque) {
            const code = `${formData.ydesignnom.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 4)}${formData.ydesignmarque.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 4)}${Date.now().toString().slice(-4)}`;
            setFormData(prev => ({ ...prev, ydesigncode: code }));
        }
    }, [formData.ydesignnom, formData.ydesignmarque]);

    // Update email when userEmail changes
    useEffect(() => {
        setFormData(prev => ({ ...prev, ydesigncontactemail: userEmail }));
    }, [userEmail]);

    // Memoized validation function to prevent infinite re-renders
    const validateCurrentStep = useCallback((data: DesignerFormData, currentStep: 'basic' | 'additional') => {
        const currentStepErrors: Record<string, string> = {};
        
        // Basic step validation
        if (currentStep === 'basic') {
            if (!data.ydesignnom.trim()) {
                currentStepErrors.ydesignnom = t("admin.users.designer.nameRequired") || "Designer name is required";
            }
            
            if (!data.ydesigncontactpersonne.trim()) {
                currentStepErrors.ydesigncontactpersonne = t("admin.users.designer.contactPersonRequired") || "Contact person is required";
            }
            
            if (!data.ydesigncontactemail.trim()) {
                currentStepErrors.ydesigncontactemail = t("admin.users.designer.emailRequired") || "Email is required";
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.ydesigncontactemail)) {
                currentStepErrors.ydesigncontactemail = t("admin.users.designer.emailInvalid") || "Please enter a valid email address";
            }
            
            if (!data.ydesigncontacttelephone.trim()) {
                currentStepErrors.ydesigncontacttelephone = t("admin.users.designer.phoneRequired") || "Phone number is required";
            }
        }
        
        // Additional step validation
        if (currentStep === 'additional') {
            if (!data.ydesignmarque.trim()) {
                currentStepErrors.ydesignmarque = t("admin.users.designer.brandRequired") || "Brand name is required";
            }
            
            if (!data.ydesignpays.trim()) {
                currentStepErrors.ydesignpays = t("admin.users.designer.countryRequired") || "Country is required";
            }
            
            if (!data.ydesignspecialite.trim()) {
                currentStepErrors.ydesignspecialite = t("admin.users.designer.specialtyRequired") || "Specialty is required";
            }
        }

        return {
            errors: currentStepErrors,
            isValid: Object.keys(currentStepErrors).length === 0
        };
    }, [t]);

    const validateForm = () => {
        const errors: Record<string, string> = {};
        
        // Basic step validation
        if (step === 'basic') {
            if (!formData.ydesignnom.trim()) {
                errors.ydesignnom = t("admin.users.designer.nameRequired") || "Designer name is required";
            }
            
            if (!formData.ydesigncontactpersonne.trim()) {
                errors.ydesigncontactpersonne = t("admin.users.designer.contactPersonRequired") || "Contact person is required";
            }
            
            if (!formData.ydesigncontactemail.trim()) {
                errors.ydesigncontactemail = t("admin.users.designer.emailRequired") || "Email is required";
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ydesigncontactemail)) {
                errors.ydesigncontactemail = t("admin.users.designer.emailInvalid") || "Please enter a valid email address";
            }
            
            if (!formData.ydesigncontacttelephone.trim()) {
                errors.ydesigncontacttelephone = t("admin.users.designer.phoneRequired") || "Phone number is required";
            }
        }
        
        // Additional step validation
        if (step === 'additional') {
            if (!formData.ydesignmarque.trim()) {
                errors.ydesignmarque = t("admin.users.designer.brandRequired") || "Brand name is required";
            }
            
            if (!formData.ydesignpays.trim()) {
                errors.ydesignpays = t("admin.users.designer.countryRequired") || "Country is required";
            }
            
            if (!formData.ydesignspecialite.trim()) {
                errors.ydesignspecialite = t("admin.users.designer.specialtyRequired") || "Specialty is required";
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (field: keyof DesignerFormData, value: string) => {
        const newFormData = { ...formData, [field]: value };
        setFormData(newFormData);
        
        // Clear error when user starts typing
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: "" }));
        }
        
        // Only validate and notify parent after user has started interacting
        setTimeout(() => {
            const validation = validateCurrentStep(newFormData, step);
            onFormChange(newFormData, validation.isValid);
        }, 0);
    };

    // Initial validation and notify parent of current form state
    useEffect(() => {
        const validation = validateCurrentStep(formData, step);
        onFormChange(formData, validation.isValid);
    }, [formData, step, validateCurrentStep, onFormChange]);

    return (
        <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <Palette className="h-5 w-5 text-morpheus-gold-light" />
                    {t("admin.users.designer.designerInformation")}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Basic Information - Step 1 */}
                {step === 'basic' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="designerName" className="text-white flex items-center gap-2">
                            <User className="h-4 w-4 text-morpheus-gold-light" />
                            {t("admin.users.designer.name")} *
                        </Label>
                        <Input
                            id="designerName"
                            type="text"
                            value={formData.ydesignnom}
                            onChange={(e) => handleInputChange("ydesignnom", e.target.value)}
                            placeholder={t("admin.users.designer.namePlaceholder")}
                            disabled={disabled}
                            className={`bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-morpheus-gold-light ${
                                formErrors.ydesignnom ? "border-red-500" : ""
                            }`}
                        />
                        {formErrors.ydesignnom && (
                            <p className="text-red-400 text-sm">{formErrors.ydesignnom}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="contactPerson" className="text-white flex items-center gap-2">
                            <User className="h-4 w-4 text-morpheus-gold-light" />
                            {t("admin.users.designer.contactPerson")} *
                        </Label>
                        <Input
                            id="contactPerson"
                            type="text"
                            value={formData.ydesigncontactpersonne}
                            onChange={(e) => handleInputChange("ydesigncontactpersonne", e.target.value)}
                            placeholder={t("admin.users.designer.contactPersonPlaceholder")}
                            disabled={disabled}
                            className={`bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-morpheus-gold-light ${
                                formErrors.ydesigncontactpersonne ? "border-red-500" : ""
                            }`}
                        />
                        {formErrors.ydesigncontactpersonne && (
                            <p className="text-red-400 text-sm">{formErrors.ydesigncontactpersonne}</p>
                        )}
                    </div>
                        </div>

                        {/* Contact Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-white flex items-center gap-2">
                            <Mail className="h-4 w-4 text-morpheus-gold-light" />
                            {t("admin.users.designer.email")} *
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.ydesigncontactemail}
                            onChange={(e) => handleInputChange("ydesigncontactemail", e.target.value)}
                            placeholder={t("admin.users.designer.emailPlaceholder")}
                            disabled={disabled}
                            className={`bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-morpheus-gold-light ${
                                formErrors.ydesigncontactemail ? "border-red-500" : ""
                            }`}
                        />
                        {formErrors.ydesigncontactemail && (
                            <p className="text-red-400 text-sm">{formErrors.ydesigncontactemail}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-white flex items-center gap-2">
                            <Phone className="h-4 w-4 text-morpheus-gold-light" />
                            {t("admin.users.designer.phone")} *
                        </Label>
                        <Input
                            id="phone"
                            type="tel"
                            value={formData.ydesigncontacttelephone}
                            onChange={(e) => handleInputChange("ydesigncontacttelephone", e.target.value)}
                            placeholder={t("admin.users.designer.phonePlaceholder")}
                            disabled={disabled}
                            className={`bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-morpheus-gold-light ${
                                formErrors.ydesigncontacttelephone ? "border-red-500" : ""
                            }`}
                        />
                        {formErrors.ydesigncontacttelephone && (
                            <p className="text-red-400 text-sm">{formErrors.ydesigncontacttelephone}</p>
                        )}
                    </div>
                        </div>
                    </>
                )}

                {/* Additional Information - Step 2 */}
                {step === 'additional' && (
                    <>
                        {/* Brand and Location */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="brand" className="text-white flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-morpheus-gold-light" />
                            {t("admin.users.designer.brand")} *
                        </Label>
                        <Input
                            id="brand"
                            type="text"
                            value={formData.ydesignmarque}
                            onChange={(e) => handleInputChange("ydesignmarque", e.target.value)}
                            placeholder={t("admin.users.designer.brandPlaceholder")}
                            disabled={disabled}
                            className={`bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-morpheus-gold-light ${
                                formErrors.ydesignmarque ? "border-red-500" : ""
                            }`}
                        />
                        {formErrors.ydesignmarque && (
                            <p className="text-red-400 text-sm">{formErrors.ydesignmarque}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="country" className="text-white flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-morpheus-gold-light" />
                            {t("admin.users.designer.country")} *
                        </Label>
                        <Input
                            id="country"
                            type="text"
                            value={formData.ydesignpays}
                            onChange={(e) => handleInputChange("ydesignpays", e.target.value)}
                            placeholder={t("admin.users.designer.countryPlaceholder")}
                            disabled={disabled}
                            className={`bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-morpheus-gold-light ${
                                formErrors.ydesignpays ? "border-red-500" : ""
                            }`}
                        />
                        {formErrors.ydesignpays && (
                            <p className="text-red-400 text-sm">{formErrors.ydesignpays}</p>
                        )}
                    </div>
                        </div>

                        {/* Specialty */}
                        <div className="space-y-2">
                    <Label htmlFor="specialty" className="text-white">
                        {t("admin.users.designer.specialty")} *
                    </Label>
                    <Textarea
                        id="specialty"
                        value={formData.ydesignspecialite}
                        onChange={(e) => handleInputChange("ydesignspecialite", e.target.value)}
                        placeholder={t("admin.users.designer.specialtyPlaceholder")}
                        disabled={disabled}
                        rows={3}
                        className={`bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-morpheus-gold-light resize-none ${
                            formErrors.ydesignspecialite ? "border-red-500" : ""
                        }`}
                    />
                    {formErrors.ydesignspecialite && (
                        <p className="text-red-400 text-sm">{formErrors.ydesignspecialite}</p>
                    )}
                        </div>

                        {/* Color Preferences (Optional) */}
                        <div className="space-y-4">
                    <h4 className="text-white font-medium">{t("admin.users.designer.colorPreferences")} ({t("common.optional")})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map((num) => (
                            <div key={num} className="space-y-2">
                                <Label className="text-white text-sm">
                                    {t("admin.users.designer.color")} {num}
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="color"
                                        value={formData[`ydesigncouleur${num}codehexa` as keyof DesignerFormData] as string || "#000000"}
                                        onChange={(e) => handleInputChange(`ydesigncouleur${num}codehexa` as keyof DesignerFormData, e.target.value)}
                                        disabled={disabled}
                                        className="w-12 h-8 p-0 border-gray-600 bg-gray-800/50"
                                    />
                                    <Input
                                        type="text"
                                        value={formData[`ydesigncouleur${num}dsg` as keyof DesignerFormData] as string || ""}
                                        onChange={(e) => handleInputChange(`ydesigncouleur${num}dsg` as keyof DesignerFormData, e.target.value)}
                                        placeholder={t("admin.users.designer.colorDescription")}
                                        disabled={disabled}
                                        className="flex-1 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-morpheus-gold-light"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                        </div>

                        {/* Designer Code (Read-only) */}
                        {formData.ydesigncode && (
                    <div className="space-y-2">
                        <Label className="text-white">
                            {t("admin.users.designer.designerCode")}
                        </Label>
                        <Input
                            type="text"
                            value={formData.ydesigncode}
                            disabled
                            className="bg-gray-700/50 border-gray-600 text-gray-300"
                        />
                    </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}