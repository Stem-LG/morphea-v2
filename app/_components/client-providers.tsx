'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { LanguageProvider } from '@/hooks/useLanguage'
import { CurrencyProvider } from '@/hooks/useCurrency'
import VisitorFormDialog from './visitor-form-dialog'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import NavBar from './nav_bar'

const queryClient = new QueryClient()

export default function ClientProviders({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <QueryClientProvider client={queryClient}>
            <NuqsAdapter>
                <LanguageProvider>
                    <CurrencyProvider>
                        <TooltipProvider>
                            <NavBar />
                            {/* Main content with navbar spacing */}
                            <div className="relative z-10">{children}</div>
                            {/* Visitor form dialog */}
                            <VisitorFormDialog />
                        </TooltipProvider>
                    </CurrencyProvider>
                </LanguageProvider>
            </NuqsAdapter>
            <Toaster />
        </QueryClientProvider>
    )
}
