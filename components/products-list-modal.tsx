"use client";

import { useMemo, useState } from "react";
import ProductDetailsPage from "./product-details-page";
import { useSceneProducts } from "@/hooks/useSceneProducts";
import Image from "next/image";

interface ProductsListModalProps {
    isOpen: string | null;
    onClose: () => void;
    onProductDetailsChange?: (isOpen: boolean) => void;
}

export default function ProductsListModal({ isOpen, onClose, onProductDetailsChange }: ProductsListModalProps) {
    const sceneId = isOpen;

    const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
    const [showProductDetails, setShowProductDetails] = useState(false);

    const { data: productsData, isLoading } = useSceneProducts(sceneId);

    const productsList = useMemo(() => {
        return productsData?.map((product) => ({
            id: product.yprodid,
            name: product.yprodintitule,
            model: "", // No 3D models available from current query
            image: "/logo.png", // Default image since imageurl doesn't exist in schema
            description: product.yproddetailstech,
            backgroundColor: "#f0f0f0", // Default background since yarriereplancouleur doesn't exist
            models: [], // No 3D models available from current query
            properties: {},
            features: [],
        }));
    }, [productsData]);

    const selectedProductData = productsList?.find((product) => product.id === selectedProduct);

    if (!isOpen) return null;
    return (
        <div className="fixed top-16 left-0 right-0 bottom-0 z-[60] bg-black/85 backdrop-blur-sm p-2 sm:p-4">
            <div className="relative w-full max-w-6xl h-full mx-auto bg-gradient-to-br from-morpheus-blue-dark via-morpheus-blue-dark/95 to-morpheus-blue-light/90 backdrop-blur-md border-2 border-morpheus-gold-dark/30 shadow-2xl shadow-black/50 overflow-hidden rounded-lg flex flex-col">
                {/* Decorative top border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-morpheus-gold-dark via-morpheus-gold-light to-morpheus-gold-dark"></div>
                
                {/* Header */}
                <div className="relative flex justify-between items-center p-4 sm:p-6 border-b border-morpheus-gold-dark/20 bg-gradient-to-r from-black/20 to-transparent">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-parisienne bg-gradient-to-r from-morpheus-gold-dark via-morpheus-gold-light to-morpheus-gold-dark bg-clip-text text-transparent mb-1 sm:mb-2 drop-shadow-lg">
                            Catalogue des Produits
                        </h2>
                        <p className="text-gray-300 text-xs sm:text-sm tracking-wide hidden sm:block">Parcourez notre collection de produits exclusifs</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="group relative p-2 text-white/80 hover:text-morpheus-gold-light transition-all duration-300 hover:rotate-90 flex-shrink-0"
                    >
                        <div className="absolute inset-0 bg-morpheus-gold-light/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                        <svg className="relative w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-3 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
                    {isLoading ? (
                        /* Loading State */
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="w-16 h-16 border-4 border-morpheus-gold-dark border-t-morpheus-gold-light animate-spin rounded-full"></div>
                            <div className="text-center">
                                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Chargement des produits...</h3>
                                <p className="text-gray-300 text-sm sm:text-base">
                                    Veuillez patienter pendant que nous récupérons les produits du boutique
                                </p>
                            </div>
                        </div>
                    ) : productsList && productsList.length > 0 ? (
                        /* Product Cards - Horizontal Layout with Theme */
                        <div className="space-y-3 sm:space-y-4 mb-6">
                            {productsList?.map((product) => (
                                <div
                                    key={product.id}
                                    onClick={() => {
                                        setSelectedProduct(product.id);
                                        setShowProductDetails(true);
                                        onProductDetailsChange?.(true);
                                    }}
                                    className="cursor-pointer group relative overflow-hidden border-2 border-morpheus-gold-dark/30 bg-gradient-to-r from-morpheus-blue-dark/50 to-morpheus-blue-light/30 backdrop-blur-sm transition-all duration-300 hover:border-morpheus-gold-light/60 hover:shadow-xl hover:shadow-morpheus-gold-light/20 rounded-lg"
                                >
                                    {/* Hover glow effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-morpheus-gold-light/0 via-morpheus-gold-light/5 to-morpheus-gold-light/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    
                                    <div className="relative flex flex-col sm:flex-row items-center p-4 sm:p-6 space-y-4 sm:space-y-0 sm:space-x-6">
                                        {/* Product Image */}
                                        <div className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 flex-shrink-0 overflow-hidden rounded-lg border-2 border-morpheus-gold-dark/20 group-hover:border-morpheus-gold-light/40 transition-colors duration-300">
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/95 to-white/90"></div>
                                            <Image
                                                src={product.image!}
                                                fill
                                                className="relative object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                                                alt={product.name}
                                            />
                                        </div>

                                        {/* Product Information */}
                                        <div className="flex-1 min-w-0 text-center sm:text-left">
                                            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white group-hover:text-morpheus-gold-light transition-colors duration-300 mb-2 sm:mb-3">
                                                {product.name}
                                            </h3>
                                            
                                            <p className="text-gray-300 text-xs sm:text-sm line-clamp-2 mb-3 sm:mb-4">
                                                {product.description || "Découvrez ce produit exceptionnel dans notre collection exclusive."}
                                            </p>

                                            {/* Product ID Badge */}
                                            <div className="inline-flex items-center space-x-2 text-xs text-morpheus-gold-light/80">
                                                <span className="px-2 py-1 bg-morpheus-gold-dark/20 border border-morpheus-gold-dark/30 rounded">
                                                    ID: {product.id}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <div className="flex-shrink-0 w-full sm:w-auto">
                                            <button className="relative overflow-hidden bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4 font-semibold shadow-lg transition-all duration-300 hover:shadow-morpheus-gold-light/30 hover:scale-105 rounded group/btn w-full sm:w-auto">
                                                <span className="relative z-10 text-sm sm:text-base">
                                                    Voir les Détails
                                                    <span className="block text-xs font-normal opacity-80 mt-1 hidden sm:block">Explorer en 3D</span>
                                                </span>
                                                <div className="absolute inset-0 bg-gradient-to-r from-morpheus-gold-light to-morpheus-gold-dark opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Bottom accent line */}
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-morpheus-gold-light to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* No Products State */
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="text-6xl mb-4">🏪</div>
                            <div className="text-center">
                                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Aucun produit trouvé</h3>
                                <p className="text-gray-300 text-sm sm:text-base">
                                    Il n&apos;y a pas de produits disponibles dans cette section
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Product Details Modal */}
            {showProductDetails && selectedProductData && (
                <ProductDetailsPage
                    productData={{
                        id: selectedProductData.id,
                        name: selectedProductData.name,
                        description: selectedProductData.description,
                        image: selectedProductData.image!,
                        models: selectedProductData.models || [],
                        backgroundColor: selectedProductData.backgroundColor,
                    }}
                    onClose={() => {
                        setShowProductDetails(false);
                        onProductDetailsChange?.(false);
                    }}
                />
            )}
        </div>
    );
}
