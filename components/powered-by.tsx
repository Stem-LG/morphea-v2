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
        <div className="fixed bottom-0 justify-end z-20 pr-6 mb-2 flex w-full">
            <div className="rounded-lg border scale-125 border-white/10 bg-black/40 px-3 py-2">
                {mellimeUrl && !isLoadingMellimeUrl ? (
                    <button
                        onClick={handleClick}
                        className="group cursor-pointer text-sm text-white transition-colors duration-200 hover:text-white"
                    >
                        {t('common.poweredBy')}{' '}
                        <span className="group-hover:text-morpheus-gold-dark font-medium text-morpheus-blue-dark transition-colors duration-200">
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
