import type { SiteContent } from '@/types/cms'

interface AboutProps {
  content: SiteContent
}

export function About({ content }: AboutProps) {
  const { about, company, contact } = content

  return (
    <section id="om" className="section border-t border-white/10 bg-[var(--background)]">
      <div className="max-w-screen-2xl mx-auto px-8 md:px-16">
        
        {/* Split Layout: Image + Text */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left side - Image */}
          <div className="relative">
            <div className="aspect-[4/3] bg-[var(--surface)] rounded-3xl overflow-hidden border border-white/10">
              <img 
                src={about.aboutImage || '/images/projects/commercial/commercial-hall-plastering-01.jpg'} 
                alt={`${company.owner} og Mikkel - ${company.name}`} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-[var(--background)] border border-white/10 px-6 py-4 rounded-2xl hidden lg:block">
              <div className="text-sm text-white/50">{company.owner} &amp; Mikkel</div>
              <div className="text-[var(--gold)] font-medium">{company.name}</div>
            </div>
          </div>

          {/* Right side - Text Content */}
          <div>
            <span className="text-xs tracking-[3px] text-white/50">OM HØJFYNS-SPARTEL</span>
            
            <h2 className="text-5xl md:text-6xl tracking-[-2.5px] font-semibold mt-4 leading-none">
              Vi går ikke på<br />kompromis med<br />det, vi leverer.
            </h2>

            <div className="mt-8 space-y-6 text-lg text-white/80 leading-relaxed">
              <p>
                Jeg hedder <span className="text-[var(--text-primary)] font-medium">{about.ownerName}</span>. Jeg er uddannet bygningsmaler siden {company.founded} og har arbejdet med spartling, maling og overfladebehandling i mere end 15 år.
              </p>
              <p>
                I 2020 startede jeg {company.name} i Vissenbjerg. Jeg valgte at starte for mig selv, fordi jeg ville have frihed til at gøre tingene ordentligt – uden at skulle skynde mig eller gå på kompromis med kvaliteten.
              </p>
              <p>
                Jeg arbejder tæt sammen med <span className="text-[var(--text-primary)] font-medium">Mikkel</span>, som er særligt dygtig til malerarbejde og beskæring i frihånd. Sammen dækker vi hele processen – fra den grundige forberedelse til den fine finish og de dekorative detaljer.
              </p>
            </div>

            {/* Philosophy */}
            <div className="mt-10 pt-8 border-t border-white/10">
              <div className="text-[var(--gold)] text-sm tracking-wider mb-2">VORES FILOSOFI</div>
              <h3 className="text-2xl font-semibold tracking-tight mb-3">{about.philosophyTitle}</h3>
              <p className="text-white/70">
                {about.philosophyText}
              </p>
            </div>

            {/* Quick facts */}
            <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
              <div>
                <div className="text-white/50 mb-1">Erfaring</div>
                <div className="text-[var(--text-primary)]">{about.factExperience}</div>
              </div>
              <div>
                <div className="text-white/50 mb-1">Grundlagt</div>
                <div className="text-[var(--text-primary)]">{about.factFounded}</div>
              </div>
              <div>
                <div className="text-white/50 mb-1">Dækning</div>
                <div className="text-[var(--text-primary)]">{contact.area}</div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom CTA */}
        <div className="mt-16 pt-10 border-t border-white/10 max-w-2xl">
          <p className="text-lg text-white/70">
            Hvis du leder efter en, der bare hurtigt skal have opgaven overstået, er vi sandsynligvis ikke de rigtige. 
            Men hvis du vil have det gjort ordentligt – så lad os tale sammen.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <a
              href="#kontakt"
              className="text-sm font-medium text-[var(--gold)] hover:underline"
            >
              {about.ctaText}
            </a>
            <a
              href={`tel:${contact.phone.replace(/\s/g, '')}`}
              className="text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              Eller ring {contact.phone} →
            </a>
          </div>
        </div>

      </div>
    </section>
  )
}

