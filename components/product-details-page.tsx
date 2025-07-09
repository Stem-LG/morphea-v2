"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import { Suspense } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import * as THREE from "three";

// Loading component for 3D model
function LoadingSpinner() {
    const { t } = useLanguage();
    
    return (
        <Html center>
            <div className="flex flex-col items-center justify-center text-white bg-black/50 backdrop-blur-sm px-6 py-4">
                <div className="w-12 h-12 border-4 border-morpheus-gold-dark border-t-morpheus-gold-light animate-spin mb-3"></div>
                <div className="text-lg font-medium bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light bg-clip-text text-transparent font-parisienne">
                    {t('productDetails.loading3DModel')}
                </div>
            </div>
        </Html>
    );
}

// Error fallback component
function ModelNotFound({ name }: { name: string }) {
    const { t } = useLanguage();
    
    return (
        <Html center>
            <div className="flex flex-col items-center justify-center text-white bg-black/70 backdrop-blur-sm px-8 py-6 border border-morpheus-gold-dark">
                <div className="text-6xl mb-4">🌳</div>
                <div className="text-lg font-medium bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light bg-clip-text text-transparent font-parisienne mb-2">
                    {name}
                </div>
                <div className="text-sm text-gray-300 text-center">{t('productDetails.modelPreview')}</div>
            </div>
        </Html>
    );
}

// GLB Model Loader Component
function GLBModel({ url, name }: { url: string; name: string }) {
    const gltf = useGLTF(url);
    const [normalizedScale, setNormalizedScale] = useState<[number, number, number]>([1, 1, 1]);

    if (!url || url === "") {
        return <ModelNotFound name={name} />;
    }

    useEffect(() => {
        if (gltf && gltf.scene) {
            try {
                // Create a bounding box to measure the model's actual size
                const box = new THREE.Box3().setFromObject(gltf.scene);
                const size = box.getSize(new THREE.Vector3());
                
                // Calculate the maximum dimension
                const maxDimension = Math.max(size.x, size.y, size.z);
                
                // Define target size (adjust this value to make models bigger/smaller overall)
                const targetSize = 50;
                
                // Calculate scale factor to normalize to target size
                const scaleFactor = maxDimension > 0 ? targetSize / maxDimension : 1;
                
                // Apply the calculated scale
                setNormalizedScale([scaleFactor, scaleFactor, scaleFactor]);
            } catch (error) {
                console.error("Error calculating model bounds:", error);
                // Fallback to a reasonable default scale
                setNormalizedScale([5, 5, 5]);
            }
        }
    }, [gltf]);

    try {
        if (!gltf || !gltf.scene) {
            return <ModelNotFound name={name} />;
        }

        const clonedScene = gltf.scene.clone();
        return <primitive object={clonedScene} scale={normalizedScale} />;
    } catch (error) {
        console.error("Error in GLBModel component:", error);
        return <ModelNotFound name={name} />;
    }
}

// Product Model component
function ProductModel({ url, name }: { url: string; name: string }) {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <GLBModel url={url} name={name} />
        </Suspense>
    );
}

interface ProductDetailsPageProps {
    productData: {
        id: string;
        name: string;
        description: string;
        image: string;
        models: Array<{
            url: string;
            color: string;
            id: number;
        }>;
    };
    onClose: () => void;
}

