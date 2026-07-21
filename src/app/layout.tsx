import type { Metadata } from 'next'
import { DM_Sans, DM_Serif_Display, Lora, Noto_Serif_Tamil, Playfair_Display } from 'next/font/google'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Toaster } from 'sonner'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font',
  display: 'swap',
})

const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-dm-serif',
  display: 'swap',
})

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

const notoSerifTamil = Noto_Serif_Tamil({
  subsets: ['tamil'],
  weight: ['400', '500', '600'],
  variable: '--font-tamil',
  display: 'swap',
})

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Nest — a space for you',
  description: 'A warm space that helps people feel less alone and more like themselves.',
  metadataBase: new URL('https://thenest.social'),
  icons: {
    icon: [{ url: '/nest-icon.svg', type: 'image/svg+xml' }],
    shortcut: '/nest-icon.svg',
  },
  openGraph: {
    title: 'Nest — a space for you',
    description: 'A warm space that helps people feel less alone and more like themselves.',
    url: 'https://thenest.social',
    siteName: 'Nest',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Nest — a space for you',
    description: 'A warm space that helps people feel less alone and more like themselves.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmSerifDisplay.variable} ${lora.variable} ${notoSerifTamil.variable} ${playfairDisplay.variable}`}>
      <body style={{ fontFamily: 'var(--font, DM Sans, sans-serif)' }}>
        {children}
        <Toaster position="top-center" richColors />
        <Analytics />
        <SpeedInsights />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-V9X61BPJL7"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-V9X61BPJL7');
        `}</Script>
      </body>
    </html>
  )
}