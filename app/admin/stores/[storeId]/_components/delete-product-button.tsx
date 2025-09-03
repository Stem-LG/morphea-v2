"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useProductHasOrders } from "../_hooks/use-product-has-orders";

interface Product {
    yprodid: number;
    yprodstatut: string;
    yvarprod?: any[];
}

interface DeleteButtonProps {
    product: Product;
    onDelete: (product: Product) => void;
    getProductStatus: (product: Product) => string;
}

export function DeleteProductButton({ product, onDelete, getProductStatus }: DeleteButtonProps) {
    const { t } = useLanguage();
    const { data: user } = useAuth();
    const { data: hasOrders, isLoading: ordersLoading } = useProductHasOrders(product.yprodid);

    const isAdmin = user?.app_metadata?.roles?.includes("admin");
    const isStoreAdmin = user?.app_metadata?.roles?.includes("store_admin");

    // Helper function to check if product can be deleted
    const canDeleteProduct = () => {
        // If orders are loading, disable the button
        if (ordersLoading) return false;
        
        // If product has orders, cannot delete
        if (hasOrders) return false;

        // Check role-based permissions
        if (isAdmin) {
            // Admin can delete non-rejected products
            return getProductStatus(product) !== 'rejected';
        }
        
        if (isStoreAdmin) {
            // Store admin can only delete pending products
            return getProductStatus(product) === 'pending';
        }
        
        return false;
    };

    const getDisabledReason = () => {
        if (ordersLoading) return t('admin.checkingOrders') || "Checking orders...";
        if (hasOrders) return t('admin.cannotDeleteProductWithOrders') || "Cannot delete product with existing orders";
        if (!canDeleteProduct()) return t('admin.cannotDeleteProduct') || "Cannot delete product";
        return "";
    };

    const canDelete = canDeleteProduct();

    return (
        <Button
            size="sm"
            variant="ghost"
            onClick={() => canDelete && onDelete(product)}
            disabled={!canDelete || ordersLoading}
            className={`h-8 w-8 p-0 ${
                canDelete && !ordersLoading
                    ? "text-gray-600 hover:text-red-600 hover:bg-red-50"
                    : "text-gray-400 cursor-not-allowed"
            }`}
            title={canDelete ? t('admin.deleteProduct') : getDisabledReason()}
        >
            <Trash2 className="h-3 w-3" />
        </Button>
    );
}