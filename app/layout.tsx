import { Geist, Geist_Mono, Parisienne } from "next/font/google";
import localFont from "next/font/local";
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

// Local fonts
const agatho = localFont({
    src: [
        {
            path: "./_fonts/agatho/Agatho_Light.woff2",
            weight: "300",
            style: "normal",
        },
        {
            path: "./_fonts/agatho/Agatho_Regular.woff2",
            weight: "400",
            style: "normal",
        },
        {
            path: "./_fonts/agatho/Agatho_Medium.woff2",
            weight: "500",
            style: "normal",
        },
        {
            path: "./_fonts/agatho/Agatho_Bold.woff2",
            weight: "700",
            style: "normal",
        },
        {
            path: "./_fonts/agatho/Agatho_Narrow.woff2",
            weight: "400",
            style: "normal",
        },
    ],
    variable: "--font-agatho",
});

const brownSugar = localFont({
    src: "./_fonts/brown-sugar/Brown-Sugar.woff2",
    weight: "400",
    style: "normal",
    variable: "--font-brown-sugar",
});

const theSeasons = localFont({
    src: [
        {
            path: "./_fonts/the-seasons/the-seasons-light.woff2",
            weight: "300",
            style: "normal",
        },
        {
            path: "./_fonts/the-seasons/the-seasons-light-italic.woff2",
            weight: "300",
            style: "italic",
        },
        {
            path: "./_fonts/the-seasons/the-seasons-regular.woff2",
            weight: "400",
            style: "normal",
        },
        {
            path: "./_fonts/the-seasons/the-seasons-italic.woff2",
            weight: "400",
            style: "italic",
        },
        {
            path: "./_fonts/the-seasons/the-seasons-bold.woff2",
            weight: "700",
            style: "normal",
        },
        {
            path: "./_fonts/the-seasons/the-seasons-bold-italic.woff2",
            weight: "700",
            style: "italic",
        },
    ],
    variable: "--font-the-seasons",
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${geistSans.variable} ${geistMono.variable} ${parisienne.variable} ${agatho.variable} ${brownSugar.variable} ${theSeasons.variable}`}
        >
            <body className="antialiased dark">
                <ClientProviders>{children}</ClientProviders>
            </body>
        </html>
    );
}
