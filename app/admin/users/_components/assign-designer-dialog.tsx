"use client";

import { useEffect, useState } from "react";
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
    const [step, setStep] = useState(1);
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

    const handleNext = () => {
        if (step === 1) {
            // Validate step 1 data
            if (
                !designerData.nom ||
                !designerData.marque ||
                !designerData.contactemail ||
                !designerData.contactpersonne ||
                !designerData.contacttelephone ||
                !designerData.pays ||
                !designerData.specialite
            ) {
                return;
            }
            setStep(2);
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
            <CredenzaContent className="max-w-2xl bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light">
                <CredenzaHeader>
                    <CredenzaTitle>Assign Designer Role</CredenzaTitle>
                    <CredenzaDescription>
                        {step === 1
                            ? "Fill in the designer information for this user"
                            : "Assign brand colors for the designer"}
                    </CredenzaDescription>
                </CredenzaHeader>

                <CredenzaBody>
                    {/* Step Indicator */}
                    <div className="flex items-center justify-center mb-6">
                        <div className="flex items-center space-x-4">
                            <div
                                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                    step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                }`}
                            >
                                1
                            </div>
                            <div className={`w-16 h-1 ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
                            <div
                                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                    step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                }`}
                            >
                                2
                            </div>
                        </div>
                    </div>

                    {/* Step Content */}
                    {step === 1 ? (
                        <DesignerInfoForm data={designerData} onChange={setDesignerData} />
                    ) : (
                        <ColorAssignmentForm data={designerData} onChange={setDesignerData} />
                    )}
                </CredenzaBody>

                <CredenzaFooter>
                    <Button
                        variant="outline"
                        onClick={step === 1 ? handleClose : handleBack}
                        disabled={assignDesigner.isPending}
                    >
                        {step === 1 ? "Cancel" : "Back"}
                    </Button>

                    {step === 1 ? (
                        <Button onClick={handleNext} disabled={assignDesigner.isPending}>
                            Next
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={assignDesigner.isPending}>
                            {assignDesigner.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Assigning...
                                </>
                            ) : (
                                "Assign Designer Role"
                            )}
                        </Button>
                    )}
                </CredenzaFooter>
            </CredenzaContent>
        </Credenza>
    );
}
