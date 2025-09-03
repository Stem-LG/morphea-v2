"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { useLanguage } from "@/hooks/useLanguage";
import { AlertTriangle } from "lucide-react";

interface DeleteProductDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    productName: string;
    isLoading?: boolean;
}

export function DeleteProductDialog({
    isOpen,
    onClose,
    onConfirm,
    productName,
    isLoading = false
}: DeleteProductDialogProps) {
    const { t } = useLanguage();

    const handleClose = () => {
        if (!isLoading) {
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-white border-red-200 text-gray-900 sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <DialogTitle className="text-xl font-semibold text-gray-900">
                            {t("admin.deleteProduct")}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <div className="space-y-4">
                    <p className="text-gray-900">
                        Are you sure you want to delete this product? This action cannot be undone.
                    </p>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-700 font-medium text-center">
                            &ldquo;{productName}&rdquo;
                        </p>
                    </div>
                    <p className="text-gray-600 text-sm">
                        This will permanently delete the product and all its variants, images, and associated data.
                    </p>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={isLoading}
                        className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                        {t("common.cancel")}
                    </Button>
                    <Button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold"
                    >
                        {isLoading ? "Deleting..." : t("common.delete")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}