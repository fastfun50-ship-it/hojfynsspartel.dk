import Link from 'next/link'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { verifyAuth, logout } from '@/lib/auth'
import { Toaster } from 'sonner'
import { DEFAULT_COLORS } from '@/types/cms'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const pathname = headersList.get('x-admin-pathname') || ''

  // If this is the login page, render it without the admin auth guard or chrome
  // (the login page has its own full-screen UI)
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const isAuthed = await verifyAuth()

  if (!isAuthed) {
    // Should be caught by middleware, but double check for direct RSC access
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5]">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0A0A0A]/95 backdrop-blur-xl">
        <div className="max-w-screen-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="text-2xl font-semibold tracking-[-1.5px] text-white">H</div>
              <div>
                <div className="font-medium tracking-[-0.3px]">Højfynsspartel</div>
                <div className="text-[9px] text-[#C5A36E] -mt-1">CMS ADMIN</div>
              </div>
            </Link>
            <div className="text-xs px-2 py-0.5 rounded bg-white/5 text-white/50">LIVE</div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <Link href="/" target="_blank" className="text-white/70 hover:text-white transition-colors">
              Se hjemmeside →
            </Link>
            <form action="/api/admin/logout" method="POST">
              <button
                type="submit"
                className="px-4 py-1.5 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-white/40 text-sm transition-colors"
              >
                Log ud
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto">
        {children}
      </div>

      <Toaster position="top-center" richColors closeButton />

      {/* Force admin to always use original dark premium colors, independent of site theme */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --background: ${DEFAULT_COLORS.background} !important;
          --surface: ${DEFAULT_COLORS.surface} !important;
          --surface-2: ${DEFAULT_COLORS.surface2} !important;
          --border: ${DEFAULT_COLORS.border} !important;
          --text-primary: ${DEFAULT_COLORS.textPrimary} !important;
          --text-muted: ${DEFAULT_COLORS.textMuted} !important;
          --gold: ${DEFAULT_COLORS.accent} !important;
          --gold-hover: ${DEFAULT_COLORS.accentHover} !important;
        }
      ` }} />
    </div>
  )
}
