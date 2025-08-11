"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { LanguageProvider } from "@/hooks/useLanguage";
import { CurrencyProvider } from "@/hooks/useCurrency";
import NavBar from "./nav_bar";
import VisitorFormDialog from "./visitor-form-dialog";
import { Toaster } from "@/components/ui/sonner";

const queryClient = new QueryClient();

export default function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <NuqsAdapter>
                <LanguageProvider>
                    <CurrencyProvider>
                        <NavBar />
                        {/* Main content with navbar spacing */}
                        <div className="relative z-10">{children}</div>
                        {/* Visitor form dialog */}
                        <VisitorFormDialog />
                    </CurrencyProvider>
                </LanguageProvider>
            </NuqsAdapter>
            <Toaster />
        </QueryClientProvider>
    );
}
