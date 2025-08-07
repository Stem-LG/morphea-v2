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
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Credenza open={isOpen} onOpenChange={setIsOpen}>
            <CredenzaTrigger asChild>
                {children}
            </CredenzaTrigger>
            <CredenzaContent className="max-w-2xl bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light">
                <CredenzaHeader>
                    <CredenzaTitle className="text-white flex items-center gap-2">
                        <User className="h-5 w-5 text-morpheus-gold-light" />
                        Designer Information
                    </CredenzaTitle>
                    <CredenzaDescription className="text-gray-300">
                        Designer assigned to {boutiqueName}
                    </CredenzaDescription>
                </CredenzaHeader>

                <div className="px-6 py-4 space-y-6">
                    {/* Designer Avatar and Basic Info */}
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-r from-morpheus-purple to-morpheus-blue flex items-center justify-center">
                            <User className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-semibold text-white">{designer.ydesignnom}</h3>
                            <p className="text-gray-300">{designer.ydesigncontactpersonne}</p>
                            <div className="flex items-center gap-2 mt-2">
                                {isLocked && (
                                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                                        <Lock className="h-3 w-3 mr-1" />
                                        Assignment Locked
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Brand and Specialty */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-700/30 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Building className="h-4 w-4 text-morpheus-gold-light" />
                                <span className="text-sm font-medium text-morpheus-gold-light">Brand</span>
                            </div>
                            <p className="text-white font-medium">{designer.ydesignmarque}</p>
                        </div>

                        <div className="bg-gray-700/30 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Palette className="h-4 w-4 text-morpheus-gold-light" />
                                <span className="text-sm font-medium text-morpheus-gold-light">Specialty</span>
                            </div>
                            <p className="text-white font-medium">{designer.ydesignspecialite}</p>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="bg-gray-700/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-4 w-4 text-morpheus-gold-light" />
                            <span className="text-sm font-medium text-morpheus-gold-light">Location</span>
                        </div>
                        <p className="text-white font-medium">{designer.ydesignpays}</p>
                    </div>

                    {/* Designer Colors */}
                    {(designer.ydesigncouleur1codehexa || designer.ydesigncouleur2codehexa || designer.ydesigncouleur3codehexa) && (
                        <div className="bg-gray-700/30 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Palette className="h-4 w-4 text-morpheus-gold-light" />
                                <span className="text-sm font-medium text-morpheus-gold-light">Designer Colors</span>
                            </div>
                            <div className="flex gap-4">
                                {designer.ydesigncouleur1codehexa && (
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-8 h-8 rounded-full border-2 border-gray-500"
                                            style={{ backgroundColor: designer.ydesigncouleur1codehexa }}
                                        />
                                        <div>
                                            <div className="text-white text-sm font-medium">
                                                {designer.ydesigncouleur1dsg || 'Color 1'}
                                            </div>
                                            <div className="text-gray-400 text-xs">
                                                {designer.ydesigncouleur1codehexa}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {designer.ydesigncouleur2codehexa && (
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-8 h-8 rounded-full border-2 border-gray-500"
                                            style={{ backgroundColor: designer.ydesigncouleur2codehexa }}
                                        />
                                        <div>
                                            <div className="text-white text-sm font-medium">
                                                {designer.ydesigncouleur2dsg || 'Color 2'}
                                            </div>
                                            <div className="text-gray-400 text-xs">
                                                {designer.ydesigncouleur2codehexa}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {designer.ydesigncouleur3codehexa && (
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-8 h-8 rounded-full border-2 border-gray-500"
                                            style={{ backgroundColor: designer.ydesigncouleur3codehexa }}
                                        />
                                        <div>
                                            <div className="text-white text-sm font-medium">
                                                {designer.ydesigncouleur3dsg || 'Color 3'}
                                            </div>
                                            <div className="text-gray-400 text-xs">
                                                {designer.ydesigncouleur3codehexa}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Contact Information */}
                    <div className="bg-gray-700/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Mail className="h-4 w-4 text-morpheus-gold-light" />
                            <span className="text-sm font-medium text-morpheus-gold-light">Contact Information</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="text-white">{designer.ydesigncontactemail}</span>
                            </div>
                            {designer.ydesigncontacttelephone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    <span className="text-white">{designer.ydesigncontacttelephone}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {isLocked && (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Lock className="h-4 w-4 text-yellow-400" />
                                <span className="text-sm font-medium text-yellow-400">Assignment Status</span>
                            </div>
                            <p className="text-yellow-300 text-sm">
                                This designer assignment is locked because products have been created for this boutique. 
                                The assignment cannot be changed.
                            </p>
                        </div>
                    )}
                </div>

                <CredenzaFooter>
                    <CredenzaClose asChild>
                        <Button variant="outline" className="border-gray-600 text-gray-300">
                            Close
                        </Button>
                    </CredenzaClose>
                </CredenzaFooter>
            </CredenzaContent>
        </Credenza>
    );
}