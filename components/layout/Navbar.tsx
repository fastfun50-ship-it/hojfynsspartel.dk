'use client'

import Link from 'next/link'

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0A0A0A]/95 backdrop-blur-xl">
      <div className="max-w-screen-2xl mx-auto px-8 flex items-center justify-between h-[78px]">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="text-3xl font-semibold tracking-[-2px] text-white">H</div>
          <div>
            <div className="text-lg font-medium tracking-[-0.5px]">Højfynsspartel</div>
            <div className="text-[10px] text-white/50 -mt-1">Vissenbjerg • Fyn</div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-10 text-sm font-medium text-white/70">
          <a href="#arbejde" className="nav-link hover:text-white">Arbejde</a>
          <a href="#proces" className="nav-link hover:text-white">Proces</a>
          <a href="#om" className="nav-link hover:text-white">Om os</a>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <a 
            href="tel:21631793" 
            className="hidden md:block text-sm text-white/70 hover:text-white transition-colors"
          >
            21 63 17 93
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
