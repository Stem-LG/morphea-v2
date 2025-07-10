"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Viewer } from "@photo-sphere-viewer/core";
import { MarkersPlugin } from "@photo-sphere-viewer/markers-plugin";
import ProductsListModal from "./products-list-modal";
import { InfoSpotAction, getTourData, TourData, Scene } from "@/app/_consts/tourdata";

interface VirtualTourProps {
    className?: string;
    height?: string;
    width?: string;
    startingScene?: string;
    showNavbar?: boolean;
    accountForNavbar?: boolean; // New prop to account for navbar height
}

export default function VirtualTour({
    className = "",
    height = "100vh",
    width = "100%",
    startingScene = "i1",
    showNavbar = true,
    accountForNavbar = true, // Default to true to account for navbar
}: VirtualTourProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<Viewer | null>(null);
    const markersPluginRef = useRef<MarkersPlugin | null>(null);
    const [currentScene, setCurrentScene] = useState(startingScene);
    const [productsList, setProductsList] = useState<string | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [tourData, setTourData] = useState<TourData>({ scenes: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Calculate the actual height accounting for navbar
    const getActualHeight = () => {
        if (accountForNavbar && height === "100vh") {
            return "calc(100vh - 4rem)"; // 4rem is the navbar height (h-16)
        }
        return height;
    };

    const actualHeight = getActualHeight();

    // Function to preload all scene images
    const preloadSceneImages = useCallback(async (scenes: Scene[]) => {
        if (scenes.length === 0) return;
        
        
        const imagePromises = scenes.map(scene => {
            return new Promise<string>((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    setPreloadedImages(prev => new Set(prev).add(scene.panorama));
                    resolve(scene.panorama);
                };
                img.onerror = () => {
                    console.warn(`Failed to preload scene image: ${scene.panorama}`);
                    // Still resolve to not block other images
                    resolve(scene.panorama);
                };
                img.src = scene.panorama;
            });
        });

        try {
            await Promise.all(imagePromises);
        } catch (error) {
            console.error('Error preloading scene images:', error);
        }
    }, []);

    // Fetch tour data from Supabase
    useEffect(() => {
        const fetchTourData = async () => {
            try {
                setIsLoading(true);
                const data = await getTourData();
                setTourData(data);
                
                // Update starting scene if the data has scenes and the default scene doesn't exist
                if (data.scenes.length > 0) {
                    const sceneExists = data.scenes.some(scene => scene.id === startingScene);
                    if (!sceneExists) {
                        setCurrentScene(data.scenes[0].id);
                    }
                    
                    // Start preloading all scene images
                    preloadSceneImages(data.scenes);
                }
            } catch (error) {
                console.error('Failed to fetch tour data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTourData();
    }, [startingScene, preloadSceneImages]);

    useEffect(() => {
        if (!containerRef.current || isLoading || !tourData.scenes.length) return;

        const initializeViewer = () => {
            const currentSceneData = tourData.scenes.find((scene) => scene.id === currentScene);
            if (!currentSceneData) return;

            // Initialize Photo Sphere Viewer only once
            viewerRef.current = new Viewer({
                container: containerRef.current!,
                panorama: currentSceneData.panorama,
                minFov: 30,
                maxFov: 120,
                loadingImg: "/loading.gif", // Remove loading icon
                loadingTxt: "", // Remove loading text
                navbar: showNavbar ? ["zoom", "plein écran"] : false,
                plugins: [
                    [
                        MarkersPlugin,
                        {
                            markers: [],
                        },
                    ],
                ],
            });

            // Store plugin references
            markersPluginRef.current = viewerRef.current.getPlugin(MarkersPlugin) as MarkersPlugin;

            // Set up event listeners
            viewerRef.current.addEventListener("ready", addMarkers);
            markersPluginRef.current?.addEventListener("select-marker", handleMarkerClick);
            
        };

        // Only initialize viewer once
        if (!viewerRef.current) {
            initializeViewer();
        }

        // Cleanup function
        return () => {
            if (viewerRef.current) {
                viewerRef.current.destroy();
                viewerRef.current = null;
            }
        };
    }, [showNavbar, tourData, isLoading]);

    // Separate effect for scene transitions
    useEffect(() => {
        if (!viewerRef.current || !tourData.scenes.length) return;

        const currentSceneData = tourData.scenes.find((scene) => scene.id === currentScene);
        if (!currentSceneData) return;

        const transitionToScene = async () => {
            try {
                console.log('Starting transition to scene:', currentSceneData.id, 'Initial load:', isInitialLoad);
                
                // Skip transition effect on initial load
                if (isInitialLoad) {
                    console.log('Initial load - setting panorama without transition');
                    await viewerRef.current!.setPanorama(currentSceneData.panorama, {
                        transition: false, // Disable transition on initial load
                        showLoader: false,
                    });
                    
                    // Add markers immediately on initial load
                    setTimeout(() => {
                        console.log('Initial load completed, adding markers');
                        addMarkers();
                    }, 500);
                    
                    setIsInitialLoad(false);
                    return;
                }
                
                // Normal transition for scene changes
                setIsTransitioning(true);

                // Check if image is preloaded for faster transition
                const isImagePreloaded = preloadedImages.has(currentSceneData.panorama);
                
                // Use setPanorama for smooth transitions
                await viewerRef.current!.setPanorama(currentSceneData.panorama, {
                    transition: true, // Enable smooth transition
                    showLoader: !isImagePreloaded, // Only show loader if image isn't preloaded
                });

                // Animate to new view position
                viewerRef.current!.animate({
                    yaw: currentSceneData.initialView.yaw,
                    pitch: currentSceneData.initialView.pitch,
                    zoom: currentSceneData.initialView.fov,
                    speed: "2rpm",
                });

                // Update markers after transition (faster for preloaded images)
                const delay = isImagePreloaded ? 100 : 200;
                setTimeout(() => {
                    console.log('Transition completed, updating markers');
                    addMarkers();
                    setIsTransitioning(false);
                }, delay);
            } catch (error) {
                console.error("Error transitioning to scene:", error);
                setIsTransitioning(false);
            }
        };

        transitionToScene();
    }, [currentScene, tourData, preloadedImages]);

    // Add markers for navigation links and info spots
    const addMarkers = useCallback(() => {
        if (!markersPluginRef.current || !tourData.scenes.length) return;

        const currentSceneData = tourData.scenes.find((scene) => scene.id === currentScene);
        if (!currentSceneData) return;

        // Clear existing markers
        markersPluginRef.current.clearMarkers();

        // Add navigation link markers
        currentSceneData.links.forEach((link, index) => {
            markersPluginRef.current?.addMarker({
                id: `link-${index}`,
                position: { yaw: link.position.yaw, pitch: link.position.pitch },
                image: "/explore.svg", // Using existing icon
                size: { width: 40, height: 40 },
                anchor: "center center",
                tooltip: {
                    content: `${link.name}`,
                    position: "top center",
                },
                data: {
                    nodeId: link.nodeId,
                },
            });
        });

        // Add info spot markers
        currentSceneData.infoSpots.forEach((info, index) => {
            markersPluginRef.current?.addMarker({
                id: `info-${index}`,
                position: { yaw: info.position.yaw, pitch: info.position.pitch },
                html: `
          <div style="
            width: 32px; 
            height: 32px; 
            background: var(--morpheus-gold-light); 
            border: 3px solid white; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            color: white; 
            font-weight: bold; 
            font-size: 16px;
            cursor: pointer;
            animation: pulse 2s infinite;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </div>
          <style>
            @keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.1); }
              100% { transform: scale(1); }
            }
          </style>
        `,
                anchor: "center center",
                tooltip: {
                    content: info.title,
                    position: "top center",
                },
                data: {
                    type: "info",
                    title: info.title,
                    text: info.text,
                    action: info.action,
                },
            });
        });
    }, [currentScene, tourData]);

    // Handle different action types dynamically
    const handleInfoSpotAction = (action: InfoSpotAction, title: string, text: string) => {
        console.log('InfoSpot action triggered:', { action, title, text, currentScene });
        
        switch (action.type) {
            case "modal":
                if (action.modalType === "products-list") {
                    // Use the action ID to fetch products linked to this infospot action
                    console.log('Opening products list for action ID:', action.id);
                    setProductsList(action.id || currentScene);
                }
                // Add other modal types here as needed
                break;

            case "alert":
                alert(`${title}\n\n${text}`);
                break;

            case "custom":
                // Handle custom actions based on customHandler
                console.log(`Custom action: ${action.customHandler}`);
                break;

            default:
                console.warn(`Unknown action type: ${action.type}`);
                // Fallback to alert
                alert(`${title}\n\n${text}`);
        }
    };

    // Handle marker clicks
    const handleMarkerClick = useCallback((e: {
        marker: { data?: { nodeId?: string; type?: string; title?: string; text?: string; action?: InfoSpotAction } };
    }) => {
        console.log('Marker clicked:', e.marker);
        console.log('Is transitioning:', isTransitioning);
        
        if (isTransitioning) {
            console.log('Ignoring click - transitioning');
            return; // Prevent clicks during transitions
        }

        const marker = e.marker;
        if (marker.data?.nodeId) {
            // Navigate to another scene
            console.log('Navigating to scene:', marker.data.nodeId);
            setCurrentScene(marker.data.nodeId);
        } else if (marker.data?.type === "info" && marker.data.action) {
            // Handle info spot action dynamically
            console.log('Handling info spot action');
            handleInfoSpotAction(marker.data.action, marker.data.title || "", marker.data.text || "");
        }
    }, [isTransitioning, setCurrentScene, setProductsList]);

    if (isLoading) {
        return (
            <div className={`relative ${className} flex items-center justify-center bg-gray-100`} style={{ height: actualHeight, width }}>
                <div className="text-center">
                    <img src="/loading.gif" alt="Loading" className="h-12 w-12 mx-auto mb-4" />
                    <p className="text-gray-600">Chargement de la visite virtuelle...</p>
                </div>
            </div>
        );
    }

    if (!tourData.scenes.length) {
        return (
            <div className={`relative ${className} flex items-center justify-center bg-gray-100`} style={{ height: actualHeight, width }}>
                <div className="text-center">
                    <p className="text-gray-600">Aucune scène de visite disponible</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`relative ${className}`} style={{ height: actualHeight, width }}>
            <div ref={containerRef} className="w-full h-full" style={{ height: actualHeight, width }} />

            {/* Scene information overlay */}
            <div className="absolute top-4 left-4 z-10 bg-black/70 text-white px-4 py-2 rounded-lg">
                <h3 className="font-semibold">{tourData.scenes.find((scene) => scene.id === currentScene)?.name}</h3>
                <p className="text-sm opacity-75">
                    {tourData.scenes.findIndex((scene) => scene.id === currentScene) + 1} sur {tourData.scenes.length}
                </p>
            </div>

            {/* Scene Navigation Menu */}
            {/* <div className="absolute top-4 right-4 z-10 bg-black/70 text-white rounded-lg p-2">
                <div className="flex flex-col space-y-1">
                    {tourData.scenes.map((scene, index) => (
                        <button
                            key={scene.id}
                            onClick={() => !isTransitioning && setCurrentScene(scene.id)}
                            disabled={isTransitioning}
                            className={`px-3 py-2 text-sm transition-colors ${
                                currentScene === scene.id
                                    ? "bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white"
                                    : isTransitioning
                                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                    : "hover:bg-white/20 text-gray-300"
                            }`}
                        >
                            {index + 1}. {scene.name}
                        </button>
                    ))}
                </div>
            </div> */}

            {/* Navigation hints */}
            {/* <div className="absolute bottom-4 left-4 right-4 z-10 bg-black/70 text-white px-4 py-2 rounded-lg text-center">
                <p className="text-sm">
                    Cliquez sur les marqueurs pour naviguer entre les lieux • Cliquez sur les marqueurs d&apos;information pour plus de détails
                </p>
            </div> */}

            {/* Tree Inventory Modal */}
            <ProductsListModal isOpen={productsList} onClose={() => setProductsList(null)} />
        </div>
    );
}
