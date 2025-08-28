'use client'

import { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF, Html } from '@react-three/drei'
import { Suspense } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { useCurrency } from '@/hooks/useCurrency'
import { useAddToCart } from '@/app/_hooks/cart/useAddToCart'
import { useAddToWishlist } from '@/app/_hooks/wishlist/useAddToWishlist'
import { useRemoveFromWishlist } from '@/app/_hooks/wishlist/useRemoveFromWishlist'
import { useIsInWishlist } from '@/app/_hooks/wishlist/useIsInWishlist'
import * as THREE from 'three'

// Loading component for 3D model
function LoadingSpinner() {
    const { t } = useLanguage()

    return (
        <Html center>
            <div className="flex flex-col items-center justify-center rounded-lg bg-black/50 px-4 py-3 text-white backdrop-blur-sm">
                <div className="border-morpheus-gold-dark border-t-morpheus-gold-light mb-2 h-8 w-8 animate-spin rounded-full border-2"></div>
                <div className="from-morpheus-gold-dark to-morpheus-gold-light font-parisienne bg-gradient-to-r bg-clip-text text-sm font-medium text-transparent">
                    {t('productDetails.loading3DModel')}
                </div>
            </div>
        </Html>
    )
}

// Error fallback component
function ModelNotFound({ name }: { name: string }) {
    const { t } = useLanguage()

    return (
        <Html center>
            <div className="border-morpheus-gold-dark flex flex-col items-center justify-center rounded-lg border bg-black/70 px-6 py-4 text-white backdrop-blur-sm">
                <div className="mb-3 text-4xl">🌳</div>
                <div className="from-morpheus-gold-dark to-morpheus-gold-light font-parisienne mb-1 bg-gradient-to-r bg-clip-text text-base font-medium text-transparent">
                    {name}
                </div>
                <div className="text-center text-xs text-gray-300">
                    {t('productDetails.modelPreview')}
                </div>
            </div>
        </Html>
    )
}

// GLB Model Loader Component
function GLBModel({ url, name }: { url: string; name: string }) {
    const gltf = useGLTF(url)
    const [normalizedScale, setNormalizedScale] = useState<
        [number, number, number]
    >([1, 1, 1])

    useEffect(() => {
        if (gltf && gltf.scene) {
            try {
                // Create a bounding box to measure the model's actual size
                const box = new THREE.Box3().setFromObject(gltf.scene)
                const size = box.getSize(new THREE.Vector3())

                // Calculate the maximum dimension
                const maxDimension = Math.max(size.x, size.y, size.z)

                // Define target size (adjust this value to make models bigger/smaller overall)
                const targetSize = 50

                // Calculate scale factor to normalize to target size
                const scaleFactor =
                    maxDimension > 0 ? targetSize / maxDimension : 1

                // Apply the calculated scale
                setNormalizedScale([scaleFactor, scaleFactor, scaleFactor])

                // Enable shadows for all meshes in the model
                gltf.scene.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.castShadow = true
                        child.receiveShadow = true

                        // Enhance materials for better lighting
                        if (child.material) {
                            if (Array.isArray(child.material)) {
                                child.material.forEach((mat) => {
                                    if (
                                        mat instanceof
                                            THREE.MeshStandardMaterial ||
                                        mat instanceof
                                            THREE.MeshPhysicalMaterial
                                    ) {
                                        mat.envMapIntensity = 0.8
                                        mat.needsUpdate = true
                                    }
                                })
                            } else if (
                                child.material instanceof
                                    THREE.MeshStandardMaterial ||
                                child.material instanceof
                                    THREE.MeshPhysicalMaterial
                            ) {
                                child.material.envMapIntensity = 0.8
                                child.material.needsUpdate = true
                            }
                        }
                    }
                })
            } catch (error) {
                console.error('Error calculating model bounds:', error)
                // Fallback to a reasonable default scale
                setNormalizedScale([5, 5, 5])
            }
        }
    }, [gltf])

    if (!url || url === '') {
        return <ModelNotFound name={name} />
    }

    try {
        if (!gltf || !gltf.scene) {
            return <ModelNotFound name={name} />
        }

        const clonedScene = gltf.scene.clone()

        // Apply shadow settings to cloned scene
        clonedScene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })

        return <primitive object={clonedScene} scale={normalizedScale} />
    } catch (error) {
        console.error('Error in GLBModel component:', error)
        return <ModelNotFound name={name} />
    }
}

