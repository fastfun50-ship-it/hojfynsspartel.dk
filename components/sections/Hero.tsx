import type { SiteContent } from '@/types/cms'

interface HeroProps {
  content: SiteContent
}

export function Hero({ content }: HeroProps) {
  const { hero, company, contact } = content

  // Split subheadline by \n for nice breaks
  const subLines = hero.subheadline.split('\n')

  return (
    <section className="relative min-h-[100dvh] flex items-center overflow-hidden">
      
      {/* Video Background */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster="/hero-poster.jpg"
      >
        <source src="/hero-video.mp4" type="video/mp4" />
        {/* Fallback for browsers that don't support video */}
        Your browser does not support the video tag.
      </video>

      {/* Dark gradient overlays for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/55 to-black/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />

      {/* Content */}
      <div className="relative z-10 max-w-screen-2xl mx-auto px-8 md:px-16 pt-20">
        <div className="max-w-[980px]">
          
          {/* Small accent line + label */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-8 bg-[var(--gold)]"></div>
            <span className="text-xs tracking-[4px] text-white/70 font-medium">{hero.locationLabel}</span>
          </div>

          {/* Main headline - support the special "ro" accent */}
          <h1 className="text-[88px] md:text-[110px] leading-[0.86] tracking-[-6.5px] font-semibold text-[var(--text-primary)] mb-6">
            {hero.headline1}<br />
            {hero.headline2}<br />
            <span className="text-[var(--gold)]">{hero.headlineAccent}</span>
          </h1>

          <div className="max-w-md">
            <p className="text-2xl text-white/85 leading-tight tracking-[-0.3px]">
              {subLines.map((line, i) => (
                <span key={i}>{line}{i < subLines.length - 1 && <br />}</span>
              ))}
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-12">
            <a 
              href="#kontakt" 
              className="btn btn-primary px-9 py-4 text-base"
            >
              {hero.ctaPrimary}
            </a>
            
            <a 
              href="#arbejde" 
              className="group flex items-center gap-2 pl-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              {hero.ctaSecondary} 
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </a>
          </div>
        </div>

        {/* Bottom meta info */}
        <div className="relative z-10 mt-24 md:mt-32 flex flex-col md:flex-row md:items-center gap-y-3 gap-x-12 text-sm border-t border-white/20 pt-8 text-white/60">
          <div>{company.owner}</div>
          <div>Bygningsmaler siden {company.founded}</div>
          <div>{contact.area}</div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:block text-white/50 text-xs tracking-[3px]">
        SCROLL FOR AT SE MERE
      </div>
    </section>
  )
}

