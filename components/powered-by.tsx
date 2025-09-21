'use client'

import { useMellimeUrl } from '@/hooks/use-website-url'
import { useLanguage } from '@/hooks/useLanguage'

export function PoweredBy() {
    const { data: mellimeUrl, isLoading: isLoadingMellimeUrl } = useMellimeUrl()
    const { t } = useLanguage()

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
                        {t('common.poweredBy')}
                    </button>
                ) : (
                    <p className="text-sm text-white/70">
                        {t('common.poweredBy')}
                    </p>
                )}
            </div>
        </div>
    )
}
