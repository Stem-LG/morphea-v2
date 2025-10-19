'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { LanguageProvider } from '@/hooks/useLanguage'
import { CurrencyProvider } from '@/hooks/useCurrency'
import VisitorFormDialog from './visitor-form-dialog'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import NavBar from './nav_bar'
import { usePathname } from 'next/navigation'
import { CookieConsentProvider } from '@/hooks/useCookieConsent'

const queryClient = new QueryClient()

export default function ClientProviders({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const isComingSoonPage = pathname === '/comingsoon'

    return (
        <QueryClientProvider client={queryClient}>
            <NuqsAdapter>
                <LanguageProvider>
                    <CurrencyProvider>
                        <TooltipProvider>
                            <CookieConsentProvider>
                                {!isComingSoonPage && <NavBar />}
                                {/* Main content with navbar spacing */}
                                <div className="relative z-10">{children}</div>
                                {/* Visitor form dialog */}
                                {/* {!isComingSoonPage && <VisitorFormDialog />} */}
                            </CookieConsentProvider>
                        </TooltipProvider>
                    </CurrencyProvider>
                </LanguageProvider>
            </NuqsAdapter>
            <Toaster />
        </QueryClientProvider>
    )
}
