"use client";

import { useMemo, useState } from "react";
import ProductDetailsPage from "./product-details-page";
import { useSceneProducts } from "@/hooks/useSceneProducts";
import Image from "next/image";

interface ProductsListModalProps {
    isOpen: string | null;
    onClose: () => void;
}

export default function ProductsListModal({ isOpen, onClose }: ProductsListModalProps) {
    const sceneId = isOpen;

    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [showProductDetails, setShowProductDetails] = useState(false);

    const { data: productsData, isLoading } = useSceneProducts(sceneId);

    const productsList = useMemo(() => {
        return productsData?.map((product) => ({
            id: product.yproduitcode,
            name: product.yproduitintitule,
            model: product.yobjet3d.length > 0 ? product.yobjet3d[0].url : "",
            image: product.imageurl,
            description: product.yproduitdetailstech,
            models: product.yobjet3d.map((obj3d: any) => ({
                url: obj3d.url,
                color: obj3d.couleur || "Default",
                id: obj3d.id,
            })),
            properties: {
                height: "15-20 pieds",
                type: "Palmier à Coco",
                age: "25-30 ans",
                location: "Zones côtières",
            },
            features: ["Tolérant au sel", "Résistant aux ouragans", "Produit des noix de coco", "Verdure toute l'année"],
        }));
    }, [productsData]);

    const selectedProductData = productsList?.find((product) => product.id === selectedProduct);

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="relative w-full max-w-6xl max-h-[90vh] bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light border border-slate-700 overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-700">
                    <div>
                        <h2 className="text-2xl font-bold font-parisienne bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light bg-clip-text text-transparent mb-2">
                            Catalogue des Produits
                        </h2>
                        <p className="text-gray-300">Parcourez notre collection de produits</p>
                    </div>
                    <button onClick={onClose} className="text-white hover:text-morpheus-gold-light transition-colors">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {isLoading ? (
                        /* Loading State */
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="w-16 h-16 border-4 border-morpheus-gold-dark border-t-morpheus-gold-light animate-spin rounded-full"></div>
                            <div className="text-center">
                                <h3 className="text-xl font-semibold text-white mb-2">Chargement des produits...</h3>
                                <p className="text-gray-300">Veuillez patienter pendant que nous récupérons les produits du magasin</p>
                            </div>
                        </div>
                    ) : productsList && productsList.length > 0 ? (
                        /* Product Cards Grid - Horizontal Layout */
                        <div className="space-y-4 mb-6">
                            {productsList?.map((product) => (
                                <div
                                    key={product.id}
                                    onClick={() => {
                                        setSelectedProduct(product.id);
                                        setShowProductDetails(true);
                                    }}
                                    className={`cursor-pointer border-2 transition-all duration-300 hover:border-morpheus-gold-light bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light border-slate-600 group`}
                                >
                                    <div className="flex items-center p-4 space-x-6">
                                        {/* Product 3D Preview */}
                                        <div className="w-32 h-32 bg-white flex items-center justify-center flex-shrink-0 shadow-lg">
                                            <div className="text-center">
                                                <Image src={product.image!} height={256} width={256} alt="" />
                                            </div>
                                        </div>

                                        {/* Product Information */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-2xl font-bold text-white group-hover:text-morpheus-gold-light transition-colors">
                                                    {product.name}
                                                </h3>
                                                <div className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white px-3 py-1 text-sm font-medium">
                                                    {product.properties.type}
                                                </div>
                                            </div>

                                            <p className="text-gray-300 mb-4 line-clamp-2">{product.description}</p>

                                            {/* Properties Grid */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                <div className="text-center">
                                                    <div className="text-morpheus-gold-light text-sm font-medium">
                                                        Hauteur
                                                    </div>
                                                    <div className="text-white text-lg">
                                                        {product.properties.height}
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-morpheus-gold-light text-sm font-medium">
                                                        Âge
                                                    </div>
                                                    <div className="text-white text-lg">{product.properties.age}</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-morpheus-gold-light text-sm font-medium">
                                                        Emplacement
                                                    </div>
                                                    <div className="text-white text-sm">
                                                        {product.properties.location}
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-[#e9d079] text-sm font-medium">Caractéristiques</div>
                                                    <div className="text-white text-sm">
                                                        {product.features.length} caractéristiques
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Key Features Tags */}
                                            <div className="flex flex-wrap gap-2">
                                                {product.features.slice(0, 3).map((feature, index) => (
                                                    <span
                                                        key={index}
                                                        className="bg-slate-700 text-gray-300 px-2 py-1 text-xs"
                                                    >
                                                        {feature}
                                                    </span>
                                                ))}
                                                {product.features.length > 3 && (
                                                    <span className="bg-slate-600 text-gray-400 px-2 py-1 text-xs">
                                                        +{product.features.length - 3} de plus
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <div className="flex-shrink-0">
                                            <button className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-[#695029] hover:to-[#d4c066] text-white px-6 py-3 transition-colors font-medium shadow-lg group-hover:shadow-morpheus-gold-light/25 rounded-none">
                                                Voir les Détails
                                                <div className="text-xs opacity-75 mt-1">Cliquez pour explorer</div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* No Products State */
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="text-6xl mb-4">🏪</div>
                            <div className="text-center">
                                <h3 className="text-xl font-semibold text-white mb-2">Aucun produit trouvé</h3>
                                <p className="text-gray-300">Il n&apos;y a pas de produits disponibles dans cette section</p>
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
                    }}
                    onClose={() => setShowProductDetails(false)}
                />
            )}
        </div>
    );
}
