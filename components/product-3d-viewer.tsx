"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";
import { Loader2, Play, Pause, Maximize2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";

// Types
type Media = {
  id: number;
  url: string;
  title: string;
  type: 'image' | 'video';
  position?: { x: number; y: number; z: number };
};

type Variant = {
  id: number;
  name: string;
  color?: string;
  size?: string;
  price?: number;
  currency?: string;
};

interface Product3DViewerProps {
  modelUrl: string;
  productName: string;
  media?: Media[];
  variants?: Variant[];
  className?: string;
  height?: string;
  showControls?: boolean;
  autoRotate?: boolean;
  compact?: boolean;
}

// Loading component for 3D model
function LoadingSpinner() {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center text-white bg-black/70 backdrop-blur-sm px-4 py-3 rounded-lg border border-gray-600">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400 mb-2" />
        <div className="text-sm font-medium text-gray-200">
          Loading 3D Model...
        </div>
      </div>
    </Html>
  );
}

function ModelError({ productName }: { productName: string }) {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center text-white bg-red-900/70 backdrop-blur-sm px-6 py-4 rounded-lg border border-red-600">
        <div className="text-2xl mb-2">⚠️</div>
        <div className="text-sm font-medium text-red-200 mb-1">
          Failed to load 3D model
        </div>
        <div className="text-xs text-red-300 text-center max-w-48">
          {productName}
        </div>
      </div>
    </Html>
  );
}

// Media Hotspot Component
function MediaHotspot({ 
  media, 
  position, 
  onClick 
}: { 
  media: Media; 
  position: [number, number, number]; 
  onClick: (media: Media) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <mesh
      position={position}
      onClick={() => onClick(media)}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <sphereGeometry args={[hovered ? 1.2 : 1, 16, 16]} />
      <meshStandardMaterial
        color={media.type === 'video' ? '#ef4444' : '#3b82f6'}
        emissive={media.type === 'video' ? '#7f1d1d' : '#1e3a8a'}
        emissiveIntensity={hovered ? 0.3 : 0.1}
        transparent
        opacity={hovered ? 0.8 : 0.6}
      />
      <Html distanceFactor={10} position={[0, 2, 0]}>
        <div className={`
          px-2 py-1 rounded text-xs font-medium transition-all duration-200 pointer-events-none
          ${hovered 
            ? 'bg-black/90 text-white scale-110 shadow-lg' 
            : 'bg-black/70 text-gray-300 scale-100'
          }
        `}>
          {media.type === 'video' ? '🎥' : '📷'} {media.title}
        </div>
      </Html>
    </mesh>
  );
}

// GLB Model Loader Component
function GLBModel({ 
  url, 
  name, 
  media = [], 
  onMediaClick 
}: { 
  url: string; 
  name: string; 
  media?: Media[];
  onMediaClick: (media: Media) => void;
}) {
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

        // Define target size (smaller for approval context)
        const targetSize = 35;

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
        setNormalizedScale([3, 3, 3]);
      }
    }
  }, [gltf]);

  if (!url || url === "") {
    return <ModelError productName={name} />;
  }

  try {
    if (!gltf || !gltf.scene) {
      return <ModelError productName={name} />;
    }

    const clonedScene = gltf.scene.clone();

    // Apply shadow settings to cloned scene
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return (
      <group>
        <primitive object={clonedScene} scale={normalizedScale} />
        
        {/* Render media hotspots */}
        {media.map((mediaItem, index) => (
          <MediaHotspot
            key={mediaItem.id}
            media={mediaItem}
            position={mediaItem.position ? [mediaItem.position.x, mediaItem.position.y, mediaItem.position.z] : [10 + index * 5, 10, 10]}
            onClick={onMediaClick}
          />
        ))}
      </group>
    );
  } catch (error) {
    console.error("Error in GLBModel component:", error);
    return <ModelError productName={name} />;
  }
}

// Product Model wrapper component
function ProductModel({ 
  url, 
  name, 
  media, 
  onMediaClick 
}: { 
  url: string; 
  name: string; 
  media?: Media[];
  onMediaClick: (media: Media) => void;
}) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <GLBModel url={url} name={name} media={media} onMediaClick={onMediaClick} />
    </Suspense>
  );
}