// Background Color Manager Component
function BackgroundColorManager({
    backgroundColor,
}: {
    backgroundColor: string
}) {
    const { gl, scene } = useThree()

    useEffect(() => {
        console.log('Setting 3D background color to:', backgroundColor)
        gl.setClearColor(backgroundColor)
        scene.background = new THREE.Color(backgroundColor)
    }, [backgroundColor, gl, scene])

    return null // This component doesn't render anything
}

// Product Model component
function ProductModel({ url, name }: { url: string; name: string }) {
    return (
        <group>
            <Suspense fallback={<LoadingSpinner />}>
                <GLBModel url={url} name={name} />
            </Suspense>
        </group>
    )
}

// Types based on the actual API response structure
type ProductVariant = {
    yvarprodid: number
    yvarprodintitule: string
    yvarprodprixcatalogue: number
    yvarprodprixpromotion: number | null
    yvarprodpromotiondatedeb: string | null
    yvarprodpromotiondatefin: string | null
    yvarprodnbrjourlivraison: number
    yvarprodstatut: string // Approval status field
    xdeviseidfk: number | null // Currency foreign key
    xcouleur: {
        xcouleurid: number
        xcouleurintitule: string
        xcouleurhexa: string
    }
    xtaille: {
        xtailleid: number
        xtailleintitule: string
    }
    yvarprodmedia: Array<{
        ymedia: {
            ymediaid: number
            ymediaintitule: string
            ymediaurl: string
            ymediaboolvideo: boolean
        }
    }>
    yobjet3d?: Array<{
        yobjet3did: number
        yobjet3durl: string
        ycouleurarriereplan?: string | null
    }>
}

interface ProductDetailsPageProps {
    productData: {
        yprodid: number
        yprodintitule: string
        yproddetailstech: string
        yprodinfobulle: string
        yvarprod: ProductVariant[]
    }
    onClose: () => void
    extraTop?: boolean
}

