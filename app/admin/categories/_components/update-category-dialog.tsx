"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tag, Save, X } from "lucide-react";
import { toast } from "sonner";
import {
    Credenza,
    CredenzaTrigger,
    CredenzaContent,
    CredenzaHeader,
    CredenzaTitle,
    CredenzaBody,
    CredenzaFooter,
} from "@/components/ui/credenza";
import { useUpdateCategory } from "@/hooks/useCategories";

interface CategoryFormData {
    xcategprodintitule: string;
    xcategprodcode: string;
    xcategprodinfobulle: string;
}

interface CategoryData {
    xcategprodid: number;
    xcategprodintitule: string;
    xcategprodcode: string;
    xcategprodinfobulle: string;
}

interface UpdateCategoryDialogProps {
    children: React.ReactNode;
    category: CategoryData;
}

export function UpdateCategoryDialog({ children, category }: UpdateCategoryDialogProps) {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState<CategoryFormData>({
        xcategprodintitule: "",
        xcategprodcode: "",
        xcategprodinfobulle: ""
    });

    const updateCategoryMutation = useUpdateCategory();

    // Initialize form data when category changes or dialog opens
    useEffect(() => {
        if (category && isOpen) {
            setFormData({
                xcategprodintitule: category.xcategprodintitule || "",
                xcategprodcode: category.xcategprodcode || "",
                xcategprodinfobulle: category.xcategprodinfobulle || ""
            });
        }
    }, [category, isOpen]);

    const resetForm = () => {
        if (category) {
            setFormData({
                xcategprodintitule: category.xcategprodintitule || "",
                xcategprodcode: category.xcategprodcode || "",
                xcategprodinfobulle: category.xcategprodinfobulle || ""
            });
        }
    };

    const validateForm = () => {
        return formData.xcategprodintitule.trim() !== "" &&
               formData.xcategprodcode.trim() !== "" &&
               formData.xcategprodinfobulle.trim() !== "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error(t("admin.categories.fillRequiredFields"));
            return;
        }

        try {
            await updateCategoryMutation.mutateAsync({
                categoryId: category.xcategprodid,
                updates: formData
            });
            setIsOpen(false);
            toast.success(t("admin.categories.categoryUpdatedSuccess"));
        } catch (error) {
            console.error('Failed to update category:', error);
            const errorMessage = error instanceof Error ? error.message : t("admin.categories.failedToUpdateCategory");
            toast.error(errorMessage);
        }
    };

    const handleDialogChange = (open: boolean) => {
        if (!open) {
            resetForm();
        }
        setIsOpen(open);
    };

    return (
        <Credenza open={isOpen} onOpenChange={handleDialogChange}>
            <CredenzaTrigger asChild>{children}</CredenzaTrigger>
            <CredenzaContent className="bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light border-slate-700/50 max-w-2xl">
                <CredenzaHeader>
                    <CredenzaTitle className="text-white flex items-center gap-2">
                        <Tag className="h-5 w-5 text-morpheus-gold-light" />
                        {t("admin.categories.editCategory")}
                    </CredenzaTitle>
                </CredenzaHeader>

                <form onSubmit={handleSubmit}>
                    <CredenzaBody className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-gray-300">{t("admin.categories.categoryName")} *</Label>
                                <Input
                                    value={formData.xcategprodintitule}
                                    onChange={(e) => setFormData(prev => ({ ...prev, xcategprodintitule: e.target.value }))}
                                    className="bg-morpheus-blue-dark/30 border-slate-600 text-white"
                                    placeholder={t("admin.categories.categoryNamePlaceholder")}
                                    required
                                    disabled={updateCategoryMutation.isPending}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-300">{t("admin.categories.categoryCode")} *</Label>
                                <Input
                                    value={formData.xcategprodcode}
                                    onChange={(e) => setFormData(prev => ({ ...prev, xcategprodcode: e.target.value.toUpperCase() }))}
                                    className="bg-morpheus-blue-dark/30 border-slate-600 text-white"
                                    placeholder={t("admin.categories.categoryCodePlaceholder")}
                                    required
                                    disabled={updateCategoryMutation.isPending}
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Label className="text-gray-300">{t("admin.categories.description")} *</Label>
                            <Textarea
                                value={formData.xcategprodinfobulle}
                                onChange={(e) => setFormData(prev => ({ ...prev, xcategprodinfobulle: e.target.value }))}
                                className="bg-morpheus-blue-dark/30 border-slate-600 text-white"
                                placeholder={t("admin.categories.descriptionPlaceholder")}
                                rows={3}
                                required
                                disabled={updateCategoryMutation.isPending}
                            />
                        </div>
                    </CredenzaBody>

                    <CredenzaFooter className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={updateCategoryMutation.isPending}
                            className="flex-1 border-slate-600 text-gray-300 hover:bg-slate-700/50"
                        >
                            <X className="h-4 w-4 mr-2" />
                            {t("common.cancel")}
                        </Button>
                        <Button
                            type="submit"
                            disabled={!validateForm() || updateCategoryMutation.isPending}
                            className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {updateCategoryMutation.isPending ? t("admin.categories.updating") : t("admin.categories.updateCategory")}
                        </Button>
                    </CredenzaFooter>
                </form>
            </CredenzaContent>
        </Credenza>
    );
}