// Media Modal Component
function MediaModal({
  media,
  onClose
}: {
  media: Media | null;
  onClose: () => void;
}) {
  if (!media) return null;

  return (
    <Dialog open={!!media} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-4 bg-black/95 border-gray-600">
        <VisuallyHidden>
          <DialogTitle>Media Preview: {media.title}</DialogTitle>
        </VisuallyHidden>
        
        {media.type === 'video' ? (
          <video
            src={media.url}
            controls
            autoPlay
            className="max-w-full max-h-full rounded-lg"
          />
        ) : (
          <img
            src={media.url}
            alt={media.title}
            className="max-w-full max-h-full rounded-lg"
          />
        )}
        
        <div className="mt-2 text-white text-center">
          <h3 className="font-semibold">{media.title}</h3>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Product3DViewer({
  modelUrl,
  productName,
  media = [],
  variants = [],
  className = "",
  height = "400px",
  showControls = true,
  autoRotate = false,
  compact = false
}: Product3DViewerProps) {
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(autoRotate);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [showHotspots, setShowHotspots] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle media click
  const handleMediaClick = useCallback((media: Media) => {
    setSelectedMedia(media);
  }, []);

  // Toggle fullscreen
  const handleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const currentVariant = variants[selectedVariant] || null;

  return (
    <>
      <div 
        className={`
          relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border border-gray-300 shadow-lg overflow-hidden
          ${isFullscreen ? 'fixed inset-0 z-40' : ''}
          ${className}
        `}
        style={{ height: isFullscreen ? '100vh' : height }}
      >
        {/* Header */}
        {!compact && (
          <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/60 to-transparent p-3">
            <div className="flex justify-between items-center">
              <div className="text-white">
                <h3 className="font-semibold text-sm">{productName}</h3>
                {currentVariant && (
                  <p className="text-xs opacity-80">{currentVariant.name}</p>
                )}
              </div>
              
              {/* Variant Selector */}
              {variants.length > 1 && (
                <select
                  value={selectedVariant}
                  onChange={(e) => setSelectedVariant(Number(e.target.value))}
                  className="bg-black/50 text-white text-xs rounded px-2 py-1 border border-white/20"
                >
                  {variants.map((variant, index) => (
                    <option key={variant.id} value={index} className="bg-black text-white">
                      {variant.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        )}

        {/* 3D Canvas */}
        <Canvas
          camera={{
            position: [80, 80, 80],
            fov: compact ? 35 : 30
          }}
          shadows
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.0
          }}
          style={{ width: '100%', height: '100%' }}
        >
          <Suspense fallback={<LoadingSpinner />}>
            {/* Lighting Setup */}
            <ambientLight intensity={0.8} color="#ffffff" />
            
            <directionalLight
              position={[100, 150, 100]}
              intensity={2.0}
              color="#ffffff"
              castShadow
              shadow-mapSize={[1024, 1024]}
              shadow-camera-far={300}
              shadow-camera-left={-100}
              shadow-camera-right={100}
              shadow-camera-top={100}
              shadow-camera-bottom={-100}
            />
            
            <pointLight
              position={[150, 80, 0]}
              intensity={1.5}
              color="#ffffff"
              distance={250}
              decay={2}
            />
            
            <pointLight
              position={[-150, 80, 0]}
              intensity={1.5}
              color="#ffffff"
              distance={250}
              decay={2}
            />

            {/* Ground plane for shadows */}
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, -30, 0]}
              receiveShadow
            >
              <planeGeometry args={[500, 500]} />
              <shadowMaterial opacity={0.2} />
            </mesh>

            {/* 3D Model */}
            <ProductModel 
              url={modelUrl} 
              name={productName}
              media={showHotspots ? media : []}
              onMediaClick={handleMediaClick}
            />

            {/* Controls */}
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              maxPolarAngle={Math.PI / 2.1}
              minDistance={40}
              maxDistance={200}
              target={[0, 10, 0]}
              autoRotate={isAutoRotating}
              autoRotateSpeed={0.8}
            />
          </Suspense>
        </Canvas>

        {/* 3D indicator badge */}
        <div className="absolute top-2 right-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg z-20">
          3D Preview
        </div>

        {/* Media count badge */}
        {media.length > 0 && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-green-600 to-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg z-20">
            {media.length} Media
          </div>
        )}

        {/* Controls */}
        {showControls && (
          <div className="absolute bottom-3 left-3 right-3 z-20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setIsAutoRotating(!isAutoRotating)}
                  className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                >
                  {isAutoRotating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                </Button>
                

                {media.length > 0 && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setShowHotspots(!showHotspots)}
                    className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                  >
                    {showHotspots ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </Button>
                )}
              </div>

              <Button
                size="default"
                variant="secondary"
                onClick={handleFullscreen}
                className="bg-black/50 hover:bg-black/70 text-white border-white/20 h-10 w-10 p-0"
              >
                <Maximize2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Fullscreen close button */}
        {isFullscreen && (
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-black/70 hover:bg-black/90 text-white rounded-full flex items-center justify-center z-30"
          >
            ×
          </button>
        )}
      </div>

      {/* Media Modal */}
      <MediaModal media={selectedMedia} onClose={() => setSelectedMedia(null)} />
    </>
  );
}

// Preload GLTF models utility function
export const preloadGLTF = (url: string) => {
  useGLTF.preload(url);
};
