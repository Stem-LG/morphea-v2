"use client";

import { useCart } from "@/hooks/useCart";
import { useLanguage } from "@/hooks/useLanguage";
import { useState } from "react";
import Link from "next/link";

export default function CartPage() {
    const { cart, updateQuantity, removeFromCart, isLoading } = useCart();
    const { t } = useLanguage();
    const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());

    const totalItems = cart.reduce((sum, item) => sum + item.ypanierqte, 0);
    const totalPrice = cart.reduce((sum, item) => {
        const price = item.yvarprod?.yvarprodprixpromotion || item.yvarprod?.yvarprodprixcatalogue || 99;
        return sum + price * item.ypanierqte;
    }, 0);

    const handleQuantityChange = async (itemId: number, newQuantity: number) => {
        if (newQuantity < 1) return;

        setUpdatingItems((prev) => new Set(prev).add(itemId));
        try {
            await updateQuantity({ itemId, quantity: newQuantity });
        } finally {
            setUpdatingItems((prev) => {
                const newSet = new Set(prev);
                newSet.delete(itemId);
                return newSet;
            });
        }
    };

    const handleRemoveItem = async (itemId: number) => {
        setUpdatingItems((prev) => new Set(prev).add(itemId));
        try {
            await removeFromCart(itemId);
        } finally {
            setUpdatingItems((prev) => {
                const newSet = new Set(prev);
                newSet.delete(itemId);
                return newSet;
            });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-morpheus-blue-dark via-morpheus-blue-light to-morpheus-blue-dark">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="w-12 h-12 border-4 border-morpheus-gold-dark border-t-morpheus-gold-light animate-spin rounded-full"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-morpheus-blue-dark via-morpheus-blue-light to-morpheus-blue-dark">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold font-parisienne bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light bg-clip-text text-transparent mb-4">
                        {t('cart.title')}
                    </h1>
                    <p className="text-gray-300">
                        {totalItems} {totalItems === 1 ? t('cart.oneItem') : t('cart.multipleItems')} {t('cart.inYourCart')}
                    </p>
                </div>

                {cart.length === 0 ? (
                    /* Empty Cart */
                    <div className="text-center py-16">
                        <div className="w-24 h-24 bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-semibold text-white mb-4">{t('cart.empty')}</h2>
                        <p className="text-gray-300 mb-8">{t('cart.emptyDescription')}</p>
                        <Link
                            href="/main"
                            className="inline-block bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white px-8 py-3 font-semibold hover:from-morpheus-gold-light hover:to-morpheus-gold-dark transition-all duration-300"
                        >
                            {t('cart.continueShopping')}
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cart.map((item) => (
                                <div
                                    key={item.ypanierid}
                                    className="bg-gradient-to-br from-morpheus-blue-dark/60 to-morpheus-blue-light/40 border border-morpheus-gold-dark/30 p-6 backdrop-blur-sm"
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Product Image */}
                                        <div className="w-20 h-20 bg-gradient-to-br from-morpheus-gold-dark/20 to-morpheus-gold-light/20 border border-morpheus-gold-dark/40 flex items-center justify-center flex-shrink-0">
                                            {/* Note: No image URL available in current schema */}
                                            {false ? (
                                                <img
                                                    src=""
                                                    alt={item.yvarprod?.yprod?.yprodintitule || "Product"}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <svg
                                                    className="w-8 h-8 text-morpheus-gold-light"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                    />
                                                </svg>
                                            )}
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-1">
                                            <h3 className="text-white font-semibold text-lg mb-1">
                                                {item.yvarprod?.yvarprodintitule || item.yvarprod?.yprod?.yprodintitule || t('cart.unknownProduct')}
                                            </h3>
                                            {item.yvarprod?.yprod?.yproddetailstech && (
                                                <p className="text-gray-300 text-sm mb-2 line-clamp-2">
                                                    {item.yvarprod.yprod.yproddetailstech}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-4">
                                                <span className="text-morpheus-gold-light font-semibold">
                                                    ${(item.yvarprod?.yvarprodprixpromotion || item.yvarprod?.yvarprodprixcatalogue || 99).toFixed(2)}
                                                </span>
                                                {item.yvarprod?.xcouleur && (
                                                    <span className="text-gray-300 text-sm">
                                                        {item.yvarprod.xcouleur.xcouleurintitule}
                                                    </span>
                                                )}
                                                {item.yvarprod?.xtaille && (
                                                    <span className="text-gray-300 text-sm">
                                                        {item.yvarprod.xtaille.xtailleintitule}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleQuantityChange(item.ypanierid, item.ypanierqte - 1)}
                                                disabled={updatingItems.has(item.ypanierid) || item.ypanierqte <= 1}
                                                className="w-8 h-8 bg-gradient-to-r from-morpheus-gold-dark/20 to-morpheus-gold-light/20 border border-morpheus-gold-dark/40 text-morpheus-gold-light flex items-center justify-center hover:from-morpheus-gold-dark/30 hover:to-morpheus-gold-light/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                -
                                            </button>
                                            <span className="text-white font-semibold min-w-[2rem] text-center">
                                                {updatingItems.has(item.ypanierid) ? (
                                                    <div className="w-4 h-4 border-2 border-morpheus-gold-dark border-t-morpheus-gold-light animate-spin rounded-full mx-auto"></div>
                                                ) : (
                                                    item.ypanierqte
                                                )}
                                            </span>
                                            <button
                                                onClick={() => handleQuantityChange(item.ypanierid, item.ypanierqte + 1)}
                                                disabled={updatingItems.has(item.ypanierid)}
                                                className="w-8 h-8 bg-gradient-to-r from-morpheus-gold-dark/20 to-morpheus-gold-light/20 border border-morpheus-gold-dark/40 text-morpheus-gold-light flex items-center justify-center hover:from-morpheus-gold-dark/30 hover:to-morpheus-gold-light/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                +
                                            </button>
                                        </div>

                                        {/* Remove Button */}
                                        <button
                                            onClick={() => handleRemoveItem(item.ypanierid)}
                                            disabled={updatingItems.has(item.ypanierid)}
                                            className="text-red-400 hover:text-red-300 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                            title={t('cart.removeFromCart')}
                                        >
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Item Total */}
                                    <div className="mt-4 pt-4 border-t border-morpheus-gold-dark/30">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-300">{t('cart.itemTotal')}:</span>
                                            <span className="text-morpheus-gold-light font-semibold">
                                                ${((item.yvarprod?.yvarprodprixpromotion || item.yvarprod?.yvarprodprixcatalogue || 99) * item.ypanierqte).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-gradient-to-br from-morpheus-blue-dark/60 to-morpheus-blue-light/40 border border-morpheus-gold-dark/30 p-6 backdrop-blur-sm sticky top-4">
                                <h2 className="text-xl font-semibold text-white mb-6">{t('cart.orderSummary')}</h2>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-300">{t('cart.items')} ({totalItems}):</span>
                                        <span className="text-white">${totalPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-300">{t('cart.shipping')}:</span>
                                        <span className="text-white">{t('cart.free')}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-300">{t('cart.tax')}:</span>
                                        <span className="text-white">{t('cart.calculatedAtCheckout')}</span>
                                    </div>
                                    <div className="border-t border-morpheus-gold-dark/30 pt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-semibold text-white">{t('cart.total')}:</span>
                                            <span className="text-xl font-bold text-morpheus-gold-light">
                                                ${totalPrice.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button className="w-full bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white py-3 px-6 font-semibold hover:from-morpheus-gold-light hover:to-morpheus-gold-dark transition-all duration-300 mb-4">
                                    {t('cart.proceedToCheckout')}
                                </button>

                                <Link
                                    href="/main"
                                    className="block w-full text-center bg-gradient-to-r from-morpheus-gold-dark/20 to-morpheus-gold-light/20 border border-morpheus-gold-dark/40 text-morpheus-gold-light py-3 px-6 font-medium hover:from-morpheus-gold-dark/30 hover:to-morpheus-gold-light/30 transition-all duration-300"
                                >
                                    {t('cart.continueShopping')}
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
