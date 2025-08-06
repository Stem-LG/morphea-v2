"use client";

import { useState, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";

interface Model3DViewerProps {
    modelUrl: string;
    className?: string;
    autoRotate?: boolean;
}

// Loading component for 3D model
function LoadingSpinner() {
    return (
        <Html center>
            <div className="flex flex-col items-center justify-center text-white bg-black/50 backdrop-blur-sm px-4 py-3 rounded-lg">
                <div className="w-8 h-8 border-2 border-purple-400 rounded-full border-t-purple-300 animate-spin mb-2"></div>
                <div className="text-sm font-medium text-gray-300">
                    Loading 3D Model
                </div>
            </div>
        </Html>
    );
}

// Error fallback component
function ModelNotFound({ name }: { name: string }) {
    return (
        <Html center>
            <div className="flex flex-col items-center justify-center text-white bg-black/70 backdrop-blur-sm px-6 py-4 border border-gray-600 rounded-lg">
                <div className="text-4xl mb-3">🌳</div>
                <div className="text-base font-medium text-gray-300 mb-1">
                    {name}
                </div>
                <div className="text-xs text-gray-400 text-center">3D Model Preview</div>
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

                // Define target size (smaller for approval cards)
                const targetSize = 2;

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
                setNormalizedScale([1, 1, 1]);
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
        console.error("Error in GLBModel component:", error, { url, name });
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

export function Model3DViewer({ modelUrl, className = "", autoRotate = false }: Model3DViewerProps) {
    if (!modelUrl) {
        return (
            <div className={`bg-gray-800 rounded-lg flex items-center justify-center ${className}`}>
                <div className="text-gray-400 text-sm">No 3D model available</div>
            </div>
        );
    }

    return (
        <div className={`bg-gray-100 rounded-lg overflow-hidden ${className}`} style={{ backgroundColor: "#f0f0f0" }}>
            <Canvas
                camera={{ position: [3, 3, 3], fov: 50 }}
                shadows
                gl={{
                    antialias: true,
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: 1.2,
                }}
                style={{ width: "100%", height: "100%" }}
            >
                <Suspense fallback={<LoadingSpinner />}>
                    <fog attach="fog" args={["#f0f0f0", 10, 30]} />
                    <ambientLight intensity={1.0} color="#ffffff" />
                    <directionalLight
                        position={[5, 8, 5]}
                        intensity={2.0}
                        color="#ffffff"
                        castShadow
                        shadow-mapSize={[1024, 1024]}
                        shadow-camera-far={50}
                        shadow-camera-left={-10}
                        shadow-camera-right={10}
                        shadow-camera-top={10}
                        shadow-camera-bottom={-10}
                    />
                    <directionalLight
                        position={[-5, 8, -5]}
                        intensity={1.5}
                        color="#ffffff"
                    />
                    <pointLight
                        position={[8, 4, 0]}
                        intensity={1.5}
                        color="#ffffff"
                        distance={20}
                        decay={2}
                    />
                    <pointLight
                        position={[-8, 4, 0]}
                        intensity={1.5}
                        color="#ffffff"
                        distance={20}
                        decay={2}
                    />

                    <mesh
                        rotation={[-Math.PI / 2, 0, 0]}
                        position={[0, -2, 0]}
                        receiveShadow
                    >
                        <planeGeometry args={[20, 20]} />
                        <shadowMaterial opacity={0.3} />
                    </mesh>

                    <ProductModel url={modelUrl} name="Product Model" />

                    <OrbitControls
                        enablePan={true}
                        enableZoom={true}
                        enableRotate={true}
                        maxPolarAngle={Math.PI / 2.2}
                        minDistance={2}
                        maxDistance={10}
                        target={[0, 0, 0]}
                        autoRotate={autoRotate}
                        autoRotateSpeed={0.5}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
}