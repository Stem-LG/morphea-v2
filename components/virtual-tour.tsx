"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Viewer } from "@photo-sphere-viewer/core";
import { AutorotatePlugin } from "@photo-sphere-viewer/autorotate-plugin";
import { MarkersPlugin } from "@photo-sphere-viewer/markers-plugin";
import ProductsListModal from "./products-list-modal";

// Type definitions for tour data
interface InfoSpotAction {
    id?: string;
    type: "alert" | "modal" | "custom";
    modalType?: "tree-inventory" | string;
    customHandler?: string;
}

interface InfoSpot {
    position: { yaw: number; pitch: number };
    title: string;
    text: string;
    action: InfoSpotAction;
}

interface SceneLink {
    nodeId: string;
    position: { yaw: number; pitch: number };
    name: string;
}

interface Scene {
    id: string;
    name: string;
    panorama: string;
    initialView: {
        yaw: number;
        pitch: number;
        fov: number;
    };
    links: SceneLink[];
    infoSpots: InfoSpot[];
}

interface TourData {
    scenes: Scene[];
}

// Tour data converted from Marzipano format
const TOUR_DATA: TourData = {
    scenes: [
        {
            id: "0-key-biscayne-2",
            name: "Key Biscayne 2",
            panorama: "https://photo-sphere-viewer-data.netlify.app/assets/tour/key-biscayne-2.jpg",
            initialView: {
                yaw: 1.1336577326040196,
                pitch: 0.23814987400952958,
                fov: 1.4488196474276132,
            },
            links: [
                {
                    nodeId: "1-key-biscayne-3",
                    position: { yaw: 2.893400865239564, pitch: 0.1709109194111189 },
                    name: "Key Biscayne 3",
                },
                {
                    nodeId: "4-key-biscayne-1",
                    position: { yaw: -0.531815479113158, pitch: 0.027308378719935078 },
                    name: "Key Biscayne 1",
                },
            ],
            infoSpots: [
                {
                    position: { yaw: 0.744697120630752, pitch: 0.21497175500675247 },
                    title: "section 1 products",
                    text: "Look at these amazing tropical trees typical of Key Biscayne's landscape!",
                    action: {
                        id: "store-1-section-1-products",
                        type: "modal",
                        modalType: "products-list",
                    },
                },
                {
                    position: { yaw: -0.744697120630752, pitch: -0.21497175500675247 },
                    title: "section 2 products",
                    text: "Look at these amazing tropical trees typical of Key Biscayne's landscape!",
                    action: {
                        id: "store-1-section-2-products",
                        type: "modal",
                        modalType: "products-list",
                    },
                },
            ],
        },
        {
            id: "1-key-biscayne-3",
            name: "Key Biscayne 3",
            panorama: "https://photo-sphere-viewer-data.netlify.app/assets/tour/key-biscayne-3.jpg",
            initialView: {
                yaw: 0,
                pitch: 0,
                fov: 1.5707963267948966,
            },
            links: [
                {
                    nodeId: "0-key-biscayne-2",
                    position: { yaw: -0.18474699939073957, pitch: 0.15360608373157092 },
                    name: "Key Biscayne 2",
                },
                {
                    nodeId: "2-key-biscayne-4",
                    position: { yaw: -1.6698032389065691, pitch: 0.08672819911773644 },
                    name: "Key Biscayne 4",
                },
            ],
            infoSpots: [],
        },
        {
            id: "2-key-biscayne-4",
            name: "Key Biscayne 4",
            panorama: "https://photo-sphere-viewer-data.netlify.app/assets/tour/key-biscayne-4.jpg",
            initialView: {
                yaw: 0,
                pitch: 0,
                fov: 1.5707963267948966,
            },
            links: [
                {
                    nodeId: "3-key-biscayne-5",
                    position: { yaw: -2.736698300684429, pitch: 0.08522144663561093 },
                    name: "Key Biscayne 5",
                },
                {
                    nodeId: "0-key-biscayne-2",
                    position: { yaw: -0.5963643135940444, pitch: 0.09789476509356554 },
                    name: "Key Biscayne 2",
                },
            ],
            infoSpots: [
                {
                    position: { yaw: 0.8, pitch: 0.15 },
                    title: "Coastal Path",
                    text: "A scenic walking path that runs along the coastline, perfect for morning jogs.",
                    action: {
                        type: "alert",
                    },
                },
            ],
        },
        {
            id: "3-key-biscayne-5",
            name: "Key Biscayne 5",
            panorama: "https://photo-sphere-viewer-data.netlify.app/assets/tour/key-biscayne-5.jpg",
            initialView: {
                yaw: 0,
                pitch: 0,
                fov: 1.5707963267948966,
            },
            links: [
                {
                    nodeId: "2-key-biscayne-4",
                    position: { yaw: -1.548428403774265, pitch: 0.08733478802806971 },
                    name: "Key Biscayne 4",
                },
            ],
            infoSpots: [
                {
                    position: { yaw: 2.1, pitch: 0.1 },
                    title: "Mangrove Area",
                    text: "Protected mangrove ecosystem that serves as a natural habitat for local wildlife.",
                    action: {
                        type: "alert",
                    },
                },
            ],
        },
        {
            id: "4-key-biscayne-1",
            name: "Key Biscayne 1",
            panorama: "https://photo-sphere-viewer-data.netlify.app/assets/tour/key-biscayne-1.jpg",
            initialView: {
                yaw: 0,
                pitch: 0,
                fov: 1.5707963267948966,
            },
            links: [
                {
                    nodeId: "0-key-biscayne-2",
                    position: { yaw: 2.4558190395405024, pitch: 0.15457025486422538 },
                    name: "Key Biscayne 2",
                },
            ],
            infoSpots: [],
        },
    ],
};

