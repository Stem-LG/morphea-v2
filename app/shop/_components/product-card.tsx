"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingCart, Heart, Eye } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

interface ProductCardProps {
    product: {
        yprodid: number;
        yprodintitule: string;
        yproddetailstech: string;
        ydesign?: {
            ydesignnom: string;
            ydesignmarque: string;
        };
        yvarprod?: Array<{
            yvarprodid: number;
            yvarprodprixcatalogue: number;
            yvarprodprixpromotion: number | null;
            xdeviseidfk: number | null;
            xcouleur: {
                xcouleurhexa: string;
                xcouleurintitule: string;
            };
            yvarprodmedia?: Array<{
                ymedia: {
                    ymediaurl: string;
                    ymediaboolvideo: boolean;
                };
            }>;
        }>;
    };
    viewMode: 'grid' | 'list';
    onViewDetails: () => void;
}

export function ProductCard({ product, viewMode, onViewDetails }: ProductCardProps) {
    const { formatPrice, currencies } = useCurrency();
    const { t } = useLanguage();
    const [imageError, setImageError] = useState(false);
    const [hoveredColor, setHoveredColor] = useState<string | null>(null);

    // Get the first variant for pricing and media
    const firstVariant = product.yvarprod?.[0];
    const activeVariant = hoveredColor
        ? product.yvarprod?.find(v => v.xcouleur.xcouleurhexa === hoveredColor) || firstVariant
        : firstVariant;

    // Get the first image from the active variant
    const firstImage = activeVariant?.yvarprodmedia?.find(
        media => media.ymedia && !media.ymedia.ymediaboolvideo
    )?.ymedia?.ymediaurl;

    // Get pricing info
    const pricing = activeVariant ? {
        catalogPrice: activeVariant.yvarprodprixcatalogue,
        promotionPrice: activeVariant.yvarprodprixpromotion,
        productCurrency: currencies.find(c => c.xdeviseid === activeVariant.xdeviseidfk),
        formattedCatalogPrice: formatPrice(
            activeVariant.yvarprodprixcatalogue, 
            currencies.find(c => c.xdeviseid === activeVariant.xdeviseidfk)
        ),
        formattedPromotionPrice: activeVariant.yvarprodprixpromotion 
            ? formatPrice(
                activeVariant.yvarprodprixpromotion, 
                currencies.find(c => c.xdeviseid === activeVariant.xdeviseidfk)
            ) 
            : null,
        hasDiscount: !!activeVariant.yvarprodprixpromotion,
        discountPercentage: activeVariant.yvarprodprixpromotion 
            ? Math.round(((activeVariant.yvarprodprixcatalogue - activeVariant.yvarprodprixpromotion) / activeVariant.yvarprodprixcatalogue) * 100)
            : 0
    } : null;

    // Get unique colors
    const uniqueColors = product.yvarprod?.reduce((acc, variant) => {
        const colorHex = variant.xcouleur.xcouleurhexa;
        if (!acc.some(c => c.hex === colorHex)) {
            acc.push({
                hex: colorHex,
                name: variant.xcouleur.xcouleurintitule
            });
        }
        return acc;
    }, [] as Array<{ hex: string; name: string }>);

    if (viewMode === 'list') {
        return (
            <div className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 backdrop-blur-md border border-morpheus-gold-dark/20 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6">
                <div className="flex gap-6">
                    {/* Image */}
                    <div className="relative w-32 h-32 flex-shrink-0 bg-morpheus-blue-dark/20 rounded-lg overflow-hidden border border-morpheus-gold-dark/20">
                        {firstImage && !imageError ? (
                            <Image
                                src={firstImage}
                                alt={product.yprodintitule}
                                fill
                                className="object-contain p-2"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-morpheus-gold-light/60">
                                <ShoppingCart className="w-8 h-8" />
                            </div>
                        )}
                        {pricing?.hasDiscount && (
                            <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-2 py-1 rounded-md font-medium">
                                -{pricing.discountPercentage}%
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0 pr-4">
                                {product.ydesign && (
                                    <p className="text-xs text-morpheus-gold-light/80 mb-1 font-medium">{product.ydesign.ydesignmarque}</p>
                                )}
                                <h3 className="font-semibold text-white truncate text-lg">{product.yprodintitule}</h3>
                                <p className="text-sm text-gray-300 line-clamp-2 mt-2">{product.yproddetailstech}</p>
                                
                                {/* Colors */}
                                {uniqueColors && uniqueColors.length > 0 && (
                                    <div className="flex gap-2 mt-3">
                                        {uniqueColors.slice(0, 5).map((color, idx) => (
                                            <div
                                                key={idx}
                                                className="w-6 h-6 rounded-full border-2 border-morpheus-gold-dark/40 shadow-sm"
                                                style={{ backgroundColor: color.hex }}
                                                title={color.name}
                                            />
                                        ))}
                                        {uniqueColors.length > 5 && (
                                            <span className="text-xs text-morpheus-gold-light/70 ml-1 self-center">+{uniqueColors.length - 5}</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Price */}
                            <div className="text-right">
                                {pricing && (
                                    <>
                                        {pricing.hasDiscount ? (
                                            <div>
                                                <p className="text-xl font-bold bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light bg-clip-text text-transparent">
                                                    {pricing.formattedPromotionPrice}
                                                </p>
                                                <p className="text-sm text-gray-400 line-through">
                                                    {pricing.formattedCatalogPrice}
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="text-xl font-bold bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light bg-clip-text text-transparent">
                                                {pricing.formattedCatalogPrice}
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={onViewDetails}
                                className="flex-1 bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-morpheus-gold-light hover:to-morpheus-gold-dark transition-all duration-300 shadow-md"
                            >
                                {t("shop.viewDetails")}
                            </button>
                            <button className="p-2 bg-morpheus-blue-dark/40 border border-morpheus-gold-dark/30 rounded-lg hover:bg-morpheus-blue-dark/60 text-morpheus-gold-light hover:text-white transition-all duration-300">
                                <Heart className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Grid view
    return (
        <div className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 backdrop-blur-md border border-morpheus-gold-dark/20 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group">
            {/* Image */}
            <div className="relative aspect-square bg-morpheus-blue-dark/20 overflow-hidden">
                {firstImage && !imageError ? (
                    <Image
                        src={firstImage}
                        alt={product.yprodintitule}
                        fill
                        className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-morpheus-gold-light/60">
                        <ShoppingCart className="w-12 h-12" />
                    </div>
                )}
                
                {/* Discount Badge */}
                {pricing?.hasDiscount && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-3 py-1 rounded-md font-medium shadow-lg">
                        -{pricing.discountPercentage}%
                    </div>
                )}

                {/* Quick Actions */}
                <div className="absolute inset-0 bg-morpheus-blue-dark/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                    <button
                        onClick={onViewDetails}
                        className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white p-3 rounded-full hover:from-morpheus-gold-light hover:to-morpheus-gold-dark transition-all duration-300 shadow-lg"
                        title={t("shop.quickView")}
                    >
                        <Eye className="w-5 h-5" />
                    </button>
                    <button
                        className="bg-morpheus-blue-dark/60 border border-morpheus-gold-dark/40 text-morpheus-gold-light p-3 rounded-full hover:bg-morpheus-blue-dark/80 hover:text-white transition-all duration-300 shadow-lg"
                        title={t("shop.addToWishlist")}
                    >
                        <Heart className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                {/* Brand */}
                {product.ydesign && (
                    <p className="text-xs text-morpheus-gold-light/80 mb-2 font-medium">{product.ydesign.ydesignmarque}</p>
                )}

                {/* Title */}
                <h3 className="font-semibold text-white line-clamp-2 min-h-[2.5rem] text-lg">
                    {product.yprodintitule}
                </h3>

                {/* Colors */}
                {uniqueColors && uniqueColors.length > 0 && (
                    <div className="flex gap-2 mt-3 mb-4">
                        {uniqueColors.slice(0, 5).map((color, idx) => (
                            <button
                                key={idx}
                                className={cn(
                                    "w-7 h-7 rounded-full border-2 transition-all duration-300 shadow-sm",
                                    hoveredColor === color.hex
                                        ? "border-morpheus-gold-light scale-110 shadow-md"
                                        : "border-morpheus-gold-dark/40"
                                )}
                                style={{ backgroundColor: color.hex }}
                                title={color.name}
                                onMouseEnter={() => setHoveredColor(color.hex)}
                                onMouseLeave={() => setHoveredColor(null)}
                            />
                        ))}
                        {uniqueColors.length > 5 && (
                            <span className="text-xs text-morpheus-gold-light/70 ml-1 self-center font-medium">
                                +{uniqueColors.length - 5}
                            </span>
                        )}
                    </div>
                )}

                {/* Price */}
                {pricing && (
                    <div className="mb-4">
                        {pricing.hasDiscount ? (
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-bold bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light bg-clip-text text-transparent">
                                    {pricing.formattedPromotionPrice}
                                </span>
                                <span className="text-sm text-gray-400 line-through">
                                    {pricing.formattedCatalogPrice}
                                </span>
                            </div>
                        ) : (
                            <span className="text-xl font-bold bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light bg-clip-text text-transparent">
                                {pricing.formattedCatalogPrice}
                            </span>
                        )}
                    </div>
                )}

                {/* View Details Button */}
                <button
                    onClick={onViewDetails}
                    className="w-full bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white py-3 rounded-lg font-medium hover:from-morpheus-gold-light hover:to-morpheus-gold-dark transition-all duration-300 shadow-md"
                >
                    {t("shop.viewDetails")}
                </button>
            </div>
        </div>
    );
}