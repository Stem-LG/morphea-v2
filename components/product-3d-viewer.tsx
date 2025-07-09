"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import { Suspense } from "react";
import { useLanguage } from "@/hooks/useLanguage";

// Preload the GLB models
useGLTF.preload("/3d/tree1.glb");
useGLTF.preload("/3d/tree2.glb");

// Loading component for 3D model
function LoadingSpinner() {
    const { t } = useLanguage();
    
    return (
        <Html center>
            <div className="flex flex-col items-center justify-center text-white bg-black/50 backdrop-blur-sm px-6 py-4">
                <img src="/loading.gif" alt="Loading" className="h-12 w-12 mx-auto mb-4" />
                <div className="text-lg font-medium bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light bg-clip-text text-transparent font-parisienne">
                    {t('product3DViewer.loading')}
                </div>
                <div className="text-sm text-gray-300 mt-1">{t('product3DViewer.pleaseWait')}</div>
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
                <div className="text-6xl mb-4">{name.includes("Palm") ? "🌴" : "🌳"}</div>
                <div className="text-lg font-medium bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light bg-clip-text text-transparent font-parisienne mb-2">
                    {name}
                </div>
                <div className="text-sm text-gray-300 text-center">{t('product3DViewer.modelPreviewComingSoon')}</div>
            </div>
        </Html>
    );
}

// GLB Model Loader Component
function GLBModel({ url, name }: { url: string; name: string }) {
    console.log("Attempting to load GLB from:", url);

    // Always call useGLTF unconditionally
    const gltf = useGLTF(url);

    // Check if the URL is valid after calling the hook
    if (!url || url === "") {
        console.error("Invalid URL provided");
        return <ModelNotFound name={name} />;
    }

    try {
        console.log("GLTF loaded successfully:", gltf);

        if (!gltf || !gltf.scene) {
            console.error("Invalid GLTF data - no scene found");
            return <ModelNotFound name={name} />;
        }

        // Clone the scene to avoid issues with multiple instances
        const clonedScene = gltf.scene.clone();
        console.log("Using 3D model for:", name);

        return <primitive object={clonedScene} scale={[10, 10, 10]} />;
    } catch (error) {
        console.error("Error in GLBModel component:", error);
        return <ModelNotFound name={name} />;
    }
}

// Error boundary wrapper for GLB loading
function SafeGLBModel({ url, name }: { url: string; name: string }) {
    try {
        return <GLBModel url={url} name={name} />;
    } catch (error) {
        console.error("GLB Model failed to render:", error);
        return <ModelNotFound name={name} />;
    }
}

// Individual product model component
function ProductModel({ url, name }: { url: string; name: string }) {
    console.log("ProductModel component loading:", { url, name });

    return (
        <Suspense fallback={<LoadingSpinner />}>
            <SafeGLBModel url={url} name={name} />
        </Suspense>
    );
}

interface Product3DViewerProps {
    productData: {
        id: string;
        name: string;
        model: string;
        description: string;
    };
    onClose: () => void;
}

export default function Product3DViewer({ productData, onClose }: Product3DViewerProps) {
    const { t } = useLanguage();
    
    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl h-[80vh] bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light border border-slate-700 overflow-hidden">
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold font-parisienne bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light bg-clip-text text-transparent">
                                {productData.name}
                            </h2>
                            <p className="text-sm text-gray-300">{t('product3DViewer.modelViewer')}</p>
                        </div>
                        <button onClick={onClose} className="text-white hover:text-morpheus-gold-light transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                {/* 3D Viewer */}
                <div className="w-full h-full">
                    <Canvas camera={{ position: [100, 100, 100], fov: 45 }} style={{ background: "#ffffff" }}>
                        <Suspense fallback={<LoadingSpinner />}>
                            {/* Enhanced lighting setup */}
                            <ambientLight intensity={1.2} />

                            {/* Main directional light (sun-like) */}
                            <directionalLight
                                position={[80, 120, 50]}
                                intensity={2.5}
                                castShadow={true}
                                shadow-mapSize-width={2048}
                                shadow-mapSize-height={2048}
                            />

                            {/* Fill lights to reduce harsh shadows */}
                            <pointLight position={[-60, 60, -60]} intensity={1.5} color="#fff7e6" />
                            <pointLight position={[60, 60, 60]} intensity={1.5} color="#e6f3ff" />
                            <pointLight position={[0, 80, 0]} intensity={1.0} color="#ffffff" />

                            {/* Additional point lights for better coverage */}
                            <pointLight position={[100, 100, 0]} intensity={1.0} color="#ffffff" />
                            <pointLight position={[-100, 100, 0]} intensity={1.0} color="#ffffff" />
                            <pointLight position={[0, 100, 100]} intensity={1.0} color="#ffffff" />
                            <pointLight position={[0, 100, -100]} intensity={1.0} color="#ffffff" />

                            {/* Rim lighting for better definition */}
                            <spotLight
                                position={[-40, 80, 40]}
                                intensity={1.5}
                                angle={0.5}
                                penumbra={0.5}
                                color="#fff9e6"
                            />

                            {/* Additional spotlights for dramatic lighting */}
                            <spotLight
                                position={[40, 80, -40]}
                                intensity={1.5}
                                angle={0.5}
                                penumbra={0.5}
                                color="#e6f3ff"
                            />

                            {/* Product Model */}
                            <ProductModel url={productData.model} name={productData.name} />

                            {/* Camera Controls with adjusted distances */}
                            <OrbitControls
                                enablePan={true}
                                enableZoom={true}
                                enableRotate={true}
                                maxPolarAngle={Math.PI / 2.2}
                                minDistance={50}
                                maxDistance={400}
                                target={[0, 20, 0]}
                                autoRotate={false}
                                autoRotateSpeed={1}
                            />
                        </Suspense>
                    </Canvas>
                </div>

                {/* Controls Info */}
                <div className="absolute bottom-4 left-4 right-4 z-10">
                    <div className="bg-black/70 backdrop-blur-sm p-3">
                        <div className="flex justify-between items-center text-white text-sm">
                            <div>
                                <span className="font-semibold">{t('product3DViewer.controls')}</span>
                                <span className="ml-2">
                                    {t('product3DViewer.dragToRotate')} • {t('product3DViewer.scrollToZoom')} • {t('product3DViewer.rightClickToPan')}
                                </span>
                            </div>
                            <button
                                onClick={onClose}
                                className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-[#695029] hover:to-[#d4c066] px-3 py-1 transition-colors rounded-none"
                            >
                                {t('product3DViewer.backToProductsList')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
