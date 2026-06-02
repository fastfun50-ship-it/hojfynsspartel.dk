'use client'

import { useState } from 'react'
import { toast } from 'sonner'

export function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log('[Contact] Form submitted - handleSubmit fired')
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    
    const data = {
      navn: formData.get('navn') as string,
      telefon: formData.get('telefon') as string,
      email: formData.get('email') as string,
      beskrivelse: formData.get('beskrivelse') as string,
      starttidspunkt: formData.get('starttidspunkt') as string || undefined,
    }

    console.log('[Contact] Data to send:', data)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      console.log('[Contact] API response:', result)

      if (response.ok && result.success) {
        setIsSuccess(true)
        toast.success('Tak! Vi vender tilbage inden for 24 timer.')
        e.currentTarget.reset()
      } else {
        // During debugging: surface the actual Resend error from debug if present
        const debugMsg = result.debug?.message || result.debug?.name
        const displayError = debugMsg
          ? `Fejl fra Resend: ${debugMsg}`
          : (result.error || 'Der opstod en fejl. Prøv venligst igen.')
        toast.error(displayError)
        console.error('[Contact] Full error response:', result)
      }
    } catch (error) {
      console.error('[Contact] Unexpected error:', error)
      toast.error('Der opstod en uventet fejl. Prøv venligst igen senere.')
      console.error('[Contact] Full catch error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <section id="kontakt" className="section border-t border-white/10 bg-[#0A0A0A]">
        <div className="max-w-screen-2xl mx-auto px-8 md:px-16 text-center">
          <div className="max-w-md mx-auto py-12">
            <div className="text-6xl mb-6">✓</div>
            <h2 className="text-4xl font-semibold tracking-tight mb-4">Tak for din henvendelse!</h2>
            <p className="text-xl text-white/70">
              Vi har modtaget din besked og vender tilbage inden for 24 timer på hverdage.
            </p>
            <button 
              onClick={() => setIsSuccess(false)}
              className="mt-8 text-sm text-[#C5A36E] hover:underline"
            >
              Send en ny besked
            </button>
          </div>
        </div>
      </section>
    )
  }

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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs tracking-widest text-white/60 mb-2">NAVN</label>
                  <input 
                    type="text" 
                    name="navn"
                    required
                    className="w-full bg-[#111111] border border-white/20 rounded-2xl px-5 py-3.5 text-white placeholder:text-white/40 focus:border-[#C5A36E] focus:outline-none transition-colors"
                    placeholder="Anders Jensen"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-widest text-white/60 mb-2">TELEFON</label>
                  <input 
                    type="tel" 
                    name="telefon"
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
                  name="email"
                  required
                  className="w-full bg-[#111111] border border-white/20 rounded-2xl px-5 py-3.5 text-white placeholder:text-white/40 focus:border-[#C5A36E] focus:outline-none transition-colors"
                  placeholder="din@email.dk"
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest text-white/60 mb-2">BESKRIV DIN OPGAVE</label>
                <textarea 
                  name="beskrivelse"
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
                  name="starttidspunkt"
                  className="w-full bg-[#111111] border border-white/20 rounded-2xl px-5 py-3.5 text-white placeholder:text-white/40 focus:border-[#C5A36E] focus:outline-none transition-colors"
                  placeholder="Snarest / i løbet af september / efter 15. oktober"
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 h-14 rounded-2xl bg-[#C5A36E] text-[#0A0A0A] font-semibold text-base hover:bg-[#D4B47F] transition-all active:scale-[0.985] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sender besked...' : 'Send besked — vi vender tilbage hurtigt'}
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
