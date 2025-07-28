"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/hooks/useLanguage";
import { useMalls } from "../_hooks/use-malls";

interface Store {
    yboutiqueid?: number;
    yboutiqueintitule: string;
    yboutiqueadressemall?: string;
    ymallidfk?: number;
}

interface StoreFormData {
    yboutiqueintitule: string;
    yboutiqueadressemall?: string;
    ymallidfk: number;
}

interface StoreDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (storeData: StoreFormData) => Promise<void>;
    store?: Store | null;
    isLoading?: boolean;
}

export function StoreDialog({ isOpen, onClose, onSubmit, store, isLoading = false }: StoreDialogProps) {
    const { t } = useLanguage();
    const { data: malls, isLoading: mallsLoading } = useMalls();
    
    const [formData, setFormData] = useState({
        yboutiqueintitule: "",
        yboutiqueadressemall: "",
        ymallidfk: 0
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Reset form when dialog opens/closes or store changes
    useEffect(() => {
        if (isOpen) {
            if (store) {
                // Edit mode
                setFormData({
                    yboutiqueintitule: store.yboutiqueintitule || "",
                    yboutiqueadressemall: store.yboutiqueadressemall || "",
                    ymallidfk: store.ymallidfk || 0
                });
            } else {
                // Add mode - select first mall by default if available
                const defaultMallId = malls && malls.length > 0 ? malls[0].ymallid : 0;
                setFormData({
                    yboutiqueintitule: "",
                    yboutiqueadressemall: "",
                    ymallidfk: defaultMallId
                });
            }
            setFormErrors({});
        }
    }, [isOpen, store, malls]);

    const handleInputChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};
        
        if (!formData.yboutiqueintitule.trim()) {
            errors.yboutiqueintitule = t("admin.storeNameRequired");
        }

        if (!formData.ymallidfk || formData.ymallidfk === 0) {
            errors.ymallidfk = t("admin.mallRequired");
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error("Error submitting store:", error);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm border-gray-700/50 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-white">
                        {store ? t("admin.editStore") : t("admin.addStore")}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Store Name */}
                    <div className="space-y-2">
                        <Label htmlFor="storeName" className="text-white">
                            {t("admin.storeName")} *
                        </Label>
                        <Input
                            id="storeName"
                            type="text"
                            value={formData.yboutiqueintitule}
                            onChange={(e) => handleInputChange("yboutiqueintitule", e.target.value)}
                            placeholder={t("admin.storeNamePlaceholder")}
                            disabled={isLoading}
                            className={`bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-morpheus-gold-light ${
                                formErrors.yboutiqueintitule ? "border-red-500" : ""
                            }`}
                        />
                        {formErrors.yboutiqueintitule && (
                            <p className="text-red-400 text-sm">{formErrors.yboutiqueintitule}</p>
                        )}
                    </div>

                    {/* Mall Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="mallSelect" className="text-white">
                            {t("admin.mall")} *
                        </Label>
                        <Select
                            value={formData.ymallidfk.toString()}
                            onValueChange={(value) => handleInputChange("ymallidfk", parseInt(value))}
                            disabled={isLoading || mallsLoading}
                        >
                            <SelectTrigger className={`bg-gray-800/50 border-gray-600 text-white focus:border-morpheus-gold-light ${
                                formErrors.ymallidfk ? "border-red-500" : ""
                            }`}>
                                <SelectValue 
                                    placeholder={mallsLoading ? t("admin.loadingMalls") : t("admin.selectMall")}
                                    className="text-white"
                                />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-600">
                                {malls?.map((mall) => (
                                    <SelectItem 
                                        key={mall.ymallid} 
                                        value={mall.ymallid.toString()}
                                        className="text-white hover:bg-gray-700 focus:bg-gray-700"
                                    >
                                        {mall.ymallintitule}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {formErrors.ymallidfk && (
                            <p className="text-red-400 text-sm">{formErrors.ymallidfk}</p>
                        )}
                        {!mallsLoading && (!malls || malls.length === 0) && (
                            <p className="text-yellow-400 text-sm">{t("admin.noMallsAvailable")}</p>
                        )}
                    </div>

                    {/* Store Address */}
                    <div className="space-y-2">
                        <Label htmlFor="storeAddress" className="text-white">
                            {t("admin.storeAddress")}
                        </Label>
                        <Textarea
                            id="storeAddress"
                            value={formData.yboutiqueadressemall}
                            onChange={(e) => handleInputChange("yboutiqueadressemall", e.target.value)}
                            placeholder={t("admin.storeAddressPlaceholder")}
                            disabled={isLoading}
                            rows={3}
                            className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-morpheus-gold-light resize-none"
                        />
                    </div>

                    <DialogFooter className="gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800/50 hover:text-white"
                        >
                            {t("common.cancel")}
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-morpheus-gold-dark hover:to-morpheus-gold-light text-white font-semibold"
                        >
                            {isLoading
                                ? (store ? t("admin.updatingStore") : t("admin.creatingStore"))
                                : t("common.save")
                            }
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}