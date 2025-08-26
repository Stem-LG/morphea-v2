import localFont from 'next/font/local'
import './globals.css'
import ClientProviders from './_components/client-providers'
import { ConsentManagerProvider, CookieBanner, ConsentManagerDialog } from '@c15t/nextjs';

const supreme = localFont({
    src: [
        {
            path: './_fonts/supreme/Supreme-Regular.woff2',
            weight: '400',
            style: 'normal',
        },
    ],
    variable: '--font-supreme',
})

const recia = localFont({
    src: [
        {
            path: './_fonts/recia/Recia-Medium.woff2',
            weight: '400',
            style: 'normal',
        },
    ],
    variable: '--font-recia',
})

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" className={`${supreme.variable} ${recia.variable}`}>
            <body className="antialiased">
                <ConsentManagerProvider
                    options={{
                        mode: 'c15t',
                        backendURL: process.env.NEXT_PUBLIC_C15T_URL,
                    }}
                >
                    <ClientProviders>{children}</ClientProviders>
                    {/* Banner that shows at the bottom or top */}
                    <CookieBanner />
                    {/* Dialog for managing consent */}
                    <ConsentManagerDialog />
                </ConsentManagerProvider>
            </body>
        </html>
    )
}
