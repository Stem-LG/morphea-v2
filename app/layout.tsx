"use client";

import { Geist, Geist_Mono, Parisienne } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import AnimatedBackground from "@/components/animated-background";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NavBar from "./_components/nav_bar";

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

const brownSugar = localFont({
    src: "./_assets/fonts/Brown Sugar.woff2",
});

const queryClient = new QueryClient();

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                
            </head>
            <body className={`${geistSans.variable} ${geistMono.variable} ${parisienne.variable} antialiased`}>
                <QueryClientProvider client={queryClient}>
                    <NavBar />
                    {/* Animated 360° Background */}
                    <AnimatedBackground />
                    {/* Main content with navbar spacing */}
                    <div className="pt-16 relative z-10">{children}</div>
                </QueryClientProvider>
            </body>
        </html>
    );
}
