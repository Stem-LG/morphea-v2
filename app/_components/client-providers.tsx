"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "@/hooks/useLanguage";
import NavBar from "./nav_bar";
import VisitorFormDialog from "./visitor-form-dialog";

const queryClient = new QueryClient();

export default function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <LanguageProvider>
                <NavBar />
                {/* Main content with navbar spacing */}
                <div className="relative z-10">{children}</div>
                {/* Visitor form dialog */}
                <VisitorFormDialog />
            </LanguageProvider>
        </QueryClientProvider>
    );
}
