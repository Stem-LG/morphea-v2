'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useLanguage } from '@/hooks/useLanguage'

interface ThreeDPhotoCarouselProps {
    images?: string[]
    autoRotateSpeed?: number
    height?: number
    cylinderWidth?: number
}

function ThreeDPhotoCarousel({
    images = ['/lg1.jpg', '/lg2.png', '/lg3.jpg', '/lg4.jpg'], // Default images
    autoRotateSpeed = 0.5,
    height = 500,
    cylinderWidth = 1400,
}: ThreeDPhotoCarouselProps) {
    const { t } = useLanguage()
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [isHovered, setIsHovered] = useState<boolean>(false)
    const [isMobile, setIsMobile] = useState<boolean>(false)

    // Detect mobile screen size
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }

        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const faceCount = images.length

    // Responsive cylinder width based on screen size
    const responsiveCylinderWidth = isMobile
        ? Math.min(window.innerWidth * 2, 1200) // 98% of screen width, max 1200px on mobile
        : cylinderWidth // Use provided width on desktop

    const faceWidth = Math.min(
        responsiveCylinderWidth / faceCount,
        isMobile ? 300 : 500
    ) // Much larger faces on mobile
    const actualCylinderWidth = faceWidth * faceCount * 1.2 // Add 20% spacing
    const radius = actualCylinderWidth / (2 * Math.PI)
    const rotation = useMotionValue(0)

    const transform = useTransform(rotation, (value) => `rotateY(${value}deg)`)

    // Auto-rotation effect (pauses on hover)
    useEffect(() => {
        if (isHovered) return // Pause rotation when hovering

        const interval = setInterval(() => {
            rotation.set(rotation.get() + autoRotateSpeed)
        }, 16) // ~60fps

        return () => clearInterval(interval)
    }, [rotation, autoRotateSpeed, isHovered])

    const handleImageClick = (image: string) => {
        setSelectedImage(image)
    }

    const handleCloseModal = () => {
        setSelectedImage(null)
    }

    // Early return if no images
    if (!images || images.length === 0) {
        return (
            <div className="flex h-96 items-center justify-center text-gray-500">
                {t('homepage.carousel.noImages')}
            </div>
        )
    }

    // Responsive height based on screen size
    const responsiveHeight = isMobile ? Math.min(height * 0.5, 500) : height

    return (
        <div
            className="relative flex w-full items-center justify-center px-2 sm:px-4"
            style={{ height: `${responsiveHeight}px` }}
        >
            {/* 3D Carousel Container - Mobile Responsive */}
            <div
                className="flex h-full w-full items-center justify-center overflow-hidden"
                style={{
                    perspective: isMobile ? '1200px' : '2000px', // Reduced perspective on mobile
                    perspectiveOrigin: 'center center',
                    transformStyle: 'preserve-3d',
                }}
            >
                <motion.div
                    className="relative flex h-full origin-center justify-center"
                    style={{
                        transform,
                        width: actualCylinderWidth,
                        height: faceWidth,
                        transformStyle: 'preserve-3d',
                        transformOrigin: 'center center',
                        maxWidth: '100%', // Ensure it doesn't overflow container
                    }}
                >
                    {images.map((image, index) => (
                        <motion.div
                            key={`carousel-image-${index}`}
                            className="group absolute flex origin-center cursor-pointer items-center justify-center"
                            style={{
                                width: `${faceWidth}px`,
                                height: `${faceWidth}px`,
                                left: '50%',
                                top: '50%',
                                marginLeft: `-${faceWidth / 2}px`,
                                marginTop: `-${faceWidth / 2}px`,
                                transform: `rotateY(${
                                    index * (360 / faceCount)
                                }deg) translateZ(${radius}px)`,
                                transformOrigin: 'center center',
                            }}
                            onClick={() => handleImageClick(image)}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            <img
                                src={image}
                                alt={`${t('homepage.carousel.imageAlt')} ${index + 1}`}
                                className="h-full w-full rounded-lg border-2 border-white/20 object-cover shadow-lg transition-transform duration-300 group-hover:scale-110"
                                style={{
                                    aspectRatio: '1/1',
                                }}
                                draggable={false}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Modal for selected image - Mobile Responsive */}
            {selectedImage && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/75"
                    onClick={handleCloseModal}
                >
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        className="relative max-h-[90vh] max-w-[90vw] p-4 md:max-w-4xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={selectedImage}
                            alt={t('homepage.carousel.selectedImage')}
                            className="h-full w-full rounded-lg object-contain"
                        />
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-2 right-2 flex h-10 w-10 touch-manipulation items-center justify-center rounded-full bg-white/20 text-xl text-white transition-all hover:bg-white/30 md:h-8 md:w-8 md:text-lg"
                        >
                            ×
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </div>
    )
}

export { ThreeDPhotoCarousel }
