import { Geist, Geist_Mono, Parisienne } from "next/font/google";
import "./globals.css";
import ClientProviders from "./_components/client-providers";

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

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${parisienne.variable}`}>
            <body className="antialiased dark">
                <ClientProviders>{children}</ClientProviders>
            </body>
        </html>
    );
}