export default function ProductDetailsPage({ productData, onClose }: ProductDetailsPageProps) {
    const { t } = useLanguage();
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [selectedModelIndex, setSelectedModelIndex] = useState(0);
    const [viewMode, setViewMode] = useState<"image" | "3d">("3d");
    const [quantity, setQuantity] = useState(1);
    const [isWishlisted, setIsWishlisted] = useState(false);

    // Create image gallery (product image + 3D model previews)
    const imageGallery = useMemo(() => {
        const images = [productData.image];
        // For now, we'll use the main image for all variants
        // In a real app, you'd have different images for different colors
        productData.models.forEach(() => {
            images.push(productData.image);
        });
        return images;
    }, [productData]);

    // Get available colors from models
    const availableColors = useMemo(() => {
        return productData.models.map((model, index) => {
            // Create a better display name for hex colors
            const getColorName = (color: string | null | undefined) => {
                if (!color) return `${t('productDetails.variant')} ${index + 1}`;
                
                if (color.startsWith('#')) {
                    // Convert common hex colors to names based on language
                    const hexToNameMap: { [key: string]: string } = {
                        '#ff0000': t('productDetails.color') === 'Couleur' ? 'Rouge' : 'Red',
                        '#0000ff': t('productDetails.color') === 'Couleur' ? 'Bleu' : 'Blue',
                        '#00ff00': t('productDetails.color') === 'Couleur' ? 'Vert' : 'Green',
                        '#ffff00': t('productDetails.color') === 'Couleur' ? 'Jaune' : 'Yellow',
                        '#ff00ff': t('productDetails.color') === 'Couleur' ? 'Magenta' : 'Magenta',
                        '#00ffff': t('productDetails.color') === 'Couleur' ? 'Cyan' : 'Cyan',
                        '#000000': t('productDetails.color') === 'Couleur' ? 'Noir' : 'Black',
                        '#ffffff': t('productDetails.color') === 'Couleur' ? 'Blanc' : 'White',
                        '#808080': t('productDetails.color') === 'Couleur' ? 'Gris' : 'Gray',
                        '#ffa500': t('productDetails.color') === 'Couleur' ? 'Orange' : 'Orange',
                        '#800080': t('productDetails.color') === 'Couleur' ? 'Violet' : 'Purple',
                        '#ffc0cb': t('productDetails.color') === 'Couleur' ? 'Rose' : 'Pink',
                        '#a52a2a': t('productDetails.color') === 'Couleur' ? 'Marron' : 'Brown'
                    };
                    
                    return hexToNameMap[color.toLowerCase()] || `${t('productDetails.color')} ${index + 1}`;
                }
                
                return color;
            };
            
            return {
                ...model,
                index,
                displayName: getColorName(model.color)
            };
        });
    }, [productData.models]);

    const selectedModel = productData.models[selectedModelIndex];

    const handleAddToCart = () => {
        // Implementation for add to cart
        console.log("Adding to cart:", {
            productId: productData.id,
            quantity,
            selectedModel: selectedModel
        });
        // You would integrate with your cart system here
    };

    const handleDirectOrder = () => {
        // Implementation for direct order
        console.log("Direct order:", {
            productId: productData.id,
            quantity,
            selectedModel: selectedModel
        });
        // You would redirect to checkout or open order modal here
    };

    const toggleWishlist = () => {
        setIsWishlisted(!isWishlisted);
        // You would integrate with your wishlist system here
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <div className="relative top-8 w-full max-w-7xl h-[90vh] bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light border border-slate-700 overflow-hidden">
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold font-parisienne bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light bg-clip-text text-transparent">
                                {productData.name}
                            </h1>
                            <p className="text-sm text-gray-300">{t('productDetails.productDetails')}</p>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="text-white hover:text-morpheus-gold-light transition-colors"
                        >
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
                </div>

                {/* Main Content */}
                <div className="pt-20 h-full flex">
                    {/* Left Side - Images/3D Viewer */}
                    <div className="w-1/2 h-full flex flex-col">
                        {/* View Mode Toggle */}
                        <div className="p-4 flex gap-2">
                            <button
                                onClick={() => setViewMode("image")}
                                className={`px-4 py-2 text-sm font-medium transition-colors ${
                                    viewMode === "image"
                                        ? "bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white"
                                        : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                                }`}
                            >
                                {t('productDetails.images')}
                            </button>
                            <button
                                onClick={() => setViewMode("3d")}
                                className={`px-4 py-2 text-sm font-medium transition-colors ${
                                    viewMode === "3d"
                                        ? "bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white"
                                        : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                                }`}
                            >
                                {t('productDetails.view3D')}
                            </button>
                        </div>

                        {/* Main Display Area */}
                        <div className="flex-1 p-4">
                            {viewMode === "image" ? (
                                <div className="h-full">
                                    {/* Main Image */}
                                    <div className="h-5/6 bg-white flex items-center justify-center mb-4">
                                        <Image
                                            src={imageGallery[selectedImageIndex]}
                                            alt={productData.name}
                                            width={500}
                                            height={500}
                                            className="max-h-full max-w-full object-contain"
                                        />
                                    </div>
                                    
                                    {/* Image Thumbnails */}
                                    <div className="h-1/6 flex gap-2 overflow-x-auto">
                                        {imageGallery.map((image, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedImageIndex(index)}
                                                className={`flex-shrink-0 w-16 h-16 bg-white border-2 transition-colors ${
                                                    selectedImageIndex === index
                                                        ? "border-morpheus-gold-light"
                                                        : "border-gray-300"
                                                }`}
                                            >
                                                <Image
                                                    src={image}
                                                    alt={`${t('productDetails.view')} ${index + 1}`}
                                                    width={64}
                                                    height={64}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                /* 3D Viewer */
                                <div className="h-full bg-white">
                                    <Canvas camera={{ position: [200, 200, 200], fov: 60 }}>
                                        <Suspense fallback={<LoadingSpinner />}>
                                            <ambientLight intensity={1.2} />
                                            <directionalLight
                                                position={[80, 120, 50]}
                                                intensity={2.5}
                                                castShadow={true}
                                            />
                                            <pointLight position={[-60, 60, -60]} intensity={1.5} color="#fff7e6" />
                                            <pointLight position={[60, 60, 60]} intensity={1.5} color="#e6f3ff" />

                                            {selectedModel && (
                                                <ProductModel url={selectedModel.url} name={productData.name} />
                                            )}

                                            <OrbitControls
                                                enablePan={true}
                                                enableZoom={true}
                                                enableRotate={true}
                                                maxPolarAngle={Math.PI / 2.2}
                                                minDistance={100}
                                                maxDistance={600}
                                                target={[0, 15, 0]}
                                            />
                                        </Suspense>
                                    </Canvas>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side - Product Details */}
                    <div className="w-1/2 h-full overflow-y-auto p-6 space-y-6">
                        {/* Product Title & Description */}
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-4">{productData.name}</h2>
                            <p className="text-gray-300 leading-relaxed">{productData.description}</p>
                        </div>

                        {/* Price Section */}
                        <div className="border-t border-slate-600 pt-6">
                            <div className="text-3xl font-bold bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light bg-clip-text text-transparent">
                                $99.99
                            </div>
                            <p className="text-sm text-gray-400 mt-1">{t('productDetails.freeShippingAvailable')}</p>
                        </div>

                        {/* Color/Variant Selector */}
                        {productData.models.length > 0 && (
                            <div className="border-t border-slate-600 pt-6">
                                <h3 className="text-lg font-semibold text-white mb-3">
                                    {productData.models.length > 1 ? t('productDetails.availableVariants') : t('productDetails.availableVariant')} ({productData.models.length})
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {availableColors.map((colorOption) => {
                                        // Handle both hex codes and color names
                                        const getColorValue = (colorInput: string | null | undefined) => {
                                            if (!colorInput) return '#6b7280'; // Default gray
                                            
                                            // If it's already a hex code, use it directly
                                            if (colorInput.startsWith('#')) {
                                                return colorInput;
                                            }
                                            
                                            // If it's a color name, convert to hex
                                            const colorMap: { [key: string]: string } = {
                                                'red': '#ef4444',
                                                'rouge': '#ef4444',
                                                'blue': '#3b82f6',
                                                'bleu': '#3b82f6',
                                                'green': '#10b981',
                                                'vert': '#10b981',
                                                'yellow': '#eab308',
                                                'jaune': '#eab308',
                                                'purple': '#8b5cf6',
                                                'violet': '#8b5cf6',
                                                'pink': '#ec4899',
                                                'rose': '#ec4899',
                                                'orange': '#f97316',
                                                'brown': '#a3a3a3',
                                                'marron': '#a3a3a3',
                                                'black': '#000000',
                                                'noir': '#000000',
                                                'white': '#ffffff',
                                                'blanc': '#ffffff',
                                                'gray': '#6b7280',
                                                'grey': '#6b7280',
                                                'gris': '#6b7280',
                                                'default': '#6b7280'
                                            };
                                            
                                            const normalizedColor = colorInput.toLowerCase().trim();
                                            return colorMap[normalizedColor] || colorInput; // Return original if not found
                                        };

                                        const colorHex = getColorValue(colorOption.color);
                                        
                                        return (
                                            <button
                                                key={colorOption.id}
                                                onClick={() => setSelectedModelIndex(colorOption.index)}
                                                className={`w-12 h-12 border-4 transition-all relative group ${
                                                    selectedModelIndex === colorOption.index
                                                        ? "border-morpheus-gold-light scale-110 shadow-lg shadow-morpheus-gold-light/25"
                                                        : "border-slate-600 hover:border-morpheus-gold-light/50 hover:scale-105"
                                                }`}
                                                style={{ backgroundColor: colorHex }}
                                                title={colorOption.displayName}
                                            >
                                                {/* Inner border for white/light colors visibility */}
                                                <div className="absolute inset-1 border border-gray-400/20"></div>
                                                
                                                {/* Selected indicator */}
                                                {selectedModelIndex === colorOption.index && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-3 h-3 bg-white rounded-full shadow-lg"></div>
                                                    </div>
                                                )}
                                                
                                                {/* Tooltip */}
                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                                    {colorOption.displayName}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div className="border-t border-slate-600 pt-6">
                            <h3 className="text-lg font-semibold text-white mb-3">{t('productDetails.quantity')}</h3>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 border border-slate-600 text-white hover:border-morpheus-gold-light transition-colors flex items-center justify-center"
                                >
                                    -
                                </button>
                                <span className="text-white text-lg font-medium w-12 text-center">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-10 h-10 border border-slate-600 text-white hover:border-morpheus-gold-light transition-colors flex items-center justify-center"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="border-t border-slate-600 pt-6 space-y-4">
                            {/* Add to Cart & Wishlist Row */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-[#695029] hover:to-[#d4c066] text-white py-3 px-6 font-medium transition-colors"
                                >
                                    {t('productDetails.addToCart')}
                                </button>
                                <button
                                    onClick={toggleWishlist}
                                    className={`w-12 h-12 border-2 transition-all flex items-center justify-center ${
                                        isWishlisted
                                            ? "border-red-500 bg-red-500/20 text-red-400"
                                            : "border-slate-600 text-gray-400 hover:border-red-500 hover:text-red-400"
                                    }`}
                                >
                                    <svg className="w-6 h-6" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                        />
                                    </svg>
                                </button>
                            </div>

                            {/* Direct Order Button */}
                            <button
                                onClick={handleDirectOrder}
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 font-medium transition-colors"
                            >
                                {t('productDetails.orderNow')}
                            </button>
                        </div>

                        {/* Product Features */}
                        <div className="border-t border-slate-600 pt-6">
                            <h3 className="text-lg font-semibold text-white mb-3">{t('productDetails.features')}</h3>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-morpheus-gold-light"></div>
                                    <span className="text-gray-300">{t('productDetails.highQuality3DModel')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-morpheus-gold-light"></div>
                                    <span className="text-gray-300">{t('productDetails.multipleColorVariants')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-morpheus-gold-light"></div>
                                    <span className="text-gray-300">{t('productDetails.interactive3DPreview')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-morpheus-gold-light"></div>
                                    <span className="text-gray-300">{t('productDetails.freeShipping')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}