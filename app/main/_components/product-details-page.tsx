"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import { Suspense } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAddToCart } from "@/app/_hooks/cart/useAddToCart";
import { useAddToWishlist } from "@/app/_hooks/wishlist/useAddToWishlist";
import { useRemoveFromWishlist } from "@/app/_hooks/wishlist/useRemoveFromWishlist";
import { useIsInWishlist } from "@/app/_hooks/wishlist/useIsInWishlist";
import * as THREE from "three";

// Loading component for 3D model
function LoadingSpinner() {
    const { t } = useLanguage();

    return (
        <Html center>
            <div className="flex flex-col items-center justify-center text-white bg-black/50 backdrop-blur-sm px-4 py-3 rounded-lg">
                <div className="w-8 h-8 border-2 border-morpheus-gold-dark rounded-full border-t-morpheus-gold-light animate-spin mb-2"></div>
                <div className="text-sm font-medium bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light bg-clip-text text-transparent font-parisienne">
                    {t("productDetails.loading3DModel")}
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
            <div className="flex flex-col items-center justify-center text-white bg-black/70 backdrop-blur-sm px-6 py-4 border border-morpheus-gold-dark rounded-lg">
                <div className="text-4xl mb-3">🌳</div>
                <div className="text-base font-medium bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light bg-clip-text text-transparent font-parisienne mb-1">
                    {name}
                </div>
                <div className="text-xs text-gray-300 text-center">{t("productDetails.modelPreview")}</div>
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
                                    if (
                                        mat instanceof THREE.MeshStandardMaterial ||
                                        mat instanceof THREE.MeshPhysicalMaterial
                                    ) {
                                        mat.envMapIntensity = 0.8;
                                        mat.needsUpdate = true;
                                    }
                                });
                            } else if (
                                child.material instanceof THREE.MeshStandardMaterial ||
                                child.material instanceof THREE.MeshPhysicalMaterial
                            ) {
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

// Types based on the actual API response structure
type ProductVariant = {
    yvarprodid: number;
    yvarprodintitule: string;
    yvarprodprixcatalogue: number;
    yvarprodprixpromotion: number | null;
    yvarprodpromotiondatedeb: string | null;
    yvarprodpromotiondatefin: string | null;
    yvarprodnbrjourlivraison: number;
    yvarprodstatut: "approved" | "not_approved" | "rejected";
    xcouleur: {
        xcouleurid: number;
        xcouleurintitule: string;
        xcouleurhexa: string;
    };
    xtaille: {
        xtailleid: number;
        xtailleintitule: string;
    };
    yvarprodmedia: Array<{
        ymedia: {
            ymediaid: number;
            ymediaintitule: string;
            ymediaurl: string;
            ymediaboolvideo: boolean;
        };
    }>;
    yobjet3d?: Array<{
        yobjet3did: number;
        yobjet3durl: string;
    }>;
};

interface ProductDetailsPageProps {
    productData: {
        yprodid: number;
        yprodintitule: string;
        yproddetailstech: string;
        yprodinfobulle: string;
        yvarprod: ProductVariant[];
    };
    onClose: () => void;
}

export function ProductDetailsPage({ productData, onClose }: ProductDetailsPageProps) {
    const { t } = useLanguage();
    const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
    const [selectedColorId, setSelectedColorId] = useState<number>(() => {
        const approved = productData.yvarprod?.filter((variant) => variant.yvarprodstatut === "approved") || [];
        return approved.length > 0 ? approved[0].xcouleur.xcouleurid : 0;
    });
    const [selectedSizeId, setSelectedSizeId] = useState<number>(() => {
        const approved = productData.yvarprod?.filter((variant) => variant.yvarprodstatut === "approved") || [];
        return approved.length > 0 ? approved[0].xtaille.xtailleid : 0;
    });
    const [viewMode, setViewMode] = useState<"media" | "3d">("3d");
    const [quantity, setQuantity] = useState(1);

    // Hooks for cart and wishlist functionality
    const addToCartMutation = useAddToCart();
    const addToWishlistMutation = useAddToWishlist();
    const removeFromWishlistMutation = useRemoveFromWishlist();
    
    // Filter variants to show only approved ones
    const approvedVariants = useMemo(() => {
        if (!productData.yvarprod || productData.yvarprod.length === 0) return [];
        return productData.yvarprod.filter((variant) => variant.yvarprodstatut === "approved");
    }, [productData.yvarprod]);

    // Get all unique colors and sizes from approved variants only
    const availableColors = useMemo(() => {
        if (!approvedVariants || approvedVariants.length === 0) return [];

        const colorMap = new Map();
        approvedVariants.forEach((variant) => {
            const color = variant.xcouleur;
            if (!colorMap.has(color.xcouleurid)) {
                colorMap.set(color.xcouleurid, color);
            }
        });
        return Array.from(colorMap.values());
    }, [approvedVariants]);

    const availableSizes = useMemo(() => {
        if (!approvedVariants || approvedVariants.length === 0) return [];

        const sizeMap = new Map();
        // Filter sizes based on selected color from approved variants only
        const variantsForColor = approvedVariants.filter((v) => v.xcouleur.xcouleurid === selectedColorId);
        variantsForColor.forEach((variant) => {
            const size = variant.xtaille;
            if (!sizeMap.has(size.xtailleid)) {
                sizeMap.set(size.xtailleid, size);
            }
        });
        return Array.from(sizeMap.values());
    }, [approvedVariants, selectedColorId]);

    // Get current selected variant from approved variants only
    const selectedVariant = useMemo(() => {
        if (!approvedVariants || approvedVariants.length === 0) return null;

        return (
            approvedVariants.find(
                (v) => v.xcouleur.xcouleurid === selectedColorId && v.xtaille.xtailleid === selectedSizeId
            ) || approvedVariants[0]
        );
    }, [approvedVariants, selectedColorId, selectedSizeId]);

    // Check if current variant is in wishlist
    const { data: isInWishlist } = useIsInWishlist(selectedVariant?.yvarprodid || 0);

    // Get all media from approved variants only for the carousel
    const allMedia = useMemo(() => {
        if (!approvedVariants || approvedVariants.length === 0) return [];

        const mediaSet = new Set();
        const mediaArray: Array<{
            ymediaid: number;
            ymediaintitule: string;
            ymediaurl: string;
            ymediaboolvideo: boolean;
        }> = [];

        approvedVariants.forEach((variant) => {
            if (variant.yvarprodmedia && Array.isArray(variant.yvarprodmedia)) {
                variant.yvarprodmedia.forEach((mediaWrapper) => {
                    const media = mediaWrapper.ymedia;
                    if (!mediaSet.has(media.ymediaid)) {
                        mediaSet.add(media.ymediaid);
                        mediaArray.push(media);
                    }
                });
            }
        });
        return mediaArray;
    }, [approvedVariants]);

    // Get 3D model for selected variant
    const selected3DModel = useMemo(() => {
        if (!selectedVariant || !selectedVariant.yobjet3d || selectedVariant.yobjet3d.length === 0) {
            return null;
        }
        return selectedVariant.yobjet3d[0];
    }, [selectedVariant]);

    // Calculate pricing
    const pricing = useMemo(() => {
        if (!selectedVariant) return { price: 0, originalPrice: null, hasDiscount: false };

        const currentPrice = selectedVariant.yvarprodprixpromotion || selectedVariant.yvarprodprixcatalogue;
        const originalPrice = selectedVariant.yvarprodprixpromotion ? selectedVariant.yvarprodprixcatalogue : null;
        const hasDiscount = !!selectedVariant.yvarprodprixpromotion;

        return { price: currentPrice, originalPrice, hasDiscount };
    }, [selectedVariant]);

    // Handle color selection
    const handleColorChange = (colorId: number) => {
        if (!approvedVariants || approvedVariants.length === 0) return;

        setSelectedColorId(colorId);

        // Check if current size is available for new color from approved variants only
        const variantsForColor = approvedVariants.filter((v) => v.xcouleur.xcouleurid === colorId);
        const currentSizeAvailable = variantsForColor.some((v) => v.xtaille.xtailleid === selectedSizeId);

        if (!currentSizeAvailable && variantsForColor.length > 0) {
            // Switch to first available size for this color
            setSelectedSizeId(variantsForColor[0].xtaille.xtailleid);
        }

        // Update media view if variant has specific media
        const newVariant = variantsForColor.find((v) => v.xtaille.xtailleid === selectedSizeId) || variantsForColor[0];
        if (newVariant?.yvarprodmedia && newVariant.yvarprodmedia.length > 0) {
            if (viewMode === "media") {
                setSelectedMediaIndex(0);
            }
        }
    };

    // Handle size selection
    const handleSizeChange = (sizeId: number) => {
        setSelectedSizeId(sizeId);
    };

    const handleAddToCart = () => {
        if (!selectedVariant) return;

        // For now, we'll use the variant ID as a placeholder
        // In a real implementation, you would need to get the actual event detail ID
        // that corresponds to this product variant
        addToCartMutation.mutate({
            ydetailseventidfk: selectedVariant.yvarprodid, // Using variant ID as placeholder
            ypanierqte: quantity,
        });
    };

    const handleDirectOrder = () => {
        // Implementation for direct order
        console.log("Direct order:", {
            productId: productData.yprodid,
            variantId: selectedVariant?.yvarprodid,
            quantity,
            selectedVariant,
        });
        // You would redirect to checkout or open order modal here
    };

    const toggleWishlist = () => {
        if (!selectedVariant) return;

        if (isInWishlist) {
            removeFromWishlistMutation.mutate({
                yvarprodidfk: selectedVariant.yvarprodid,
            });
        } else {
            addToWishlistMutation.mutate({
                yvarprodidfk: selectedVariant.yvarprodid,
            });
        }
    };

    // Early return if no approved variants
    if (!approvedVariants || approvedVariants.length === 0) {
        return (
            <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-gradient-to-br from-morpheus-blue-dark via-morpheus-blue-dark/95 to-morpheus-blue-light/90 backdrop-blur-md shadow-2xl shadow-black/50 rounded-lg p-8 max-w-md w-full text-center">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-morpheus-gold-light transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                    <h2 className="text-2xl font-bold text-white mb-4">
                        {t("productDetails.noVariantsAvailable") || "No Variants Available"}
                    </h2>
                    <p className="text-gray-300">
                        {t("productDetails.noVariantsMessage") || "This product currently has no available variants."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-sm">
            <div className="relative w-full h-full bg-gradient-to-br from-morpheus-blue-dark via-morpheus-blue-dark/95 to-morpheus-blue-light/90 backdrop-blur-md shadow-2xl shadow-black/50 overflow-y-auto">
                {/* Close button - top right */}
                <button
                    onClick={onClose}
                    className="fixed top-4 right-4 z-20 p-2 text-white/80 hover:text-morpheus-gold-light transition-all duration-300 hover:rotate-90 bg-black/20 backdrop-blur-sm rounded-full"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto p-6 pt-16">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Left Side - Images/3D Viewer */}
                        <div className="space-y-4">
                            {/* View Mode Toggle */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setViewMode("3d")}
                                    className={`px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg ${
                                        viewMode === "3d"
                                            ? "bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white"
                                            : "bg-white/10 text-gray-300 hover:text-white hover:bg-white/20"
                                    }`}
                                >
                                    {t("productDetails.view3D") || "3D View"}
                                </button>
                                {allMedia.length > 0 && (
                                    <button
                                        onClick={() => setViewMode("media")}
                                        className={`px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg ${
                                            viewMode === "media"
                                                ? "bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white"
                                                : "bg-white/10 text-gray-300 hover:text-white hover:bg-white/20"
                                        }`}
                                    >
                                        {t("productDetails.media") || "Images"}
                                    </button>
                                )}
                            </div>

                            {/* Main Display Area */}
                            <div className="aspect-square bg-white/5 rounded-lg overflow-hidden">
                                {viewMode === "media" ? (
                                    <div className="h-full flex flex-col">
                                        {/* Main Media */}
                                        <div className="flex-1 bg-white rounded-lg overflow-hidden">
                                            <div className="h-full flex items-center justify-center p-4">
                                                {allMedia[selectedMediaIndex] ? (
                                                    allMedia[selectedMediaIndex].ymediaboolvideo ? (
                                                        <video
                                                            src={allMedia[selectedMediaIndex].ymediaurl}
                                                            controls
                                                            className="max-h-full max-w-full object-contain"
                                                        />
                                                    ) : (
                                                        <Image
                                                            src={allMedia[selectedMediaIndex].ymediaurl}
                                                            alt={productData.yprodintitule}
                                                            width={600}
                                                            height={600}
                                                            className="max-h-full max-w-full object-contain"
                                                        />
                                                    )
                                                ) : (
                                                    <div className="text-gray-500">
                                                        {t("productDetails.noMediaAvailable") || "No media available"}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Media Thumbnails */}
                                        <div className="flex gap-4 overflow-x-auto p-4">
                                            {allMedia.map((media, index) => (
                                                <button
                                                    key={media.ymediaid}
                                                    onClick={() => setSelectedMediaIndex(index)}
                                                    className={`relative flex-shrink-0 w-16 h-16 bg-white rounded-lg overflow-hidden transition-all duration-300 ${
                                                        selectedMediaIndex === index
                                                            ? "ring-2 ring-morpheus-gold-light"
                                                            : "hover:ring-2 hover:ring-white/50"
                                                    }`}
                                                >
                                                    {media.ymediaboolvideo ? (
                                                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                            <svg
                                                                className="w-6 h-6 text-gray-600"
                                                                fill="currentColor"
                                                                viewBox="0 0 20 20"
                                                            >
                                                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                                            </svg>
                                                        </div>
                                                    ) : (
                                                        <Image
                                                            src={media.ymediaurl}
                                                            alt={`${t("productDetails.view") || "View"} ${index + 1}`}
                                                            width={64}
                                                            height={64}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    /* 3D Viewer */
                                    <div className="h-full w-full relative" style={{ backgroundColor: "#f0f0f0" }}>
                                        <Canvas
                                            camera={{ position: [120, 120, 120], fov: 30 }}
                                            shadows
                                            gl={{
                                                antialias: true,
                                                toneMapping: THREE.ACESFilmicToneMapping,
                                                toneMappingExposure: 1.2,
                                            }}
                                            style={{ width: "100%", height: "100%" }}
                                        >
                                            <Suspense fallback={<LoadingSpinner />}>
                                                <fog attach="fog" args={["#f0f0f0", 400, 1000]} />
                                                <ambientLight intensity={1.0} color="#ffffff" />
                                                <directionalLight
                                                    position={[150, 200, 150]}
                                                    intensity={3.0}
                                                    color="#ffffff"
                                                    castShadow
                                                    shadow-mapSize={[2048, 2048]}
                                                    shadow-camera-far={500}
                                                    shadow-camera-left={-200}
                                                    shadow-camera-right={200}
                                                    shadow-camera-top={200}
                                                    shadow-camera-bottom={-200}
                                                />
                                                <directionalLight
                                                    position={[-150, 200, -150]}
                                                    intensity={2.5}
                                                    color="#ffffff"
                                                />
                                                <pointLight
                                                    position={[200, 100, 0]}
                                                    intensity={2.5}
                                                    color="#ffffff"
                                                    distance={400}
                                                    decay={2}
                                                />
                                                <pointLight
                                                    position={[-200, 100, 0]}
                                                    intensity={2.5}
                                                    color="#ffffff"
                                                    distance={400}
                                                    decay={2}
                                                />
                                                <pointLight
                                                    position={[0, 100, 200]}
                                                    intensity={2.5}
                                                    color="#ffffff"
                                                    distance={400}
                                                    decay={2}
                                                />
                                                <pointLight
                                                    position={[0, 100, -200]}
                                                    intensity={2.5}
                                                    color="#ffffff"
                                                    distance={400}
                                                    decay={2}
                                                />
                                                <pointLight
                                                    position={[0, 300, 0]}
                                                    intensity={3.0}
                                                    color="#ffffff"
                                                    distance={500}
                                                    decay={2}
                                                />
                                                <pointLight
                                                    position={[0, -80, 0]}
                                                    intensity={1.5}
                                                    color="#ffffff"
                                                    distance={250}
                                                    decay={2}
                                                />

                                                <mesh
                                                    rotation={[-Math.PI / 2, 0, 0]}
                                                    position={[0, -50, 0]}
                                                    receiveShadow
                                                >
                                                    <planeGeometry args={[1000, 1000]} />
                                                    <shadowMaterial opacity={0.3} />
                                                </mesh>

                                                {selected3DModel && (
                                                    <ProductModel
                                                        url={selected3DModel.yobjet3durl}
                                                        name={productData.yprodintitule}
                                                    />
                                                )}

                                                <OrbitControls
                                                    enablePan={true}
                                                    enableZoom={true}
                                                    enableRotate={true}
                                                    maxPolarAngle={Math.PI / 2.2}
                                                    minDistance={60}
                                                    maxDistance={300}
                                                    target={[0, 15, 0]}
                                                    autoRotate={true}
                                                    autoRotateSpeed={0.5}
                                                />
                                            </Suspense>
                                        </Canvas>

                                        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                            {t("productDetails.preview3D") || "3D Preview"}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Side - Product Details */}
                        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8">
                            {/* Product Title */}
                            <h1 className="text-3xl font-bold text-white mb-2">{productData.yprodintitule}</h1>

                            {/* Price */}
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-4xl font-bold bg-gradient-to-r from-morpheus-gold-dark via-morpheus-gold-light to-morpheus-gold-dark bg-clip-text text-transparent">
                                    ${pricing.price.toFixed(2)}
                                </span>
                                {pricing.hasDiscount && pricing.originalPrice && (
                                    <span className="text-xl text-gray-400 line-through">
                                        ${pricing.originalPrice.toFixed(2)}
                                    </span>
                                )}
                            </div>

                            {/* Description */}
                            <p className="text-gray-300 leading-relaxed mb-8">{productData.yproddetailstech}</p>

                            {/* Color Selection */}
                            {availableColors.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-white mb-3">
                                        {t("productDetails.color") || "Color"}
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {availableColors.map((color) => (
                                            <button
                                                key={color.xcouleurid}
                                                onClick={() => handleColorChange(color.xcouleurid)}
                                                className={`w-12 h-12 rounded-full border-2 transition-all duration-300 relative group ${
                                                    selectedColorId === color.xcouleurid
                                                        ? "border-morpheus-gold-light scale-110 shadow-lg"
                                                        : "border-white/30 hover:border-white/60 hover:scale-105"
                                                }`}
                                                style={{ backgroundColor: color.xcouleurhexa }}
                                                title={color.xcouleurintitule}
                                            >
                                                {selectedColorId === color.xcouleurid && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <svg
                                                            className="w-5 h-5 text-white drop-shadow-lg"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Size Selection */}
                            {availableSizes.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-white mb-3">
                                        {t("productDetails.size") || "Size"}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {availableSizes.map((size) => (
                                            <button
                                                key={size.xtailleid}
                                                onClick={() => handleSizeChange(size.xtailleid)}
                                                className={`px-4 py-2 rounded-lg border transition-all duration-300 ${
                                                    selectedSizeId === size.xtailleid
                                                        ? "border-morpheus-gold-light bg-morpheus-gold-light/20 text-morpheus-gold-light"
                                                        : "border-white/30 text-gray-300 hover:border-white/60 hover:text-white"
                                                }`}
                                            >
                                                {size.xtailleintitule}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantity */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-white mb-3">
                                    {t("productDetails.quantity") || "Quantity"}
                                </h3>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 rounded-lg border border-white/30 text-white hover:border-white/60 hover:bg-white/10 transition-all duration-300 flex items-center justify-center text-lg font-semibold"
                                    >
                                        −
                                    </button>
                                    <span className="text-white text-xl font-bold w-12 text-center">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-10 h-10 rounded-lg border border-white/30 text-white hover:border-white/60 hover:bg-white/10 transition-all duration-300 flex items-center justify-center text-lg font-semibold"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-4 mb-6">
                                {/* Add to Cart & Wishlist Row */}
                                <div className="flex gap-4">
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={addToCartMutation.isPending || !selectedVariant}
                                        className={`flex-1 bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white py-4 px-6 font-semibold rounded-lg shadow-lg hover:shadow-morpheus-gold-light/30 transition-all duration-300 group ${
                                            addToCartMutation.isPending || !selectedVariant
                                                ? "opacity-50 cursor-not-allowed"
                                                : ""
                                        }`}
                                    >
                                        <span className="flex items-center justify-center">
                                            {addToCartMutation.isPending ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full mr-2"></div>
                                            ) : (
                                                <svg
                                                    className="w-5 h-5 mr-2"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                                    />
                                                </svg>
                                            )}
                                            {addToCartMutation.isPending
                                                ? "Adding..."
                                                : t("productDetails.addToCart") || "Add to Cart"}
                                        </span>
                                    </button>
                                    <button
                                        onClick={toggleWishlist}
                                        disabled={
                                            addToWishlistMutation.isPending || removeFromWishlistMutation.isPending
                                        }
                                        className={`w-14 h-14 rounded-lg border-2 transition-all duration-300 flex items-center justify-center ${
                                            isInWishlist
                                                ? "border-red-500 text-red-500 bg-red-50"
                                                : "border-white/30 text-gray-300 hover:border-white/60 hover:text-white"
                                        } ${
                                            addToWishlistMutation.isPending || removeFromWishlistMutation.isPending
                                                ? "opacity-50 cursor-not-allowed"
                                                : ""
                                        }`}
                                    >
                                        {addToWishlistMutation.isPending || removeFromWishlistMutation.isPending ? (
                                            <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
                                        ) : (
                                            <svg
                                                className="w-6 h-6"
                                                fill={isInWishlist ? "currentColor" : "none"}
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
                                        )}
                                    </button>
                                </div>

                                {/* Buy Now Button */}
                                <button
                                    onClick={handleDirectOrder}
                                    className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-4 px-6 font-semibold rounded-lg shadow-lg hover:shadow-green-500/30 transition-all duration-300"
                                >
                                    <span className="flex items-center justify-center">
                                        <svg
                                            className="w-5 h-5 mr-2"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13 10V3L4 14h7v7l9-11h-7z"
                                            />
                                        </svg>
                                        {t("productDetails.buyNow") || "Buy Now"}
                                    </span>
                                </button>
                            </div>

                            {/* Delivery Info */}
                            {selectedVariant && selectedVariant.yvarprodnbrjourlivraison > 0 && (
                                <div className="p-4 bg-white/5 rounded-lg">
                                    <div className="flex items-center text-sm text-gray-300">
                                        <svg
                                            className="w-4 h-4 mr-2 text-morpheus-gold-light"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                                        </svg>
                                        {t("productDetails.deliveryIn") || "Delivery in"}{" "}
                                        {selectedVariant.yvarprodnbrjourlivraison} {t("productDetails.days") || "days"}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
