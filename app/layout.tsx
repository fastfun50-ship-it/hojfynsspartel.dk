import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { getSiteContent, getProjects } from '@/lib/cms'
import { SeMoreModal } from '@/components/project/SeMoreModal'
import { DEFAULT_COLORS } from '@/types/cms'

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

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent()
  return {
    metadataBase: new URL('https://højfynsspartel.dk'),
    title: content.metadata.title,
    description: content.metadata.description,
    icons: {
      icon: '/favicon.ico',
    },
    openGraph: {
      title: content.metadata.title,
      description: content.metadata.description,
      images: [{ url: content.metadata.ogImage }],
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [content, projects] = await Promise.all([
    getSiteContent(),
    getProjects()
  ])
  const themeColors = content.colors || DEFAULT_COLORS
  return (
    <html lang="da" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-[var(--background)] text-[var(--text-primary)] antialiased">
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --background: ${themeColors.background};
            --surface: ${themeColors.surface};
            --surface-2: ${themeColors.surface2 || '#1C1C1C'};
            --border: ${themeColors.border || '#252525'};
            --text-primary: ${themeColors.textPrimary || '#F5F5F5'};
            --text-muted: ${themeColors.textMuted || '#A1A1AA'};
            --gold: ${themeColors.accent};
            --gold-hover: ${themeColors.accentHover};
          }
        ` }} />
        {children}
        <Toaster position="top-center" richColors closeButton />
        <SeMoreModal projects={projects} />
      </body>
    </html>
  )
}