interface VirtualTourProps {
    className?: string;
    height?: string;
    width?: string;
    startingScene?: string;
    showNavbar?: boolean;
    disableAutorotate?: boolean;
}

export default function VirtualTour({
    className = "",
    height = "100vh",
    width = "100%",
    startingScene = "0-key-biscayne-2",
    showNavbar = true,
    disableAutorotate = false,
}: VirtualTourProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<Viewer | null>(null);
    const markersPluginRef = useRef<MarkersPlugin | null>(null);
    const [currentScene, setCurrentScene] = useState(startingScene);
    const [productsList, setProductsList] = useState<string | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        if (!containerRef.current) return;

        const initializeViewer = () => {
            const currentSceneData = TOUR_DATA.scenes.find((scene) => scene.id === currentScene);
            if (!currentSceneData) return;

            // Initialize Photo Sphere Viewer only once
            viewerRef.current = new Viewer({
                container: containerRef.current!,
                panorama: currentSceneData.panorama,
                defaultYaw: currentSceneData.initialView.yaw,
                defaultPitch: currentSceneData.initialView.pitch,
                defaultZoomLvl: currentSceneData.initialView.fov,
                minFov: 30,
                maxFov: 120,
                loadingImg: "", // Remove loading icon
                loadingTxt: "", // Remove loading text
                navbar: showNavbar ? ["autorotate", "zoom", "fullscreen"] : false,
                plugins: disableAutorotate
                    ? [
                          [
                              MarkersPlugin,
                              {
                                  markers: [],
                              },
                          ],
                      ]
                    : [
                          [
                              AutorotatePlugin,
                              {
                                  autostartDelay: 3000,
                                  autostartOnIdle: true,
                                  autorotateSpeed: "2rpm",
                              },
                          ],
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
    }, [showNavbar]);

    // Separate effect for scene transitions
    useEffect(() => {
        if (!viewerRef.current) return;

        const currentSceneData = TOUR_DATA.scenes.find((scene) => scene.id === currentScene);
        if (!currentSceneData) return;

        const transitionToScene = async () => {
            try {
                setIsTransitioning(true);

                // Use setPanorama for smooth transitions
                await viewerRef.current!.setPanorama(currentSceneData.panorama, {
                    transition: true, // Enable smooth transition
                    showLoader: false, // Disable loading screen
                });

                // Animate to new view position
                viewerRef.current!.animate({
                    yaw: currentSceneData.initialView.yaw,
                    pitch: currentSceneData.initialView.pitch,
                    zoom: currentSceneData.initialView.fov,
                    speed: "2rpm",
                });

                // Update markers after transition
                setTimeout(() => {
                    addMarkers();
                    setIsTransitioning(false);
                }, 200);
            } catch (error) {
                console.error("Error transitioning to scene:", error);
                setIsTransitioning(false);
            }
        };

        transitionToScene();
    }, [currentScene]);

    // Add markers for navigation links and info spots
    const addMarkers = useCallback(() => {
        if (!markersPluginRef.current) return;

        const currentSceneData = TOUR_DATA.scenes.find((scene) => scene.id === currentScene);
        if (!currentSceneData) return;

        // Clear existing markers
        markersPluginRef.current.clearMarkers();

        // Add navigation link markers
        currentSceneData.links.forEach((link, index) => {
            markersPluginRef.current?.addMarker({
                id: `link-${index}`,
                position: { yaw: link.position.yaw, pitch: link.position.pitch },
                image: "/explore.svg", // Using existing icon
                size: { width: 32, height: 32 },
                anchor: "center center",
                tooltip: {
                    content: `Go to ${link.name}`,
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
            i
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
    }, [currentScene]);

    // Handle different action types dynamically
    const handleInfoSpotAction = (action: InfoSpotAction, title: string, text: string) => {
        switch (action.type) {
            case "modal":
                if (action.modalType === "products-list") {
                    setProductsList(action.id!);
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
        if (isTransitioning) return; // Prevent clicks during transitions

        const marker = e.marker;
        if (marker.data?.nodeId) {
            // Navigate to another scene
            setCurrentScene(marker.data.nodeId);
        } else if (marker.data?.type === "info" && marker.data.action) {
            // Handle info spot action dynamically
            handleInfoSpotAction(marker.data.action, marker.data.title || "", marker.data.text || "");
        }
    }, [isTransitioning, setCurrentScene, setProductsList]);

    return (
        <div className={`relative ${className}`} style={{ height, width }}>
            <div ref={containerRef} className="w-full h-full" style={{ height, width }} />

            {/* Scene information overlay */}
            <div className="absolute top-4 left-4 z-10 bg-black/70 text-white px-4 py-2 rounded-lg">
                <h3 className="font-semibold">{TOUR_DATA.scenes.find((scene) => scene.id === currentScene)?.name}</h3>
                <p className="text-sm opacity-75">
                    {TOUR_DATA.scenes.findIndex((scene) => scene.id === currentScene) + 1} of {TOUR_DATA.scenes.length}
                </p>
            </div>

            {/* Scene Navigation Menu */}
            <div className="absolute top-4 right-4 z-10 bg-black/70 text-white rounded-lg p-2">
                <div className="flex flex-col space-y-1">
                    {TOUR_DATA.scenes.map((scene, index) => (
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
            </div>

            {/* Navigation hints */}
            <div className="absolute bottom-4 left-4 right-4 z-10 bg-black/70 text-white px-4 py-2 rounded-lg text-center">
                <p className="text-sm">
                    Click markers to navigate smoothly between locations • Click info markers for details
                </p>
            </div>

            {/* Tree Inventory Modal */}
            <ProductsListModal isOpen={productsList} onClose={() => setProductsList(null)} />
        </div>
    );
}
