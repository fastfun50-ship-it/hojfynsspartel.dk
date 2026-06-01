export function About() {
  return (
    <section id="om" className="section border-t border-white/10 bg-[#0A0A0A]">
      <div className="max-w-screen-2xl mx-auto px-8 md:px-16">
        
        {/* Split Layout: Image + Text */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left side - Image (Placeholder for now) */}
          <div className="relative">
            <div className="aspect-[4/3] bg-zinc-900 rounded-3xl overflow-hidden border border-white/10">
              {/* 
                TEMPORARY IMAGE
                Using a commercial project photo as placeholder until we get the real photo of Michael + Mikkel together.
                Replace with: /images/about/michael-mikkel.jpg when ready.
              */}
              <img 
                src="/images/projects/commercial/commercial-hall-plastering-01.jpg" 
                alt="Michael Iversen og Mikkel - Højfynsspartel" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-[#0A0A0A] border border-white/10 px-6 py-4 rounded-2xl hidden lg:block">
              <div className="text-sm text-white/50">Michael Iversen &amp; Mikkel</div>
              <div className="text-[#C5A36E] font-medium">Højfynsspartel</div>
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
                Jeg hedder <span className="text-white font-medium">Michael Iversen</span>. Jeg er uddannet bygningsmaler siden 2009 og har arbejdet med spartling, maling og overfladebehandling i mere end 15 år.
              </p>
              <p>
                I 2020 startede jeg Højfynsspartel i Vissenbjerg. Jeg valgte at starte for mig selv, fordi jeg ville have frihed til at gøre tingene ordentligt – uden at skulle skynde mig eller gå på kompromis med kvaliteten.
              </p>
              <p>
                Jeg arbejder tæt sammen med <span className="text-white font-medium">Mikkel</span>, som er særligt dygtig til malerarbejde og beskæring i frihånd. Sammen dækker vi hele processen – fra den grundige forberedelse til den fine finish og de dekorative detaljer.
              </p>
            </div>

            {/* Philosophy */}
            <div className="mt-10 pt-8 border-t border-white/10">
              <div className="text-[#C5A36E] text-sm tracking-wider mb-2">VORES FILOSOFI</div>
              <h3 className="text-2xl font-semibold tracking-tight mb-3">Kvalitet er ikke noget, man siger. Det er noget, man gør.</h3>
              <p className="text-white/70">
                Det betyder, at vi bruger den tid, der skal til. At vi forbereder ordentligt. At vi er ærlige om, hvad en opgave kræver. Og at vi ikke forlader et projekt, før det er færdigt på den måde, vi selv ville acceptere det.
              </p>
            </div>

            {/* Quick facts */}
            <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
              <div>
                <div className="text-white/50 mb-1">Erfaring</div>
                <div className="text-white">15+ år som bygningsmaler</div>
              </div>
              <div>
                <div className="text-white/50 mb-1">Grundlagt</div>
                <div className="text-white">2020 i Vissenbjerg</div>
              </div>
              <div>
                <div className="text-white/50 mb-1">Dækning</div>
                <div className="text-white">Fyn + Sjælland &amp; Jylland</div>
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
          <a 
            href="#kontakt" 
            className="inline-block mt-5 text-sm font-medium text-[#C5A36E] hover:underline"
          >
            Kontakt os om din opgave →
          </a>
        </div>

      </div>
    </section>
  )
}
