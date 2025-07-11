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
                
                // Enable shadows for all meshes in the model
                gltf.scene.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        
                        // Enhance materials for better lighting
                        if (child.material) {
                            if (Array.isArray(child.material)) {
                                child.material.forEach((mat) => {
                                    if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
                                        mat.envMapIntensity = 0.8;
                                        mat.needsUpdate = true;
                                    }
                                });
                            } else if (child.material instanceof THREE.MeshStandardMaterial || child.material instanceof THREE.MeshPhysicalMaterial) {
                                child.material.envMapIntensity = 0.8;
                                child.material.needsUpdate = true;
                            }
                        }
                    }
                });
            } catch (error) {
                console.error("Error calculating model bounds:", error);
                // Fallback to a reasonable default scale
                setNormalizedScale([5, 5, 5]);
            }
        }
    }, [gltf]);

    if (!url || url === "") {
        return <ModelNotFound name={name} />;
    }

    try {
        if (!gltf || !gltf.scene) {
            return <ModelNotFound name={name} />;
        }

        const clonedScene = gltf.scene.clone();
        
        // Apply shadow settings to cloned scene
        clonedScene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
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
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="relative w-full max-w-7xl h-[90vh] bg-gradient-to-br from-morpheus-blue-dark via-morpheus-blue-dark/95 to-morpheus-blue-light/90 backdrop-blur-md border-2 border-morpheus-gold-dark/30 shadow-2xl shadow-black/50 overflow-hidden rounded-xl">
                {/* Decorative top border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-morpheus-gold-dark via-morpheus-gold-light to-morpheus-gold-dark"></div>
                
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 via-black/30 to-transparent backdrop-blur-sm p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold font-parisienne bg-gradient-to-r from-morpheus-gold-dark via-morpheus-gold-light to-morpheus-gold-dark bg-clip-text text-transparent drop-shadow-lg">
                                {productData.name}
                            </h1>
                            <p className="text-sm text-gray-300 mt-1">{t('productDetails.productDetails')}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="group relative p-2 text-white/80 hover:text-morpheus-gold-light transition-all duration-300 hover:rotate-90"
                        >
                            <div className="absolute inset-0 bg-morpheus-gold-light/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                            <svg className="relative w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="pt-24 h-full flex">
                    {/* Left Side - Images/3D Viewer */}
                    <div className="w-1/2 h-full flex flex-col p-6">
                        {/* View Mode Toggle */}
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => setViewMode("image")}
                                className={`relative px-6 py-2 text-sm font-medium transition-all duration-300 rounded-lg overflow-hidden group ${
                                    viewMode === "image"
                                        ? "bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white shadow-lg shadow-morpheus-gold-light/25"
                                        : "bg-morpheus-blue-dark/50 text-gray-300 hover:text-morpheus-gold-light border border-morpheus-gold-dark/30"
                                }`}
                            >
                                <span className="relative z-10">{t('productDetails.images')}</span>
                                {viewMode !== "image" && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-morpheus-gold-dark/20 to-morpheus-gold-light/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                )}
                            </button>
                            <button
                                onClick={() => setViewMode("3d")}
                                className={`relative px-6 py-2 text-sm font-medium transition-all duration-300 rounded-lg overflow-hidden group ${
                                    viewMode === "3d"
                                        ? "bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white shadow-lg shadow-morpheus-gold-light/25"
                                        : "bg-morpheus-blue-dark/50 text-gray-300 hover:text-morpheus-gold-light border border-morpheus-gold-dark/30"
                                }`}
                            >
                                <span className="relative z-10">{t('productDetails.view3D')}</span>
                                {viewMode !== "3d" && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-morpheus-gold-dark/20 to-morpheus-gold-light/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                )}
                            </button>
                        </div>

                        {/* Main Display Area */}
                        <div className="flex-1">
                            {viewMode === "image" ? (
                                <div className="h-full flex flex-col">
                                    {/* Main Image */}
                                    <div className="flex-1 bg-gradient-to-br from-white/95 to-white/90 rounded-lg border-2 border-morpheus-gold-dark/20 shadow-xl overflow-hidden mb-4">
                                        <div className="h-full flex items-center justify-center p-8">
                                            <Image
                                                src={imageGallery[selectedImageIndex]}
                                                alt={productData.name}
                                                width={500}
                                                height={500}
                                                className="max-h-full max-w-full object-contain drop-shadow-2xl"
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Image Thumbnails */}
                                    <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                                        {imageGallery.map((image, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedImageIndex(index)}
                                                className={`relative flex-shrink-0 w-20 h-20 bg-white rounded-lg border-2 transition-all duration-300 overflow-hidden group ${
                                                    selectedImageIndex === index
                                                        ? "border-morpheus-gold-light shadow-lg shadow-morpheus-gold-light/25 scale-105"
                                                        : "border-morpheus-gold-dark/20 hover:border-morpheus-gold-light/50"
                                                }`}
                                            >
                                                <Image
                                                    src={image}
                                                    alt={`${t('productDetails.view')} ${index + 1}`}
                                                    width={80}
                                                    height={80}
                                                    className="w-full h-full object-cover"
                                                />
                                                {selectedImageIndex === index && (
                                                    <div className="absolute inset-0 bg-gradient-to-t from-morpheus-gold-light/30 to-transparent"></div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                /* 3D Viewer */
                                <div className="h-full bg-gradient-to-br from-gray-300 via-gray-100 to-gray-200 rounded-lg border-2 border-morpheus-gold-dark/20 shadow-xl overflow-hidden relative">
                                    {/* Gradient overlay for depth */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-400/30 via-transparent to-transparent pointer-events-none z-10"></div>
                                    
                                    <Canvas
                                        camera={{ position: [200, 200, 200], fov: 60 }}
                                        shadows
                                        gl={{
                                            antialias: true,
                                            toneMapping: THREE.ACESFilmicToneMapping,
                                            toneMappingExposure: 1.2
                                        }}
                                    >
                                        <Suspense fallback={<LoadingSpinner />}>
                                            {/* Environment and Fog for atmosphere */}
                                            <fog attach="fog" args={['#e5e7eb', 400, 1000]} />
                                            
                                            {/* Main ambient light - bright white overall illumination */}
                                            <ambientLight intensity={1.0} color="#e5e7eb" />
                                            
                                            {/* Key light - main directional light pure white */}
                                            <directionalLight
                                                position={[150, 200, 150]}
                                                intensity={3.0}
                                                color="#e5e7eb"
                                                castShadow
                                                shadow-mapSize={[2048, 2048]}
                                                shadow-camera-far={500}
                                                shadow-camera-left={-200}
                                                shadow-camera-right={200}
                                                shadow-camera-top={200}
                                                shadow-camera-bottom={-200}
                                            />
                                            
                                            {/* Secondary directional light from opposite side */}
                                            <directionalLight
                                                position={[-150, 200, -150]}
                                                intensity={2.5}
                                                color="#e5e7eb"
                                            />
                                            
                                            {/* Front light */}
                                            <pointLight
                                                position={[200, 100, 0]}
                                                intensity={2.5}
                                                color="#e5e7eb"
                                                distance={400}
                                                decay={2}
                                            />
                                            
                                            {/* Back light */}
                                            <pointLight
                                                position={[-200, 100, 0]}
                                                intensity={2.5}
                                                color="#e5e7eb"
                                                distance={400}
                                                decay={2}
                                            />
                                            
                                            {/* Left side light */}
                                            <pointLight
                                                position={[0, 100, 200]}
                                                intensity={2.5}
                                                color="#e5e7eb"
                                                distance={400}
                                                decay={2}
                                            />
                                            
                                            {/* Right side light */}
                                            <pointLight
                                                position={[0, 100, -200]}
                                                intensity={2.5}
                                                color="#e5e7eb"
                                                distance={400}
                                                decay={2}
                                            />
                                            
                                            {/* Top light - bright white from above */}
                                            <pointLight
                                                position={[0, 300, 0]}
                                                intensity={3.0}
                                                color="#e5e7eb"
                                                distance={500}
                                                decay={2}
                                            />
                                            
                                            {/* Bottom fill light - white upward illumination */}
                                            <pointLight
                                                position={[0, -80, 0]}
                                                intensity={1.5}
                                                color="#e5e7eb"
                                                distance={250}
                                                decay={2}
                                            />
                                            
                                            {/* Corner lights for complete coverage */}
                                            <pointLight position={[150, 150, 150]} intensity={2.0} color="#e5e7eb" distance={350} decay={2} />
                                            <pointLight position={[-150, 150, 150]} intensity={2.0} color="#e5e7eb" distance={350} decay={2} />
                                            <pointLight position={[150, 150, -150]} intensity={2.0} color="#e5e7eb" distance={350} decay={2} />
                                            <pointLight position={[-150, 150, -150]} intensity={2.0} color="#e5e7eb" distance={350} decay={2} />
                                            
                                            {/* Spot lights for additional brightness */}
                                            <spotLight
                                                position={[200, 250, 200]}
                                                angle={0.4}
                                                penumbra={0.5}
                                                intensity={2.5}
                                                color="#e5e7eb"
                                                castShadow
                                                target-position={[0, 0, 0]}
                                            />
                                            
                                            <spotLight
                                                position={[-200, 250, -200]}
                                                angle={0.4}
                                                penumbra={0.5}
                                                intensity={2.5}
                                                color="#e5e7eb"
                                                target-position={[0, 0, 0]}
                                            />
                                            
                                            {/* Ground plane for shadows */}
                                            <mesh
                                                rotation={[-Math.PI / 2, 0, 0]}
                                                position={[0, -50, 0]}
                                                receiveShadow
                                            >
                                                <planeGeometry args={[1000, 1000]} />
                                                <shadowMaterial opacity={0.3} />
                                            </mesh>

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
                                                autoRotate={true}
                                                autoRotateSpeed={0.5}
                                            />
                                        </Suspense>
                                    </Canvas>
                                    
                                    {/* 3D indicator badge */}
                                    <div className="absolute top-4 right-4 bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg z-20">
                                        3D Preview
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side - Product Details */}
                    <div className="w-1/2 h-full overflow-y-auto p-6 custom-scrollbar">
                        <div className="space-y-6">
                            {/* Product Title & Description */}
                            <div className="bg-morpheus-blue-dark/30 backdrop-blur-sm rounded-lg p-6 border border-morpheus-gold-dark/20">
                                <h2 className="text-3xl font-bold text-white mb-4">{productData.name}</h2>
                                <p className="text-gray-300 leading-relaxed">{productData.description}</p>
                            </div>

                            {/* Price Section */}
                            <div className="bg-gradient-to-r from-morpheus-gold-dark/20 to-morpheus-gold-light/20 rounded-lg p-6 border border-morpheus-gold-dark/30">
                                <div className="text-4xl font-bold bg-gradient-to-r from-morpheus-gold-dark via-morpheus-gold-light to-morpheus-gold-dark bg-clip-text text-transparent">
                                    $99.99
                                </div>
                                <p className="text-sm text-gray-300 mt-2 flex items-center">
                                    <svg className="w-4 h-4 mr-1 text-morpheus-gold-light" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                                    </svg>
                                    {t('productDetails.freeShippingAvailable')}
                                </p>
                            </div>

                            {/* Color/Variant Selector */}
                            {productData.models.length > 0 && (
                                <div className="bg-morpheus-blue-dark/30 backdrop-blur-sm rounded-lg p-6 border border-morpheus-gold-dark/20">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                        <span className="w-2 h-2 bg-morpheus-gold-light rounded-full mr-2"></span>
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
                                                    className={`w-14 h-14 rounded-lg border-4 transition-all duration-300 relative group ${
                                                        selectedModelIndex === colorOption.index
                                                            ? "border-morpheus-gold-light scale-110 shadow-lg shadow-morpheus-gold-light/40"
                                                            : "border-morpheus-gold-dark/30 hover:border-morpheus-gold-light/60 hover:scale-105"
                                                    }`}
                                                    style={{ backgroundColor: colorHex }}
                                                    title={colorOption.displayName}
                                                >
                                                    {/* Inner border for white/light colors visibility */}
                                                    <div className="absolute inset-1 border border-gray-400/20 rounded"></div>
                                                    
                                                    {/* Selected indicator */}
                                                    {selectedModelIndex === colorOption.index && (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <svg className="w-6 h-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Tooltip */}
                                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-black/90 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                                        {colorOption.displayName}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Quantity Selector */}
                            <div className="bg-morpheus-blue-dark/30 backdrop-blur-sm rounded-lg p-6 border border-morpheus-gold-dark/20">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                    <span className="w-2 h-2 bg-morpheus-gold-light rounded-full mr-2"></span>
                                    {t('productDetails.quantity')}
                                </h3>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-12 h-12 rounded-lg border-2 border-morpheus-gold-dark/30 text-white hover:border-morpheus-gold-light hover:bg-morpheus-gold-dark/20 transition-all duration-300 flex items-center justify-center text-xl font-semibold"
                                    >
                                        −
                                    </button>
                                    <span className="text-white text-2xl font-bold w-16 text-center">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-12 h-12 rounded-lg border-2 border-morpheus-gold-dark/30 text-white hover:border-morpheus-gold-light hover:bg-morpheus-gold-dark/20 transition-all duration-300 flex items-center justify-center text-xl font-semibold"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-4">
                                {/* Add to Cart & Wishlist Row */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleAddToCart}
                                        className="flex-1 relative overflow-hidden bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white py-4 px-6 font-semibold rounded-lg shadow-lg hover:shadow-morpheus-gold-light/30 transition-all duration-300 group"
                                    >
                                        <span className="relative z-10 flex items-center justify-center">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            {t('productDetails.addToCart')}
                                        </span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-morpheus-gold-light to-morpheus-gold-dark opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    </button>
                                    <button
                                        onClick={toggleWishlist}
                                        className={`w-14 h-14 rounded-lg border-2 transition-all duration-300 flex items-center justify-center ${
                                            isWishlisted
                                                ? "border-red-500 bg-red-500/20 text-red-500 shadow-lg shadow-red-500/25"
                                                : "border-morpheus-gold-dark/30 text-gray-400 hover:border-red-500 hover:text-red-500 hover:bg-red-500/10"
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
                                    className="w-full relative overflow-hidden bg-gradient-to-r from-green-600 to-green-500 text-white py-4 px-6 font-semibold rounded-lg shadow-lg hover:shadow-green-500/30 transition-all duration-300 group"
                                >
                                    <span className="relative z-10 flex items-center justify-center">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        {t('productDetails.orderNow')}
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </button>
                            </div>

                            {/* Product Features */}
                            <div className="bg-morpheus-blue-dark/30 backdrop-blur-sm rounded-lg p-6 border border-morpheus-gold-dark/20">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                    <span className="w-2 h-2 bg-morpheus-gold-light rounded-full mr-2"></span>
                                    {t('productDetails.features')}
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="flex items-center gap-3 group">
                                        <div className="w-8 h-8 rounded-lg bg-morpheus-gold-dark/20 flex items-center justify-center group-hover:bg-morpheus-gold-dark/30 transition-colors">
                                            <svg className="w-4 h-4 text-morpheus-gold-light" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <span className="text-gray-300">{t('productDetails.highQuality3DModel')}</span>
                                    </div>
                                    <div className="flex items-center gap-3 group">
                                        <div className="w-8 h-8 rounded-lg bg-morpheus-gold-dark/20 flex items-center justify-center group-hover:bg-morpheus-gold-dark/30 transition-colors">
                                            <svg className="w-4 h-4 text-morpheus-gold-light" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <span className="text-gray-300">{t('productDetails.multipleColorVariants')}</span>
                                    </div>
                                    <div className="flex items-center gap-3 group">
                                        <div className="w-8 h-8 rounded-lg bg-morpheus-gold-dark/20 flex items-center justify-center group-hover:bg-morpheus-gold-dark/30 transition-colors">
                                            <svg className="w-4 h-4 text-morpheus-gold-light" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                                            </svg>
                                        </div>
                                        <span className="text-gray-300">{t('productDetails.interactive3DPreview')}</span>
                                    </div>
                                    <div className="flex items-center gap-3 group">
                                        <div className="w-8 h-8 rounded-lg bg-morpheus-gold-dark/20 flex items-center justify-center group-hover:bg-morpheus-gold-dark/30 transition-colors">
                                            <svg className="w-4 h-4 text-morpheus-gold-light" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                                                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                                            </svg>
                                        </div>
                                        <span className="text-gray-300">{t('productDetails.freeShipping')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                </div>
            </div>
        </div>
    );
}