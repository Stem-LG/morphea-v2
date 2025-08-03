"use client";

import { useLanguage } from "@/hooks/useLanguage";
import { useCart } from "@/app/_hooks/cart/useCart";
import { useUpdateCart } from "@/app/_hooks/cart/useUpdateCart";
import { useDeleteFromCart } from "@/app/_hooks/cart/useDeleteFromCart";
import {
    Credenza,
    CredenzaContent,
    CredenzaHeader,
    CredenzaTitle,
    CredenzaBody,
    CredenzaFooter,
} from "@/components/ui/credenza";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";

interface CartDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CartDialog({ isOpen, onClose }: CartDialogProps) {
    const { t } = useLanguage();
    const { data: cartItems = [], isLoading } = useCart();
    const updateCartMutation = useUpdateCart();
    const deleteFromCartMutation = useDeleteFromCart();

    const handleQuantityChange = (ypanierid: number, newQuantity: number) => {
        if (newQuantity <= 0) {
            deleteFromCartMutation.mutate({ ypanierid });
        } else {
            updateCartMutation.mutate({ ypanierid, ypanierqte: newQuantity });
        }
    };

    const handleRemoveItem = (ypanierid: number) => {
        deleteFromCartMutation.mutate({ ypanierid });
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            const price = item.yvarprod?.yvarprodprixpromotion || item.yvarprod?.yvarprodprixcatalogue || 0;
            return total + price * item.ypanierqte;
        }, 0);
    };

    const handleCheckout = () => {
        // Implementation for checkout
        console.log("Proceeding to checkout with items:", cartItems);
        // You would redirect to checkout page here
        onClose();
    };

    return (
        <Credenza open={isOpen} onOpenChange={onClose}>
            <CredenzaContent className="max-w-2xl max-h-[80vh] bg-gradient-to-br from-morpheus-blue-dark via-morpheus-blue-dark/95 to-morpheus-blue-light/90 backdrop-blur-md border border-morpheus-gold-dark/20">
                <CredenzaHeader>
                    <CredenzaTitle className="flex items-center gap-2 text-white">
                        <ShoppingCart className="w-5 h-5 text-morpheus-gold-light" />
                        {t("cart.title") || "Shopping Cart"}
                        {cartItems.length > 0 && (
                            <span className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white text-xs px-2 py-1 rounded-full">
                                {cartItems.length}
                            </span>
                        )}
                    </CredenzaTitle>
                </CredenzaHeader>

                <CredenzaBody className="max-h-96 overflow-y-auto bg-transparent">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="w-8 h-8 border-2 border-morpheus-gold-dark border-t-transparent animate-spin rounded-full"></div>
                        </div>
                    ) : cartItems.length === 0 ? (
                        <div className="text-center py-8">
                            <ShoppingCart className="w-16 h-16 mx-auto text-morpheus-gold-light/50 mb-4" />
                            <h3 className="text-lg font-medium text-white mb-2">
                                {t("cart.empty") || "Your cart is empty"}
                            </h3>
                            <p className="text-gray-300">{t("cart.emptyMessage") || "Add some items to get started"}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cartItems.map((item) => (
                                <div
                                    key={item.ypanierid}
                                    className="flex items-center gap-4 p-4 border border-morpheus-gold-dark/20 rounded-lg bg-white/5 backdrop-blur-sm"
                                >
                                    {/* Product Image */}
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        {(item.yvarprod as any)?.yvarprodmedia?.[0]?.ymedia?.ymediaurl ? (
                                            <Image
                                                src={(item.yvarprod as any).yvarprodmedia[0].ymedia.ymediaurl}
                                                alt={item.yvarprod?.yvarprodintitule || "Product"}
                                                width={64}
                                                height={64}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <ShoppingCart className="w-6 h-6" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Details */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-white truncate">
                                            {item.yvarprod?.yvarprodintitule || "Unknown Product"}
                                        </h4>
                                        <div className="flex items-center gap-2 text-sm text-gray-300">
                                            {item.yvarprod?.xcouleur && (
                                                <span className="flex items-center gap-1">
                                                    <div
                                                        className="w-3 h-3 rounded-full border"
                                                        style={{ backgroundColor: item.yvarprod.xcouleur.xcouleurhexa }}
                                                    />
                                                    {item.yvarprod.xcouleur.xcouleurintitule}
                                                </span>
                                            )}
                                            {item.yvarprod?.xtaille && (
                                                <span>• {item.yvarprod.xtaille.xtailleintitule}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-morpheus-gold-dark">
                                                    $
                                                    {(
                                                        item.yvarprod?.yvarprodprixpromotion ||
                                                        item.yvarprod?.yvarprodprixcatalogue ||
                                                        0
                                                    ).toFixed(2)}
                                                </span>
                                                {item.yvarprod?.yvarprodprixpromotion &&
                                                    item.yvarprod?.yvarprodprixcatalogue && (
                                                        <span className="text-sm text-gray-300 line-through">
                                                            ${item.yvarprod.yvarprodprixcatalogue.toFixed(2)}
                                                        </span>
                                                    )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleQuantityChange(item.ypanierid, item.ypanierqte - 1)}
                                            disabled={updateCartMutation.isPending || deleteFromCartMutation.isPending}
                                            className="w-8 h-8 p-0 border-morpheus-gold-dark/30 text-white hover:bg-morpheus-gold-dark/20"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </Button>
                                        <span className="w-8 text-center font-medium text-white">
                                            {item.ypanierqte}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleQuantityChange(item.ypanierid, item.ypanierqte + 1)}
                                            disabled={updateCartMutation.isPending || deleteFromCartMutation.isPending}
                                            className="w-8 h-8 p-0 border-morpheus-gold-dark/30 text-white hover:bg-morpheus-gold-dark/20"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </Button>
                                    </div>

                                    {/* Remove Button */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveItem(item.ypanierid)}
                                        disabled={deleteFromCartMutation.isPending}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CredenzaBody>

                {cartItems.length > 0 && (
                    <CredenzaFooter className="flex gap-4 bg-transparent">
                        <div className="flex flex-1 gap-2 items-center text-lg font-semibold">
                            <span className="text-white">{t("cart.total") || "Total"}</span>
                            <span className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light bg-clip-text text-transparent">
                                ${calculateTotal().toFixed(2)}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="flex-1 border-morpheus-gold-dark/30 text-white hover:bg-morpheus-gold-dark/20"
                            >
                                {t("cart.continueShopping") || "Continue Shopping"}
                            </Button>
                            <Button
                                onClick={handleCheckout}
                                className="flex-1 bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-morpheus-gold-light hover:to-morpheus-gold-dark text-white"
                            >
                                {t("cart.checkout") || "Checkout"}
                            </Button>
                        </div>
                    </CredenzaFooter>
                )}
            </CredenzaContent>
        </Credenza>
    );
}
