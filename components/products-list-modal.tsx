"use client";

import { useMemo, useState } from "react";
import Product3DViewer from "./product-3d-viewer";
import { useSceneProducts } from "@/hooks/useSceneProducts";
import Image from "next/image";

interface ProductsListModalProps {
    isOpen: string | null;
    onClose: () => void;
}

export default function ProductsListModal({ isOpen, onClose }: ProductsListModalProps) {
    let sceneId = isOpen;

    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [show3DViewer, setShow3DViewer] = useState(false);

    const { data: productsData, isLoading } = useSceneProducts(sceneId);

    let productsList = useMemo(() => {
        return productsData?.map((product) => ({
            id: product.yproduitcode,
            name: product.yproduitintitule,
            model: (product as any)[0]
                ? (product as any)[0].url
                : "https://bv90iny2pa.ufs.sh/f/JbGxKbqSczovUft4zqzPn9Rb1yKz8qNZXfhSgpM3GeAakC54",
            image: product.imageurl, // Placeholder image
            description: product.yproduitdetailstech,
            properties: {
                height: "15-20 feet",
                type: "Coconut Palm",
                age: "25-30 years",
                location: "Beachfront areas",
            },
            features: ["Salt-tolerant", "Hurricane resistant", "Produces coconuts", "Year-round greenery"],
        }));
    }, [productsData]);

    const selectedProductData = productsList?.find((product) => product.id === selectedProduct);

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="relative w-full max-w-6xl max-h-[90vh] bg-gradient-to-br from-[#000c18] to-[#083543] border border-slate-700 overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-700">
                    <div>
                        <h2 className="text-2xl font-bold font-parisienne bg-gradient-to-r from-[#785730] to-[#e9d079] bg-clip-text text-transparent mb-2">
                            Product List
                        </h2>
                        <p className="text-gray-300">Discover the store products</p>
                    </div>
                    <button onClick={onClose} className="text-white hover:text-[#e9d079] transition-colors">
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
                    {/* Product Cards Grid - Horizontal Layout */}
                    <div className="space-y-4 mb-6">
                        {productsList?.map((product) => (
                            <div
                                key={product.id}
                                onClick={() => {
                                    setSelectedProduct(product.id);
                                    setShow3DViewer(true);
                                }}
                                className={`cursor-pointer border-2 transition-all duration-300 hover:border-[#e9d079] bg-gradient-to-br from-[#000c18] to-[#083543] border-slate-600 group`}
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
                                            <h3 className="text-2xl font-bold text-white group-hover:text-[#e9d079] transition-colors">
                                                {product.name}
                                            </h3>
                                            <div className="bg-gradient-to-r from-[#785730] to-[#e9d079] text-white px-3 py-1 text-sm font-medium">
                                                {product.properties.type}
                                            </div>
                                        </div>

                                        <p className="text-gray-300 mb-4 line-clamp-2">{product.description}</p>

                                        {/* Properties Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                            <div className="text-center">
                                                <div className="text-[#e9d079] text-sm font-medium">Height</div>
                                                <div className="text-white text-lg">{product.properties.height}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-[#e9d079] text-sm font-medium">Age</div>
                                                <div className="text-white text-lg">{product.properties.age}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-[#e9d079] text-sm font-medium">Location</div>
                                                <div className="text-white text-sm">{product.properties.location}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-[#e9d079] text-sm font-medium">Features</div>
                                                <div className="text-white text-sm">
                                                    {product.features.length} traits
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
                                                    +{product.features.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="flex-shrink-0">
                                        <button className="bg-gradient-to-r from-[#785730] to-[#e9d079] hover:from-[#695029] hover:to-[#d4c066] text-white px-6 py-3 transition-colors font-medium shadow-lg group-hover:shadow-[#e9d079]/25 rounded-none">
                                            View in 3D
                                            <div className="text-xs opacity-75 mt-1">Click to explore</div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3D Viewer Modal */}
            {show3DViewer && selectedProductData && (
                <Product3DViewer productData={selectedProductData} onClose={() => setShow3DViewer(false)} />
            )}
        </div>
    );
}
