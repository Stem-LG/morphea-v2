import localFont from 'next/font/local'
import './globals.css'
import ClientProviders from './_components/client-providers'

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
                <ClientProviders>{children}</ClientProviders>
            </body>
        </html>
    )
}
