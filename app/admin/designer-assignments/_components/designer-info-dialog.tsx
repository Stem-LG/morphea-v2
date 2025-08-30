"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Credenza,
    CredenzaContent,
    CredenzaDescription,
    CredenzaHeader,
    CredenzaTitle,
    CredenzaTrigger,
    CredenzaFooter,
    CredenzaClose,
} from "@/components/ui/credenza";
import { User, Mail, Phone, MapPin, Palette, Building, Lock } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface Designer {
    ydesignid: number;
    ydesignnom: string;
    ydesignmarque: string;
    ydesignspecialite: string;
    ydesignpays: string;
    ydesigncontactemail: string;
    ydesigncontactpersonne: string;
    ydesigncontacttelephone: string;
    ydesigncouleur1codehexa?: string;
    ydesigncouleur1dsg?: string;
    ydesigncouleur2codehexa?: string;
    ydesigncouleur2dsg?: string;
    ydesigncouleur3codehexa?: string;
    ydesigncouleur3dsg?: string;
}

interface DesignerInfoDialogProps {
    designer: Designer;
    boutiqueName: string;
    isLocked: boolean;
    children: React.ReactNode;
}

export function DesignerInfoDialog({
    designer,
    boutiqueName,
    isLocked,
    children
}: DesignerInfoDialogProps) {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Credenza open={isOpen} onOpenChange={setIsOpen}>
            <CredenzaTrigger asChild>
                {children}
            </CredenzaTrigger>
            <CredenzaContent className="max-w-2xl bg-white">
                <CredenzaHeader>
                    <CredenzaTitle className="text-gray-900 flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-600" />
                        {t('admin.designerAssignments.designerInformation')}
                    </CredenzaTitle>
                    <CredenzaDescription className="text-gray-600">
                        {t('admin.designerAssignments.designerAssignedTo')} {boutiqueName}
                    </CredenzaDescription>
                </CredenzaHeader>

                <div className="px-6 py-4 space-y-6">
                    {/* Designer Avatar and Basic Info */}
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                            <User className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900">{designer.ydesignnom}</h3>
                            <p className="text-gray-600">{designer.ydesigncontactpersonne}</p>
                            <div className="flex items-center gap-2 mt-2">
                                {isLocked && (
                                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                        <Lock className="h-3 w-3 mr-1" />
                                        {t('admin.designerAssignments.assignmentLocked')}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Brand and Specialty */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-100 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Building className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-600">{t('admin.designerAssignments.brand')}</span>
                            </div>
                            <p className="text-gray-900 font-medium">{designer.ydesignmarque}</p>
                        </div>

                        <div className="bg-gray-100 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Palette className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-600">{t('admin.designerAssignments.specialty')}</span>
                            </div>
                            <p className="text-gray-900 font-medium">{designer.ydesignspecialite}</p>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="bg-gray-100 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-600">{t('admin.designerAssignments.location')}</span>
                        </div>
                        <p className="text-gray-900 font-medium">{designer.ydesignpays}</p>
                    </div>

                    {/* Designer Colors */}
                    {(designer.ydesigncouleur1codehexa || designer.ydesigncouleur2codehexa || designer.ydesigncouleur3codehexa) && (
                        <div className="bg-gray-100 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Palette className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-600">{t('admin.designerAssignments.designerColors')}</span>
                            </div>
                            <div className="flex gap-4">
                                {designer.ydesigncouleur1codehexa && (
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-8 h-8 rounded-full border-2 border-gray-300"
                                            style={{ backgroundColor: designer.ydesigncouleur1codehexa }}
                                        />
                                        <div>
                                            <div className="text-gray-900 text-sm font-medium">
                                                {designer.ydesigncouleur1dsg || t('admin.designerAssignments.color1')}
                                            </div>
                                            <div className="text-gray-500 text-xs">
                                                {designer.ydesigncouleur1codehexa}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {designer.ydesigncouleur2codehexa && (
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-8 h-8 rounded-full border-2 border-gray-300"
                                            style={{ backgroundColor: designer.ydesigncouleur2codehexa }}
                                        />
                                        <div>
                                            <div className="text-gray-900 text-sm font-medium">
                                                {designer.ydesigncouleur2dsg || t('admin.designerAssignments.color2')}
                                            </div>
                                            <div className="text-gray-500 text-xs">
                                                {designer.ydesigncouleur2codehexa}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {designer.ydesigncouleur3codehexa && (
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-8 h-8 rounded-full border-2 border-gray-300"
                                            style={{ backgroundColor: designer.ydesigncouleur3codehexa }}
                                        />
                                        <div>
                                            <div className="text-gray-900 text-sm font-medium">
                                                {designer.ydesigncouleur3dsg || t('admin.designerAssignments.color3')}
                                            </div>
                                            <div className="text-gray-500 text-xs">
                                                {designer.ydesigncouleur3codehexa}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Contact Information */}
                    <div className="bg-gray-100 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Mail className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-600">{t('admin.designerAssignments.contactInformation')}</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-900">{designer.ydesigncontactemail}</span>
                            </div>
                            {designer.ydesigncontacttelephone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-gray-500" />
                                    <span className="text-gray-900">{designer.ydesigncontacttelephone}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {isLocked && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Lock className="h-4 w-4 text-yellow-600" />
                                <span className="text-sm font-medium text-yellow-800">{t('admin.designerAssignments.assignmentStatus')}</span>
                            </div>
                            <p className="text-yellow-700 text-sm">
                                {t('admin.designerAssignments.assignmentLockedMessage')}
                            </p>
                        </div>
                    )}
                </div>

                <CredenzaFooter>
                    <CredenzaClose asChild>
                        <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                            {t('common.close')}
                        </Button>
                    </CredenzaClose>
                </CredenzaFooter>
            </CredenzaContent>
        </Credenza>
    );
}