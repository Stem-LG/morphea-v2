'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'

export interface CookiePreferences {
    necessary: boolean // Always true
    analytics: boolean
    marketing: boolean
    functional: boolean
}

interface CookieConsentContextType {
    preferences: CookiePreferences
    hasConsent: boolean
    showBanner: boolean
    acceptAll: () => void
    rejectAll: () => void
    updatePreferences: (prefs: Partial<CookiePreferences>) => void
    closeBanner: () => void
    openPreferences: () => void
}

const defaultPreferences: CookiePreferences = {
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
}

const CookieConsentContext = createContext<CookieConsentContextType | null>(null)

export function useCookieConsent() {
    const context = useContext(CookieConsentContext)
    if (!context) {
        throw new Error('useCookieConsent must be used within a CookieConsentProvider')
    }
    return context
}

interface CookieConsentProviderProps {
    children: ReactNode
}

export function CookieConsentProvider({ children }: CookieConsentProviderProps) {
    const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences)
    const [hasConsent, setHasConsent] = useState(false)
    const [showBanner, setShowBanner] = useState(false)

    useEffect(() => {
        // Check if user has already given consent
        const savedConsent = localStorage.getItem('cookie-consent')
        const savedPreferences = localStorage.getItem('cookie-preferences')

        if (savedConsent === 'true' && savedPreferences) {
            try {
                const prefs = JSON.parse(savedPreferences)
                setPreferences({ ...defaultPreferences, ...prefs })
                setHasConsent(true)
                setShowBanner(false)
            } catch {
                // If parsing fails, show banner
                setShowBanner(true)
            }
        } else {
            // Show banner if no consent given
            setShowBanner(true)
        }
    }, [])

    const savePreferences = (prefs: CookiePreferences) => {
        localStorage.setItem('cookie-consent', 'true')
        localStorage.setItem('cookie-preferences', JSON.stringify(prefs))
        setPreferences(prefs)
        setHasConsent(true)
        setShowBanner(false)

        // Dispatch event for analytics/marketing scripts to listen to
        window.dispatchEvent(new CustomEvent('cookiePreferencesUpdated', { 
            detail: prefs 
        }))
    }

    const acceptAll = () => {
        const allAccepted: CookiePreferences = {
            necessary: true,
            analytics: true,
            marketing: true,
            functional: true,
        }
        savePreferences(allAccepted)
    }

    const rejectAll = () => {
        const onlyNecessary: CookiePreferences = {
            necessary: true,
            analytics: false,
            marketing: false,
            functional: false,
        }
        savePreferences(onlyNecessary)
    }

    const updatePreferences = (newPrefs: Partial<CookiePreferences>) => {
        const updated = { ...preferences, ...newPrefs, necessary: true }
        savePreferences(updated)
    }

    const closeBanner = () => {
        setShowBanner(false)
    }

    const openPreferences = () => {
        setShowBanner(true)
    }

    return (
        <CookieConsentContext.Provider
            value={{
                preferences,
                hasConsent,
                showBanner,
                acceptAll,
                rejectAll,
                updatePreferences,
                closeBanner,
                openPreferences,
            }}
        >
            {children}
        </CookieConsentContext.Provider>
    )
}