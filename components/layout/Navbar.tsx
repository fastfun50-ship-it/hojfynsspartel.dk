'use client'

import Link from 'next/link'
import type { SiteContent } from '@/types/cms'

interface NavbarProps {
  content: SiteContent
}

export function Navbar({ content }: NavbarProps) {
  const phoneClean = content.contact.phone.replace(/\s/g, '')

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[var(--background)]/95 backdrop-blur-xl">
      <div className="max-w-screen-2xl mx-auto px-8 flex items-center justify-between h-[78px]">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="text-3xl font-semibold tracking-[-2px] text-white">H</div>
          <div>
            <div className="text-lg font-medium tracking-[-0.5px]">{content.company.name}</div>
            <div className="text-[10px] text-[var(--text-muted)] -mt-1">Vissenbjerg • Fyn</div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-10 text-sm font-medium text-white/70">
          <Link href="/#arbejde" className="nav-link hover:text-white">Arbejde</Link>
          <Link href="/projekter" className="nav-link hover:text-white">Projekter</Link>
          <a href="#se-mere" onClick={(e) => {
            e.preventDefault();
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new Event('open-se-more'));
              // Fallback if no listener yet
              if ((window as any).__openSeMore) {
                (window as any).__openSeMore();
              } else {
                // If modal not mounted, go to projects page
                window.location.href = '/projekter';
              }
            }
          }} className="nav-link hover:text-white">Se mere</a>
          <a href="#proces" className="nav-link hover:text-white">Proces</a>
          <a href="#om" className="nav-link hover:text-white">Om os</a>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <a 
            href={`tel:${phoneClean}`} 
            className="hidden md:block text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            {content.contact.phone}
          </a>
          
          <a 
            href="#kontakt" 
            className="btn btn-primary px-6 py-3 text-sm"
          >
            Start samtale
          </a>
        </div>
      </div>
    </nav>
  )
}
