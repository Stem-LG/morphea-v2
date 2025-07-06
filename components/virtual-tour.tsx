"use client";

import { useEffect, useRef, useState } from "react";
import { Viewer } from "@photo-sphere-viewer/core";
import { AutorotatePlugin } from "@photo-sphere-viewer/autorotate-plugin";
import { MarkersPlugin } from "@photo-sphere-viewer/markers-plugin";
import ProductsListModal from "./products-list-modal";
import { InfoSpotAction, TOUR_DATA } from "@/app/_consts/tourdata";

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
    const addMarkers = () => {
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
            background: #e9d079; 
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
    };

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
    const handleMarkerClick = (e: {
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
    };

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
                                    ? "bg-gradient-to-r from-[#785730] to-[#e9d079] text-white"
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
