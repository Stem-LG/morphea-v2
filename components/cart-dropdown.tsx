"use client";

import { useCart } from "@/hooks/useCart";
import { useLanguage } from "@/hooks/useLanguage";
import Image from "next/image";
import { useEffect, useRef } from "react";

interface CartDropdownProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CartDropdown({ isOpen, onClose }: CartDropdownProps) {
    const { cart, removeFromCart, updateQuantity, isLoading } = useCart();
    const { t } = useLanguage();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const totalItems = cart.reduce((sum, item) => sum + item.yquantite, 0);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose();
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div 
            ref={dropdownRef}
            className="absolute right-0 top-full mt-2 w-96 max-w-[90vw] bg-gradient-to-br from-morpheus-blue-dark via-morpheus-blue-dark/95 to-morpheus-blue-light/90 backdrop-blur-md shadow-2xl shadow-black/50 rounded-lg border border-morpheus-gold-dark/20 z-50"
        >
            {/* Header */}
            <div className="p-4 border-b border-morpheus-gold-dark/20">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold font-parisienne bg-gradient-to-r from-morpheus-gold-dark via-morpheus-gold-light to-morpheus-gold-dark bg-clip-text text-transparent">
                        {t('cart.title')} ({totalItems})
                    </h3>
                    <button
                        onClick={onClose}
                        className="group relative p-1 text-white/80 hover:text-morpheus-gold-light transition-all duration-300"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
                {isLoading ? (
                    <div className="flex items-center justify-center p-8">
                        <div className="w-8 h-8 border-2 border-morpheus-gold-dark border-t-morpheus-gold-light animate-spin rounded-full"></div>
                    </div>
                ) : cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                        <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h4 className="text-sm font-semibold text-white mb-1">{t('cart.empty')}</h4>
                        <p className="text-xs text-gray-400">{t('cart.emptyDescription')}</p>
                    </div>
                ) : (
                    <div className="p-4 space-y-3">
                        {cart.slice(0, 3).map((item) => (
                            <div key={item.id} className="flex gap-3 p-3 bg-morpheus-blue-dark/30 backdrop-blur-sm rounded-lg border border-morpheus-gold-dark/10">
                                {/* Product Image */}
                                <div className="w-12 h-12 bg-white rounded-md overflow-hidden flex-shrink-0">
                                    <Image
                                        src={item.yproduit?.imageurl || '/placeholder-product.jpg'}
                                        alt={item.yproduit?.yproduitintitule || 'Product'}
                                        width={48}
                                        height={48}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Product Details */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white text-sm font-medium truncate">
                                        {item.yproduit?.yproduitintitule || 'Unknown Product'}
                                    </h4>
                                    {item.yproduit?.yinfospotactions?.yboutique && (
                                        <p className="text-morpheus-gold-light text-xs font-medium">
                                            {item.yproduit.yinfospotactions.yboutique.yboutiqueintitule || item.yproduit.yinfospotactions.yboutique.yboutiquecode}
                                        </p>
                                    )}
                                    {item.ycouleur && (
                                        <p className="text-gray-400 text-xs">
                                            {t('cart.color')}: {item.ycouleur}
                                        </p>
                                    )}
                                    
                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-2 mt-1">
                                        <button
                                            onClick={() => updateQuantity({ itemId: item.id, quantity: item.yquantite - 1 })}
                                            className="w-6 h-6 rounded border border-morpheus-gold-dark/30 text-white hover:border-morpheus-gold-light hover:bg-morpheus-gold-dark/20 transition-all duration-300 flex items-center justify-center text-sm"
                                        >
                                            −
                                        </button>
                                        <span className="text-white text-sm font-medium w-6 text-center">{item.yquantite}</span>
                                        <button
                                            onClick={() => updateQuantity({ itemId: item.id, quantity: item.yquantite + 1 })}
                                            className="w-6 h-6 rounded border border-morpheus-gold-dark/30 text-white hover:border-morpheus-gold-light hover:bg-morpheus-gold-dark/20 transition-all duration-300 flex items-center justify-center text-sm"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Remove Button */}
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="text-red-400 hover:text-red-300 transition-colors p-1 flex-shrink-0"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                        
                        {cart.length > 3 && (
                            <div className="text-center text-gray-400 text-xs py-2">
                                +{cart.length - 3} more items
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
                <div className="p-4 border-t border-morpheus-gold-dark/20">
                    <button className="w-full bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white py-2 px-4 font-semibold rounded-lg shadow-lg hover:shadow-morpheus-gold-light/30 transition-all duration-300 text-sm">
                        {t('cart.checkout')} ({totalItems} {t('cart.items')})
                    </button>
                </div>
            )}
        </div>
    );
}