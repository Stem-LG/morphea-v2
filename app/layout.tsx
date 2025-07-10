"use client";

import { Geist, Geist_Mono, Parisienne } from "next/font/google";
import "./globals.css";
import AnimatedBackground from "@/components/animated-background";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NavBnorear from "./_components/nav_bar";
import { LanguageProvider } from "@/hooks/useLanguage";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const parisienne = Parisienne({
    variable: "--font-parisienne",
    subsets: ["latin"],
    weight: "400",
});

const queryClient = new QueryClient();

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} ${parisienne.variable} antialiased`}>
                <QueryClientProvider client={queryClient}>
                    <LanguageProvider>
                        <NavBar />
                        {/* Animated 360° Background */}
                        <AnimatedBackground />
                        {/* Main content with navbar spacing */}
                        <div className="relative z-10">{children}</div>
                    </LanguageProvider>
                </QueryClientProvider>
            </body>
        </html>
    );
}
