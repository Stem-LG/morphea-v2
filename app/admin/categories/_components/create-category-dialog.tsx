"use client";

import { useState } from "react";
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
import { useCreateCategory } from "@/hooks/useCategories";

interface CategoryFormData {
    xcategprodintitule: string;
    xcategprodcode: string;
    xcategprodinfobulle: string;
}

interface CreateCategoryDialogProps {
    children: React.ReactNode;
}

export function CreateCategoryDialog({ children }: CreateCategoryDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState<CategoryFormData>({
        xcategprodintitule: "",
        xcategprodcode: "",
        xcategprodinfobulle: ""
    });

    const createCategoryMutation = useCreateCategory();

    const resetForm = () => {
        setFormData({
            xcategprodintitule: "",
            xcategprodcode: "",
            xcategprodinfobulle: ""
        });
    };

    const validateForm = () => {
        return formData.xcategprodintitule.trim() !== "" &&
               formData.xcategprodcode.trim() !== "" &&
               formData.xcategprodinfobulle.trim() !== "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            await createCategoryMutation.mutateAsync(formData);
            resetForm();
            setIsOpen(false);
            toast.success("Category created successfully");
        } catch (error) {
            console.error('Failed to create category:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to create category';
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
                        Add New Category
                    </CredenzaTitle>
                </CredenzaHeader>

                <form onSubmit={handleSubmit}>
                    <CredenzaBody className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-gray-300">Category Name *</Label>
                                <Input
                                    value={formData.xcategprodintitule}
                                    onChange={(e) => setFormData(prev => ({ ...prev, xcategprodintitule: e.target.value }))}
                                    className="bg-morpheus-blue-dark/30 border-slate-600 text-white"
                                    placeholder="e.g., Electronics"
                                    required
                                    disabled={createCategoryMutation.isPending}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-300">Category Code *</Label>
                                <Input
                                    value={formData.xcategprodcode}
                                    onChange={(e) => setFormData(prev => ({ ...prev, xcategprodcode: e.target.value.toUpperCase() }))}
                                    className="bg-morpheus-blue-dark/30 border-slate-600 text-white"
                                    placeholder="e.g., ELEC"
                                    required
                                    disabled={createCategoryMutation.isPending}
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Label className="text-gray-300">Description *</Label>
                            <Textarea
                                value={formData.xcategprodinfobulle}
                                onChange={(e) => setFormData(prev => ({ ...prev, xcategprodinfobulle: e.target.value }))}
                                className="bg-morpheus-blue-dark/30 border-slate-600 text-white"
                                placeholder="Describe this category..."
                                rows={3}
                                required
                                disabled={createCategoryMutation.isPending}
                            />
                        </div>
                    </CredenzaBody>

                    <CredenzaFooter className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={createCategoryMutation.isPending}
                            className="flex-1 border-slate-600 text-gray-300 hover:bg-slate-700/50"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!validateForm() || createCategoryMutation.isPending}
                            className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {createCategoryMutation.isPending ? 'Creating...' : 'Create Category'}
                        </Button>
                    </CredenzaFooter>
                </form>
            </CredenzaContent>
        </Credenza>
    );
}