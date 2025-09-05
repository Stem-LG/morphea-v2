"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import {
    Credenza,
    CredenzaBody,
    CredenzaContent,
    CredenzaDescription,
    CredenzaFooter,
    CredenzaHeader,
    CredenzaTitle,
} from "@/components/ui/credenza";
import { Button } from "@/components/ui/button";
import { useAssignDesigner } from "../_hooks/use-assign-designer";
import { DesignerInfoForm } from "./designer-info-form";
import { ColorAssignmentForm } from "./color-assignment-form";
import { Loader2 } from "lucide-react";

interface User {
    id: string;
    email: string;
    name?: string;
}

interface AssignDesignerDialogProps {
    user: User | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AssignDesignerDialog({ user, open, onOpenChange }: AssignDesignerDialogProps) {
    const { t } = useLanguage();
    const [step, setStep] = useState(1);
    const [validationAttempted, setValidationAttempted] = useState(false);
    const [designerData, setDesignerData] = useState({
        nom: user?.name || "",
        marque: "",
        contactpersonne: user?.name || "",
        contactemail: user?.email || "",
        contacttelephone: "",
        pays: "",
        specialite: "",
        couleur1: {
            hexa: "",
            rvb: "",
            dsg: "",
        },
        couleur2: {
            hexa: "",
            rvb: "",
            dsg: "",
        },
        couleur3: {
            hexa: "",
            rvb: "",
            dsg: "",
        },
    });

    useEffect(() => {
        if (user) {
            setDesignerData((prev) => ({
                ...prev,
                nom: user.name || "",
                contactemail: user.email || "",
                contactpersonne: user.name || "",
            }));
        }
    }, [user]);

    const assignDesigner = useAssignDesigner();

    const getEmptyFields = () => {
        const emptyFields: string[] = [];
        if (!designerData.nom.trim()) emptyFields.push('nom');
        if (!designerData.marque.trim()) emptyFields.push('marque');
        if (!designerData.contactemail.trim()) emptyFields.push('contactemail');
        if (!designerData.contactpersonne.trim()) emptyFields.push('contactpersonne');
        if (!designerData.contacttelephone.trim()) emptyFields.push('contacttelephone');
        if (!designerData.pays.trim()) emptyFields.push('pays');
        if (!designerData.specialite.trim()) emptyFields.push('specialite');
        return emptyFields;
    };

    const handleNext = () => {
        if (step === 1) {
            setValidationAttempted(true);
            const emptyFields = getEmptyFields();
            
            if (emptyFields.length === 0) {
                setStep(2);
                setValidationAttempted(false);
            }
        }
    };

    const handleBack = () => {
        if (step === 2) {
            setStep(1);
        }
    };

    const handleSubmit = async () => {
        if (!user) return;

        await assignDesigner.mutateAsync({
            userId: user.id,
            designerData,
        });

        // Reset state
        setStep(1);
        onOpenChange(false);
    };

    const handleClose = () => {
        setStep(1);
        onOpenChange(false);
    };

    return (
        <Credenza open={open} onOpenChange={handleClose}>
            <CredenzaContent className="max-w-2xl bg-white border border-gray-200 shadow-xl">
                <CredenzaHeader className="border-b border-gray-100 pb-4">
                    <CredenzaTitle className="text-gray-900 text-xl font-semibold">{t("admin.users.assignDesignerRole")}</CredenzaTitle>
                    <CredenzaDescription className="text-gray-600 mt-1">
                        {step === 1
                            ? t("admin.users.fillDesignerInfo")
                            : t("admin.users.assignBrandColors")}
                    </CredenzaDescription>
                </CredenzaHeader>

                <CredenzaBody className="py-6">
                    {/* Step Indicator */}
                    <div className="flex items-center justify-center mb-6">
                        <div className="flex items-center space-x-4">
                            <div
                                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                                    step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                                }`}
                            >
                                1
                            </div>
                            <div className={`w-16 h-1 rounded ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`} />
                            <div
                                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                                    step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                                }`}
                            >
                                2
                            </div>
                        </div>
                    </div>

                    {/* Step Content */}
                    {step === 1 ? (
                        <DesignerInfoForm 
                            data={designerData} 
                            onChange={setDesignerData}
                            showValidation={validationAttempted}
                        />
                    ) : (
                        <ColorAssignmentForm data={designerData} onChange={setDesignerData} />
                    )}
                </CredenzaBody>

                <CredenzaFooter className="border-t border-gray-100 pt-4">
                    <Button
                        variant="outline"
                        onClick={step === 1 ? handleClose : handleBack}
                        disabled={assignDesigner.isPending}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                        {step === 1 ? t("common.cancel") : t("admin.users.stepper.back")}
                    </Button>

                    {step === 1 ? (
                        <Button 
                            onClick={handleNext} 
                            disabled={assignDesigner.isPending}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {t("admin.users.stepper.next")}
                        </Button>
                    ) : (
                        <Button 
                            onClick={handleSubmit} 
                            disabled={assignDesigner.isPending}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {assignDesigner.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t("admin.users.assigning")}
                                </>
                            ) : (
                                t("admin.users.assignDesignerRole")
                            )}
                        </Button>
                    )}
                </CredenzaFooter>
            </CredenzaContent>
        </Credenza>
    );
}
