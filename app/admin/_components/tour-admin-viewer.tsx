'use client'

import { useEffect, useState, useCallback } from 'react'
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
  const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null)
  const [viewerInstance, setViewerInstance] = useState<Viewer | null>(null)
  const [markersPlugin, setMarkersPlugin] = useState<MarkersPlugin | null>(null)

  const { scenes, loading: scenesLoading, deleteScene, refreshScenes } = useScenes()
  const { infospots, loading: infospotsLoading, createInfospot, updateInfospot, deleteInfospot, refreshInfospots } = useInfospots()
  const { scenelinks, loading: scenelinksLoading, createSceneLink, updateSceneLink, deleteSceneLink, refreshSceneLinks } = useSceneLinks()
  const { actions } = useInfoactions()

  const [currentScene, setCurrentScene] = useState<Scene | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [selectedMarkerPosition, setSelectedMarkerPosition] = useState<{ yaw: number; pitch: number } | null>(null)
  const [adminMode, setAdminMode] = useState<'view' | 'edit'>('edit')
  const [isHandlingEdit, setIsHandlingEdit] = useState(false)
  const [isModeTransitioning, setIsModeTransitioning] = useState(false)
  const [forceStopTransitions, setForceStopTransitions] = useState(true)
  const [isViewerInitializing, setIsViewerInitializing] = useState(false)
  
  // Inline editing states
  const [inlineEditingInfospot, setInlineEditingInfospot] = useState<InfoSpot | null>(null)
  const [inlineEditingSceneLink, setInlineEditingSceneLink] = useState<SceneLink | null>(null)
  const [previewMarkerPosition, setPreviewMarkerPosition] = useState<{ yaw: number; pitch: number } | null>(null)
  
  // States for inline adding
  const [inlineAddingInfospot, setInlineAddingInfospot] = useState<boolean>(false)
  const [inlineAddingSceneLink, setInlineAddingSceneLink] = useState<boolean>(false)
  const [addingMarkerPosition, setAddingMarkerPosition] = useState<{ yaw: number; pitch: number } | null>(null)
  
  // Keep only essential refs for DOM elements and viewer instances

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

  // Initialize Photo Sphere Viewer
  useEffect(() => {
    if (!containerElement || !currentScene || loading || isViewerInitializing) return

    // Add global handlers for marker clicks - use refs to get current values
    (window as any).handleSceneLinkClick = (linkId: string, targetId: string) => {
      console.log('Global scene link click handler called:', linkId, targetId)
      
      // Use multiple checks to ensure we get the correct current mode
      const checkAndExecute = () => {
        const currentMode = adminMode
        const currentScenelinks = scenelinks
        const currentScenes = scenes
        
        console.log('Scene link click - current mode:', currentMode, 'adminMode state:', adminMode)
        
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
          if (!forceStopTransitions) {
            const targetScene = currentScenes.find(s => s.yid === targetId)
            if (targetScene) {
              console.log('Navigating to scene via global handler:', targetScene.yname)
              setIsTransitioning(true)
              setCurrentScene(targetScene)
              
              // Update URL with new scene ID
              const newUrl = new URL(window.location.href)
              newUrl.searchParams.set('sceneId', targetScene.yid)
              router.replace(newUrl.pathname + newUrl.search)
              
              // Update panorama and markers
              if (viewerInstance) {
                viewerInstance.setPanorama(targetScene.ypanorama, {
                  transition: true,
                  showLoader: true,
                }).then(() => {
                  setTimeout(() => {
                    addMarkers() // Update markers for new scene
                    setIsTransitioning(false)
                  }, 500)
                })
              }
            }
          }
        }
      }
      
      // Try immediately first
      checkAndExecute()
    }

    (window as any).handleInfospotClick = (infospotId: string, title: string, text: string) => {
      console.log('Global infospot click handler called:', infospotId)
      
      // Use multiple checks to ensure we get the correct current mode
      const checkAndExecute = () => {
        const currentMode = adminMode
        const currentInfospots = infospots
        
        console.log('Infospot click - current mode:', currentMode, 'adminMode state:', adminMode)
        
        if (currentMode === 'edit') {
          console.log('Edit mode detected - opening inline edit for infospot')
          // Edit mode: Open inline edit
          const infospot = currentInfospots.find(spot => spot.yid === infospotId)
          if (infospot) {
            setInlineEditingInfospot(infospot)
            setPreviewMarkerPosition({ yaw: infospot.yyaw, pitch: infospot.ypitch })
          }
        } else {
          console.log('View mode detected - showing infospot alert')
          // View mode: Show infospot information
          alert(`${title}\n\n${text}`)
        }
      }
      
      // Try immediately first
      checkAndExecute()
    }

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
        setMarkersPlugin(plugin)
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

    // Only destroy and recreate if we don't have a viewer or if container/scene changed
    if (!viewerInstance || viewerInstance.container !== containerElement) {
      if (viewerInstance) {
        try {
          console.log('Destroying existing viewer')
          viewerInstance.destroy()
        } catch (error) {
          console.warn('Error destroying viewer:', error)
        } finally {
          setViewerInstance(null)
          setMarkersPlugin(null)
        }
      }
      
      // Add a small delay to ensure cleanup is complete
      setTimeout(() => {
        try {
          initializeViewer()
        } catch (error) {
          console.error('Error initializing viewer:', error)
        }
      }, 50)
    } else if (viewerInstance && currentScene) {
      // If viewer exists but scene changed, just update the panorama
      console.log('Updating panorama for existing viewer to:', currentScene.yname)
      try {
        viewerInstance.setPanorama(currentScene.ypanorama, {
          transition: true,
          showLoader: true,
        }).then(() => {
          console.log('Panorama updated successfully')
          addMarkers()
        }).catch((error) => {
          console.error('Error updating panorama:', error)
        })
      } catch (error) {
        console.error('Error setting panorama:', error)
        // If panorama update fails, try to reinitialize
        try {
          viewerInstance.destroy()
        } catch (destroyError) {
          console.warn('Error destroying viewer after panorama failure:', destroyError)
        } finally {
          setViewerInstance(null)
          setMarkersPlugin(null)
          setTimeout(() => {
            initializeViewer()
          }, 100)
        }
      }
    }

    return () => {
      if (viewerInstance) {
        try {
          console.log('Cleaning up viewer in useEffect cleanup')
          viewerInstance.destroy()
        } catch (error) {
          console.warn('Error destroying viewer in cleanup:', error)
        } finally {
          setViewerInstance(null)
          setMarkersPlugin(null)
        }
      }
      
      // Clean up global handlers
      try {
        delete (window as any).handleSceneLinkClick
        delete (window as any).handleInfospotClick
      } catch (error) {
        console.warn('Error cleaning up global handlers:', error)
      }
    }
  }, [containerElement, currentScene, loading])

  // Update global handlers when adminMode changes
  useEffect(() => {
    if (!viewerInstance) return

    // Update global handlers with current adminMode
    (window as any).handleSceneLinkClick = (linkId: string, targetId: string) => {
      console.log('Global scene link click handler called:', linkId, targetId, 'current adminMode:', adminMode)
      
      if (adminMode === 'edit') {
        console.log('Edit mode detected - opening inline edit for scene link')
        setForceStopTransitions(true)
        setIsTransitioning(false)
        
        const sceneLink = scenelinks.find(link => link.yid === linkId)
        if (sceneLink) {
          setInlineEditingSceneLink(sceneLink)
          setPreviewMarkerPosition({ yaw: sceneLink.yyaw, pitch: sceneLink.ypitch })
        }
      } else {
        console.log('View mode detected - navigating to target scene')
        if (!forceStopTransitions) {
          const targetScene = scenes.find(s => s.yid === targetId)
          if (targetScene) {
            console.log('Navigating to scene via global handler:', targetScene.yname)
            setIsTransitioning(true)
            setCurrentScene(targetScene)
            
            const newUrl = new URL(window.location.href)
            newUrl.searchParams.set('sceneId', targetScene.yid)
            router.replace(newUrl.pathname + newUrl.search)
            
            // Let the useEffect handle the panorama change and marker updates
            // This prevents DOM manipulation conflicts
            setTimeout(() => {
              setIsTransitioning(false)
            }, 1000)
          }
        }
      }
    }

    (window as any).handleInfospotClick = (infospotId: string, title: string, text: string) => {
      console.log('Global infospot click handler called:', infospotId, 'current adminMode:', adminMode)
      
      if (adminMode === 'edit') {
        console.log('Edit mode detected - opening inline edit for infospot')
        const infospot = infospots.find(spot => spot.yid === infospotId)
        if (infospot) {
          setInlineEditingInfospot(infospot)
          setPreviewMarkerPosition({ yaw: infospot.yyaw, pitch: infospot.ypitch })
        }
      } else {
        console.log('View mode detected - showing infospot alert')
        alert(`${title}\n\n${text}`)
      }
    }
  }, [adminMode, scenelinks, scenes, infospots, viewerInstance, forceStopTransitions, router])

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
  }, [infospots, scenelinks, currentScene, adminMode, viewerInstance])

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
  }, [previewMarkerPosition, inlineEditingInfospot, inlineEditingSceneLink])

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
  }, [addingMarkerPosition, inlineAddingInfospot, inlineAddingSceneLink])

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
  }, [adminMode, inlineEditingInfospot, inlineEditingSceneLink, inlineAddingInfospot, inlineAddingSceneLink])

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
      console.log('Cannot add markers - markers plugin not found')
      return
    }

    console.log('Adding markers for scene:', currentScene.yid, currentScene.yname)
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
          content: adminMode === 'edit'
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
          onclick="event.stopPropagation(); event.preventDefault(); window.handleInfospotClick('${spot.yid}', '${spot.ytitle.replace(/'/g, "\\'")}', '${spot.ytext.replace(/'/g, "\\'")}');"
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
          content: adminMode === 'edit'
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

  }, [viewerInstance, currentScene, scenelinks, infospots, scenes, actions, adminMode])


  const handleMarkerClick = useCallback((e: any) => {
    console.log('Marker clicked:', e, 'Admin mode:', adminMode, 'Is transitioning:', isTransitioning, 'Is handling edit:', isHandlingEdit, 'Force stop:', forceStopTransitions)
    
    if ((isTransitioning && !forceStopTransitions) || isHandlingEdit) return

    const marker = e.marker
    const data = marker.data

    // Stop event propagation immediately
    if (e.originalEvent) {
      e.originalEvent.preventDefault()
      e.originalEvent.stopPropagation()
      e.originalEvent.stopImmediatePropagation()
    }

    // In edit mode, always edit
    if (adminMode === 'edit') {
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
        // Normal view mode functionality - only if not handling edit
        console.log('Normal click in view mode for:', data.type, data.id)
        
        if (data.type === 'scenelink') {
          // Navigate to target scene
          const targetScene = scenes.find(s => s.yid === data.targetId)
          if (targetScene) {
            console.log('Navigating to scene:', targetScene.yname)
            setIsTransitioning(true)
            setCurrentScene(targetScene)
            setTimeout(() => setIsTransitioning(false), 1000)
          }
        } else if (data.type === 'infospot') {
          // Show infospot information
          alert(`${data.title}\n\n${data.text}`)
        }
      }
    }
  }, [adminMode, isTransitioning, isHandlingEdit, scenes, scenelinks, infospots])

  const handleSceneChange = (sceneId: string) => {
    const scene = scenes.find(s => s.yid === sceneId)
    if (scene && scene.yid !== currentScene?.yid) {
      // Close any open edit panels when changing scenes
      setInlineEditingInfospot(null)
      setInlineEditingSceneLink(null)
      setPreviewMarkerPosition(null)
      setInlineAddingInfospot(false)
      setInlineAddingSceneLink(false)
      setAddingMarkerPosition(null)
      
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
          <p className="text-gray-600">Loading virtual tour...</p>
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
              Admin Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={adminMode === 'view' ? 'default' : 'outline'}
                onClick={async () => {
                  if (adminMode !== 'view') {
                    setIsModeTransitioning(true)
                    setAdminMode('view')
                    setForceStopTransitions(false) // Reset force stop when switching to view mode
                    
                    // Close any open edit panels when switching to view mode
                    setInlineEditingInfospot(null)
                    setInlineEditingSceneLink(null)
                    setPreviewMarkerPosition(null)
                    setInlineAddingInfospot(false)
                    setInlineAddingSceneLink(false)
                    setAddingMarkerPosition(null)
                    
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
                      }, 700)
                    } else {
                      setIsModeTransitioning(false)
                    }
                  }
                }}
                disabled={isModeTransitioning}
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
              <Button
                size="sm"
                variant={adminMode === 'edit' ? 'default' : 'outline'}
                onClick={async () => {
                  if (adminMode !== 'edit') {
                    // Force stop any ongoing transitions when entering edit mode
                    setForceStopTransitions(true)
                    setIsTransitioning(false)
                    setIsModeTransitioning(true)
                    setAdminMode('edit')
                    
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
                        setForceStopTransitions(false) // Reset force stop after mode transition
                      }, 700)
                    } else {
                      setIsModeTransitioning(false)
                      setForceStopTransitions(false)
                    }
                  }
                }}
                disabled={isModeTransitioning}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
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
                  {inlineAddingInfospot ? 'Cancel InfoSpot' : 'Add InfoSpot'}
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
                  {inlineAddingSceneLink ? 'Cancel Scene Link' : 'Add Scene Link'}
                </Button>
                
                {(inlineAddingInfospot || inlineAddingSceneLink) && addingMarkerPosition && (
                  <div className="text-xs text-green-600 p-2 bg-green-50 rounded">
                    Adding position:<br/>
                    Yaw: {addingMarkerPosition.yaw.toFixed(3)}<br/>
                    Pitch: {addingMarkerPosition.pitch.toFixed(3)}
                    <div className="text-xs text-gray-600 mt-1">
                      Click on panorama to change position
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
                      Use Current View
                    </Button>
                    {selectedMarkerPosition ? (
                      <div className="text-xs text-gray-600 p-2 bg-blue-50 rounded">
                        Position selected:<br/>
                        Yaw: {selectedMarkerPosition.yaw.toFixed(3)}<br/>
                        Pitch: {selectedMarkerPosition.pitch.toFixed(3)}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedMarkerPosition(null)}
                          className="w-full mt-1 h-6 text-xs"
                        >
                          Clear Selection
                        </Button>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                        Click on panorama or use &quot;Use Current View&quot; to select position
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
            <CardTitle className="text-sm">Current Scene</CardTitle>
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
            
            {/* Delete Scene Button - Only show in edit mode and if there are multiple scenes */}
            {adminMode === 'edit' && scenes.length > 1 && (
              <div className="mt-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={async () => {
                    if (!confirm(`Are you sure you want to delete the scene &quot;${currentScene.yname}&quot;?\n\nThis will also delete all infospots and scene links associated with this scene.\n\nThis action cannot be undone.`)) {
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
                      
                      // Refresh all related data
                      await Promise.all([
                        refreshInfospots(),
                        refreshSceneLinks()
                      ])
                      
                    } catch (error) {
                      console.error('Error deleting scene:', error)
                      alert('Failed to delete scene. Please try again.')
                    }
                  }}
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete Scene
                </Button>
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
              {scenes.findIndex(s => s.yid === currentScene.yid) + 1} of {scenes.length} scenes
            </p>
            {adminMode === 'edit' ? (
              <div className="text-xs mt-1 space-y-1">
                <p className="text-yellow-300">
                  Click on panorama to select position for new markers
                </p>
                <p className="text-blue-300">
                  Click on existing markers to edit them
                </p>
              </div>
            ) : (
              <div className="text-xs mt-1 space-y-1">
                <p className="text-green-300">
                  Click markers to interact with them
                </p>
                <p className="text-blue-300">
                  Ctrl+Click markers to edit them
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
          <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-2 border-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Edit className="w-4 h-4" />
                {inlineEditingInfospot ? 'Edit InfoSpot' : 'Edit Scene Link'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Position Display */}
              {previewMarkerPosition && (
                <div className="text-xs bg-blue-50 p-2 rounded">
                  <div className="font-semibold text-blue-800">Current Position:</div>
                  <div>Yaw: {previewMarkerPosition.yaw.toFixed(3)}</div>
                  <div>Pitch: {previewMarkerPosition.pitch.toFixed(3)}</div>
                </div>
              )}
              
              {/* Position Controls */}
              <div className="space-y-2">
                <div>
                  <label className="text-xs font-medium">Yaw:</label>
                  <input
                    type="range"
                    min="-3.14159"
                    max="3.14159"
                    step="0.01"
                    value={previewMarkerPosition?.yaw || 0}
                    onChange={(e) => setPreviewMarkerPosition(prev => prev ? {...prev, yaw: parseFloat(e.target.value)} : null)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Pitch:</label>
                  <input
                    type="range"
                    min="-1.5708"
                    max="1.5708"
                    step="0.01"
                    value={previewMarkerPosition?.pitch || 0}
                    onChange={(e) => setPreviewMarkerPosition(prev => prev ? {...prev, pitch: parseFloat(e.target.value)} : null)}
                    className="w-full"
                  />
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
                        // Update infospot position using hook
                        const result = await updateInfospot(inlineEditingInfospot.yid, {
                          yaw: previewMarkerPosition.yaw,
                          pitch: previewMarkerPosition.pitch,
                        })
                        
                        if (!result) throw new Error('Failed to update infospot')
                      } else if (inlineEditingSceneLink) {
                        // Update scene link position using hook
                        const result = await updateSceneLink(inlineEditingSceneLink.yid, {
                          yaw: previewMarkerPosition.yaw,
                          pitch: previewMarkerPosition.pitch,
                        })
                        
                        if (!result) throw new Error('Failed to update scene link')
                      }
                      
                      // Close inline editing
                      setInlineEditingInfospot(null)
                      setInlineEditingSceneLink(null)
                      setPreviewMarkerPosition(null)
                      
                      // Auto-switch to view mode after saving
                      setAdminMode('view')
                      
                      // Refetch data from server to ensure we have latest data
                      await Promise.all([
                        refreshInfospots(),
                        refreshSceneLinks()
                      ])
                      
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
                  Save
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
                      
                      // Auto-switch to view mode after deleting
                      setAdminMode('view')
                      
                      // Refetch data from server to ensure we have latest data
                      await Promise.all([
                        refreshInfospots(),
                        refreshSceneLinks()
                      ])
                      
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
                  Delete
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
                  Cancel
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
                {inlineAddingInfospot ? 'Add New InfoSpot' : 'Add New Scene Link'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Position Display */}
              <div className="text-xs bg-green-50 p-2 rounded">
                <div className="font-semibold text-green-800">Position:</div>
                <div>Yaw: {addingMarkerPosition.yaw.toFixed(3)}</div>
                <div>Pitch: {addingMarkerPosition.pitch.toFixed(3)}</div>
              </div>
              
              {/* Position Controls */}
              <div className="space-y-2">
                <div>
                  <label className="text-xs font-medium">Yaw:</label>
                  <input
                    type="range"
                    min="-3.14159"
                    max="3.14159"
                    step="0.01"
                    value={addingMarkerPosition.yaw}
                    onChange={(e) => setAddingMarkerPosition(prev => prev ? {...prev, yaw: parseFloat(e.target.value)} : null)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Pitch:</label>
                  <input
                    type="range"
                    min="-1.5708"
                    max="1.5708"
                    step="0.01"
                    value={addingMarkerPosition.pitch}
                    onChange={(e) => setAddingMarkerPosition(prev => prev ? {...prev, pitch: parseFloat(e.target.value)} : null)}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Form Fields */}
              {inlineAddingInfospot && (
                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-medium">Title:</label>
                    <input
                      type="text"
                      placeholder="InfoSpot title"
                      className="w-full px-2 py-1 text-xs border rounded"
                      id="adding-infospot-title"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Text:</label>
                    <textarea
                      placeholder="InfoSpot description"
                      className="w-full px-2 py-1 text-xs border rounded h-16 resize-none"
                      id="adding-infospot-text"
                    />
                  </div>
                </div>
              )}

              {inlineAddingSceneLink && (
                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-medium">Name:</label>
                    <input
                      type="text"
                      placeholder="Scene link name"
                      className="w-full px-2 py-1 text-xs border rounded"
                      id="adding-scenelink-name"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Target Scene:</label>
                    <select
                      className="w-full px-2 py-1 text-xs border rounded"
                      id="adding-scenelink-target"
                    >
                      <option value="">Select target scene</option>
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
                        
                        if (!titleInput.value.trim()) {
                          alert('Please enter a title for the InfoSpot')
                          return
                        }
                        
                        if (!currentScene?.yid) {
                          alert('No current scene selected')
                          return
                        }
                        
                        // Create new infospot using hook
                        const result = await createInfospot({
                          sceneId: currentScene.yid,
                          title: titleInput.value.trim(),
                          text: textInput.value.trim() || '',
                          yaw: addingMarkerPosition.yaw,
                          pitch: addingMarkerPosition.pitch,
                          actionId: null // Default no action
                        })
                        
                        if (!result) throw new Error('Failed to create InfoSpot')
                        
                      } else if (inlineAddingSceneLink) {
                        const nameInput = document.getElementById('adding-scenelink-name') as HTMLInputElement
                        const targetSelect = document.getElementById('adding-scenelink-target') as HTMLSelectElement
                        
                        if (!nameInput.value.trim()) {
                          alert('Please enter a name for the Scene Link')
                          return
                        }
                        
                        if (!targetSelect.value) {
                          alert('Please select a target scene')
                          return
                        }
                        
                        if (!currentScene?.yid) {
                          alert('No current scene selected')
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
                      
                      // Auto-switch to view mode after adding
                      setAdminMode('view')
                      
                      // Refetch data from server to ensure we have latest data
                      await Promise.all([
                        refreshInfospots(),
                        refreshSceneLinks()
                      ])
                      
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
                  Create
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
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transition Overlay */}
      {(isTransitioning || isModeTransitioning) && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30">
          <div className="bg-white rounded-lg p-4 flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>
              {isTransitioning ? 'Transitioning to scene...' : `Switching to ${adminMode} mode...`}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}