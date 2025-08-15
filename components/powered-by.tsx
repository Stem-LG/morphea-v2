'use client'

import { usePoweredBy, useMellimeUrl } from '@/hooks/use-website-url'
import { useLanguage } from '@/hooks/useLanguage'

export function PoweredBy() {
  const { data: poweredByText, isLoading: isLoadingPoweredBy } = usePoweredBy()
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
    <div className="fixed bottom-4 right-4 z-10">
      <div className="bg-black/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10">
        {mellimeUrl && !isLoadingMellimeUrl ? (
          <button
            onClick={handleClick}
            className="text-sm text-white/70 hover:text-white transition-colors duration-200 cursor-pointer group"
          >
            {t('common.poweredBy')}{' '}
            <span className="text-morpheus-gold-light font-medium group-hover:text-morpheus-gold-dark transition-colors duration-200">
              {poweredByText}
            </span>
          </button>
        ) : (
          <p className="text-sm text-white/70">
            {t('common.poweredBy')} <span className="text-morpheus-gold-light font-medium">{poweredByText}</span>
          </p>
        )}
      </div>
    </div>
  )
}