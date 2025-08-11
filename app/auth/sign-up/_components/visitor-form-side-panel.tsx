"use client";

import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export type VisitorFormData = {
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

interface VisitorFormSidePanelProps {
    onDataChange: (data: VisitorFormData) => void;
    initialData?: VisitorFormData;
}

const defaultVisitorFormData: VisitorFormData = {
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
};

export function VisitorFormSidePanel({ onDataChange, initialData }: VisitorFormSidePanelProps) {
    const [formData, setFormData] = useState<VisitorFormData>(initialData || defaultVisitorFormData);
    const { t } = useLanguage();

    const handleInputChange = (field: keyof Omit<VisitorFormData, "visitorTypes">, value: string) => {
        const newData = {
            ...formData,
            [field]: value,
        };
        setFormData(newData);
        onDataChange(newData);
    };

    const handleVisitorTypeChange = (type: keyof VisitorFormData["visitorTypes"], checked: boolean) => {
        const newData = {
            ...formData,
            visitorTypes: {
                ...formData.visitorTypes,
                [type]: checked,
            },
        };
        setFormData(newData);
        onDataChange(newData);
    };

    return (
        <div className="w-full max-w-md">
            <Card className="bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light border border-slate-700 shadow-2xl h-full">
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-morpheus-gold-light flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        {t("visitorForm.additionalInfo")}
                    </CardTitle>
                    <p className="text-gray-300 text-sm">{t("visitorForm.helpUsKnowYouBetter")}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Contact Information */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-white text-sm font-medium">
                                {t("visitorForm.phone")}
                            </Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleInputChange("phone", e.target.value)}
                                className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 h-10 text-sm focus:border-morpheus-gold-light focus:ring-morpheus-gold-light rounded-none"
                                placeholder={t("visitorForm.phonePlaceholder")}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address" className="text-white text-sm font-medium">
                                {t("visitorForm.address")}
                            </Label>
                            <Input
                                id="address"
                                type="text"
                                value={formData.address}
                                onChange={(e) => handleInputChange("address", e.target.value)}
                                className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 h-10 text-sm focus:border-morpheus-gold-light focus:ring-morpheus-gold-light rounded-none"
                                placeholder={t("visitorForm.addressPlaceholder")}
                            />
                        </div>
                    </div>

                    {/* Visitor Types */}
                    <div className="space-y-4">
                        <div>
                            <Label className="text-white text-sm font-medium">{t("visitorForm.visitorTypes")}</Label>
                            <p className="text-gray-400 text-xs mt-1">{t("visitorForm.selectAllThatApply")}</p>
                        </div>

                        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                            {[
                                "grandpublic",
                                "clientprive",
                                "acheteurluxe",
                                "acheteurpro",
                                "artisan",
                                "createur",
                                "collectionneur",
                                "investisseur",
                                "influenceur",
                                "journaliste",
                                "pressespecialisee",
                                "culturel",
                                "vip",
                            ].map((key) => (
                                <label
                                    key={key}
                                    className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-morpheus-blue-dark/30 transition-colors"
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.visitorTypes[key as keyof VisitorFormData["visitorTypes"]]}
                                        onChange={(e) =>
                                            handleVisitorTypeChange(
                                                key as keyof VisitorFormData["visitorTypes"],
                                                e.target.checked
                                            )
                                        }
                                        className="w-3 h-3 text-morpheus-gold-light bg-morpheus-blue-dark border-morpheus-gold-dark/30 rounded focus:ring-morpheus-gold-light focus:ring-1"
                                    />
                                    <span className="text-gray-300 text-xs">{t(`visitorForm.visitorTypeLabels.${key}`)}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
