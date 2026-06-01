import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Højfynsspartel | Professionel spartling & maling på Fyn',
  description: 'Højfynsspartel v/ Michael Iversen. Uddannet bygningsmaler siden 2009. Vi leverer håndværk i særklasse – fuldspartling, filt, maling og facader på hele Fyn.',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'Højfynsspartel | Professionel spartling & maling på Fyn',
    description: 'Håndværk der holder. Finish der ses. 15+ års erfaring.',
    images: [{ url: '/og-image.jpg' }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="da" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-[#0A0A0A] text-[#F5F5F5] antialiased">
        {children}
      </body>
    </html>
  )
}