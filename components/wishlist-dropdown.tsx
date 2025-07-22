"use client";

import { useWishlist } from "@/hooks/useWishlist";
import { useLanguage } from "@/hooks/useLanguage";
import Image from "next/image";
import { useEffect, useRef } from "react";
import Link from "next/link";

interface WishlistDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    onProductClick?: (productData: {
        id: number;
        name: string;
        description: string;
        image: string;
        backgroundColor?: string;
        models: Array<{
            url: string;
            color: string;
            id: number;
        }>;
    }) => void;
}

export function WishlistDropdown({ isOpen, onClose, onProductClick }: WishlistDropdownProps) {
    const { wishlist, removeFromWishlist, isLoading } = useWishlist();
    const { t } = useLanguage();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose();
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    const handleProductClick = (item: any) => {
        if (!onProductClick || !item.yproduit) return;

        console.log("Wishlist item clicked:", item);
        console.log("3D objects:", item.yproduit.yobjet3d);

        // Transform the product data to match ProductDetailsPageProps
        const productData = {
            id: item.yproduit.yproduitid,
            name: item.yproduit.yproduitintitule || "Unknown Product",
            description: item.yproduit.yproduitdetailstech || "",
            image: item.yproduit.imageurl || "/placeholder-product.jpg",
            backgroundColor: "#f0f0f0",
            models:
                item.yproduit.yobjet3d?.map((obj: any, index: number) => ({
                    url: obj.url || "",
                    color: obj.couleur || "default",
                    id: obj.id || index,
                })) || [],
        };

        console.log("Transformed product data:", productData);
        onProductClick(productData);
    };

    if (!isOpen) return null;

    return (
        <div
            ref={dropdownRef}
            className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] bg-gradient-to-br from-morpheus-blue-dark via-morpheus-blue-dark/95 to-morpheus-blue-light/90 backdrop-blur-md shadow-2xl shadow-black/50 rounded-lg border border-morpheus-gold-dark/20 z-50"
        >
            {/* Header */}
            <div className="p-4 border-b border-morpheus-gold-dark/20">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold font-parisienne bg-gradient-to-r from-morpheus-gold-dark via-morpheus-gold-light to-morpheus-gold-dark bg-clip-text text-transparent">
                        {t("wishlist.title")} ({wishlist.length})
                    </h3>
                    <button
                        onClick={onClose}
                        className="group relative p-1 text-white/80 hover:text-morpheus-gold-light transition-all duration-300"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
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
                ) : wishlist.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                        <svg
                            className="w-12 h-12 text-gray-400 mb-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                        </svg>
                        <h4 className="text-sm font-semibold text-white mb-1">{t("wishlist.empty")}</h4>
                        <p className="text-xs text-gray-400">{t("wishlist.emptyDescription")}</p>
                    </div>
                ) : (
                    <div className="p-4 space-y-3">
                        {wishlist.slice(0, 4).map((item) => (
                            <div
                                key={item.id}
                                className="flex gap-3 p-3 bg-morpheus-blue-dark/30 backdrop-blur-sm rounded-lg border border-morpheus-gold-dark/10"
                            >
                                {/* Product Image */}
                                <div className="w-12 h-12 bg-white rounded-md overflow-hidden flex-shrink-0">
                                    <Image
                                        src={item.yproduit?.imageurl || "/placeholder-product.jpg"}
                                        alt={item.yproduit?.yproduitintitule || "Product"}
                                        width={48}
                                        height={48}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Product Details */}
                                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleProductClick(item)}>
                                    <h4 className="text-white text-sm font-medium truncate hover:text-morpheus-gold-light transition-colors">
                                        {item.yproduit?.yproduitintitule || "Unknown Product"}
                                    </h4>
                                    {item.yproduit?.yinfospotactions?.yboutique && (
                                        <p className="text-morpheus-gold-light text-xs font-medium">
                                            {item.yproduit.yinfospotactions.yboutique.yboutiqueintitule ||
                                                item.yproduit.yinfospotactions.yboutique.yboutiquecode}
                                        </p>
                                    )}

                                    {item.yproduit?.yproduitdetailstech && (
                                        <p className="text-gray-400 text-xs line-clamp-1 mt-1">
                                            {item.yproduit.yproduitdetailstech}
                                        </p>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-1 mt-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleProductClick(item);
                                            }}
                                            className="flex-1 bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white py-1 px-2 font-medium rounded text-xs hover:shadow-morpheus-gold-light/30 transition-all duration-300"
                                        >
                                            {t("wishlist.viewProduct")}
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (item.yproduit_id) removeFromWishlist(item.yproduit_id);
                                            }}
                                            className="w-6 h-6 rounded border border-red-500/30 text-red-400 hover:border-red-500 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300 flex items-center justify-center"
                                        >
                                            <svg
                                                className="w-3 h-3"
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
                                </div>
                            </div>
                        ))}

                        {wishlist.length > 4 && (
                            <div className="text-center text-gray-400 text-xs py-2">
                                +{wishlist.length - 4} {t("wishlist.moreItems")}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            {wishlist.length > 0 && (
                <div className="p-4">
                    <Link href="/wishlist">
                        <button
                            onClick={onClose}
                            className="w-full bg-morpheus-blue-dark/50 border border-morpheus-gold-dark/30 text-morpheus-gold-light py-2 px-4 font-medium rounded-lg hover:bg-morpheus-gold-dark/20 transition-all duration-300 text-sm"
                        >
                            {t("wishlist.viewAllItems")}
                        </button>
                    </Link>
                </div>
            )}
        </div>
    );
}
