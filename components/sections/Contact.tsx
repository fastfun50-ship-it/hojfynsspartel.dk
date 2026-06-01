'use client'

export function Contact() {
  return (
    <section id="kontakt" className="section border-t border-white/10 bg-[#0A0A0A]">
      <div className="max-w-screen-2xl mx-auto px-8 md:px-16">
        
        {/* Header */}
        <div className="max-w-2xl mb-12">
          <span className="text-xs tracking-[3px] text-white/50">KOM I GANG</span>
          <h2 className="text-5xl md:text-6xl tracking-[-2.5px] font-semibold mt-3 leading-none">
            Lad os tale om<br />din opgave.
          </h2>
          <p className="mt-6 text-xl text-white/70">
            Fortæl os lidt om dit projekt, så tager vi en uforpligtende snak. 
            Vi svarer normalt inden for 24 timer på hverdage.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          
          {/* Contact Info + Trust signals */}
          <div className="space-y-10">
            <div>
              <div className="text-sm text-white/50 mb-2">Telefon</div>
              <a href="tel:21631793" className="text-3xl font-medium hover:text-[#C5A36E] transition-colors">
                21 63 17 93
              </a>
            </div>

            <div>
              <div className="text-sm text-white/50 mb-2">E-mail</div>
              <a href="mailto:info@højfynsspartel.dk" className="text-2xl hover:text-[#C5A36E] transition-colors">
                info@højfynsspartel.dk
              </a>
            </div>

            <div>
              <div className="text-sm text-white/50 mb-2">Adresse</div>
              <div className="text-xl text-white/90">Vissenbjerg, Fyn</div>
              <div className="text-white/60 mt-1">Vi dækker hele Fyn samt opgaver på Sjælland og i Jylland efter aftale.</div>
            </div>

            {/* Trust signals */}
            <div className="pt-8 border-t border-white/10 space-y-4 text-sm text-white/70">
              <div className="flex items-start gap-3">
                <span className="text-[#C5A36E] mt-1">✓</span>
                <span>Uforpligtende besigtigelse og tilbud</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#C5A36E] mt-1">✓</span>
                <span>Vi svarer typisk inden for 24 timer på hverdage</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#C5A36E] mt-1">✓</span>
                <span>CVR 41620730</span>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs tracking-widest text-white/60 mb-2">NAVN</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-[#111111] border border-white/20 rounded-2xl px-5 py-3.5 text-white placeholder:text-white/40 focus:border-[#C5A36E] focus:outline-none transition-colors"
                    placeholder="Anders Jensen"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-widest text-white/60 mb-2">TELEFON</label>
                  <input 
                    type="tel" 
                    required
                    className="w-full bg-[#111111] border border-white/20 rounded-2xl px-5 py-3.5 text-white placeholder:text-white/40 focus:border-[#C5A36E] focus:outline-none transition-colors"
                    placeholder="21 63 17 93"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs tracking-widest text-white/60 mb-2">E-MAIL</label>
                <input 
                  type="email" 
                  required
                  className="w-full bg-[#111111] border border-white/20 rounded-2xl px-5 py-3.5 text-white placeholder:text-white/40 focus:border-[#C5A36E] focus:outline-none transition-colors"
                  placeholder="din@email.dk"
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest text-white/60 mb-2">BESKRIV DIN OPGAVE</label>
                <textarea 
                  required
                  rows={6}
                  className="w-full bg-[#111111] border border-white/20 rounded-3xl px-5 py-4 text-white placeholder:text-white/40 focus:border-[#C5A36E] focus:outline-none transition-colors resize-y"
                  placeholder="F.eks. fuldspartling af stue og køkken, ca. 85 m². Gerne færdig inden 1. oktober."
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest text-white/60 mb-2">ØNSKET STARTTIDSPUNKT (valgfrit)</label>
                <input 
                  type="text" 
                  className="w-full bg-[#111111] border border-white/20 rounded-2xl px-5 py-3.5 text-white placeholder:text-white/40 focus:border-[#C5A36E] focus:outline-none transition-colors"
                  placeholder="Snarest / i løbet af september / efter 15. oktober"
                />
              </div>

              <button 
                type="submit"
                className="w-full mt-4 h-14 rounded-2xl bg-[#C5A36E] text-[#0A0A0A] font-semibold text-base hover:bg-[#D4B47F] transition-all active:scale-[0.985]"
              >
                Send besked — vi vender tilbage hurtigt
              </button>

              <p className="text-center text-xs text-white/50 pt-2">
                Vi svarer typisk inden for 24 timer på hverdage. Ingen forpligtelse.
              </p>
            </form>
          </div>

        </div>
      </div>
    </section>
  )
}
