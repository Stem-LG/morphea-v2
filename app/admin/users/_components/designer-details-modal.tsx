"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { DesignerForm, DesignerFormData } from "./designer-form";
import { useHasDesigner, useUpdateDesigner } from "../_hooks/use-designer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, MapPin, Briefcase, Palette, Edit } from "lucide-react";

interface DesignerDetailsModalProps {
    userId: string | null;
    userEmail: string;
    isOpen: boolean;
    onClose: () => void;
    canEdit?: boolean; // Whether the current user can edit the designer details
}

export function DesignerDetailsModal({ 
    userId, 
    userEmail, 
    isOpen, 
    onClose, 
    canEdit = false 
}: DesignerDetailsModalProps) {
    const { t } = useLanguage();
    const [isEditing, setIsEditing] = useState(false);
    const [designerData, setDesignerData] = useState<DesignerFormData | null>(null);
    const [isDesignerFormValid, setIsDesignerFormValid] = useState(false);
    
    const { hasDesigner, designer, isLoading } = useHasDesigner(userId);
    const updateDesignerMutation = useUpdateDesigner();

    useEffect(() => {
        if (designer) {
            setDesignerData(designer);
        }
    }, [designer]);

    const handleDesignerFormChange = (data: DesignerFormData, isValid: boolean) => {
        setDesignerData(data);
        setIsDesignerFormValid(isValid);
    };

    const handleSave = async () => {
        if (!designerData || !userId || !isDesignerFormValid || !designer) return;

        try {
            await updateDesignerMutation.mutateAsync({
                designerId: designer.ydesignid,
                designerData,
                userId
            });
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating designer:", error);
        }
    };

    const handleCancel = () => {
        setDesignerData(designer || null);
        setIsEditing(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Palette className="h-5 w-5 text-morpheus-gold-light" />
                        {t("admin.users.designerDetails")} - {userEmail}
                    </h2>
                    <div className="flex items-center gap-2">
                        {canEdit && hasDesigner && !isEditing && (
                            <Button
                                onClick={() => setIsEditing(true)}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <Edit className="h-4 w-4" />
                                {t("admin.users.editDesigner")}
                            </Button>
                        )}
                        <Button
                            onClick={onClose}
                            variant="outline"
                            size="sm"
                        >
                            {t("common.cancel")}
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="text-center text-gray-600 dark:text-gray-300 py-8">
                            {t("common.loading")}
                        </div>
                    ) : !hasDesigner ? (
                        <div className="text-center text-gray-600 dark:text-gray-300 py-8">
                            <Palette className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <p>{t("admin.users.noDesignerProfile")}</p>
                        </div>
                    ) : isEditing ? (
                        <div className="space-y-6">
                            <DesignerForm
                                userEmail={userEmail}
                                onFormChange={handleDesignerFormChange}
                                initialData={designerData || undefined}
                                disabled={updateDesignerMutation.isPending}
                                step="basic"
                            />
                            <DesignerForm
                                userEmail={userEmail}
                                onFormChange={handleDesignerFormChange}
                                initialData={designerData || undefined}
                                disabled={updateDesignerMutation.isPending}
                                step="additional"
                            />
                        </div>
                    ) : (
                        <DesignerDetailsView designer={designer!} />
                    )}
                </div>

                {isEditing && (
                    <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <Button
                            onClick={handleCancel}
                            variant="outline"
                            disabled={updateDesignerMutation.isPending}
                        >
                            {t("common.cancel")}
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!isDesignerFormValid || updateDesignerMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {updateDesignerMutation.isPending ? t("common.saving") : t("common.save")}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

function DesignerDetailsView({ designer }: { designer: DesignerFormData }) {
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            {/* Basic Information */}
            <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <User className="h-5 w-5 text-morpheus-gold-light" />
                        {t("admin.users.stepper.basicInfo")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-300">
                                {t("admin.users.designer.name")}
                            </label>
                            <p className="text-white mt-1">{designer.ydesignnom || "N/A"}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-300">
                                {t("admin.users.designer.contactPerson")}
                            </label>
                            <p className="text-white mt-1">{designer.ydesigncontactpersonne || "N/A"}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <Mail className="h-4 w-4 text-morpheus-gold-light" />
                                {t("admin.users.designer.email")}
                            </label>
                            <p className="text-white mt-1">{designer.ydesigncontactemail || "N/A"}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <Phone className="h-4 w-4 text-morpheus-gold-light" />
                                {t("admin.users.designer.phone")}
                            </label>
                            <p className="text-white mt-1">{designer.ydesigncontacttelephone || "N/A"}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Additional Information */}
            <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-morpheus-gold-light" />
                        {t("admin.users.stepper.additionalInfo")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-300">
                                {t("admin.users.designer.brand")}
                            </label>
                            <p className="text-white mt-1">{designer.ydesignmarque || "N/A"}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-morpheus-gold-light" />
                                {t("admin.users.designer.country")}
                            </label>
                            <p className="text-white mt-1">{designer.ydesignpays || "N/A"}</p>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-300">
                            {t("admin.users.designer.specialty")}
                        </label>
                        <p className="text-white mt-1">{designer.ydesignspecialite || "N/A"}</p>
                    </div>
                    
                    {/* Color Preferences */}
                    <div>
                        <label className="text-sm font-medium text-gray-300 mb-3 block">
                            {t("admin.users.designer.colorPreferences")}
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[1, 2, 3].map((num) => {
                                const colorHex = designer[`ydesigncouleur${num}codehexa` as keyof DesignerFormData] as string;
                                const colorDesc = designer[`ydesigncouleur${num}dsg` as keyof DesignerFormData] as string;
                                
                                if (!colorHex && !colorDesc) return null;
                                
                                return (
                                    <div key={num} className="flex items-center gap-3">
                                        <div 
                                            className="w-8 h-8 rounded border border-gray-600"
                                            style={{ backgroundColor: colorHex || "#000000" }}
                                        />
                                        <div>
                                            <p className="text-white text-sm font-medium">
                                                {t("admin.users.designer.color")} {num}
                                            </p>
                                            <p className="text-gray-300 text-xs">
                                                {colorDesc || colorHex || "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Designer Code */}
                    {designer.ydesigncode && (
                        <div>
                            <label className="text-sm font-medium text-gray-300">
                                {t("admin.users.designer.designerCode")}
                            </label>
                            <p className="text-white mt-1 font-mono">{designer.ydesigncode}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}