'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

export function useScrollDirection() {
    const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null)
    const [isVisible, setIsVisible] = useState(true)
    const lastScrollY = useRef(0)
    const ticking = useRef(false)

    const updateScrollDirection = useCallback(() => {
        const scrollY = window.scrollY

        // Determine direction
        const direction = scrollY > lastScrollY.current ? 'down' : 'up'

        // Only update if scroll direction changed and we've scrolled more than 10px
        if (Math.abs(scrollY - lastScrollY.current) > 10) {
            setScrollDirection(direction)
            setIsVisible(direction === 'up' || scrollY < 100) // Show navbar when scrolling up or near top
        }

        lastScrollY.current = scrollY > 0 ? scrollY : 0
        ticking.current = false
    }, [])

    const requestTick = useCallback(() => {
        if (!ticking.current) {
            requestAnimationFrame(updateScrollDirection)
            ticking.current = true
        }
    }, [updateScrollDirection])

    useEffect(() => {
        // Initialize with current scroll position
        lastScrollY.current = window.scrollY

        // Add event listener
        window.addEventListener('scroll', requestTick, { passive: true })

        // Clean up
        return () => {
            window.removeEventListener('scroll', requestTick)
        }
    }, [requestTick])

    return { scrollDirection, isVisible }
}