export function ProductDetailsPage({
    productData,
    onClose,
    extraTop = false,
}: ProductDetailsPageProps) {
    const { t } = useLanguage()
    const { formatPrice, currencies } = useCurrency()

    // Filter to only show approved and visible variants
    const approvedVariants = useMemo(() => {
        if (!productData.yvarprod || productData.yvarprod.length === 0)
            return []
        return productData.yvarprod.filter(
            (variant) =>
                variant.yvarprodstatut === 'approved' &&
                variant.yestvisible === true
        )
    }, [productData.yvarprod])

    const [selectedMediaIndex, setSelectedMediaIndex] = useState(0)
    const [selectedColorId, setSelectedColorId] = useState<number>(() => {
        return approvedVariants && approvedVariants.length > 0
            ? approvedVariants[0].xcouleur.xcouleurid
            : 0
    })
    const [selectedSizeId, setSelectedSizeId] = useState<number>(() => {
        return approvedVariants && approvedVariants.length > 0
            ? approvedVariants[0].xtaille.xtailleid
            : 0
    })
    const [viewMode, setViewMode] = useState<'media' | '3d'>('media')
    const [quantity, setQuantity] = useState(1)

    // Hooks for cart and wishlist functionality
    const addToCartMutation = useAddToCart()
    const addToWishlistMutation = useAddToWishlist()
    const removeFromWishlistMutation = useRemoveFromWishlist()

    // Get all unique colors and sizes from approved variants only
    const availableColors = useMemo(() => {
        if (!approvedVariants || approvedVariants.length === 0) return []

        const colorMap = new Map()
        approvedVariants.forEach((variant) => {
            const color = variant.xcouleur
            if (!colorMap.has(color.xcouleurid)) {
                colorMap.set(color.xcouleurid, color)
            }
        })
        return Array.from(colorMap.values())
    }, [approvedVariants])

    const availableSizes = useMemo(() => {
        if (!approvedVariants || approvedVariants.length === 0) return []

        const sizeMap = new Map()
        // Filter sizes based on selected color from approved variants only
        const variantsForColor = approvedVariants.filter(
            (v) => v.xcouleur.xcouleurid === selectedColorId
        )
        variantsForColor.forEach((variant) => {
            const size = variant.xtaille
            if (!sizeMap.has(size.xtailleid)) {
                sizeMap.set(size.xtailleid, size)
            }
        })
        return Array.from(sizeMap.values())
    }, [approvedVariants, selectedColorId])

    // Get current selected variant from approved variants only
    const selectedVariant = useMemo(() => {
        if (!approvedVariants || approvedVariants.length === 0) return null

        return (
            approvedVariants.find(
                (v) =>
                    v.xcouleur.xcouleurid === selectedColorId &&
                    v.xtaille.xtailleid === selectedSizeId
            ) || approvedVariants[0]
        )
    }, [approvedVariants, selectedColorId, selectedSizeId])

    // Check if current variant is in wishlist
    const { data: isInWishlist } = useIsInWishlist(
        selectedVariant?.yvarprodid || 0
    )

    // Get all media from approved variants only for the carousel
    const allMedia = useMemo(() => {
        if (!approvedVariants || approvedVariants.length === 0) return []

        const mediaSet = new Set()
        const mediaArray: Array<{
            ymediaid: number
            ymediaintitule: string
            ymediaurl: string
            ymediaboolvideo: boolean
        }> = []

        approvedVariants.forEach((variant) => {
            if (variant.yvarprodmedia && Array.isArray(variant.yvarprodmedia)) {
                variant.yvarprodmedia.forEach((mediaWrapper) => {
                    const media = mediaWrapper.ymedia
                    if (!mediaSet.has(media.ymediaid)) {
                        mediaSet.add(media.ymediaid)
                        mediaArray.push(media)
                    }
                })
            }
        })
        return mediaArray
    }, [approvedVariants])

    // Get 3D model for selected variant
    const selected3DModel = useMemo(() => {
        if (
            !selectedVariant ||
            !selectedVariant.yobjet3d ||
            selectedVariant.yobjet3d.length === 0
        ) {
            return null
        }
        return selectedVariant.yobjet3d[0]
    }, [selectedVariant])

    // Calculate pricing with currency conversion
    const pricing = useMemo(() => {
        if (!selectedVariant)
            return {
                price: 0,
                originalPrice: null,
                hasDiscount: false,
                formattedPrice: '',
                formattedOriginalPrice: null,
            }

        // Find the product's base currency
        const productCurrency = currencies.find(
            (c) => c.xdeviseid === selectedVariant.xdeviseidfk
        )

        // Get raw prices
        const rawCurrentPrice =
            selectedVariant.yvarprodprixpromotion ||
            selectedVariant.yvarprodprixcatalogue
        const rawOriginalPrice = selectedVariant.yvarprodprixpromotion
            ? selectedVariant.yvarprodprixcatalogue
            : null
        const hasDiscount = !!selectedVariant.yvarprodprixpromotion

        // Format prices with proper currency conversion
        const formattedPrice = formatPrice(rawCurrentPrice, productCurrency)
        const formattedOriginalPrice = rawOriginalPrice
            ? formatPrice(rawOriginalPrice, productCurrency)
            : null

        return {
            price: rawCurrentPrice,
            originalPrice: rawOriginalPrice,
            hasDiscount,
            formattedPrice,
            formattedOriginalPrice,
        }
    }, [selectedVariant, currencies, formatPrice])

    // Handle color selection
    const handleColorChange = (colorId: number) => {
        if (!approvedVariants || approvedVariants.length === 0) return

        setSelectedColorId(colorId)

        // Check if current size is available for new color from approved variants only
        const variantsForColor = approvedVariants.filter(
            (v) => v.xcouleur.xcouleurid === colorId
        )
        const currentSizeAvailable = variantsForColor.some(
            (v) => v.xtaille.xtailleid === selectedSizeId
        )

        if (!currentSizeAvailable && variantsForColor.length > 0) {
            // Switch to first available size for this color
            setSelectedSizeId(variantsForColor[0].xtaille.xtailleid)
        }

        // Update media view if variant has specific media
        const newVariant =
            variantsForColor.find(
                (v) => v.xtaille.xtailleid === selectedSizeId
            ) || variantsForColor[0]
        if (newVariant?.yvarprodmedia && newVariant.yvarprodmedia.length > 0) {
            if (viewMode === 'media') {
                setSelectedMediaIndex(0)
            }
        }
    }

    // Handle size selection
    const handleSizeChange = (sizeId: number) => {
        setSelectedSizeId(sizeId)
    }

    const handleAddToCart = () => {
        if (!selectedVariant) return

        addToCartMutation.mutate({
            yvarprodidfk: selectedVariant.yvarprodid,
            ypanierqte: quantity,
        })
    }

    const handleDirectOrder = () => {
        // Implementation for direct order
        console.log('Direct order:', {
            productId: productData.yprodid,
            variantId: selectedVariant?.yvarprodid,
            quantity,
            selectedVariant,
        })
        // You would redirect to checkout or open order modal here
    }

    const toggleWishlist = () => {
        if (!selectedVariant) return

        if (isInWishlist) {
            removeFromWishlistMutation.mutate({
                yvarprodidfk: selectedVariant.yvarprodid,
            })
        } else {
            addToWishlistMutation.mutate({
                yvarprodidfk: selectedVariant.yvarprodid,
            })
        }
    }

    // Early return if no approved variants
    if (!approvedVariants || approvedVariants.length === 0) {
        return (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
                <div className="from-morpheus-blue-dark via-morpheus-blue-light to-morpheus-blue-dark w-full max-w-md rounded-lg bg-gradient-to-br p-8 text-center shadow-2xl shadow-black/50">
                    <button
                        onClick={onClose}
                        className="hover:text-morpheus-gold-light absolute top-4 right-4 text-white/80 transition-colors"
                    >
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                    <h2 className="mb-4 text-2xl font-bold text-white">
                        {t('productDetails.noVariantsAvailable') ||
                            'No Variants Available'}
                    </h2>
                    <p className="text-gray-300">
                        {t('productDetails.noVariantsMessage') ||
                            'This product currently has no available variants.'}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div
            className={
                'fixed inset-0 z-[70] bg-black/90 backdrop-blur-sm' +
                (extraTop ? ' pt-16' : '')
            }
        >
            <div className="from-morpheus-blue-dark via-morpheus-blue-light to-morpheus-blue-dark relative h-full w-full overflow-y-auto bg-gradient-to-br shadow-2xl shadow-black/50">
                {/* Close button - top right */}
                <button
                    onClick={onClose}
                    className="hover:text-morpheus-gold-light fixed top-4 right-4 z-20 rounded-full bg-black/20 p-2 text-white/80 backdrop-blur-sm transition-all duration-300 hover:rotate-90"
                >
                    <svg
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>

                {/* Main Content */}
                <div className="mx-auto max-w-7xl p-6 pt-16">
                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                        {/* Left Side - Images/3D Viewer */}
                        <div className="space-y-4">
                            {/* View Mode Toggle */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setViewMode('media')}
                                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${
                                        viewMode === 'media'
                                            ? 'from-morpheus-gold-dark to-morpheus-gold-light bg-gradient-to-r text-white'
                                            : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                                    }`}
                                >
                                    {t('productDetails.media') || 'Images'}
                                </button>
                                <button
                                    onClick={() => setViewMode('3d')}
                                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${
                                        viewMode === '3d'
                                            ? 'from-morpheus-gold-dark to-morpheus-gold-light bg-gradient-to-r text-white'
                                            : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                                    }`}
                                >
                                    {t('productDetails.view3D') || '3D View'}
                                </button>
                            </div>

                            {/* Main Display Area */}
                            <div className="aspect-square overflow-hidden rounded-lg bg-white/5">
                                {viewMode === 'media' ? (
                                    <div className="flex h-full flex-col">
                                        {/* Main Media */}
                                        <div className="flex-1 overflow-hidden rounded-lg bg-white">
                                            <div className="flex h-full items-center justify-center p-4">
                                                {allMedia[
                                                    selectedMediaIndex
                                                ] ? (
                                                    allMedia[selectedMediaIndex]
                                                        .ymediaboolvideo ? (
                                                        <video
                                                            src={
                                                                allMedia[
                                                                    selectedMediaIndex
                                                                ].ymediaurl
                                                            }
                                                            controls
                                                            className="max-h-full max-w-full object-contain"
                                                        />
                                                    ) : (
                                                        <Image
                                                            src={
                                                                allMedia[
                                                                    selectedMediaIndex
                                                                ].ymediaurl
                                                            }
                                                            alt={
                                                                productData.yprodintitule
                                                            }
                                                            width={600}
                                                            height={600}
                                                            className="max-h-full max-w-full object-contain"
                                                        />
                                                    )
                                                ) : (
                                                    <div className="text-gray-500">
                                                        {t(
                                                            'productDetails.noMediaAvailable'
                                                        ) ||
                                                            'No media available'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Media Thumbnails */}
                                        <div className="flex gap-4 overflow-x-auto p-4">
                                            {allMedia.map((media, index) => (
                                                <button
                                                    key={media.ymediaid}
                                                    onClick={() =>
                                                        setSelectedMediaIndex(
                                                            index
                                                        )
                                                    }
                                                    className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-white transition-all duration-300 ${
                                                        selectedMediaIndex ===
                                                        index
                                                            ? 'ring-morpheus-gold-light ring-2'
                                                            : 'hover:ring-2 hover:ring-white/50'
                                                    }`}
                                                >
                                                    {media.ymediaboolvideo ? (
                                                        <div className="flex h-full w-full items-center justify-center bg-gray-100">
                                                            <svg
                                                                className="h-6 w-6 text-gray-600"
                                                                fill="currentColor"
                                                                viewBox="0 0 20 20"
                                                            >
                                                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                                            </svg>
                                                        </div>
                                                    ) : (
                                                        <Image
                                                            src={
                                                                media.ymediaurl
                                                            }
                                                            alt={`${t('productDetails.view') || 'View'} ${index + 1}`}
                                                            width={64}
                                                            height={64}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    /* 3D Viewer */
                                    <div
                                        className="relative h-full w-full"
                                        style={{
                                            backgroundColor:
                                                selected3DModel?.ycouleurarriereplan ||
                                                '#f0f0f0',
                                        }}
                                    >
                                        <Canvas
                                            camera={{
                                                position: [120, 120, 120],
                                                fov: 30,
                                            }}
                                            shadows
                                            gl={{
                                                antialias: true,
                                                toneMapping:
                                                    THREE.ACESFilmicToneMapping,
                                                toneMappingExposure: 1.2,
                                            }}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                            }}
                                            onCreated={({ gl, scene }) => {
                                                const backgroundColor =
                                                    selected3DModel?.ycouleurarriereplan ||
                                                    '#f0f0f0'
                                                gl.setClearColor(
                                                    backgroundColor
                                                )
                                                scene.background =
                                                    new THREE.Color(
                                                        backgroundColor
                                                    )
                                            }}
                                        >
                                            <Suspense
                                                fallback={<LoadingSpinner />}
                                            >
                                                <BackgroundColorManager
                                                    backgroundColor={
                                                        selected3DModel?.ycouleurarriereplan ||
                                                        '#f0f0f0'
                                                    }
                                                />
                                                <fog
                                                    attach="fog"
                                                    args={[
                                                        selected3DModel?.ycouleurarriereplan ||
                                                            '#f0f0f0',
                                                        400,
                                                        1000,
                                                    ]}
                                                />
                                                <ambientLight
                                                    intensity={1.0}
                                                    color="#ffffff"
                                                />
                                                <directionalLight
                                                    position={[150, 200, 150]}
                                                    intensity={3.0}
                                                    color="#ffffff"
                                                    castShadow
                                                    shadow-mapSize={[
                                                        2048, 2048,
                                                    ]}
                                                    shadow-camera-far={500}
                                                    shadow-camera-left={-200}
                                                    shadow-camera-right={200}
                                                    shadow-camera-top={200}
                                                    shadow-camera-bottom={-200}
                                                />
                                                <directionalLight
                                                    position={[-150, 200, -150]}
                                                    intensity={2.5}
                                                    color="#ffffff"
                                                />
                                                <pointLight
                                                    position={[200, 100, 0]}
                                                    intensity={2.5}
                                                    color="#ffffff"
                                                    distance={400}
                                                    decay={2}
                                                />
                                                <pointLight
                                                    position={[-200, 100, 0]}
                                                    intensity={2.5}
                                                    color="#ffffff"
                                                    distance={400}
                                                    decay={2}
                                                />
                                                <pointLight
                                                    position={[0, 100, 200]}
                                                    intensity={2.5}
                                                    color="#ffffff"
                                                    distance={400}
                                                    decay={2}
                                                />
                                                <pointLight
                                                    position={[0, 100, -200]}
                                                    intensity={2.5}
                                                    color="#ffffff"
                                                    distance={400}
                                                    decay={2}
                                                />
                                                <pointLight
                                                    position={[0, 300, 0]}
                                                    intensity={3.0}
                                                    color="#ffffff"
                                                    distance={500}
                                                    decay={2}
                                                />
                                                <pointLight
                                                    position={[0, -80, 0]}
                                                    intensity={1.5}
                                                    color="#ffffff"
                                                    distance={250}
                                                    decay={2}
                                                />

                                                <mesh
                                                    rotation={[
                                                        -Math.PI / 2,
                                                        0,
                                                        0,
                                                    ]}
                                                    position={[0, -50, 0]}
                                                    receiveShadow
                                                >
                                                    <planeGeometry
                                                        args={[1000, 1000]}
                                                    />
                                                    <shadowMaterial
                                                        opacity={0.3}
                                                    />
                                                </mesh>

                                                {selected3DModel && (
                                                    <ProductModel
                                                        url={
                                                            selected3DModel.yobjet3durl
                                                        }
                                                        name={
                                                            productData.yprodintitule
                                                        }
                                                    />
                                                )}

                                                <OrbitControls
                                                    enablePan={true}
                                                    enableZoom={true}
                                                    enableRotate={true}
                                                    maxPolarAngle={
                                                        Math.PI / 2.2
                                                    }
                                                    minDistance={60}
                                                    maxDistance={300}
                                                    target={[0, 15, 0]}
                                                    autoRotate={true}
                                                    autoRotateSpeed={0.5}
                                                />
                                            </Suspense>
                                        </Canvas>

                                        <div className="absolute top-4 right-4 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white">
                                            {t('productDetails.preview3D') ||
                                                '3D Preview'}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Side - Product Details */}
                        <div className="rounded-lg bg-white/5 p-8 backdrop-blur-sm">
                            {/* Product Title */}
                            <h1 className="mb-2 text-3xl font-bold text-white">
                                {productData.yprodintitule}
                            </h1>

                            {/* Price */}
                            <div className="mb-6 flex items-center gap-3">
                                <span className="from-morpheus-gold-dark via-morpheus-gold-light to-morpheus-gold-dark bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent">
                                    {pricing.formattedPrice}
                                </span>
                                {pricing.hasDiscount &&
                                    pricing.formattedOriginalPrice && (
                                        <span className="text-xl text-gray-400 line-through">
                                            {pricing.formattedOriginalPrice}
                                        </span>
                                    )}
                            </div>

                            {/* Description */}
                            <p className="mb-8 leading-relaxed text-gray-300">
                                {productData.yproddetailstech}
                            </p>

                            {/* Color Selection */}
                            {availableColors.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="mb-3 text-lg font-semibold text-white">
                                        {t('productDetails.color') || 'Color'}
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {availableColors.map((color) => (
                                            <button
                                                key={color.xcouleurid}
                                                onClick={() =>
                                                    handleColorChange(
                                                        color.xcouleurid
                                                    )
                                                }
                                                className={`group relative h-12 w-12 rounded-full border-2 transition-all duration-300 ${
                                                    selectedColorId ===
                                                    color.xcouleurid
                                                        ? 'border-morpheus-gold-light scale-110 shadow-lg'
                                                        : 'border-white/30 hover:scale-105 hover:border-white/60'
                                                }`}
                                                style={{
                                                    backgroundColor:
                                                        color.xcouleurhexa,
                                                }}
                                                title={color.xcouleurintitule}
                                            >
                                                {selectedColorId ===
                                                    color.xcouleurid && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <svg
                                                            className="h-5 w-5 text-white drop-shadow-lg"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Size Selection */}
                            {availableSizes.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="mb-3 text-lg font-semibold text-white">
                                        {t('productDetails.size') || 'Size'}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {availableSizes.map((size) => (
                                            <button
                                                key={size.xtailleid}
                                                onClick={() =>
                                                    handleSizeChange(
                                                        size.xtailleid
                                                    )
                                                }
                                                className={`rounded-lg border px-4 py-2 transition-all duration-300 ${
                                                    selectedSizeId ===
                                                    size.xtailleid
                                                        ? 'border-morpheus-gold-light bg-morpheus-gold-light/20 text-morpheus-gold-light'
                                                        : 'border-white/30 text-gray-300 hover:border-white/60 hover:text-white'
                                                }`}
                                            >
                                                {size.xtailleintitule}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantity */}
                            <div className="mb-8">
                                <h3 className="mb-3 text-lg font-semibold text-white">
                                    {t('productDetails.quantity') || 'Quantity'}
                                </h3>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() =>
                                            setQuantity(
                                                Math.max(1, quantity - 1)
                                            )
                                        }
                                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/30 text-lg font-semibold text-white transition-all duration-300 hover:border-white/60 hover:bg-white/10"
                                    >
                                        −
                                    </button>
                                    <span className="w-12 text-center text-xl font-bold text-white">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() =>
                                            setQuantity(quantity + 1)
                                        }
                                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/30 text-lg font-semibold text-white transition-all duration-300 hover:border-white/60 hover:bg-white/10"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mb-6 space-y-4">
                                {/* Add to Cart & Wishlist Row */}
                                <div className="flex gap-4">
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={
                                            addToCartMutation.isPending ||
                                            !selectedVariant
                                        }
                                        className={`from-morpheus-gold-dark to-morpheus-gold-light hover:shadow-morpheus-gold-light/30 group flex-1 rounded-lg bg-gradient-to-r px-6 py-4 font-semibold text-white shadow-lg transition-all duration-300 ${
                                            addToCartMutation.isPending ||
                                            !selectedVariant
                                                ? 'cursor-not-allowed opacity-50'
                                                : ''
                                        }`}
                                    >
                                        <span className="flex items-center justify-center">
                                            {addToCartMutation.isPending ? (
                                                <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                            ) : (
                                                <svg
                                                    className="mr-2 h-5 w-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                                    />
                                                </svg>
                                            )}
                                            {addToCartMutation.isPending
                                                ? 'Adding...'
                                                : t(
                                                      'productDetails.addToCart'
                                                  ) || 'Add to Cart'}
                                        </span>
                                    </button>
                                    <button
                                        onClick={toggleWishlist}
                                        disabled={
                                            addToWishlistMutation.isPending ||
                                            removeFromWishlistMutation.isPending
                                        }
                                        className={`flex h-14 w-14 items-center justify-center rounded-lg border-2 transition-all duration-300 ${
                                            isInWishlist
                                                ? 'border-red-500 bg-red-50 text-red-500'
                                                : 'border-white/30 text-gray-300 hover:border-white/60 hover:text-white'
                                        } ${
                                            addToWishlistMutation.isPending ||
                                            removeFromWishlistMutation.isPending
                                                ? 'cursor-not-allowed opacity-50'
                                                : ''
                                        }`}
                                    >
                                        {addToWishlistMutation.isPending ||
                                        removeFromWishlistMutation.isPending ? (
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                                        ) : (
                                            <svg
                                                className="h-6 w-6"
                                                fill={
                                                    isInWishlist
                                                        ? 'currentColor'
                                                        : 'none'
                                                }
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                </div>

                                {/* Buy Now Button */}
                                <button
                                    onClick={handleDirectOrder}
                                    className="w-full rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-6 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-green-500/30"
                                >
                                    <span className="flex items-center justify-center">
                                        <svg
                                            className="mr-2 h-5 w-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13 10V3L4 14h7v7l9-11h-7z"
                                            />
                                        </svg>
                                        {t('productDetails.buyNow') ||
                                            'Buy Now'}
                                    </span>
                                </button>
                            </div>

                            {/* Delivery Info */}
                            {selectedVariant &&
                                selectedVariant.yvarprodnbrjourlivraison >
                                    0 && (
                                    <div className="rounded-lg bg-white/5 p-4">
                                        <div className="flex items-center text-sm text-gray-300">
                                            <svg
                                                className="text-morpheus-gold-light mr-2 h-4 w-4"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                                            </svg>
                                            {t('productDetails.deliveryIn') ||
                                                'Delivery in'}{' '}
                                            {
                                                selectedVariant.yvarprodnbrjourlivraison
                                            }{' '}
                                            {t('productDetails.days') || 'days'}
                                        </div>
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
