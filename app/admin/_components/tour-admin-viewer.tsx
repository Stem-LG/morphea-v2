'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Viewer } from '@photo-sphere-viewer/core'
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Edit, Plus, Trash2, Eye, Settings } from 'lucide-react'
import { useScenes } from '@/hooks/useScenes'
import { useInfospots } from '@/hooks/useInfospots'
import { useSceneLinks } from '@/hooks/useSceneLinks'
import { useInfoactions } from '@/hooks/useInfoactions'
import { useLanguage } from '@/hooks/useLanguage'
import { Database } from '@/lib/supabase'

type Scene = Database['morpheus']['Tables']['yscenes']['Row']
type InfoSpot = Database['morpheus']['Tables']['yinfospots']['Row']
type SceneLink = Database['morpheus']['Tables']['yscenelinks']['Row']

interface TourAdminViewerProps {
  initialSceneId?: string
  height?: string
  width?: string
  className?: string
}

export default function TourAdminViewer({
  initialSceneId,
  height = '70vh',
  width = '100%',
  className = ''
}: TourAdminViewerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null)
  const [viewerInstance, setViewerInstance] = useState<Viewer | null>(null)

  const { scenes, loading: scenesLoading, deleteScene, refreshScenes, createScene } = useScenes()
  const { infospots, loading: infospotsLoading, createInfospot, updateInfospot, deleteInfospot } = useInfospots()
  const { scenelinks, loading: scenelinksLoading, createSceneLink, updateSceneLink, deleteSceneLink } = useSceneLinks()
  const { actions, createAction } = useInfoactions()

  const [currentScene, setCurrentScene] = useState<Scene | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [selectedMarkerPosition, setSelectedMarkerPosition] = useState<{ yaw: number; pitch: number } | null>(null)
  const [adminMode, setAdminMode] = useState<'view' | 'edit'>('view')
  const [isHandlingEdit, setIsHandlingEdit] = useState(false)
  const [isModeTransitioning, setIsModeTransitioning] = useState(false)
  const [forceStopTransitions, setForceStopTransitions] = useState(false)
  const [isViewerInitializing, setIsViewerInitializing] = useState(false)
  
  // Inline editing states
  const [inlineEditingInfospot, setInlineEditingInfospot] = useState<InfoSpot | null>(null)
  const [inlineEditingSceneLink, setInlineEditingSceneLink] = useState<SceneLink | null>(null)
  const [previewMarkerPosition, setPreviewMarkerPosition] = useState<{ yaw: number; pitch: number } | null>(null)
  
  // States for inline adding
  const [inlineAddingInfospot, setInlineAddingInfospot] = useState<boolean>(false)
  const [inlineAddingSceneLink, setInlineAddingSceneLink] = useState<boolean>(false)
  const [addingMarkerPosition, setAddingMarkerPosition] = useState<{ yaw: number; pitch: number } | null>(null)
  
  // State for viewing infospot details
  const [viewingInfospot, setViewingInfospot] = useState<InfoSpot | null>(null)
  
  // State for adding new action
  const [isAddingAction, setIsAddingAction] = useState<boolean>(false)
  const [newActionForm, setNewActionForm] = useState({
    title: '',
    type: '',
    description: ''
  })
  
  // State for adding new scene
  const [isAddingScene, setIsAddingScene] = useState<boolean>(false)
  const [newSceneForm, setNewSceneForm] = useState({
    name: '',
    panorama: '',
    yaw: 0,
    pitch: 0,
    fov: 50
  })
  
  // Refs to store current state values to avoid stale closure issues
  const adminModeRef = useRef(adminMode)
  const isTransitioningRef = useRef(isTransitioning)
  const isHandlingEditRef = useRef(isHandlingEdit)
  const forceStopTransitionsRef = useRef(forceStopTransitions)
  
  // Update refs whenever state changes
  useEffect(() => {
    adminModeRef.current = adminMode
  }, [adminMode])
  
  useEffect(() => {
    isTransitioningRef.current = isTransitioning
  }, [isTransitioning])
  
  useEffect(() => {
    isHandlingEditRef.current = isHandlingEdit
  }, [isHandlingEdit])
  
  useEffect(() => {
    forceStopTransitionsRef.current = forceStopTransitions
  }, [forceStopTransitions])

  const loading = scenesLoading || infospotsLoading || scenelinksLoading


  // Initialize current scene with URL persistence
  useEffect(() => {
    if (scenes.length > 0 && !currentScene) {
      // Check URL for scene ID first, then initialSceneId prop, then default to first scene
      const urlSceneId = searchParams.get('sceneId')
      const targetSceneId = urlSceneId || initialSceneId
      
      const initialScene = targetSceneId
        ? scenes.find(s => s.yid === targetSceneId) || scenes[0]
        : scenes[0]
      
      setCurrentScene(initialScene)
      
      // Update URL if scene ID is not already in URL
      if (initialScene && !urlSceneId) {
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.set('sceneId', initialScene.yid)
        router.replace(newUrl.pathname + newUrl.search)
      }
    }
  }, [scenes, initialSceneId, currentScene, searchParams, router])

  // Initialize Photo Sphere Viewer (only once)
  useEffect(() => {
    if (!containerElement || !currentScene || loading || isViewerInitializing || viewerInstance) return

    const initializeViewer = () => {
      setIsViewerInitializing(true)
      
      try {
        const viewer = new Viewer({
          container: containerElement!,
          panorama: currentScene.ypanorama,
          minFov: 30,
          maxFov: 120,
          loadingImg: "/loading.gif",
          loadingTxt: "",
          navbar: ["zoom", "fullscreen"],
          plugins: [
            [
              MarkersPlugin,
              {
                markers: [],
              },
            ],
          ],
        })

        const plugin = viewer.getPlugin(MarkersPlugin) as MarkersPlugin
        setViewerInstance(viewer)

        viewer.addEventListener("ready", () => {
          setIsViewerInitializing(false)
          addMarkers()
        })

        // Handle marker clicks - use both events to ensure we catch all clicks
        plugin?.addEventListener("select-marker", handleMarkerClick)
        plugin?.addEventListener("enter-marker", (e: any) => {
          console.log('Marker entered:', e)
        })
        plugin?.addEventListener("leave-marker", (e: any) => {
          console.log('Marker left:', e)
        })

        // Handle viewer clicks for adding new markers in edit mode
        viewer.addEventListener("click", handleViewerClick)
        
        // Also listen for position updates to debug
        viewer.addEventListener("position-updated", (e: any) => {
          console.log('Position updated:', e.position)
        })
      } catch (error) {
        console.error('Error initializing viewer:', error)
        setIsViewerInitializing(false)
      }
    }

    initializeViewer()

    return () => {
      if (viewerInstance) {
        try {
          console.log('Cleaning up viewer in useEffect cleanup')
          // Check if viewer is still attached to DOM before destroying
          if (viewerInstance.container && viewerInstance.container.parentNode) {
            viewerInstance.destroy()
          } else {
            console.log('Viewer container already detached, skipping destroy')
          }
        } catch (error) {
          console.warn('Error destroying viewer in cleanup:', error)
        } finally {
          setViewerInstance(null)
        }
      }
    }
  }, [containerElement, currentScene?.yid, loading])

  // Separate effect for scene transitions (like virtual-tour.tsx)
  useEffect(() => {
    if (!viewerInstance || !currentScene || loading) return

    const transitionToScene = async () => {
      try {
        console.log('Starting smooth transition to scene:', currentScene.yid, currentScene.yname)
        
        setIsTransitioning(true)
        
        // Use setPanorama for smooth transitions (like virtual-tour.tsx)
        await viewerInstance.setPanorama(currentScene.ypanorama, {
          transition: true,
          showLoader: true,
        })

        // Update markers after transition with reduced delay
        setTimeout(() => {
          console.log('Transition completed, updating markers')
          addMarkers()
          setIsTransitioning(false)
        }, 200) // Reduced delay for faster feel
      } catch (error) {
        console.error("Error transitioning to scene:", error)
        setIsTransitioning(false)
      }
    }

    transitionToScene()
  }, [currentScene?.yid, viewerInstance, loading])

  // Global handlers setup (separate from viewer initialization)
  useEffect(() => {
    // Add global handlers for marker clicks - use refs to get current values
    (window as any).handleSceneLinkClick = (linkId: string, targetId: string) => {
      console.log('Global scene link click handler called:', linkId, targetId)
      
      const currentMode = adminModeRef.current
      const currentScenelinks = scenelinks
      const currentScenes = scenes
      
      console.log('Scene link click - current mode:', currentMode)
      
      if (currentMode === 'edit') {
        console.log('Edit mode detected - opening inline edit for scene link')
        // Edit mode: Open inline edit (force stop any transitions)
        setForceStopTransitions(true)
        setIsTransitioning(false)
        
        const sceneLink = currentScenelinks.find(link => link.yid === linkId)
        if (sceneLink) {
          setInlineEditingSceneLink(sceneLink)
          setPreviewMarkerPosition({ yaw: sceneLink.yyaw, pitch: sceneLink.ypitch })
        }
      } else {
        console.log('View mode detected - navigating to target scene')
        // View mode: Navigate to target scene (only if not force stopped)
        if (!forceStopTransitionsRef.current) {
          const targetScene = currentScenes.find(s => s.yid === targetId)
          if (targetScene) {
            console.log('Navigating to scene via global handler:', targetScene.yname)
            setCurrentScene(targetScene)
            
            // Update URL with new scene ID
            const newUrl = new URL(window.location.href)
            newUrl.searchParams.set('sceneId', targetScene.yid)
            router.replace(newUrl.pathname + newUrl.search)
          }
        }
      }
    }

    (window as any).handleInfospotClick = (infospotId: string) => {
      console.log('Global infospot click handler called:', infospotId)
      
      const currentMode = adminModeRef.current
      const currentInfospots = infospots
      
      console.log('Infospot click - current mode:', currentMode)
      
      if (currentMode === 'edit') {
        console.log('Edit mode detected - opening inline edit for infospot')
        // Edit mode: Open inline edit
        const infospot = currentInfospots.find(spot => spot.yid === infospotId)
        if (infospot) {
          setInlineEditingInfospot(infospot)
          setPreviewMarkerPosition({ yaw: infospot.yyaw, pitch: infospot.ypitch })
        }
      } else {
        console.log('View mode detected - showing infospot details')
        // View mode: Show infospot information in modal
        const infospot = currentInfospots.find(spot => spot.yid === infospotId)
        if (infospot) {
          setViewingInfospot(infospot)
        }
      }
    }

    return () => {
      // Clean up global handlers
      try {
        delete (window as any).handleSceneLinkClick
        delete (window as any).handleInfospotClick
      } catch (error) {
        console.warn('Error cleaning up global handlers:', error)
      }
    }
  }, [scenelinks, scenes, infospots, router])


  // Update markers when data changes or admin mode changes
  useEffect(() => {
    if (viewerInstance && currentScene) {
      console.log('Updating markers due to data/mode/scene change, admin mode:', adminMode, 'current scene:', currentScene.yid, currentScene.yname)
      
      // Force clear all markers first to ensure clean state
      const markersPluginInstance = viewerInstance.getPlugin(MarkersPlugin) as MarkersPlugin
      if (markersPluginInstance) {
        markersPluginInstance.clearMarkers()
      }
      
      // Add a small delay to ensure admin mode ref is updated and markers are cleared
      setTimeout(() => {
        console.log('Calling addMarkers after delay for scene:', currentScene.yid)
        addMarkers()
      }, 100)
    }
  }, [infospots, scenelinks, currentScene?.yid, adminMode, viewerInstance])

  // Update preview marker in real-time when position changes (for editing)
  useEffect(() => {
    if (viewerInstance && previewMarkerPosition && (inlineEditingInfospot || inlineEditingSceneLink)) {
      const markersPluginInstance = viewerInstance.getPlugin(MarkersPlugin) as MarkersPlugin
      if (markersPluginInstance) {
        // Remove existing preview marker
        try {
          markersPluginInstance.removeMarker('preview-marker')
        } catch {
          // Marker doesn't exist, ignore
        }

        // Add new preview marker at updated position
        markersPluginInstance.addMarker({
          id: 'preview-marker',
          position: { yaw: previewMarkerPosition.yaw, pitch: previewMarkerPosition.pitch },
          html: `
            <div style="
              width: 50px;
              height: 50px;
              background: #ff0000;
              border: 4px solid #ffffff;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 20px;
              cursor: pointer;
              animation: previewPulse 1s infinite;
              box-shadow: 0 4px 12px rgba(255,0,0,0.5);
              opacity: 0.9;
            ">
              ✎
            </div>
            <style>
              @keyframes previewPulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
              }
            </style>
          `,
          anchor: "center center",
          tooltip: {
            content: "Preview Position - Editing Mode",
            position: "top center",
          },
        })
      }
    } else if (viewerInstance && !previewMarkerPosition) {
      // Remove preview marker when not editing
      const markersPluginInstance = viewerInstance.getPlugin(MarkersPlugin) as MarkersPlugin
      if (markersPluginInstance) {
        try {
          markersPluginInstance.removeMarker('preview-marker')
        } catch {
          // Marker doesn't exist, ignore
        }
      }
    }
  }, [previewMarkerPosition, inlineEditingInfospot, inlineEditingSceneLink, viewerInstance])

  // Update adding preview marker in real-time when position changes (for adding)
  useEffect(() => {
    if (viewerInstance && addingMarkerPosition && (inlineAddingInfospot || inlineAddingSceneLink)) {
      const markersPluginInstance = viewerInstance.getPlugin(MarkersPlugin) as MarkersPlugin
      if (markersPluginInstance) {
        // Remove existing adding preview marker
        try {
          markersPluginInstance.removeMarker('adding-preview-marker')
        } catch {
          // Marker doesn't exist, ignore
        }

        // Add new adding preview marker at updated position
        markersPluginInstance.addMarker({
          id: 'adding-preview-marker',
          position: { yaw: addingMarkerPosition.yaw, pitch: addingMarkerPosition.pitch },
          html: `
            <div style="
              width: 50px;
              height: 50px;
              background: #10b981;
              border: 4px solid #ffffff;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 20px;
              cursor: pointer;
              animation: addingPulse 1s infinite;
              box-shadow: 0 4px 12px rgba(16,185,129,0.5);
              opacity: 0.9;
            ">
              +
            </div>
            <style>
              @keyframes addingPulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
              }
            </style>
          `,
          anchor: "center center",
          tooltip: {
            content: `Preview Position - Adding ${inlineAddingInfospot ? 'InfoSpot' : 'Scene Link'}`,
            position: "top center",
          },
        })
      }
    } else if (viewerInstance && !addingMarkerPosition) {
      // Remove adding preview marker when not adding
      const markersPluginInstance = viewerInstance.getPlugin(MarkersPlugin) as MarkersPlugin
      if (markersPluginInstance) {
        try {
          markersPluginInstance.removeMarker('adding-preview-marker')
        } catch {
          // Marker doesn't exist, ignore
        }
      }
    }
  }, [addingMarkerPosition, inlineAddingInfospot, inlineAddingSceneLink, viewerInstance])

  const handleViewerClick = useCallback((e: any) => {
    console.log('Viewer clicked:', e, 'Admin mode:', adminMode)
    
    if (adminMode === 'edit' && !inlineEditingInfospot && !inlineEditingSceneLink) {
      // Try different ways to get the position data
      let position = null
      
      if (e.data && e.data.yaw !== undefined && e.data.pitch !== undefined) {
        position = { yaw: e.data.yaw, pitch: e.data.pitch }
      } else if (e.yaw !== undefined && e.pitch !== undefined) {
        position = { yaw: e.yaw, pitch: e.pitch }
      } else if (viewerInstance) {
        // Get current viewer position as fallback
        const currentPosition = viewerInstance.getPosition()
        position = { yaw: currentPosition.yaw, pitch: currentPosition.pitch }
      }
      
      console.log('Setting position:', position)
      if (position) {
        // If we're in inline adding mode, set the adding position
        if (inlineAddingInfospot || inlineAddingSceneLink) {
          setAddingMarkerPosition(position)
        } else {
          setSelectedMarkerPosition(position)
        }
      }
    }
  }, [adminMode, inlineEditingInfospot, inlineEditingSceneLink, inlineAddingInfospot, inlineAddingSceneLink, viewerInstance])

  const addMarkers = useCallback(() => {
    if (!viewerInstance || !currentScene) {
      console.log('Cannot add markers - missing viewer or current scene:', {
        hasViewer: !!viewerInstance,
        currentScene: currentScene?.yid
      })
      return
    }

    const markersPluginInstance = viewerInstance.getPlugin(MarkersPlugin) as MarkersPlugin
    if (!markersPluginInstance) {
      console.log('Markers plugin not available yet')
      return
    }

    console.log('Adding markers for scene:', currentScene.yid, currentScene.yname)
    
    // Inline the marker adding logic to avoid circular dependency
    markersPluginInstance.clearMarkers()

    // Add scene link markers - filter by current scene ID
    const currentSceneLinks = scenelinks.filter(link => link.ysceneid === currentScene.yid)
    console.log('Scene links for current scene:', currentSceneLinks.length, currentSceneLinks.map(l => l.yname))
    
    currentSceneLinks.forEach((link) => {
      const targetScene = scenes.find(s => s.yid === link.ytargetid)
      
      // Create custom HTML for scene link markers with click handling
      const markerHtml = `
        <div
          style="
            width: 40px;
            height: 40px;
            background-image: url('/explore.svg');
            background-size: contain;
            background-repeat: no-repeat;
            cursor: pointer;
            position: relative;
          "
          data-marker-type="scenelink"
          data-marker-id="${link.yid}"
          data-target-id="${link.ytargetid}"
          onclick="event.stopPropagation(); event.preventDefault(); window.handleSceneLinkClick('${link.yid}', '${link.ytargetid}');"
        ></div>
      `
      
      markersPluginInstance.addMarker({
        id: `link-${link.yid}`,
        position: { yaw: link.yyaw, pitch: link.ypitch },
        html: markerHtml,
        anchor: "center center",
        tooltip: {
          content: adminModeRef.current === 'edit'
            ? `Click to edit: ${link.yname} → ${targetScene?.yname || 'Unknown Scene'}`
            : `${link.yname} → ${targetScene?.yname || 'Unknown Scene'}`,
          position: "top center",
        },
        data: {
          type: 'scenelink',
          id: link.yid,
          targetId: link.ytargetid,
        },
      })
    })

    // Add infospot markers - filter by current scene ID
    const currentInfospots = infospots.filter(spot => spot.ysceneid === currentScene.yid)
    console.log('Infospots for current scene:', currentInfospots.length, currentInfospots.map(s => s.ytitle))
    
    currentInfospots.forEach((spot) => {
      const action = actions.find(a => a.yinfospotactionsid === spot.yinfospotactionsidfk)
      
      const infospotHtml = `
        <div
          style="
            width: 32px;
            height: 32px;
            background: #f59e0b;
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
          "
          data-marker-type="infospot"
          data-marker-id="${spot.yid}"
          onclick="event.stopPropagation(); event.preventDefault(); window.handleInfospotClick('${spot.yid}');"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        </div>
        <style>
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        </style>
      `
      
      markersPluginInstance.addMarker({
        id: `infospot-${spot.yid}`,
        position: { yaw: spot.yyaw, pitch: spot.ypitch },
        html: infospotHtml,
        anchor: "center center",
        tooltip: {
          content: adminModeRef.current === 'edit'
            ? `Click to edit: ${spot.ytitle}`
            : spot.ytitle,
          position: "top center",
        },
        data: {
          type: 'infospot',
          id: spot.yid,
          title: spot.ytitle,
          text: spot.ytext,
          action: action,
        },
      })
    })

    console.log('Finished adding markers. Total markers added:', currentSceneLinks.length + currentInfospots.length)
  }, [viewerInstance, currentScene, scenelinks, infospots, scenes, actions])


  const handleMarkerClick = useCallback((e: any) => {
    // Use refs to get current state values to avoid stale closure issues
    const currentAdminMode = adminModeRef.current
    const currentIsTransitioning = isTransitioningRef.current
    const currentIsHandlingEdit = isHandlingEditRef.current
    const currentForceStopTransitions = forceStopTransitionsRef.current
    
    console.log('Marker clicked:', e, 'Admin mode:', currentAdminMode, 'Is transitioning:', currentIsTransitioning, 'Is handling edit:', currentIsHandlingEdit, 'Force stop:', currentForceStopTransitions)
    if ((currentIsTransitioning && !currentForceStopTransitions) || currentIsHandlingEdit) return

    const marker = e.marker
    const data = marker.data

    // Stop event propagation immediately
    if (e.originalEvent) {
      e.originalEvent.preventDefault()
      e.originalEvent.stopPropagation()
      e.originalEvent.stopImmediatePropagation()
    }

    // In edit mode, always edit
    if (currentAdminMode === 'edit') {
      console.log('Edit mode - opening edit form for:', data.type, data.id)
      setIsHandlingEdit(true)
      
      if (data.type === 'scenelink') {
        const sceneLink = scenelinks.find(link => link.yid === data.id)
        console.log('Found scene link for editing:', sceneLink)
        if (sceneLink) {
          setInlineEditingSceneLink(sceneLink)
          setPreviewMarkerPosition({ yaw: sceneLink.yyaw, pitch: sceneLink.ypitch })
          // Reset flag after a delay
          setTimeout(() => setIsHandlingEdit(false), 100)
          return // Exit early to prevent any navigation
        }
      } else if (data.type === 'infospot') {
        const infospot = infospots.find(spot => spot.yid === data.id)
        console.log('Found infospot for editing:', infospot)
        if (infospot) {
          setInlineEditingInfospot(infospot)
          setPreviewMarkerPosition({ yaw: infospot.yyaw, pitch: infospot.ypitch })
          // Reset flag after a delay
          setTimeout(() => setIsHandlingEdit(false), 100)
          return // Exit early to prevent any navigation
        }
      }
      
      // Reset flag if no match found
      setIsHandlingEdit(false)
    } else {
      // View mode: Check for ctrl+click for editing, otherwise normal functionality
      const isEditClick = e.originalEvent?.ctrlKey || e.originalEvent?.button === 2
      
      if (isEditClick) {
        console.log('Ctrl+click in view mode - opening edit form for:', data.type, data.id)
        setIsHandlingEdit(true)
        
        if (data.type === 'scenelink') {
          const sceneLink = scenelinks.find(link => link.yid === data.id)
          console.log('Found scene link for editing (ctrl+click):', sceneLink)
          if (sceneLink) {
            setInlineEditingSceneLink(sceneLink)
            setPreviewMarkerPosition({ yaw: sceneLink.yyaw, pitch: sceneLink.ypitch })
            setTimeout(() => setIsHandlingEdit(false), 100)
            return
          }
        } else if (data.type === 'infospot') {
          const infospot = infospots.find(spot => spot.yid === data.id)
          console.log('Found infospot for editing (ctrl+click):', infospot)
          if (infospot) {
            setInlineEditingInfospot(infospot)
            setPreviewMarkerPosition({ yaw: infospot.yyaw, pitch: infospot.ypitch })
            setTimeout(() => setIsHandlingEdit(false), 100)
            return
          }
        }
        
        setIsHandlingEdit(false)
      } else {
        // Normal view mode functionality - only if not handling edit and not in edit mode
        console.log('Normal click in view mode for:', data.type, data.id)
        
        // Double-check current mode to prevent navigation in edit mode
        const finalAdminMode = adminModeRef.current
        const finalForceStopTransitions = forceStopTransitionsRef.current
        if (finalAdminMode === 'edit' || finalForceStopTransitions) {
          console.log('Navigation blocked - current mode:', finalAdminMode, 'forceStop:', finalForceStopTransitions)
          return
        }
        
        if (data.type === 'scenelink') {
          // Navigate to target scene only if we're truly in view mode
          const targetScene = scenes.find(s => s.yid === data.targetId)
          if (targetScene) {
            console.log('Navigating to scene:', targetScene.yname)
            setIsTransitioning(true)
            setCurrentScene(targetScene)
            setTimeout(() => setIsTransitioning(false), 1000)
          }
        } else if (data.type === 'infospot') {
          // Show infospot information in modal
          const infospot = infospots.find(spot => spot.yid === data.id)
          if (infospot) {
            setViewingInfospot(infospot)
          }
        }
      }
    }
  }, [scenes, scenelinks, infospots])

  const handleSceneChange = (sceneId: string) => {
    const scene = scenes.find(s => s.yid === sceneId)
    if (scene && scene.yid !== currentScene?.yid) {
      // Close any open edit panels and modals when changing scenes
      setInlineEditingInfospot(null)
      setInlineEditingSceneLink(null)
      setPreviewMarkerPosition(null)
      setInlineAddingInfospot(false)
      setInlineAddingSceneLink(false)
      setAddingMarkerPosition(null)
      setViewingInfospot(null)
      setIsAddingAction(false)
      setIsAddingScene(false)
      
      // Allow manual scene changes from dropdown even in edit mode
      setIsTransitioning(true)
      
      // Update URL with new scene ID
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.set('sceneId', scene.yid)
      router.replace(newUrl.pathname + newUrl.search)
      
      // Update panorama
      if (viewerInstance) {
        viewerInstance.setPanorama(scene.ypanorama, {
          transition: true,
          showLoader: true,
        }).then(() => {
          // Set the current scene after panorama is loaded
          setCurrentScene(scene)
          
          setTimeout(() => {
            // Force clear markers first
            const markersPluginInstance = viewerInstance.getPlugin(MarkersPlugin) as MarkersPlugin
            if (markersPluginInstance) {
              markersPluginInstance.clearMarkers()
            }
            
            // Add markers for the new scene - the useEffect will handle this
            // once currentScene is updated, but we can also trigger it manually
            addMarkers()
            setIsTransitioning(false)
          }, 500)
        }).catch(() => {
          // Ensure transition state is reset even if panorama loading fails
          setCurrentScene(scene)
          setIsTransitioning(false)
        })
      } else {
        // If no viewer, still update scene and reset transition state
        setCurrentScene(scene)
        setTimeout(() => {
          addMarkers()
          setIsTransitioning(false)
        }, 100)
      }
    }
  }


  if (loading || !currentScene) {
    return (
      <div className={`relative ${className} flex items-center justify-center bg-gray-100`} style={{ height, width }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('admin.tour.loadingVirtualTour')}</p>
        </div>
      </div>
    )
  }


  return (
    <div className={`relative ${className}`} style={{ height, width }}>
      {/* Admin Controls */}
      <div className="absolute top-4 left-4 z-20 space-y-2">
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings className="w-4 h-4" />
              {t('admin.tour.adminControls')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={adminMode === 'view' ? 'default' : 'outline'}
                onClick={async () => {
                  if (adminMode !== 'view') {
                    console.log('Switching to view mode')
                    setIsModeTransitioning(true)
                    
                    // Close any open edit panels and modals when switching to view mode
                    setInlineEditingInfospot(null)
                    setInlineEditingSceneLink(null)
                    setPreviewMarkerPosition(null)
                    setInlineAddingInfospot(false)
                    setInlineAddingSceneLink(false)
                    setAddingMarkerPosition(null)
                    setViewingInfospot(null)
                    setIsAddingAction(false) // Close any open add action modal
                    setIsAddingScene(false) // Close any open add scene modal
                    
                    // Set force stop transitions FIRST, then admin mode
                    // This ensures the state is properly synchronized
                    setForceStopTransitions(false)
                    
                    // Use setTimeout to ensure state update is processed
                    setTimeout(() => {
                      setAdminMode('view')
                    }, 0)
                    
                    // Add a smooth transition effect
                    if (viewerInstance && currentScene) {
                      // Clear all markers first to ensure clean state
                      const markersPluginInstance = viewerInstance.getPlugin(MarkersPlugin) as MarkersPlugin
                      if (markersPluginInstance) {
                        markersPluginInstance.clearMarkers()
                      }
                      
                      // Refresh the panorama with a subtle transition
                      await viewerInstance.setPanorama(currentScene.ypanorama, {
                        transition: true,
                        showLoader: false,
                      })
                      
                      // Update markers after transition with proper timing
                      setTimeout(() => {
                        addMarkers()
                        setIsModeTransitioning(false)
                        console.log('View mode transition complete')
                      }, 700)
                    } else {
                      setIsModeTransitioning(false)
                      console.log('View mode set (no viewer)')
                    }
                  }
                }}
                disabled={isModeTransitioning}
              >
                <Eye className="w-4 h-4 mr-1" />
                {t('admin.tour.view')}
              </Button>
              <Button
                size="sm"
                variant={adminMode === 'edit' ? 'default' : 'outline'}
                onClick={async () => {
                  if (adminMode !== 'edit') {
                    console.log('Switching to edit mode')
                    setIsModeTransitioning(true)
                    setIsTransitioning(false)
                    setViewingInfospot(null) // Close any open infospot details modal
                    setIsAddingAction(false) // Close any open add action modal
                    setIsAddingScene(false) // Close any open add scene modal
                    
                    // Set force stop transitions FIRST, then admin mode
                    // This ensures the state is properly synchronized
                    setForceStopTransitions(true)
                    
                    // Use setTimeout to ensure state update is processed
                    setTimeout(() => {
                      setAdminMode('edit')
                    }, 0)
                    
                    // Add a smooth transition effect when entering edit mode
                    if (viewerInstance && currentScene) {
                      // Clear all markers first to ensure clean state
                      const markersPluginInstance = viewerInstance.getPlugin(MarkersPlugin) as MarkersPlugin
                      if (markersPluginInstance) {
                        markersPluginInstance.clearMarkers()
                      }
                      
                      // Refresh the panorama with a subtle transition to indicate mode change
                      await viewerInstance.setPanorama(currentScene.ypanorama, {
                        transition: true,
                        showLoader: false,
                      })
                      
                      // Update markers after transition to show edit-mode tooltips
                      setTimeout(() => {
                        addMarkers()
                        setIsModeTransitioning(false)
                        console.log('Edit mode transition complete')
                      }, 700)
                    } else {
                      setIsModeTransitioning(false)
                      console.log('Edit mode set (no viewer)')
                    }
                  }
                }}
                disabled={isModeTransitioning}
              >
                <Edit className="w-4 h-4 mr-1" />
                {t('admin.tour.edit')}
              </Button>
            </div>
            
            {adminMode === 'edit' && (
              <div className="space-y-1">
                <Button
                  size="sm"
                  variant={inlineAddingInfospot ? "default" : "outline"}
                  onClick={() => {
                    if (inlineAddingInfospot) {
                      // Cancel adding
                      setInlineAddingInfospot(false)
                      setAddingMarkerPosition(null)
                    } else {
                      // Start adding
                      setInlineAddingInfospot(true)
                      setInlineAddingSceneLink(false)
                      // Get current viewer position as initial position
                      if (viewerInstance) {
                        const currentPosition = viewerInstance.getPosition()
                        setAddingMarkerPosition({ yaw: currentPosition.yaw, pitch: currentPosition.pitch })
                      }
                    }
                  }}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {inlineAddingInfospot ? t('admin.tour.cancelInfoSpot') : t('admin.tour.addInfoSpot')}
                </Button>
                <Button
                  size="sm"
                  variant={inlineAddingSceneLink ? "default" : "outline"}
                  onClick={() => {
                    if (inlineAddingSceneLink) {
                      // Cancel adding
                      setInlineAddingSceneLink(false)
                      setAddingMarkerPosition(null)
                    } else {
                      // Start adding
                      setInlineAddingSceneLink(true)
                      setInlineAddingInfospot(false)
                      // Get current viewer position as initial position
                      if (viewerInstance) {
                        const currentPosition = viewerInstance.getPosition()
                        setAddingMarkerPosition({ yaw: currentPosition.yaw, pitch: currentPosition.pitch })
                      }
                    }
                  }}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {inlineAddingSceneLink ? t('admin.tour.cancelSceneLink') : t('admin.tour.addSceneLink')}
                </Button>
                
                {(inlineAddingInfospot || inlineAddingSceneLink) && addingMarkerPosition && (
                  <div className="text-xs text-green-600 p-2 bg-green-50 rounded">
                    {t('admin.tour.addingPosition')}:<br/>
                    {t('admin.tour.yaw')}: {addingMarkerPosition.yaw.toFixed(3)}<br/>
                    {t('admin.tour.pitch')}: {addingMarkerPosition.pitch.toFixed(3)}
                    <div className="text-xs text-gray-600 mt-1">
                      {t('admin.tour.clickToChangePosition')}
                    </div>
                  </div>
                )}
                
                {!inlineAddingInfospot && !inlineAddingSceneLink && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // Get current viewer position as fallback
                        if (viewerInstance) {
                          const currentPosition = viewerInstance.getPosition()
                          setSelectedMarkerPosition({ yaw: currentPosition.yaw, pitch: currentPosition.pitch })
                        }
                      }}
                      className="w-full text-xs"
                    >
                      {t('admin.tour.useCurrentView')}
                    </Button>
                    {selectedMarkerPosition ? (
                      <div className="text-xs text-gray-600 p-2 bg-blue-50 rounded">
                        {t('admin.tour.positionSelected')}:<br/>
                        {t('admin.tour.yaw')}: {selectedMarkerPosition.yaw.toFixed(3)}<br/>
                        {t('admin.tour.pitch')}: {selectedMarkerPosition.pitch.toFixed(3)}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedMarkerPosition(null)}
                          className="w-full mt-1 h-6 text-xs"
                        >
                          {t('admin.tour.clearSelection')}
                        </Button>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                        {t('admin.tour.clickOrUseCurrentView')}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Scene Navigation */}
      <div className="absolute top-4 right-4 z-20">
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('admin.tour.currentScene')}</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={currentScene.yid}
              onChange={(e) => handleSceneChange(e.target.value)}
              disabled={isTransitioning}
              className="w-full px-2 py-1 text-sm border rounded"
            >
              {scenes.map((scene) => (
                <option key={scene.yid} value={scene.yid}>
                  {scene.yname}
                </option>
              ))}
            </select>
            <div className="mt-2 text-xs text-gray-600">
              <Badge variant="outline">{currentScene.yid}</Badge>
            </div>
            
            {/* Scene Management Buttons - Only show in edit mode */}
            {adminMode === 'edit' && (
              <div className="mt-2 space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsAddingScene(true)
                    setNewSceneForm({
                      name: '',
                      panorama: '',
                      yaw: 0,
                      pitch: 0,
                      fov: 50
                    })
                  }}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {t('admin.tour.addNewScene')}
                </Button>
                
                {/* Delete Scene Button - Only show if there are multiple scenes */}
                {scenes.length > 1 && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      if (!confirm(`${t('admin.tour.confirmDeleteScene')} "${currentScene.yname}"?\n\n${t('admin.tour.confirmDeleteSceneWarning')}\n\n${t('admin.tour.actionCannotBeUndone')}`)) {
                        return
                      }
                      
                      try {
                        // Delete the scene
                        const success = await deleteScene(currentScene.yid)
                        if (!success) throw new Error('Failed to delete scene')
                        
                        // Refresh scenes data
                        await refreshScenes()
                        
                        // Navigate to the first available scene
                        const remainingScenes = scenes.filter(s => s.yid !== currentScene.yid)
                        if (remainingScenes.length > 0) {
                          const nextScene = remainingScenes[0]
                          setCurrentScene(nextScene)
                          
                          // Update URL with new scene ID
                          const newUrl = new URL(window.location.href)
                          newUrl.searchParams.set('sceneId', nextScene.yid)
                          router.replace(newUrl.pathname + newUrl.search)
                          
                          // Update panorama
                          if (viewerInstance) {
                            viewerInstance.setPanorama(nextScene.ypanorama, {
                              transition: true,
                              showLoader: true,
                            }).then(() => {
                              setTimeout(() => {
                                addMarkers()
                              }, 500)
                            })
                          }
                        }
                        
                        // Data will be automatically refreshed by the hooks
                        // No need for manual refresh calls
                        
                      } catch (error) {
                        console.error('Error deleting scene:', error)
                        alert('Failed to delete scene. Please try again.')
                      }
                    }}
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    {t('admin.tour.deleteScene')}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Scene Info */}
      <div className="absolute bottom-4 left-4 z-20">
        <Card className="bg-black/70 text-white">
          <CardContent className="p-3">
            <h3 className="font-semibold">{currentScene.yname}</h3>
            <p className="text-sm opacity-75">
              {scenes.findIndex(s => s.yid === currentScene.yid) + 1} {t('admin.tour.of')} {scenes.length} {t('admin.tour.scenes')}
            </p>
            {adminMode === 'edit' ? (
              <div className="text-xs mt-1 space-y-1">
                <p className="text-yellow-300">
                  {t('admin.tour.clickPanoramaToSelectPosition')}
                </p>
                <p className="text-blue-300">
                  {t('admin.tour.clickMarkersToEdit')}
                </p>
              </div>
            ) : (
              <div className="text-xs mt-1 space-y-1">
                <p className="text-green-300">
                  {t('admin.tour.clickMarkersToInteract')}
                </p>
                <p className="text-blue-300">
                  {t('admin.tour.ctrlClickToEdit')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Viewer Container */}
      <div ref={setContainerElement} className="w-full h-full" style={{ height, width }} />

      {/* Inline Editing Panel */}
      {(inlineEditingInfospot || inlineEditingSceneLink) && (
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-30">
          <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-2 border-blue-500 max-w-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Edit className="w-4 h-4" />
                {inlineEditingInfospot ? t('admin.tour.editInfoSpot') : t('admin.tour.editSceneLink')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {/* InfoSpot-specific fields */}
              {inlineEditingInfospot && (
                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-medium">{t('admin.tour.title')}:</label>
                    <input
                      type="text"
                      value={inlineEditingInfospot.ytitle}
                      onChange={(e) => setInlineEditingInfospot(prev => prev ? {...prev, ytitle: e.target.value} : null)}
                      className="w-full px-2 py-1 text-xs border rounded"
                      placeholder={t('admin.tour.infospotTitlePlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium">{t('admin.tour.description')}:</label>
                    <textarea
                      value={inlineEditingInfospot.ytext}
                      onChange={(e) => setInlineEditingInfospot(prev => prev ? {...prev, ytext: e.target.value} : null)}
                      className="w-full px-2 py-1 text-xs border rounded h-16 resize-none"
                      placeholder={t('admin.tour.infospotDescriptionPlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium">{t('admin.tour.infospotAction')}:</label>
                    <select
                      value={inlineEditingInfospot.yinfospotactionsidfk || ''}
                      onChange={(e) => setInlineEditingInfospot(prev => prev ? {...prev, yinfospotactionsidfk: e.target.value || null} : null)}
                      className="w-full px-2 py-1 text-xs border rounded"
                    >
                      <option value="">{t('admin.tour.noAction')}</option>
                      {actions.map(action => (
                        <option key={action.yinfospotactionsid} value={action.yinfospotactionsid}>
                          {action.ytitle || action.ytype} - {action.ytype}
                        </option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsAddingAction(true)
                        setNewActionForm({ title: '', type: '', description: '' })
                      }}
                      className="w-full mt-1 text-xs h-6"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {t('admin.tour.addNewAction')}
                    </Button>
                  </div>
                </div>
              )}

              {/* Scene Link-specific fields */}
              {inlineEditingSceneLink && (
                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-medium">{t('admin.tour.name')}:</label>
                    <input
                      type="text"
                      value={inlineEditingSceneLink.yname}
                      onChange={(e) => setInlineEditingSceneLink(prev => prev ? {...prev, yname: e.target.value} : null)}
                      className="w-full px-2 py-1 text-xs border rounded"
                      placeholder={t('admin.tour.sceneLinkNamePlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium">{t('admin.tour.targetScene')}:</label>
                    <select
                      value={inlineEditingSceneLink.ytargetid}
                      onChange={(e) => setInlineEditingSceneLink(prev => prev ? {...prev, ytargetid: e.target.value} : null)}
                      className="w-full px-2 py-1 text-xs border rounded"
                    >
                      {scenes.filter(s => s.yid !== currentScene?.yid).map(scene => (
                        <option key={scene.yid} value={scene.yid}>
                          {scene.yname}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Position Display */}
              {previewMarkerPosition && (
                <div className="text-xs bg-blue-50 p-2 rounded">
                  <div className="font-semibold text-blue-800">{t('admin.tour.currentPosition')}:</div>
                  <div>{t('admin.tour.yaw')}: {previewMarkerPosition.yaw.toFixed(3)}</div>
                  <div>{t('admin.tour.pitch')}: {previewMarkerPosition.pitch.toFixed(3)}</div>
                </div>
              )}
              
              {/* Position Controls */}
              <div className="space-y-2">
                <div>
                  <label className="text-xs font-medium">{t('admin.tour.yaw')}:</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="range"
                      min="-3.14159"
                      max="3.14159"
                      step="0.01"
                      value={previewMarkerPosition?.yaw || 0}
                      onChange={(e) => setPreviewMarkerPosition(prev => prev ? {...prev, yaw: parseFloat(e.target.value)} : null)}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      min="-3.14159"
                      max="3.14159"
                      step="0.01"
                      value={previewMarkerPosition?.yaw || 0}
                      onChange={(e) => setPreviewMarkerPosition(prev => prev ? {...prev, yaw: parseFloat(e.target.value) || 0} : null)}
                      className="w-20 px-2 py-1 text-xs border rounded"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium">{t('admin.tour.pitch')}:</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="range"
                      min="-1.5708"
                      max="1.5708"
                      step="0.01"
                      value={previewMarkerPosition?.pitch || 0}
                      onChange={(e) => setPreviewMarkerPosition(prev => prev ? {...prev, pitch: parseFloat(e.target.value)} : null)}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      min="-1.5708"
                      max="1.5708"
                      step="0.01"
                      value={previewMarkerPosition?.pitch || 0}
                      onChange={(e) => setPreviewMarkerPosition(prev => prev ? {...prev, pitch: parseFloat(e.target.value) || 0} : null)}
                      className="w-20 px-2 py-1 text-xs border rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={async () => {
                    if (!previewMarkerPosition) return
                    
                    try {
                      if (inlineEditingInfospot) {
                        // Update infospot with all fields
                        const result = await updateInfospot(inlineEditingInfospot.yid, {
                          title: inlineEditingInfospot.ytitle,
                          text: inlineEditingInfospot.ytext,
                          yaw: previewMarkerPosition.yaw,
                          pitch: previewMarkerPosition.pitch,
                          actionId: inlineEditingInfospot.yinfospotactionsidfk,
                        })
                        
                        if (!result) throw new Error('Failed to update infospot')
                      } else if (inlineEditingSceneLink) {
                        // Update scene link with all fields
                        const result = await updateSceneLink(inlineEditingSceneLink.yid, {
                          name: inlineEditingSceneLink.yname,
                          targetId: inlineEditingSceneLink.ytargetid,
                          yaw: previewMarkerPosition.yaw,
                          pitch: previewMarkerPosition.pitch,
                        })
                        
                        if (!result) throw new Error('Failed to update scene link')
                      }
                      
                      // Close inline editing
                      setInlineEditingInfospot(null)
                      setInlineEditingSceneLink(null)
                      setPreviewMarkerPosition(null)
                      
                      // Auto-switch to view mode after saving and reset force stop flag
                      setForceStopTransitions(false)
                      setAdminMode('view')
                      
                      // Refetch data from server to ensure we have latest data
                      // await Promise.all([
                      //   refreshInfospots(),
                      //   refreshSceneLinks()
                      // ])
                      
                      // Force immediate marker refresh with fresh data
                      if (viewerInstance && currentScene) {
                        // Clear all markers first
                        const markersPlugin = viewerInstance.getPlugin(MarkersPlugin) as MarkersPlugin
                        if (markersPlugin) {
                          markersPlugin.clearMarkers()
                        }
                        
                        // Add markers with fresh data after a short delay
                        setTimeout(() => {
                          addMarkers()
                        }, 100)
                      }
                      
                    } catch (error) {
                      console.error('Error saving marker position:', error)
                      alert('Failed to save marker position. Please try again.')
                    }
                  }}
                  className="flex-1"
                >
                  {t('admin.tour.save')}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={async () => {
                    const itemType = inlineEditingInfospot ? 'InfoSpot' : 'Scene Link'
                    const itemName = inlineEditingInfospot ? inlineEditingInfospot.ytitle : inlineEditingSceneLink?.yname
                    
                    if (!confirm(`Are you sure you want to delete this ${itemType}: &quot;${itemName}&quot;?\n\nThis action cannot be undone.`)) {
                      return
                    }
                    
                    try {
                      if (inlineEditingInfospot) {
                        // Delete infospot using hook
                        const success = await deleteInfospot(inlineEditingInfospot.yid)
                        if (!success) throw new Error('Failed to delete infospot')
                      } else if (inlineEditingSceneLink) {
                        // Delete scene link using hook
                        const success = await deleteSceneLink(inlineEditingSceneLink.yid)
                        if (!success) throw new Error('Failed to delete scene link')
                      }
                      
                      // Close inline editing
                      setInlineEditingInfospot(null)
                      setInlineEditingSceneLink(null)
                      setPreviewMarkerPosition(null)
                      
                      // Auto-switch to view mode after deleting and reset force stop flag
                      setForceStopTransitions(false)
                      setAdminMode('view')
                      
                      // Refetch data from server to ensure we have latest data
                      // await Promise.all([
                      //   refreshInfospots(),
                      //   refreshSceneLinks()
                      // ])
                      
                      // Force immediate marker refresh with fresh data
                      if (viewerInstance && currentScene) {
                        // Clear all markers first
                        const markersPlugin = viewerInstance.getPlugin(MarkersPlugin) as MarkersPlugin
                        if (markersPlugin) {
                          markersPlugin.clearMarkers()
                        }
                        
                        // Add markers with fresh data after a short delay
                        setTimeout(() => {
                          addMarkers()
                        }, 100)
                      }
                      
                    } catch (error) {
                      console.error('Error deleting marker:', error)
                      alert('Failed to delete marker. Please try again.')
                    }
                  }}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  {t('admin.tour.delete')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setInlineEditingInfospot(null)
                    setInlineEditingSceneLink(null)
                    setPreviewMarkerPosition(null)
                  }}
                  className="flex-1"
                >
                  {t('admin.tour.cancel')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Inline Adding Panel */}
      {(inlineAddingInfospot || inlineAddingSceneLink) && addingMarkerPosition && (
        <div className="absolute top-1/2 left-4 transform -translate-y-1/2 z-30">
          <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-2 border-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" />
                {inlineAddingInfospot ? t('admin.tour.addNewInfoSpot') : t('admin.tour.addNewSceneLink')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Position Display */}
              <div className="text-xs bg-green-50 p-2 rounded">
                <div className="font-semibold text-green-800">{t('admin.tour.position')}:</div>
                <div>{t('admin.tour.yaw')}: {addingMarkerPosition.yaw.toFixed(3)}</div>
                <div>{t('admin.tour.pitch')}: {addingMarkerPosition.pitch.toFixed(3)}</div>
              </div>
              
              {/* Position Controls */}
              <div className="space-y-2">
                <div>
                  <label className="text-xs font-medium">{t('admin.tour.yaw')}:</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="range"
                      min="-3.14159"
                      max="3.14159"
                      step="0.01"
                      value={addingMarkerPosition.yaw}
                      onChange={(e) => setAddingMarkerPosition(prev => prev ? {...prev, yaw: parseFloat(e.target.value)} : null)}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      min="-3.14159"
                      max="3.14159"
                      step="0.01"
                      value={addingMarkerPosition.yaw}
                      onChange={(e) => setAddingMarkerPosition(prev => prev ? {...prev, yaw: parseFloat(e.target.value) || 0} : null)}
                      className="w-20 px-2 py-1 text-xs border rounded"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium">{t('admin.tour.pitch')}:</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="range"
                      min="-1.5708"
                      max="1.5708"
                      step="0.01"
                      value={addingMarkerPosition.pitch}
                      onChange={(e) => setAddingMarkerPosition(prev => prev ? {...prev, pitch: parseFloat(e.target.value)} : null)}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      min="-1.5708"
                      max="1.5708"
                      step="0.01"
                      value={addingMarkerPosition.pitch}
                      onChange={(e) => setAddingMarkerPosition(prev => prev ? {...prev, pitch: parseFloat(e.target.value) || 0} : null)}
                      className="w-20 px-2 py-1 text-xs border rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              {inlineAddingInfospot && (
                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-medium">{t('admin.tour.title')}:</label>
                    <input
                      type="text"
                      placeholder={t('admin.tour.infospotTitlePlaceholder')}
                      className="w-full px-2 py-1 text-xs border rounded"
                      id="adding-infospot-title"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium">{t('admin.tour.text')}:</label>
                    <textarea
                      placeholder={t('admin.tour.infospotDescriptionPlaceholder')}
                      className="w-full px-2 py-1 text-xs border rounded h-16 resize-none"
                      id="adding-infospot-text"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium">{t('admin.tour.infospotAction')}:</label>
                    <select
                      className="w-full px-2 py-1 text-xs border rounded"
                      id="adding-infospot-action"
                    >
                      <option value="">{t('admin.tour.noAction')}</option>
                      {actions.map(action => (
                        <option key={action.yinfospotactionsid} value={action.yinfospotactionsid}>
                          {action.ytitle || action.ytype} - {action.ytype}
                        </option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsAddingAction(true)
                        setNewActionForm({ title: '', type: '', description: '' })
                      }}
                      className="w-full mt-1 text-xs h-6"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {t('admin.tour.addNewAction')}
                    </Button>
                  </div>
                </div>
              )}

              {inlineAddingSceneLink && (
                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-medium">{t('admin.tour.name')}:</label>
                    <input
                      type="text"
                      placeholder={t('admin.tour.sceneLinkNamePlaceholder')}
                      className="w-full px-2 py-1 text-xs border rounded"
                      id="adding-scenelink-name"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium">{t('admin.tour.targetScene')}:</label>
                    <select
                      className="w-full px-2 py-1 text-xs border rounded"
                      id="adding-scenelink-target"
                    >
                      <option value="">{t('admin.tour.selectTargetScene')}</option>
                      {scenes.filter(s => s.yid !== currentScene?.yid).map(scene => (
                        <option key={scene.yid} value={scene.yid}>
                          {scene.yname}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={async () => {
                    try {
                      if (inlineAddingInfospot) {
                        const titleInput = document.getElementById('adding-infospot-title') as HTMLInputElement
                        const textInput = document.getElementById('adding-infospot-text') as HTMLTextAreaElement
                        const actionSelect = document.getElementById('adding-infospot-action') as HTMLSelectElement
                        
                        if (!titleInput || !titleInput.value.trim()) {
                          alert(t('admin.tour.pleaseEnterInfospotTitle'))
                          return
                        }
                        
                        if (!currentScene?.yid) {
                          alert(t('admin.tour.noCurrentSceneSelected'))
                          return
                        }
                        
                        // Create new infospot using hook
                        const result = await createInfospot({
                          sceneId: currentScene.yid,
                          title: titleInput.value.trim(),
                          text: textInput?.value.trim() || '',
                          yaw: addingMarkerPosition.yaw,
                          pitch: addingMarkerPosition.pitch,
                          actionId: actionSelect?.value || null
                        })
                        
                        if (!result) throw new Error('Failed to create InfoSpot')
                        
                      } else if (inlineAddingSceneLink) {
                        const nameInput = document.getElementById('adding-scenelink-name') as HTMLInputElement
                        const targetSelect = document.getElementById('adding-scenelink-target') as HTMLSelectElement
                        
                        if (!nameInput.value.trim()) {
                          alert(t('admin.tour.pleaseEnterSceneLinkName'))
                          return
                        }
                        
                        if (!targetSelect.value) {
                          alert(t('admin.tour.pleaseSelectTargetScene'))
                          return
                        }
                        
                        if (!currentScene?.yid) {
                          alert(t('admin.tour.noCurrentSceneSelected'))
                          return
                        }
                        
                        // Create new scene link using hook
                        const result = await createSceneLink({
                          sceneId: currentScene.yid,
                          targetId: targetSelect.value,
                          name: nameInput.value.trim(),
                          yaw: addingMarkerPosition.yaw,
                          pitch: addingMarkerPosition.pitch
                        })
                        
                        if (!result) throw new Error('Failed to create Scene Link')
                      }
                      
                      // Close inline adding
                      setInlineAddingInfospot(false)
                      setInlineAddingSceneLink(false)
                      setAddingMarkerPosition(null)
                      
                      // Auto-switch to view mode after adding and reset force stop flag
                      setForceStopTransitions(false)
                      setAdminMode('view')
                      
                      // Refetch data from server to ensure we have latest data
                      // await Promise.all([
                      //   refreshInfospots(),
                      //   refreshSceneLinks()
                      // ])
                      
                      // Force immediate marker refresh with fresh data
                      if (viewerInstance && currentScene) {
                        // Clear all markers first
                        const markersPlugin = viewerInstance.getPlugin(MarkersPlugin) as MarkersPlugin
                        if (markersPlugin) {
                          markersPlugin.clearMarkers()
                        }
                        
                        // Add markers with fresh data after a short delay
                        setTimeout(() => {
                          addMarkers()
                        }, 100)
                      }
                      
                    } catch (error) {
                      console.error('Error creating marker:', error)
                      alert('Failed to create marker. Please try again.')
                    }
                  }}
                  className="flex-1"
                >
                  {t('admin.tour.create')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setInlineAddingInfospot(false)
                    setInlineAddingSceneLink(false)
                    setAddingMarkerPosition(null)
                  }}
                  className="flex-1"
                >
                  {t('admin.tour.cancel')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* InfoSpot Details Modal */}
      {viewingInfospot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{viewingInfospot.ytitle}</h2>
                <button
                  onClick={() => setViewingInfospot(null)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-4 overflow-y-auto max-h-96">
              {viewingInfospot.ytext && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">{t('admin.tour.description')}</h3>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {viewingInfospot.ytext}
                  </p>
                </div>
              )}
              
              {/* Show action information if available */}
              {viewingInfospot.yinfospotactionsidfk && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">{t('admin.tour.action')}</h3>
                  {(() => {
                    const action = actions.find(a => a.yinfospotactionsid === viewingInfospot.yinfospotactionsidfk)
                    return action ? (
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{action.ytype}</Badge>
                          <span className="text-sm font-medium">{action.ytitle}</span>
                        </div>
                        {action.ydescription && (
                          <p className="text-sm text-gray-600">{action.ydescription}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">{t('admin.tour.actionNotFound')}</p>
                    )
                  })()}
                </div>
              )}
              
              {/* Technical details for admin */}
              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">{t('admin.tour.technicalDetails')}</h3>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div>
                    <span className="font-medium">{t('admin.tour.position')}:</span>
                    <div>{t('admin.tour.yaw')}: {viewingInfospot.yyaw.toFixed(3)}</div>
                    <div>{t('admin.tour.pitch')}: {viewingInfospot.ypitch.toFixed(3)}</div>
                  </div>
                  <div>
                    <span className="font-medium">{t('admin.tour.scene')}:</span>
                    <div>{currentScene?.yname}</div>
                    <span className="font-medium">{t('admin.tour.id')}:</span>
                    <div className="font-mono">{viewingInfospot.yid}</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="bg-gray-50 px-4 py-3 flex justify-end">
              <Button
                size="sm"
                onClick={() => setViewingInfospot(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {t('admin.tour.close')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Action Modal */}
      {isAddingAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{t('admin.tour.addNewAction')}</h2>
                <button
                  onClick={() => {
                    setIsAddingAction(false)
                    setNewActionForm({ title: '', type: '', description: '' })
                  }}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.tour.actionTitle')} *
                  </label>
                  <input
                    type="text"
                    value={newActionForm.title}
                    onChange={(e) => setNewActionForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder={t('admin.tour.enterActionTitle')}
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.tour.actionType')} *
                  </label>
                  <select
                    value={newActionForm.type}
                    onChange={(e) => setNewActionForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">{t('admin.tour.selectActionType')}</option>
                    <option value="modal">{t('admin.tour.modal')}</option>
                    <option value="navigation">{t('admin.tour.navigation')}</option>
                    <option value="custom">{t('admin.tour.custom')}</option>
                    <option value="link">{t('admin.tour.link')}</option>
                    <option value="popup">{t('admin.tour.popup')}</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.tour.descriptionOptional')}
                  </label>
                  <textarea
                    value={newActionForm.description}
                    onChange={(e) => setNewActionForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder={t('admin.tour.enterActionDescription')}
                  />
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="bg-gray-50 px-4 py-3 flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsAddingAction(false)
                  setNewActionForm({ title: '', type: '', description: '' })
                }}
              >
                {t('admin.tour.cancel')}
              </Button>
              <Button
                size="sm"
                onClick={async () => {
                  if (!newActionForm.title.trim()) {
                    alert(t('admin.tour.pleaseEnterActionTitle'))
                    return
                  }
                  
                  if (!newActionForm.type) {
                    alert(t('admin.tour.pleaseSelectActionType'))
                    return
                  }
                  
                  try {
                    // Create new action using the hook function
                    const newAction = await createAction({
                      id: crypto.randomUUID(),
                      type: newActionForm.type,
                      title: newActionForm.title.trim(),
                      description: newActionForm.description.trim() || null
                    })
                    
                    if (newAction) {
                      if (inlineEditingInfospot) {
                        // Auto-assign the new action to the currently editing infospot
                        setInlineEditingInfospot(prev => prev ? {...prev, yinfospotactionsidfk: newAction.yinfospotactionsid} : null)
                      } else if (inlineAddingInfospot) {
                        // Auto-assign the new action to the adding infospot form
                        const actionSelect = document.getElementById('adding-infospot-action') as HTMLSelectElement
                        if (actionSelect) {
                          actionSelect.value = newAction.yinfospotactionsid
                        }
                      }
                    }
                    
                    // Close the modal
                    setIsAddingAction(false)
                    setNewActionForm({ title: '', type: '', description: '' })
                    
                  } catch (error) {
                    console.error('Error creating action:', error)
                    alert('Failed to create action. Please try again.')
                  }
                }}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={!newActionForm.title.trim() || !newActionForm.type}
              >
                <Plus className="w-4 h-4 mr-1" />
                {t('admin.tour.createAction')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Scene Modal */}
      {isAddingScene && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{t('admin.tour.addNewScene')}</h2>
                <button
                  onClick={() => {
                    setIsAddingScene(false)
                    setNewSceneForm({
                      name: '',
                      panorama: '',
                      yaw: 0,
                      pitch: 0,
                      fov: 50
                    })
                  }}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-4 overflow-y-auto max-h-96">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.tour.sceneName')} *
                  </label>
                  <input
                    type="text"
                    value={newSceneForm.name}
                    onChange={(e) => setNewSceneForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder={t('admin.tour.enterSceneName')}
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.tour.panoramaUrl')} *
                  </label>
                  <input
                    type="url"
                    value={newSceneForm.panorama}
                    onChange={(e) => setNewSceneForm(prev => ({ ...prev, panorama: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder={t('admin.tour.panoramaUrlPlaceholder')}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t('admin.tour.panoramaUrlDescription')}
                  </p>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.tour.initialYaw')}
                    </label>
                    <input
                      type="number"
                      value={newSceneForm.yaw}
                      onChange={(e) => setNewSceneForm(prev => ({ ...prev, yaw: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      step="0.1"
                      min="-3.14159"
                      max="3.14159"
                    />
                    <p className="text-xs text-gray-500 mt-1">{t('admin.tour.horizontalRotation')}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.tour.initialPitch')}
                    </label>
                    <input
                      type="number"
                      value={newSceneForm.pitch}
                      onChange={(e) => setNewSceneForm(prev => ({ ...prev, pitch: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      step="0.1"
                      min="-1.5708"
                      max="1.5708"
                    />
                    <p className="text-xs text-gray-500 mt-1">{t('admin.tour.verticalRotation')}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.tour.fieldOfView')}
                    </label>
                    <input
                      type="number"
                      value={newSceneForm.fov}
                      onChange={(e) => setNewSceneForm(prev => ({ ...prev, fov: parseFloat(e.target.value) || 50 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      step="1"
                      min="30"
                      max="120"
                    />
                    <p className="text-xs text-gray-500 mt-1">{t('admin.tour.zoomLevel')}</p>
                  </div>
                </div>
                
                {/* Preview Section */}
                {newSceneForm.panorama && (
                  <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin.tour.panoramaPreview')}
                    </label>
                    <div className="relative">
                      <img
                        src={newSceneForm.panorama}
                        alt="Panorama preview"
                        className="w-full h-32 object-cover rounded-md border"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const errorDiv = target.nextElementSibling as HTMLDivElement
                          if (errorDiv) errorDiv.style.display = 'flex'
                        }}
                      />
                      <div
                        className="hidden w-full h-32 bg-gray-100 rounded-md border items-center justify-center text-gray-500 text-sm"
                      >
                        {t('admin.tour.failedToLoadPanorama')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="bg-gray-50 px-4 py-3 flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsAddingScene(false)
                  setNewSceneForm({
                    name: '',
                    panorama: '',
                    yaw: 0,
                    pitch: 0,
                    fov: 50
                  })
                }}
              >
                {t('admin.tour.cancel')}
              </Button>
              <Button
                size="sm"
                onClick={async () => {
                  if (!newSceneForm.name.trim()) {
                    alert(t('admin.tour.pleaseEnterSceneName'))
                    return
                  }
                  
                  if (!newSceneForm.panorama.trim()) {
                    alert(t('admin.tour.pleaseEnterPanoramaUrl'))
                    return
                  }
                  
                  try {
                    // Create new scene using the hook function
                    const newScene = await createScene({
                      id: crypto.randomUUID(),
                      name: newSceneForm.name.trim(),
                      panorama: newSceneForm.panorama.trim(),
                      yaw: newSceneForm.yaw,
                      pitch: newSceneForm.pitch,
                      fov: newSceneForm.fov
                    })
                    
                    if (newScene) {
                      // Close the modal
                      setIsAddingScene(false)
                      setNewSceneForm({
                        name: '',
                        panorama: '',
                        yaw: 0,
                        pitch: 0,
                        fov: 50
                      })
                      
                      // Navigate to the new scene to preview it
                      setCurrentScene(newScene)
                      
                      // Update URL with new scene ID
                      const newUrl = new URL(window.location.href)
                      newUrl.searchParams.set('sceneId', newScene.yid)
                      router.replace(newUrl.pathname + newUrl.search)
                      
                      // Update panorama in viewer
                      if (viewerInstance) {
                        setIsTransitioning(true)
                        viewerInstance.setPanorama(newScene.ypanorama, {
                          transition: true,
                          showLoader: true,
                        }).then(() => {
                          setTimeout(() => {
                            addMarkers()
                            setIsTransitioning(false)
                          }, 500)
                        }).catch(() => {
                          setIsTransitioning(false)
                        })
                      }
                    }
                    
                  } catch (error) {
                    console.error('Error creating scene:', error)
                    alert('Failed to create scene. Please try again.')
                  }
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled={!newSceneForm.name.trim() || !newSceneForm.panorama.trim()}
              >
                <Plus className="w-4 h-4 mr-1" />
                {t('admin.tour.createAndPreviewScene')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Transition Overlay */}
      {(isModeTransitioning) && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30">

          <div className="bg-white rounded-lg p-4 flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>
              {isTransitioning ? t('admin.tour.transitioningToScene') : `${t('admin.tour.switchingTo')} ${t(`admin.tour.${adminMode}`)} ${t('admin.tour.mode')}...`}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}