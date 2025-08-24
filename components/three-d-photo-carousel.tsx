"use client"

import { useEffect, useState } from "react"
import { motion, useMotionValue, useTransform } from "framer-motion"

interface ThreeDPhotoCarouselProps {
  images?: string[]
  autoRotateSpeed?: number
  height?: number
  cylinderWidth?: number
}

function ThreeDPhotoCarousel({ 
  images = ["/lg1.jpg", "/lg2.png", "/lg3.jpg", "/lg4.jpg"], // Default images
  autoRotateSpeed = 0.5,
  height = 500,
  cylinderWidth = 1400
}: ThreeDPhotoCarouselProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null)

    const faceCount = images.length
    const faceWidth = Math.min(cylinderWidth / faceCount, 500) // Increased from 300 to 500
    const actualCylinderWidth = faceWidth * faceCount * 1.2 // Add 20% spacing
    const radius = actualCylinderWidth / (2 * Math.PI)
    const rotation = useMotionValue(0)

    const transform = useTransform(rotation, (value) => `rotateY(${value}deg)`)

    // Auto-rotation effect
    useEffect(() => {
        const interval = setInterval(() => {
            rotation.set(rotation.get() + autoRotateSpeed)
        }, 16) // ~60fps

        return () => clearInterval(interval)
    }, [rotation, autoRotateSpeed])

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
                No images to display
            </div>
        )
    }

    return (
        <div
            className="relative flex w-full items-center justify-center"
            style={{ height: `${height}px` }}
        >
            {/* 3D Carousel Container */}
            <div
                className="flex h-full w-full items-center justify-center overflow-hidden"
                style={{
                    perspective: '2000px', // Increased perspective for better front view
                    perspectiveOrigin: 'center center', // Center the perspective
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
                        >
                            <img
                                src={image}
                                alt={`Carousel image ${index + 1}`}
                                className="h-full w-full rounded-lg border-2 border-white/20 object-cover shadow-lg transition-transform duration-200 group-hover:scale-105"
                                style={{
                                    aspectRatio: '1/1',
                                }}
                                draggable={false}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Modal for selected image */}
            {selectedImage && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-opacity-75 fixed inset-0 z-50 flex items-center justify-center bg-black"
                    onClick={handleCloseModal}
                >
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        className="max-h-4xl relative max-w-4xl p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={selectedImage}
                            alt="Selected image"
                            className="h-full w-full rounded-lg object-contain"
                        />
                        <button
                            onClick={handleCloseModal}
                            className="bg-opacity-20 hover:bg-opacity-30 absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-white transition-all"
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