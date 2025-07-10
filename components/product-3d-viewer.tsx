"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import { Suspense } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import * as THREE from "three";

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
        
        // Enable shadows for all meshes in the model
        clonedScene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
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
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl h-[80vh] bg-gradient-to-br from-morpheus-blue-dark via-morpheus-blue-dark/95 to-morpheus-blue-light/90 backdrop-blur-md border-2 border-morpheus-gold-dark/30 shadow-2xl shadow-black/50 overflow-hidden rounded-xl">
                {/* Decorative top border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-morpheus-gold-dark via-morpheus-gold-light to-morpheus-gold-dark"></div>
                
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 via-black/30 to-transparent backdrop-blur-sm p-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold font-parisienne bg-gradient-to-r from-morpheus-gold-dark via-morpheus-gold-light to-morpheus-gold-dark bg-clip-text text-transparent drop-shadow-lg">
                                {productData.name}
                            </h2>
                            <p className="text-sm text-gray-300 mt-1">{t('product3DViewer.modelViewer')}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="group relative p-2 text-white/80 hover:text-morpheus-gold-light transition-all duration-300 hover:rotate-90"
                        >
                            <div className="absolute inset-0 bg-morpheus-gold-light/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                            <svg className="relative w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="w-full h-full pt-16 relative">
                    <div className="h-full bg-gradient-to-br from-morpheus-blue-dark/10 via-transparent to-morpheus-blue-light/10 rounded-lg border-2 border-morpheus-gold-dark/20 shadow-inner m-4">
                        {/* Gradient overlay for depth */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none z-10 rounded-lg"></div>
                        
                        <Canvas
                            camera={{ position: [100, 100, 100], fov: 45 }}
                            shadows
                            gl={{
                                antialias: true,
                                toneMapping: THREE.ACESFilmicToneMapping,
                                toneMappingExposure: 1.2
                            }}
                        >
                            <Suspense fallback={<LoadingSpinner />}>
                                {/* Environment and Fog for atmosphere */}
                                <fog attach="fog" args={['#f0f0f0', 300, 800]} />
                                
                                {/* Main ambient light - bright white overall illumination */}
                                <ambientLight intensity={1.0} color="#ffffff" />
                                
                                {/* Key light - main directional light pure white */}
                                <directionalLight
                                    position={[100, 150, 100]}
                                    intensity={3.0}
                                    color="#ffffff"
                                    castShadow
                                    shadow-mapSize={[2048, 2048]}
                                    shadow-camera-far={400}
                                    shadow-camera-left={-150}
                                    shadow-camera-right={150}
                                    shadow-camera-top={150}
                                    shadow-camera-bottom={-150}
                                />
                                
                                {/* Secondary directional light from opposite side */}
                                <directionalLight
                                    position={[-100, 150, -100]}
                                    intensity={2.5}
                                    color="#ffffff"
                                />
                                
                                {/* Front light */}
                                <pointLight
                                    position={[150, 80, 0]}
                                    intensity={2.5}
                                    color="#ffffff"
                                    distance={300}
                                    decay={2}
                                />
                                
                                {/* Back light */}
                                <pointLight
                                    position={[-150, 80, 0]}
                                    intensity={2.5}
                                    color="#ffffff"
                                    distance={300}
                                    decay={2}
                                />
                                
                                {/* Left side light */}
                                <pointLight
                                    position={[0, 80, 150]}
                                    intensity={2.5}
                                    color="#ffffff"
                                    distance={300}
                                    decay={2}
                                />
                                
                                {/* Right side light */}
                                <pointLight
                                    position={[0, 80, -150]}
                                    intensity={2.5}
                                    color="#ffffff"
                                    distance={300}
                                    decay={2}
                                />
                                
                                {/* Top light - bright white from above */}
                                <pointLight
                                    position={[0, 200, 0]}
                                    intensity={3.0}
                                    color="#ffffff"
                                    distance={400}
                                    decay={2}
                                />
                                
                                {/* Bottom fill light - white upward illumination */}
                                <pointLight
                                    position={[0, -50, 0]}
                                    intensity={1.5}
                                    color="#ffffff"
                                    distance={200}
                                    decay={2}
                                />
                                
                                {/* Corner lights for complete coverage */}
                                <pointLight position={[120, 100, 120]} intensity={2.0} color="#ffffff" distance={250} decay={2} />
                                <pointLight position={[-120, 100, 120]} intensity={2.0} color="#ffffff" distance={250} decay={2} />
                                <pointLight position={[120, 100, -120]} intensity={2.0} color="#ffffff" distance={250} decay={2} />
                                <pointLight position={[-120, 100, -120]} intensity={2.0} color="#ffffff" distance={250} decay={2} />
                                
                                {/* Spot lights for additional brightness */}
                                <spotLight
                                    position={[150, 200, 150]}
                                    angle={0.4}
                                    penumbra={0.5}
                                    intensity={2.5}
                                    color="#ffffff"
                                    castShadow
                                    target-position={[0, 0, 0]}
                                />
                                
                                <spotLight
                                    position={[-150, 200, -150]}
                                    angle={0.4}
                                    penumbra={0.5}
                                    intensity={2.5}
                                    color="#ffffff"
                                    target-position={[0, 0, 0]}
                                />
                                
                                {/* Ground plane for shadows */}
                                <mesh
                                    rotation={[-Math.PI / 2, 0, 0]}
                                    position={[0, -30, 0]}
                                    receiveShadow
                                >
                                    <planeGeometry args={[500, 500]} />
                                    <shadowMaterial opacity={0.3} />
                                </mesh>

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
                                    autoRotate={true}
                                    autoRotateSpeed={0.5}
                                />
                            </Suspense>
                        </Canvas>
                        
                        {/* 3D indicator badge */}
                        <div className="absolute top-4 right-4 bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg z-20">
                            3D Model
                        </div>
                    </div>
                </div>

                {/* Controls Info */}
                <div className="absolute bottom-4 left-4 right-4 z-10">
                    <div className="bg-morpheus-blue-dark/80 backdrop-blur-sm p-4 rounded-lg border border-morpheus-gold-dark/30">
                        <div className="flex justify-between items-center text-white text-sm">
                            <div className="flex items-center space-x-4">
                                <span className="font-semibold text-morpheus-gold-light">{t('product3DViewer.controls')}:</span>
                                <div className="flex items-center space-x-3 text-gray-300">
                                    <span className="flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                                        </svg>
                                        {t('product3DViewer.dragToRotate')}
                                    </span>
                                    <span className="text-morpheus-gold-dark">•</span>
                                    <span className="flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
                                        </svg>
                                        {t('product3DViewer.scrollToZoom')}
                                    </span>
                                    <span className="text-morpheus-gold-dark">•</span>
                                    <span className="flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
                                        </svg>
                                        {t('product3DViewer.rightClickToPan')}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="relative overflow-hidden bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white px-4 py-2 font-medium rounded-lg shadow-lg hover:shadow-morpheus-gold-light/30 transition-all duration-300 group"
                            >
                                <span className="relative z-10">{t('product3DViewer.backToProductsList')}</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-morpheus-gold-light to-morpheus-gold-dark opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
