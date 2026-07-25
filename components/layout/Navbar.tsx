'use client'

import Link from 'next/link'
import type { SiteContent } from '@/types/cms'

interface NavbarProps {
  content: SiteContent
}

export function Navbar({ content }: NavbarProps) {
  const phoneClean = content.contact.phone.replace(/\s/g, '')
  const phoneDisplay = content.contact.phone

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[var(--background)]/95 backdrop-blur-xl">
      <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 md:px-8 flex items-center justify-between h-14 sm:h-16 md:h-[78px] gap-2">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0 min-w-0">
          <div className="text-2xl sm:text-3xl font-semibold tracking-[-2px] text-white">H</div>
          <div className="hidden sm:block">
            <div className="text-base md:text-lg font-medium tracking-[-0.5px]">{content.company.name}</div>
            <div className="text-[10px] text-[var(--text-muted)] -mt-1">Vissenbjerg • Fyn</div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-white/70">
          <Link href="/#arbejde" className="nav-link hover:text-white">Arbejde</Link>
          <Link href="/projekter" className="nav-link hover:text-white">Projekter</Link>
          <a
            href="#se-mere"
            onClick={(e) => {
              e.preventDefault()
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('open-se-more'))
                if ((window as any).__openSeMore) {
                  ;(window as any).__openSeMore()
                } else {
                  window.location.href = '/projekter'
                }
              }
            }}
            className="nav-link hover:text-white"
          >
            Se mere
          </a>
          <Link href="/#proces" className="nav-link hover:text-white">Proces</Link>
          <Link href="/#om" className="nav-link hover:text-white">Om os</Link>
        </div>

        {/* Right side: compact Ring + Kontakt — sized for mobile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <a
            href={`tel:${phoneClean}`}
            className="btn btn-outline btn-sm"
            aria-label={`Ring til ${phoneDisplay}`}
          >
            <PhoneIcon className="w-3.5 h-3.5 shrink-0" />
            <span>Ring</span>
            <span className="hidden lg:inline text-white/55 font-normal">{phoneDisplay}</span>
          </a>

          <a
            href="/#kontakt"
            className="btn btn-primary btn-sm"
          >
            <span className="sm:hidden">Kontakt</span>
            <span className="hidden sm:inline">Start samtale</span>
          </a>
        </div>
      </div>
    </nav>
  )
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}
