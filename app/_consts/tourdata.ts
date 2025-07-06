// Type definitions for tour data
export interface InfoSpotAction {
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

export const TOUR_DATA: TourData = {
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