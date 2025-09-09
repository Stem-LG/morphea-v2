'use client'

import { useState } from 'react'
import { X, Settings, Cookie, ChevronUp, ChevronDown } from 'lucide-react'
import { useCookieConsent, CookiePreferences } from '@/hooks/useCookieConsent'
import { useLanguage } from '@/hooks/useLanguage'

export default function CookieConsentBanner() {
    const { preferences, showBanner, acceptAll, rejectAll, updatePreferences, closeBanner } = useCookieConsent()
    const { t } = useLanguage()
    const [showPreferences, setShowPreferences] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)
    const [tempPreferences, setTempPreferences] = useState<CookiePreferences>(preferences)

    if (!showBanner) return null

    const handleSavePreferences = () => {
        updatePreferences(tempPreferences)
        setShowPreferences(false)
        setIsExpanded(false)
    }

    const togglePreference = (key: keyof CookiePreferences) => {
        if (key === 'necessary') return // Cannot disable necessary cookies
        setTempPreferences(prev => ({
            ...prev,
            [key]: !prev[key]
        }))
    }

    const handleToggleExpanded = () => {
        setIsExpanded(!isExpanded)
        if (!isExpanded) {
            setTempPreferences(preferences)
            setShowPreferences(true)
        } else {
            setShowPreferences(false)
        }
    }

    return (
        <div className="fixed bottom-4 left-4 z-50 max-w-md w-full">
            <div className={`bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300 ${
                isExpanded ? 'max-h-[80vh]' : 'max-h-fit'
            }`}>
                {/* Header - Always visible */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#063846]/10">
                            <Cookie className="h-4 w-4 text-[#063846]" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-[#05141D] text-sm">
                                {t('cookies.title')}
                            </h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleToggleExpanded}
                            className="text-[#063846] hover:text-[#05141D] transition-colors p-1"
                        >
                            {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                            ) : (
                                <ChevronUp className="h-4 w-4" />
                            )}
                        </button>
                        <button
                            onClick={closeBanner}
                            className="text-[#063846] hover:text-[#05141D] transition-colors p-1"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Compact Description - Always visible */}
                <div className="p-4">
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                        {t('cookies.description')}
                    </p>

                    {!isExpanded ? (
                        /* Compact Banner */
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                                <button
                                    onClick={acceptAll}
                                    className="bg-gradient-to-r from-[#05141D] to-[#063846] hover:from-[#04111a] hover:to-[#052d37] text-white px-4 py-2 rounded-md font-medium transition-all duration-300 text-sm flex-1"
                                >
                                    {t('cookies.acceptAll')}
                                </button>
                                <button
                                    onClick={rejectAll}
                                    className="border border-[#063846] text-[#063846] hover:text-[#05141D] hover:border-[#05141D] px-4 py-2 rounded-md font-medium transition-colors text-sm flex-1"
                                >
                                    {t('cookies.rejectAll')}
                                </button>
                            </div>
                            <button
                                onClick={handleToggleExpanded}
                                className="bg-[#063846]/10 border border-[#063846]/20 text-[#063846] hover:bg-[#063846]/20 px-4 py-2 rounded-md font-medium transition-colors text-sm flex items-center justify-center gap-2"
                            >
                                <Settings className="h-3 w-3" />
                                {t('cookies.managePreferences')}
                            </button>
                        </div>
                    ) : (
                        /* Expanded Preferences - Scrollable */
                        <div className="max-h-64 overflow-y-auto">
                            <div className="space-y-3">
                                {/* Necessary Cookies */}
                                <div className="border border-[#063846]/20 rounded-md p-3 bg-[#063846]/5">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium text-[#05141D] text-sm">
                                            {t('cookies.necessary')}
                                        </h4>
                                        <div className="bg-[#063846]/10 text-[#063846] px-2 py-1 rounded-full text-xs font-medium">
                                            {t('common.required')}
                                        </div>
                                    </div>
                                    <p className="text-xs text-[#063846]/70">
                                        {t('cookies.necessaryDescription')}
                                    </p>
                                </div>

                                {/* Analytics Cookies */}
                                <div className="border border-slate-200 rounded-md p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium text-[#05141D] text-sm">
                                            {t('cookies.analytics')}
                                        </h4>
                                        <button
                                            onClick={() => togglePreference('analytics')}
                                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                                tempPreferences.analytics 
                                                    ? 'bg-[#063846]' 
                                                    : 'bg-slate-300'
                                            }`}
                                        >
                                            <span
                                                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                                    tempPreferences.analytics 
                                                        ? 'translate-x-5' 
                                                        : 'translate-x-1'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-600">
                                        {t('cookies.analyticsDescription')}
                                    </p>
                                </div>

                                {/* Marketing Cookies */}
                                <div className="border border-slate-200 rounded-md p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium text-[#05141D] text-sm">
                                            {t('cookies.marketing')}
                                        </h4>
                                        <button
                                            onClick={() => togglePreference('marketing')}
                                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                                tempPreferences.marketing 
                                                    ? 'bg-[#063846]' 
                                                    : 'bg-slate-300'
                                            }`}
                                        >
                                            <span
                                                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                                    tempPreferences.marketing 
                                                        ? 'translate-x-5' 
                                                        : 'translate-x-1'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-600">
                                        {t('cookies.marketingDescription')}
                                    </p>
                                </div>

                                {/* Functional Cookies */}
                                <div className="border border-slate-200 rounded-md p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium text-[#05141D] text-sm">
                                            {t('cookies.functional')}
                                        </h4>
                                        <button
                                            onClick={() => togglePreference('functional')}
                                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                                tempPreferences.functional 
                                                    ? 'bg-[#063846]' 
                                                    : 'bg-slate-300'
                                            }`}
                                        >
                                            <span
                                                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                                    tempPreferences.functional 
                                                        ? 'translate-x-5' 
                                                        : 'translate-x-1'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-600">
                                        {t('cookies.functionalDescription')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Save Button - Only shown when expanded */}
                {isExpanded && (
                    <div className="border-t border-slate-200 p-4">
                        <div className="flex gap-2">
                            <button
                                onClick={handleSavePreferences}
                                className="bg-gradient-to-r from-[#05141D] to-[#063846] hover:from-[#04111a] hover:to-[#052d37] text-white px-4 py-2 rounded-md font-medium transition-all duration-300 text-sm flex-1"
                            >
                                {t('cookies.save')}
                            </button>
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="border border-slate-300 text-slate-600 hover:text-slate-800 hover:border-slate-400 px-4 py-2 rounded-md font-medium transition-colors text-sm flex-1"
                            >
                                {t('common.back')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}