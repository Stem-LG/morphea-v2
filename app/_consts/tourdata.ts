import { createClient } from '@/lib/client'

// Type definitions for tour data
export interface InfoSpotAction {
    id?: string;
    type: "alert" | "modal" | "custom";
    modalType?: "products-list" | string;
    customHandler?: string;
}

export interface InfoSpot {
    position: { yaw: number; pitch: number };
    title: string;
    text: string;
    action: InfoSpotAction;
}

export interface SceneLink {
    nodeId: string;
    position: { yaw: number; pitch: number };
    name: string;
}

export interface Scene {
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

export interface TourData {
    scenes: Scene[];
}

// Function to fetch tour data from Supabase
export async function getTourData(): Promise<TourData> {
    const supabase = createClient()
    
    try {
        // Fetch all scenes
        const { data: scenesData, error: scenesError } = await supabase
            .schema('morpheus')
            .from('yscenes')
            .select('*')
            .order('yid')
        
        if (scenesError) {
            console.error('Error fetching scenes:', scenesError)
            throw scenesError
        }
        
        if (!scenesData || scenesData.length === 0) {
            return { scenes: [] }
        }
        
        // Fetch all scene links
        const { data: linksData, error: linksError } = await supabase
            .schema('morpheus')
            .from('yscenelinks')
            .select('*')
            .order('ycreatedat')
        
        if (linksError) {
            console.error('Error fetching scene links:', linksError)
            throw linksError
        }
        
        // Fetch all info spots with their actions
        const { data: infospotsData, error: infospotsError } = await supabase
            .schema('morpheus')
            .from('yinfospots')
            .select(`
                *,
                yinfospotactions (*)
            `)
            .order('ycreatedat')
        
        if (infospotsError) {
            console.error('Error fetching info spots:', infospotsError)
            throw infospotsError
        }
        
        // Transform the data to match the expected format
        const scenes: Scene[] = scenesData.map(scene => {
            // Get links for this scene
            const sceneLinks = linksData?.filter(link => link.ysceneid === scene.yid) || []
            const links: SceneLink[] = sceneLinks.map(link => ({
                nodeId: link.ytargetid,
                position: { yaw: link.yyaw, pitch: link.ypitch },
                name: link.yname
            }))
            
            // Get info spots for this scene
            const sceneInfoSpots = infospotsData?.filter(infospot => infospot.ysceneid === scene.yid) || []
            const infoSpots: InfoSpot[] = sceneInfoSpots.map(infospot => {
                const action: InfoSpotAction = {
                    type: (infospot.yinfospotactions?.ytype as "alert" | "modal" | "custom") || "alert",
                }
                
                // Add optional action properties if they exist
                if (infospot.yinfospotactions?.yinfospotactionsid) {
                    action.id = infospot.yinfospotactions.yinfospotactionsid
                }
                if (infospot.yinfospotactions?.ymodaltype) {
                    action.modalType = infospot.yinfospotactions.ymodaltype
                }
                if (infospot.yinfospotactions?.ycustomhandler) {
                    action.customHandler = infospot.yinfospotactions.ycustomhandler
                }
                
                return {
                    position: { yaw: infospot.yyaw, pitch: infospot.ypitch },
                    title: infospot.ytitle,
                    text: infospot.ytext,
                    action
                }
            })
            
            return {
                id: scene.yid,
                name: scene.yname,
                panorama: scene.ypanorama,
                initialView: {
                    yaw: scene.yyaw,
                    pitch: scene.ypitch,
                    fov: scene.yfov
                },
                links,
                infoSpots
            }
        })
        
        return { scenes }
        
    } catch (error) {
        console.error('Error fetching tour data:', error)
        // Return empty tour data as fallback
        return { scenes: [] }
    }
}