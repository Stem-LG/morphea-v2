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
  
  // Early return if no images
  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        No images to display
      </div>
    )
  }
  
  const faceCount = images.length
  const faceWidth = Math.min(cylinderWidth / faceCount, 500) // Increased from 300 to 500
  const actualCylinderWidth = faceWidth * faceCount * 1.2 // Add 20% spacing
  const radius = actualCylinderWidth / (2 * Math.PI)
  const rotation = useMotionValue(0)
  
  const transform = useTransform(
    rotation,
    (value) => `rotateY(${value}deg)`
  )

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

  return (
    <div className="relative w-full flex items-center justify-center" style={{ height: `${height}px` }}>
      {/* 3D Carousel Container */}
      <div
        className="w-full h-full flex items-center justify-center overflow-hidden"
        style={{
          perspective: "2000px", // Increased perspective for better front view
          perspectiveOrigin: "center center", // Center the perspective
          transformStyle: "preserve-3d",
        }}
      >
        <motion.div
          className="relative flex h-full origin-center justify-center"
          style={{
            transform,
            width: actualCylinderWidth,
            height: faceWidth,
            transformStyle: "preserve-3d",
            transformOrigin: "center center",
          }}
        >
          {images.map((image, index) => (
            <motion.div
              key={`carousel-image-${index}`}
              className="absolute flex origin-center items-center justify-center cursor-pointer group"
              style={{
                width: `${faceWidth}px`,
                height: `${faceWidth}px`,
                left: '50%',
                top: '50%',
                marginLeft: `-${faceWidth/2}px`,
                marginTop: `-${faceWidth/2}px`,
                transform: `rotateY(${
                  index * (360 / faceCount)
                }deg) translateZ(${radius}px)`,
                transformOrigin: "center center",
              }}
              onClick={() => handleImageClick(image)}
            >
              <img
                src={image}
                alt={`Carousel image ${index + 1}`}
                className="w-full h-full object-cover rounded-lg shadow-lg border-2 border-white/20 transition-transform duration-200 group-hover:scale-105"
                style={{
                  aspectRatio: '1/1'
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
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={handleCloseModal}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="relative max-w-4xl max-h-4xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt="Selected image"
              className="w-full h-full object-contain rounded-lg"
            />
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all"
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