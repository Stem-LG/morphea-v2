'use client'

import { useState, useEffect } from 'react'

export function useScrollDirection() {
    const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null)
    const [lastScrollY, setLastScrollY] = useState(0)
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        const updateScrollDirection = () => {
            const scrollY = window.scrollY
            const direction = scrollY > lastScrollY ? 'down' : 'up'
            
            // Only update if scroll direction changed and we've scrolled more than 10px
            if (direction !== scrollDirection && Math.abs(scrollY - lastScrollY) > 10) {
                setScrollDirection(direction)
                setIsVisible(direction === 'up' || scrollY < 100) // Show navbar when scrolling up or near top
            }
            
            setLastScrollY(scrollY > 0 ? scrollY : 0)
        }

        // Add event listener
        window.addEventListener('scroll', updateScrollDirection)

        // Clean up
        return () => {
            window.removeEventListener('scroll', updateScrollDirection)
        }
    }, [scrollDirection, lastScrollY])

    return { scrollDirection, isVisible }
}
