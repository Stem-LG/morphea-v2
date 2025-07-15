"use client";

import { useCart } from "@/hooks/useCart";
import { useLanguage } from "@/hooks/useLanguage";
import Image from "next/image";

interface CartModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CartModal({ isOpen, onClose }: CartModalProps) {
    const { cart, removeFromCart, updateQuantity, isLoading } = useCart();
    const { t } = useLanguage();

    if (!isOpen) return null;

    const totalItems = cart.reduce((sum, item) => sum + item.yquantite, 0);

    return (
        <div className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-sm">
            <div className="relative w-full h-full bg-gradient-to-br from-morpheus-blue-dark via-morpheus-blue-dark/95 to-morpheus-blue-light/90 backdrop-blur-md shadow-2xl shadow-black/50 overflow-hidden">
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 via-black/30 to-transparent backdrop-blur-sm p-4 lg:p-6 border-b border-morpheus-gold-dark/20">
                    <div className="flex justify-between items-center">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold font-parisienne bg-gradient-to-r from-morpheus-gold-dark via-morpheus-gold-light to-morpheus-gold-dark bg-clip-text text-transparent drop-shadow-lg">
                                {t('cart.title')} ({totalItems})
                            </h1>
                        </div>
                        <button
                            onClick={onClose}
                            className="group relative p-2 text-white/80 hover:text-morpheus-gold-light transition-all duration-300 hover:rotate-90 flex-shrink-0"
                        >
                            <div className="absolute inset-0 bg-morpheus-gold-light/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                            <svg className="relative w-6 h-6 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="pt-20 lg:pt-24 h-full overflow-y-auto p-4 lg:p-6 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="w-12 h-12 border-4 border-morpheus-gold-dark border-t-morpheus-gold-light animate-spin rounded-full"></div>
                        </div>
                    ) : cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <h3 className="text-lg font-semibold text-white mb-2">{t('cart.empty')}</h3>
                            <p className="text-gray-400">{t('cart.emptyDescription')}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cart.map((item) => (
                                <div key={item.id} className="bg-morpheus-blue-dark/30 backdrop-blur-sm rounded-lg p-4 border border-morpheus-gold-dark/20">
                                    <div className="flex gap-4">
                                        {/* Product Image */}
                                        <div className="w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0">
                                            <Image
                                                src={item.yproduit?.imageurl || '/placeholder-product.jpg'}
                                                alt={item.yproduit?.yproduitintitule || 'Product'}
                                                width={80}
                                                height={80}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-white font-semibold mb-1 truncate">
                                                {item.yproduit?.yproduitintitule || 'Unknown Product'}
                                            </h3>
                                            {item.ycouleur && (
                                                <p className="text-gray-400 text-sm mb-2">
                                                    {t('cart.color')}: {item.ycouleur}
                                                </p>
                                            )}
                                            
                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => updateQuantity({ itemId: item.id, quantity: item.yquantite - 1 })}
                                                    className="w-8 h-8 rounded-lg border-2 border-morpheus-gold-dark/30 text-white hover:border-morpheus-gold-light hover:bg-morpheus-gold-dark/20 transition-all duration-300 flex items-center justify-center text-lg font-semibold"
                                                >
                                                    −
                                                </button>
                                                <span className="text-white text-lg font-bold w-8 text-center">{item.yquantite}</span>
                                                <button
                                                    onClick={() => updateQuantity({ itemId: item.id, quantity: item.yquantite + 1 })}
                                                    className="w-8 h-8 rounded-lg border-2 border-morpheus-gold-dark/30 text-white hover:border-morpheus-gold-light hover:bg-morpheus-gold-dark/20 transition-all duration-300 flex items-center justify-center text-lg font-semibold"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        {/* Remove Button */}
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-red-400 hover:text-red-300 transition-colors p-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Checkout Button */}
                            {cart.length > 0 && (
                                <div className="mt-6 pt-4 border-t border-morpheus-gold-dark/20">
                                    <button className="w-full bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white py-3 px-6 font-semibold rounded-lg shadow-lg hover:shadow-morpheus-gold-light/30 transition-all duration-300">
                                        {t('cart.checkout')} ({totalItems} {t('cart.items')})
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}