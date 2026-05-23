import type { Metadata } from 'next'
import { DM_Sans, DM_Serif_Display, Lora, Noto_Serif_Tamil } from 'next/font/google'
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

export const metadata: Metadata = {
  title: 'Nest — a space for you',
  description: 'A warm space that helps people feel less alone and more like themselves.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmSerifDisplay.variable} ${lora.variable} ${notoSerifTamil.variable}`}>
      <body style={{ fontFamily: 'var(--font, DM Sans, sans-serif)' }}>
        {children}
      </body>
    </html>
  )
}