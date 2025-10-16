'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Viewer } from '@photo-sphere-viewer/core'
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin'
import ProductsListModal from './products-list-modal'
import {
    InfoSpotAction,
    getTourData,
    TourData,
    Scene,
} from '@/app/_consts/tourdata'
import { useIncrementSceneView } from '../_hooks/use-increment-scene-view'
import { useLanguage } from '@/hooks/useLanguage'

interface VirtualTourProps {
    className?: string
    height?: string
    width?: string
    startingScene?: string
    startingYaw?: number // Default yaw angle in radians
    startingPitch?: number // Default pitch angle in radians
    showNavbar?: boolean
    accountForNavbar?: boolean // New prop to account for navbar height
}

export default function VirtualTour({
    className = '',
    height = '100vh',
    width = '100%',
    startingScene = '15',
    startingYaw = -1.57, // Default to -1.57 radians (facing left)
    startingPitch = 0, // Default to 0 radians (horizontal)
    showNavbar = true,
    accountForNavbar = true, // Default to true to account for navbar
}: VirtualTourProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const viewerRef = useRef<Viewer | null>(null)
    const markersPluginRef = useRef<MarkersPlugin | null>(null)
    const router = useRouter()
    const { t } = useLanguage()

    // Initialize the scene view increment hook
    const incrementSceneView = useIncrementSceneView()

    // Get scene from URL on initial load only
    const getInitialScene = useCallback(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search)
            return params.get('scene') || startingScene
        }
        return startingScene
    }, [startingScene])

    const [currentScene, setCurrentScene] = useState(getInitialScene)
    const [productsList, setProductsList] = useState<string | null>(null)
    const [isProductDetailsOpen, setIsProductDetailsOpen] = useState(false)
    const [isProductsListOpen, setIsProductsListOpen] = useState(false)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [tourData, setTourData] = useState<TourData>({ scenes: [] })
    const [isLoading, setIsLoading] = useState(true)
    const [preloadedImages, setPreloadedImages] = useState<Set<string>>(
        new Set()
    )
    const [isInitialLoad, setIsInitialLoad] = useState(true)
    const [, setCurrentZoom] = useState(60) // Default zoom level
    const [currentPosition, setCurrentPosition] = useState({
        yaw: startingYaw,
        pitch: startingPitch,
    })
    const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set())
    const animationIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const isUpdatingUrlRef = useRef(false)
    const isTransitioningRef = useRef(false)
    const rotationAnimRef = useRef<number | null>(null)

    // Loading progress states
    const [loadingProgress, setLoadingProgress] = useState(0)
    const [loadingText, setLoadingText] = useState(t('virtualTour.loading'))

    // Track viewed scenes to prevent duplicate increments
    const [viewedScenes, setViewedScenes] = useState<Set<string>>(new Set())
    const [isSceneDropdownOpen, setIsSceneDropdownOpen] = useState(false)

    // In-app guide (coach marks)
    const [showGuide, setShowGuide] = useState(false)
    const [guideStep, setGuideStep] = useState(0)
    const sceneMenuRef = useRef<HTMLDivElement | null>(null)
    const [isTouch, setIsTouch] = useState(false)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsTouch('ontouchstart' in window || (navigator as any).maxTouchPoints > 0)
        }
    }, [])
    // Show guide on first visit once the viewer is ready
    useEffect(() => {
        if (typeof window === 'undefined') return
        try {
            const seen = window.localStorage.getItem('vt_guide_seen_v1')
            if (seen !== '1' && seen !== 'skipped') setShowGuide(true)
        } catch { }
        // run once after scenes load
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tourData.scenes.length])
    // Keep track of prior scenes menu state while guide forces it open
    const prevSceneDropdownOpenRef = useRef<boolean | null>(null)
    useEffect(() => {
        if (!showGuide) {
            // restore
            if (prevSceneDropdownOpenRef.current !== null) {
                setIsSceneDropdownOpen(prevSceneDropdownOpenRef.current)
                prevSceneDropdownOpenRef.current = null
            }
            return
        }
        // Force open scenes menu on the dedicated step
        if (guideStep === 5) {
            prevSceneDropdownOpenRef.current = isSceneDropdownOpen
            setIsSceneDropdownOpen(true)
        } else {
            setIsSceneDropdownOpen(false)
        }
    }, [showGuide, guideStep])


    // Calculate the actual height accounting for navbar
    const getActualHeight = () => {
        if (accountForNavbar && height === '100vh') {
            return 'calc(100vh - 3.5rem)' // 4rem is the navbar height (h-16)
        }
        return height
    }

    const actualHeight = getActualHeight()

    // Function to preload all scene images
    const preloadSceneImages = useCallback(async (scenes: Scene[]) => {
        if (scenes.length === 0) return

        const imagePromises = scenes.map((scene) => {
            return new Promise<string>((resolve) => {
                const img = new Image()
                img.onload = () => {
                    setPreloadedImages((prev) =>
                        new Set(prev).add(scene.panorama)
                    )
                    resolve(scene.panorama)
                }
                img.onerror = () => {
                    console.warn(
                        `Failed to preload scene image: ${scene.panorama}`
                    )
                    // Still resolve to not block other images
                    resolve(scene.panorama)
                }
                img.src = scene.panorama
            })
        })

        try {
            await Promise.all(imagePromises)
        } catch (error) {
            console.error('Error preloading scene images:', error)
        }
    }, [])

    // Helper function to normalize angle to [-π, π]
    const normalizeAngle = (angle: number): number => {
        while (angle > Math.PI) angle -= 2 * Math.PI
        while (angle < -Math.PI) angle += 2 * Math.PI
        return angle
    }

    // Helper function to calculate angular distance between two angles
    const angularDistance = (a1: number, a2: number): number => {
        const diff = normalizeAngle(a2 - a1)
        return Math.abs(diff)
    }

    // Find closest scene in a given direction
    const findClosestSceneInDirection = useCallback(
        (
            direction: 'forward' | 'backward' | 'left' | 'right'
        ): string | null => {
            const currentSceneData = tourData.scenes.find(
                (scene) => scene.id === currentScene
            )
            if (!currentSceneData || !currentSceneData.links.length) return null

            const currentYaw = currentPosition.yaw
            let targetYaw = currentYaw

            switch (direction) {
                case 'forward':
                    targetYaw = currentYaw // Same direction
                    break
                case 'backward':
                    targetYaw = normalizeAngle(currentYaw + Math.PI) // Opposite direction
                    break
                case 'left':
                    targetYaw = normalizeAngle(currentYaw - Math.PI / 2) // 90 degrees left
                    break
                case 'right':
                    targetYaw = normalizeAngle(currentYaw + Math.PI / 2) // 90 degrees right
                    break
            }

            // Find the closest link in the target direction
            let closestLink = null
            let minDistance = Infinity

            currentSceneData.links.forEach((link) => {
                const linkYaw = link.position.yaw
                const distance = angularDistance(targetYaw, linkYaw)

                if (distance < minDistance) {
                    minDistance = distance
                    closestLink = link
                }
            })

            return closestLink ? closestLink.nodeId : null
        },
        [currentScene, currentPosition.yaw, tourData.scenes, angularDistance]
    )

    // Handle key press/release for smooth movement
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (!viewerRef.current || isTransitioning) return

            const key = event.key
            if (
                ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(
                    key
                )
            ) {
                event.preventDefault()
                setPressedKeys((prev) => new Set(prev).add(key))
            }
        },
        [isTransitioning]
    )

    const handleKeyUp = useCallback((event: KeyboardEvent) => {
        const key = event.key
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
            event.preventDefault()
            setPressedKeys((prev) => {
                const newSet = new Set(prev)
                newSet.delete(key)
                return newSet
            })
        }
    }, [])

    // Start/stop animation loop based on pressed keys
    useEffect(() => {
        if (
            pressedKeys.size > 0 &&
            !animationIntervalRef.current &&
            !isTransitioning
        ) {
            // Start smooth animation
            animationIntervalRef.current = setInterval(() => {
                if (!viewerRef.current || isTransitioning) return

                const viewer = viewerRef.current
                const minZoom = 40
                const maxZoom = 80
                const zoomSpeed = 0.8 // Smooth zoom speed
                const rotationSpeed = 0.02 // Smooth rotation speed (radians per frame)

                // Handle zoom controls
                if (pressedKeys.has('ArrowUp')) {
                    setCurrentZoom((prev) => {
                        if (prev < maxZoom) {
                            const newZoom = Math.min(prev + zoomSpeed, maxZoom)
                            viewer.zoom(newZoom)
                            return newZoom
                        } else {
                            // Navigate to closest scene forward when at max zoom
                            const currentSceneData = tourData.scenes.find(
                                (scene) => scene.id === currentScene
                            )
                            if (
                                currentSceneData &&
                                currentSceneData.links.length > 0
                            ) {
                                const nextScene =
                                    findClosestSceneInDirection('forward')
                                if (nextScene) {
                                    setCurrentScene(nextScene)
                                    viewer.zoom(60)
                                    // Clear pressed keys to prevent continuous navigation
                                    setPressedKeys(new Set())
                                    return 60
                                }
                            }
                            return prev
                        }
                    })
                }

                if (pressedKeys.has('ArrowDown')) {
                    setCurrentZoom((prev) => {
                        if (prev > minZoom) {
                            const newZoom = Math.max(prev - zoomSpeed, minZoom)
                            viewer.zoom(newZoom)
                            return newZoom
                        } else {
                            // Navigate to closest scene backward when at min zoom
                            const currentSceneData = tourData.scenes.find(
                                (scene) => scene.id === currentScene
                            )
                            if (
                                currentSceneData &&
                                currentSceneData.links.length > 0
                            ) {
                                const nextScene =
                                    findClosestSceneInDirection('backward')
                                if (nextScene) {
                                    setCurrentScene(nextScene)
                                    viewer.zoom(60)
                                    // Clear pressed keys to prevent continuous navigation
                                    setPressedKeys(new Set())
                                    return 60
                                }
                            }
                            return prev
                        }
                    })
                }

                // Handle rotation controls
                if (pressedKeys.has('ArrowLeft')) {
                    setCurrentPosition((prev) => {
                        const newYaw = normalizeAngle(prev.yaw - rotationSpeed)
                        viewer.rotate({
                            yaw: newYaw,
                            pitch: prev.pitch,
                        })
                        return { ...prev, yaw: newYaw }
                    })
                }

                if (pressedKeys.has('ArrowRight')) {
                    setCurrentPosition((prev) => {
                        const newYaw = normalizeAngle(prev.yaw + rotationSpeed)
                        viewer.rotate({
                            yaw: newYaw,
                            pitch: prev.pitch,
                        })
                        return { ...prev, yaw: newYaw }
                    })
                }
            }, 16) // ~60fps (16ms interval)
        } else if (pressedKeys.size === 0 && animationIntervalRef.current) {
            clearInterval(animationIntervalRef.current)
            animationIntervalRef.current = null
        }

        return () => {
            if (animationIntervalRef.current) {
                clearInterval(animationIntervalRef.current)
                animationIntervalRef.current = null
            }
        }
    }, [
        pressedKeys,
        isTransitioning,
        tourData.scenes,
        currentScene,
        findClosestSceneInDirection,
        normalizeAngle,
    ])

    // Add keyboard event listeners
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
            if (animationIntervalRef.current) {
                clearInterval(animationIntervalRef.current)
                animationIntervalRef.current = null
            }
        }
    }, [handleKeyDown, handleKeyUp])

    const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)

    const animateRotateBy = (delta: number, duration = 400) => {
        if (!viewerRef.current || isTransitioningRef.current) return
        // stop keyboard animation if any
        setPressedKeys(new Set())
        // cancel ongoing rotation animation
        if (rotationAnimRef.current) {
            cancelAnimationFrame(rotationAnimRef.current)
            rotationAnimRef.current = null
        }
        const startYaw = currentPosition.yaw
        const startPitch = currentPosition.pitch
        const targetYaw = normalizeAngle(startYaw + delta)
        const diff = normalizeAngle(targetYaw - startYaw)
        const startTime = performance.now()

        const step = (now: number) => {
            const t = Math.min((now - startTime) / duration, 1)
            const eased = easeInOutQuad(t)
            const yaw = normalizeAngle(startYaw + diff * eased)
            viewerRef.current!.rotate({ yaw, pitch: startPitch })
            setCurrentPosition((prev) => ({ ...prev, yaw }))
            if (t < 1) {
                rotationAnimRef.current = requestAnimationFrame(step)
            } else {
                rotationAnimRef.current = null
            }
        }

        rotationAnimRef.current = requestAnimationFrame(step)
    }

    useEffect(() => {
        return () => {
            if (rotationAnimRef.current) {
                cancelAnimationFrame(rotationAnimRef.current)
                rotationAnimRef.current = null
            }
        }
    }, [])

    // Update URL when scene changes (handled in transition completion to avoid blocking navigation)

    // Fetch tour data from Supabase
    useEffect(() => {
        // Don't fetch data if translations are still loading
        if (!t) {
            return;
        }

        const fetchTourData = async () => {
            try {
                setIsLoading(true)
                setLoadingProgress(0)
                setLoadingText(t('virtualTour.fetchingData'))

                // Simulate progress during data fetching
                const progressInterval = setInterval(() => {
                    setLoadingProgress((prev) => {
                        if (prev >= 50) {
                            clearInterval(progressInterval)
                            return 50
                        }
                        return prev + 10
                    })
                }, 100)

                const data = await getTourData()

                clearInterval(progressInterval)
                setLoadingProgress(70)
                setLoadingText(t('virtualTour.processingScenes'))

                setTourData(data)

                // Update starting scene if the data has scenes and the default scene doesn't exist
                if (data.scenes.length > 0) {
                    const initialSceneId = getInitialScene()
                    const sceneExists = data.scenes.some(
                        (scene) => scene.id === initialSceneId
                    )
                    if (!sceneExists) {
                        setCurrentScene(data.scenes[0].id)
                    }

                    setLoadingProgress(85)
                    setLoadingText(t('virtualTour.preloadingImages'))

                    // Start preloading all scene images
                    preloadSceneImages(data.scenes)
                }

                setLoadingProgress(90)
                setLoadingText(t('virtualTour.initializingViewer'))

                // Trigger viewer initialization
                setTimeout(() => {
                    setIsLoading(false) // This will trigger the viewer initialization useEffect
                }, 200)
            } catch (error) {
                console.error('Failed to fetch tour data:', error)
                setIsLoading(false) // Make sure to hide loading on error
            }
            // Don't set isLoading to false here - let the scene initialization handle it
        }

        fetchTourData()
    }, [getInitialScene, preloadSceneImages, t]) // Add t to the dependency array

    useEffect(() => {
        if (!containerRef.current || isLoading || !tourData.scenes.length)
            return

        // Continue from where data fetching left off (90%)
        setLoadingProgress(95)
        setLoadingText(t('virtualTour.loadingViewer'))

        const initializeViewer = () => {
            const currentSceneData = tourData.scenes.find(
                (scene) => scene.id === currentScene
            )
            if (!currentSceneData) return

            // Initialize Photo Sphere Viewer only once
            viewerRef.current = new Viewer({
                container: containerRef.current!,
                panorama: currentSceneData.panorama,
                minFov: 30,
                maxFov: 120,
                // loadingImg: '/logo.png',
                loadingTxt: '', // Remove loading text
                navbar:
                    showNavbar && !isProductDetailsOpen && !isProductsListOpen
                        ? ['zoom', 'fullscreen']
                        : false,
                plugins: [
                    [
                        MarkersPlugin,
                        {
                            markers: [],
                        },
                    ],
                ],
            })

            // Store plugin references
            markersPluginRef.current = viewerRef.current.getPlugin(
                MarkersPlugin
            ) as MarkersPlugin

            // Set up event listeners
            viewerRef.current.addEventListener('ready', () => {
                // Set initial position when viewer is ready
                if (viewerRef.current) {
                    viewerRef.current.rotate({
                        yaw: startingYaw,
                        pitch: startingPitch,
                    })
                }

                // Complete the loading process
                setLoadingProgress(100)
                setLoadingText(t('virtualTour.tourReady'))

                setTimeout(() => {
                    addMarkers()
                    setIsLoading(false) // Only turn off initial loading

                    // Dispatch custom event for initial scene load
                    if (typeof window !== 'undefined') {
                        const sceneChangeEvent = new CustomEvent(
                            'sceneChanged',
                            {
                                detail: {
                                    sceneId: currentSceneData.id,
                                    sceneName: currentSceneData.name,
                                    isInitialLoad: true,
                                },
                            }
                        )
                        window.dispatchEvent(sceneChangeEvent)
                    }
                }, 500)
            })

            markersPluginRef.current?.addEventListener(
                'select-marker',
                handleMarkerClick
            )

            // Listen for position changes
            viewerRef.current.addEventListener(
                'position-updated',
                (event: any) => {
                    setCurrentPosition({
                        yaw: event.position.yaw,
                        pitch: event.position.pitch,
                    })
                }
            )

            // Listen for zoom changes
            viewerRef.current.addEventListener('zoom-updated', (event: any) => {
                setCurrentZoom(event.zoomLevel)
            })
        }

        // Only initialize viewer once
        if (!viewerRef.current) {
            initializeViewer()
        }

        // Cleanup function
        return () => {
            if (viewerRef.current) {
                viewerRef.current.destroy()
                viewerRef.current = null
            }
        }
    }, [
        showNavbar,
        isProductDetailsOpen,
        isProductsListOpen,
        tourData,
        isLoading,
        startingYaw,
        startingPitch,
    ])

    // Separate effect for scene transitions
    useEffect(() => {
        if (!viewerRef.current || !tourData.scenes.length) return

        const currentSceneData = tourData.scenes.find(
            (scene) => scene.id === currentScene
        )
        if (!currentSceneData) return

        // Prevent multiple concurrent transitions
        if (isTransitioningRef.current) {
            console.log('Transition already in progress, skipping')
            return
        }

        const transitionToScene = async () => {
            try {
                console.log(
                    'Starting transition to scene:',
                    currentSceneData.id,
                    'Initial load:',
                    isInitialLoad
                )

                // Helper function to increment scene view count
                const incrementViewCount = () => {
                    // Only increment if this scene hasn't been viewed yet in this session
                    if (!viewedScenes.has(currentSceneData.id)) {
                        console.log(
                            'Incrementing view count for scene:',
                            currentSceneData.id
                        )

                        // Convert scene ID to number for the API call
                        const sceneIdNumber = parseInt(currentSceneData.id, 10)
                        if (!isNaN(sceneIdNumber)) {
                            incrementSceneView.mutate(sceneIdNumber)

                            // Mark this scene as viewed
                            setViewedScenes((prev) =>
                                new Set(prev).add(currentSceneData.id)
                            )
                        } else {
                            console.warn(
                                'Invalid scene ID for view increment:',
                                currentSceneData.id
                            )
                        }
                    } else {
                        console.log(
                            'Scene already viewed in this session:',
                            currentSceneData.id
                        )
                    }
                }

                if (isInitialLoad) {
                    // For initial load, just increment view count since viewer handles the loading
                    setTimeout(() => {
                        incrementViewCount()
                    }, 1000)
                    setIsInitialLoad(false)
                    return
                }

                // Normal transition for scene changes
                isTransitioningRef.current = true
                setIsTransitioning(true)

                // Check if image is preloaded for faster transition
                const isImagePreloaded = preloadedImages.has(
                    currentSceneData.panorama
                )

                // Use setPanorama for smooth transitions
                await viewerRef.current!.setPanorama(
                    currentSceneData.panorama,
                    {
                        transition: true, // Enable smooth transition
                        showLoader: !isImagePreloaded, // Only show loader if image isn't preloaded
                    }
                )

                // Reset transition state immediately after setPanorama completes
                console.log('Transition completed, resetting state')
                isTransitioningRef.current = false

                // Force state update with a callback to ensure it's applied
                setIsTransitioning((prev) => {
                    console.log(
                        'Setting isTransitioning from',
                        prev,
                        'to false'
                    )
                    return false
                })

                // Update markers after transition with reduced delay for faster feel
                const delay = isImagePreloaded ? 0 : 100 // Reduced delay from 200ms to 100ms
                setTimeout(() => {
                    console.log('Adding markers after delay')
                    addMarkers()

                    // Increment view count after scene is fully loaded and visible
                    incrementViewCount()

                    // Dispatch custom event for test page monitoring
                    if (typeof window !== 'undefined') {
                        const sceneChangeEvent = new CustomEvent(
                            'sceneChanged',
                            {
                                detail: {
                                    sceneId: currentSceneData.id,
                                    sceneName: currentSceneData.name,
                                    viewCount: currentSceneData.id, // We'll get the actual count from the database
                                },
                            }
                        )
                        window.dispatchEvent(sceneChangeEvent)
                    }

                    // Update URL after transition is complete using simple history API
                    setTimeout(() => {
                        if (!isUpdatingUrlRef.current) {
                            isUpdatingUrlRef.current = true
                            const currentUrl = new URL(window.location.href)
                            const currentSceneParam =
                                currentUrl.searchParams.get('scene')

                            if (currentSceneParam !== currentSceneData.id) {
                                currentUrl.searchParams.set(
                                    'scene',
                                    currentSceneData.id
                                )
                                window.history.replaceState(
                                    { ...window.history.state },
                                    '',
                                    currentUrl.toString()
                                )
                            }

                            // Reset the flag after a short delay
                            setTimeout(() => {
                                isUpdatingUrlRef.current = false
                            }, 100)
                        }
                    }, 50)
                }, delay)
            } catch (error) {
                console.error('Error transitioning to scene:', error)
                isTransitioningRef.current = false
                setIsTransitioning(false)
            }
        }

        transitionToScene()
    }, [currentScene, tourData, preloadedImages, isInitialLoad])

    // Effect to dynamically show/hide navbar based on modal states
    useEffect(() => {
        if (!viewerRef.current) return

        // Get the navbar element and hide/show it with CSS
        const navbarElement =
            viewerRef.current.container.querySelector('.psv-navbar')
        if (navbarElement) {
            if (isProductDetailsOpen || isProductsListOpen) {
                ; (navbarElement as HTMLElement).style.display = 'none'
            } else {
                ; (navbarElement as HTMLElement).style.display = ''
            }
        }
    }, [isProductDetailsOpen, isProductsListOpen])

    // Add markers for navigation links and info spots
    const addMarkers = useCallback(() => {
        if (!markersPluginRef.current || !tourData.scenes.length) return

        const currentSceneData = tourData.scenes.find(
            (scene) => scene.id === currentScene
        )
        if (!currentSceneData) return

        // Clear existing markers
        markersPluginRef.current.clearMarkers()

        // Add navigation link markers
        currentSceneData.links.forEach((link, index) => {
            markersPluginRef.current?.addMarker({
                id: `link-${index}`,
                position: {
                    yaw: link.position.yaw,
                    pitch: link.position.pitch,
                },
                image: '/explore.svg', // Using existing icon
                size: { width: 90, height: 90 },
                anchor: 'center center',
                tooltip: {
                    content: t(link.name),
                    position: 'top center',
                },
                data: {
                    nodeId: link.nodeId,
                },
            })
        })

        // Add info spot markers
        currentSceneData.infoSpots.forEach((info, index) => {
            markersPluginRef.current?.addMarker({
                id: `info-${index}`,
                position: {
                    yaw: info.position.yaw,
                    pitch: info.position.pitch,
                },
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
                anchor: 'center center',
                tooltip: {
                    content: info.title + "hello",
                    position: 'top center',
                },
                data: {
                    type: 'info',
                    title: info.title,
                    text: t(info.text),
                    action: info.action,
                },
            })
        })
    }, [currentScene, tourData])

    // Handle different action types dynamically
    const handleInfoSpotAction = (
        action: InfoSpotAction,
        title: string,
        text: string
    ) => {
        console.log('InfoSpot action triggered:', {
            action,
            title,
            text,
            currentScene,
        })

        switch (action.type) {
            case 'modal':
                if (action.modalType === 'products-list') {
                    // Use the action ID to fetch products linked to this infospot action
                    console.log(
                        'Opening products list for action ID:',
                        action.id
                    )
                    setProductsList(action.id || currentScene)
                    setIsProductsListOpen(true)
                }
                // Add other modal types here as needed
                break

            case 'alert':
                alert(`${title}\n\n${text}`)
                break

            case 'custom':
                // Handle custom actions based on customHandler
                console.log(`Custom action: ${action.customHandler}`)
                break

            default:
                console.warn(`Unknown action type: ${action.type}`)
                // Fallback to alert
                alert(`${title}\n\n${text}`)
        }
    }

    // Handle marker clicks
    const handleMarkerClick = useCallback(
        (e: {
            marker: {
                data?: {
                    nodeId?: string
                    type?: string
                    title?: string
                    text?: string
                    action?: InfoSpotAction
                }
            }
        }) => {
            console.log('Marker clicked:', e.marker)
            console.log('Is transitioning (state):', isTransitioning)
            console.log('Is transitioning (ref):', isTransitioningRef.current)

            // Use only ref for transition checking since it's more reliable
            if (isTransitioningRef.current) {
                console.log('Ignoring click - transitioning (ref check)')
                return // Prevent clicks during transitions
            }

            const marker = e.marker
            if (marker.data?.nodeId) {
                // Navigate to another scene
                console.log('Navigating to scene:', marker.data.nodeId)
                setCurrentScene(marker.data.nodeId)
            } else if (marker.data?.type === 'info' && marker.data.action) {
                // Handle info spot action dynamically
                console.log('Handling info spot action')
                handleInfoSpotAction(
                    marker.data.action,
                    marker.data.title || '',
                    marker.data.text || ''
                )
            }
        },
        [isTransitioning, handleInfoSpotAction, currentScene]
    )

    if (isLoading) {
        return (
            <div
                className={`relative ${className} flex items-center justify-center bg-gray-100`}
                style={{ height: actualHeight, width }}
            >
                <div className="mx-auto max-w-md px-6 text-center text-white">
                    <img
                        src="/logo.png"
                        alt="Loading"
                        className="mx-auto mb-6 h-16 w-16 animate-pulse"
                    />
                    <h3 className="font-supreme mb-4 text-xl text-gray-700">
                        {t('virtualTour.loadingVirtualTour')}
                    </h3>

                    {/* Progress Bar */}
                    <div className="mb-4 h-3 w-full overflow-hidden rounded-full bg-gray-300">
                        <div
                            className="from-morpheus-gold-dark to-morpheus-gold-light h-full rounded-full bg-gradient-to-r transition-all duration-300 ease-out"
                            style={{ width: `${loadingProgress}%` }}
                        />
                    </div>

                    {/* Progress Percentage */}
                    <p className="text-sm text-gray-600">
                        {Math.round(loadingProgress)}%
                    </p>

                    {/* Loading hint */}
                    <p className="mt-2 text-xs text-gray-500">
                        {t('virtualTour.preparingTourData')}
                    </p>
                </div>
            </div>
        )
    }

    if (!tourData.scenes.length) {
        return (
            <div
                className={`relative ${className} flex items-center justify-center bg-gray-100`}
                style={{ height: actualHeight, width }}
            >
                <div className="text-center">
                    <p className="text-gray-600">
                        {t('virtualTour.noSceneAvailable')}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div
            className={`relative ${className}`}

            style={{ height: actualHeight, width }}
        >
            <div
                ref={containerRef}
                className="h-full w-full"
                style={{ height: actualHeight, width }}
            />

            {/* Loading Progress Bar Overlay - Only show during initial load */}
            {isLoading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80">
                    <div className="mx-auto max-w-md px-6 text-center text-white">
                        <img
                            src="/logo.png"
                            alt="Loading"
                            className="mx-auto mb-6 h-16 w-16 animate-pulse"
                        />
                        <h3 className="font-supreme mb-4 text-xl">
                            {loadingText}
                        </h3>

                        {/* Progress Bar */}
                        <div className="mb-4 h-3 w-full overflow-hidden rounded-full bg-gray-700">
                            <div
                                className="from-morpheus-gold-dark to-morpheus-gold-light h-full rounded-full bg-gradient-to-r transition-all duration-300 ease-out"
                                style={{ width: `${loadingProgress}%` }}
                            />
                        </div>

                        {/* Progress Percentage */}
                        <p className="text-sm text-gray-300">
                            {Math.round(loadingProgress)}%
                        </p>

                        {/* Loading hint */}
                        <p className="mt-2 text-xs text-gray-400">
                            {t('virtualTour.initializingVirtualTour')}
                        </p>
                    </div>
                </div>
            )}

            {/* Exit Button */}
            <button
                onClick={() => router.push('/')}
                className="group absolute right-6 bottom-14 z-10 flex size-12 md:size-16 items-center justify-center rounded-full bg-black/20 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-black/40"
                title={t('virtualTour.exitVirtualTour')}
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-transform duration-200 group-hover:scale-110"
                >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16,17 21,12 16,7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
            </button>

            {/* Rotate Left 45° */}
            <button
                onClick={() => animateRotateBy(-Math.PI / 4)}
                className="group absolute scale-70 left-4 top-1/2 -translate-y-1/2 z-10 flex h-24 w-24 items-center justify-center rounded-full bg-black/20 text-white shadow-lg transition-all duration-300 hover:scale-75 hover:bg-black/40"
                title={t('virtualTour.turnLeft45')}
            >
                <svg
                    width="64"
                    height="64"
                    viewBox="0 0 400 200"
                    className="transition-transform duration-200 scale-200 -translate-x-3 -rotate-90"
                >
                    {/* Left-pointing arrow based on original polygon, scaled up and modified for direction */}
                    <polygon points="200,110 300,155 260,155 200,140 140,155 100,155"
                        fill="white"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinejoin="round" />
                </svg>
            </button>

            {/* Rotate Right 45° */}
            <button
                onClick={() => animateRotateBy(Math.PI / 4)}
                className="group absolute overflow-clip scale-70 right-4 top-1/2 -translate-y-1/2 z-10 flex h-24 w-24 items-center justify-center rounded-full bg-black/20 text-white shadow-lg transition-all duration-300 hover:scale-75 hover:bg-black/40"
                title={t('virtualTour.turnRight45')}
            >
                <svg
                    width="64"
                    height="64"
                    viewBox="0 0 400 200"
                    className="transition-transform duration-200 scale-200 translate-x-3 rotate-90"
                >
                    {/* Left-pointing arrow based on original polygon, scaled up and modified for direction */}
                    <polygon points="200,110 300,155 260,155 200,140 140,155 100,155"
                        fill="white"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>

            {/* Turn Around 180° */}
            <button
                onClick={() => animateRotateBy(Math.PI)}
                className="group absolute left-6 bottom-14 z-10 flex size-12 md:size-16 items-center justify-center rounded-full bg-black/20 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-black/40"
                title={t('virtualTour.turnAround180')}

            >
                <span className="font-supreme md:text-lg">180°</span>
            </button>

            {/* Scene Navigation Dropdown */}
            <div className="absolute top-4 right-4 z-10" ref={sceneMenuRef}>
                <div className="relative">
                    <button
                        onClick={() =>
                            setIsSceneDropdownOpen(!isSceneDropdownOpen)
                        }
                        className="group flex items-center gap-2 rounded-lg bg-black/20 px-4 py-2 font-light text-white transition-all duration-300 hover:bg-black/40"
                        title={t('virtualTour.sceneNavigation')}
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="transition-transform duration-200 group-hover:scale-110"
                        >
                            <path d="M3 6h18" />
                            <path d="M3 12h18" />
                            <path d="M3 18h18" />
                        </svg>
                        <span className="font-supreme text-sm">
                            {t('virtualTour.scenes')}
                        </span>
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`transition-transform duration-200 ${isSceneDropdownOpen ? 'rotate-180' : ''}`}
                        >
                            <path d="M6 9l6 6 6-6" />
                        </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {isSceneDropdownOpen && (
                        <div className="absolute top-full right-0 mt-2 w-64 overflow-hidden rounded-lg border border-white/20 bg-black/40 shadow-xl backdrop-blur-sm">
                            <div className="max-h-80 overflow-y-auto">
                                {tourData.scenes
                                    .filter((scene) => scene.yboutiqueidfk) // Only show scenes with boutique ID
                                    .map((scene) => (
                                        <button
                                            key={scene.id}
                                            onClick={() => {
                                                if (!isTransitioning) {
                                                    setCurrentScene(scene.id)
                                                    setIsSceneDropdownOpen(
                                                        false
                                                    )
                                                }
                                            }}
                                            disabled={isTransitioning}
                                            className={`w-full border-b border-white/10 px-4 py-3 text-left text-sm transition-colors last:border-b-0 ${currentScene === scene.id
                                                ? 'bg-white/10 font-semibold text-white shadow-inner'
                                                : isTransitioning
                                                    ? 'cursor-not-allowed text-gray-400'
                                                    : 'text-white hover:bg-white/20 hover:text-white'
                                                }`}
                                        >
                                            <div className="font-supreme">
                                                {t(scene.name.split('-')[0])}
                                            </div>
                                        </button>
                                    ))}
                                {tourData.scenes.filter(
                                    (scene) => scene.yboutiqueidfk
                                ).length === 0 && (
                                        <div className="px-4 py-3 text-center text-sm text-gray-300">
                                            {t(
                                                'virtualTour.noBoutiqueSceneAvailable'
                                            )}
                                        </div>
                                    )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Help button to reopen guide */}
            <button
                onClick={() => { setGuideStep(0); setShowGuide(true); }}
                className="group absolute right-6 bottom-32 z-10 flex size-12 md:size-14 items-center justify-center rounded-full bg-black/20 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-black/40"
                title={t('virtualTour.guide.title')}
                aria-label={t('virtualTour.guide.openGuide')}
            >
                <span className="font-supreme text-xl">i</span>
            </button>

            {/* Coach-marks overlay */}
            {showGuide && (
                <div className="absolute inset-0 z-50 bg-black/60">
                    {/* Step-specific overlays and animations */}
                    {/* Step 0: swipe animation in the center */}
                    {guideStep === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative text-white/90">
                                <div className="flex items-center gap-6 select-none">
                                    {/* left chevrons */}
                                    <svg width="32" height="32" viewBox="0 0 24 24" className="opacity-80">
                                        <path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    {/* moving dot */}
                                    <div className="h-10 w-10 rounded-full bg-white/90 shadow-md animate-swipe-x" />
                                    {/* right chevrons */}
                                    <svg width="32" height="32" viewBox="0 0 24 24" className="opacity-80">
                                        <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div className="text-center text-xs mt-2 opacity-80">{isTouch ? t('virtualTour.guide.swipe') : t('virtualTour.guide.drag')}</div>
                                <style>{`@keyframes swipe-x{0%{transform:translateX(-24px)}50%{transform:translateX(24px)}100%{transform:translateX(-24px)}} .animate-swipe-x{animation:swipe-x 1.6s ease-in-out infinite}`}</style>
                            </div>
                        </div>
                    )}

                    {/* Step 1: arrows pointing to left/right rotate buttons */}
                    {guideStep === 1 && (
                        <>
                            {/* Arrow to left rotate (points right toward the button) */}
                            <svg className="absolute left-28 top-1/2 -translate-y-1/2 rotate-180 text-white" width="70" height="40" viewBox="0 0 90 40">
                                <path d="M0 20 H70 M70 20 L58 12 M70 20 L58 28" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            {/* Arrow to right rotate (points toward the right button) */}
                            <svg className="absolute right-28 top-1/2 -translate-y-1/2 text-white" width="70" height="40" viewBox="0 0 90 40">
                                <path d="M0 20 H70 M70 20 L58 12 M70 20 L58 28" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </>
                    )}


                    {/* Step 2: arrow pointing to the bottom-left (zoom slider) */}
                    {guideStep === 2 && (
                        <div className="absolute left-20 bottom-16 text-white">
                            <svg className="text-white" width="100" height="50" viewBox="0 0 100 50" style={{ transform: 'rotate(-225deg)' }}>
                                <path d="M0 25 H80 M80 25 L68 15 M80 25 L68 35" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    )}

                    {/* Step 3: arrow to the 180° turn button */}
                    {guideStep === 3 && (
                        <svg className="absolute -left-1 bottom-32 md:left-1 md:bottom-36 text-white" width="100" height="50" viewBox="0 0 100 50" style={{ transform: 'rotate(90deg)' }}>
                            <path d="M0 25 H80 M80 25 L68 15 M80 25 L68 35" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}

                    {/* Step 4: arrow to the Exit button */}
                    {guideStep === 4 && (
                        <svg className="absolute -right-1 bottom-32 md:right-2 md:bottom-36 text-white" width="100" height="50" viewBox="0 0 100 50" style={{ transform: 'rotate(90deg)' }}>
                            <path d="M0 25 H80 M80 25 L68 15 M80 25 L68 35" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}

                    {/* Step 5: arrow to the Scenes menu (menu is auto-opened while on this step) */}
                    {guideStep === 5 && (
                        <svg className="absolute right-0 top-20 text-white" width="100" height="50" viewBox="0 0 100 50" style={{ transform: 'rotate(-90deg)' }}>
                            <path d="M0 25 H80 M80 25 L68 15 M80 25 L68 35" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}

                    {/* Callout card */}
                    <div
                        className="absolute bottom-28 left-1/2 -translate-x-1/2 max-w-sm rounded-xl bg-white/95 text-gray-900 shadow-xl p-4 backdrop-blur-sm"
                        role="dialog"
                        aria-modal="true"
                        aria-label={t('virtualTour.guide.openGuide')}
                    >
                        <h4 className="font-supreme text-base mb-1">
                            {[
                                t('virtualTour.guide.steps.lookAround.title'),
                                t('virtualTour.guide.steps.moveLeftRight.title'),
                                t('virtualTour.guide.steps.zoom.title'),
                                t('virtualTour.guide.steps.turnAround.title'),
                                t('virtualTour.guide.steps.exitTour.title'),
                                t('virtualTour.guide.steps.scenesMenu.title')
                            ][guideStep]}
                        </h4>
                        <p className="text-sm opacity-80 mb-3 whitespace-pre-wrap">
                            {[
                                (isTouch ? t('virtualTour.guide.steps.lookAround.descriptionTouch') : t('virtualTour.guide.steps.lookAround.descriptionMouse')),
                                t('virtualTour.guide.steps.moveLeftRight.description'),
                                (isTouch ? t('virtualTour.guide.steps.zoom.descriptionTouch') : t('virtualTour.guide.steps.zoom.descriptionMouse')),
                                t('virtualTour.guide.steps.turnAround.description'),
                                t('virtualTour.guide.steps.exitTour.description'),
                                t('virtualTour.guide.steps.scenesMenu.description')
                            ][guideStep]}
                        </p>
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => { try { localStorage.setItem('vt_guide_seen_v1', '1') } catch { }; setShowGuide(false) }}
                                className="text-sm text-gray-600 hover:text-gray-900"
                            >
                                {t('virtualTour.guide.skip')}
                            </button>
                            <div className="flex items-center gap-2">
                                {/* simple progress dots */}
                                <div className={`h-1.5 w-1.5 rounded-full ${guideStep === 0 ? 'bg-gray-900' : 'bg-gray-300'}`} />
                                <div className={`h-1.5 w-1.5 rounded-full ${guideStep === 1 ? 'bg-gray-900' : 'bg-gray-300'}`} />
                                <div className={`h-1.5 w-1.5 rounded-full ${guideStep === 2 ? 'bg-gray-900' : 'bg-gray-300'}`} />
                                <div className={`h-1.5 w-1.5 rounded-full ${guideStep === 3 ? 'bg-gray-900' : 'bg-gray-300'}`} />
                                <div className={`h-1.5 w-1.5 rounded-full ${guideStep === 4 ? 'bg-gray-900' : 'bg-gray-300'}`} />
                                <div className={`h-1.5 w-1.5 rounded-full ${guideStep === 5 ? 'bg-gray-900' : 'bg-gray-300'}`} />
                                <button
                                    onClick={() => {
                                        if (guideStep < 5) setGuideStep(guideStep + 1)
                                        else { try { localStorage.setItem('vt_guide_seen_v1', '1') } catch { }; setShowGuide(false) }
                                    }}
                                    className="ml-2 px-3 py-1.5 rounded-md bg-gray-900 text-white text-sm hover:bg-black"
                                >
                                    {guideStep < 5 ? t('virtualTour.guide.next') : t('virtualTour.guide.done')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* Scene information overlay */}
            <div className="absolute top-4 left-4 z-10 rounded-lg bg-black/20 px-4 py-2 font-light text-white">
                <h3 className="font-supreme">
                    {tourData.scenes.find((scene) => scene.id === currentScene)?.name.split('-')[0].trim()}
                </h3>
                {/* <p className="text-sm opacity-75">
                    {tourData.scenes.findIndex((scene) => scene.id === currentScene) + 1} sur {tourData.scenes.length}
                </p> */}
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

            {/* Navigation hints
            <div className="absolute bottom-4 left-4 right-4 z-10 bg-black/70 text-white px-4 py-2 rounded-lg text-center">
                <p className="text-sm">
                    Use arrow keys to navigate: ↑ Zoom in/Forward • ↓ Zoom out/Backward • ← → Rotate view
                </p>
            </div> */}

            {/* Tree Inventory Modal */}
            <ProductsListModal
                isOpen={productsList}
                onClose={() => {
                    setProductsList(null)
                    setIsProductsListOpen(false)
                }}
                onProductDetailsChange={setIsProductDetailsOpen}
            />
        </div>
    )
}
