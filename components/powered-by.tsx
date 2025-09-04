'use client'

import { usePoweredBy, useMellimeUrl } from '@/hooks/use-website-url'
import { useLanguage } from '@/hooks/useLanguage'

export function PoweredBy() {
    const { data: poweredByText, isLoading: isLoadingPoweredBy } =
        usePoweredBy()
    const { data: mellimeUrl, isLoading: isLoadingMellimeUrl } = useMellimeUrl()
    const { t } = useLanguage()

    // Don't render anything if loading or no text is set
    if (isLoadingPoweredBy || !poweredByText) {
        return null
    }

    const handleClick = () => {
        if (mellimeUrl) {
            window.open(mellimeUrl, '_blank', 'noopener,noreferrer')
        }
    }

    return (
        <div className="flex">
            <div className="px-2 py-1">
                {mellimeUrl && !isLoadingMellimeUrl ? (
                    <button
                        onClick={handleClick}
                        className="group cursor-pointer text-lg text-gray-400 transition-colors duration-200 hover:text-gray-500"
                    >
                        {t('common.poweredBy')}{' '}
                        <span className="group-hover:text-morpheus-gold-dark text-morpheus-blue-dark font-medium transition-colors duration-200">
                            {poweredByText}
                        </span>
                    </button>
                ) : (
                    <p className="text-sm text-white/70">
                        {t('common.poweredBy')}{' '}
                        <span className="text-morpheus-gold-light font-medium">
                            {poweredByText}
                        </span>
                    </p>
                )}
            </div>
        </div>
    )
}
