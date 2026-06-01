'use client'

const steps = [
  {
    number: "01",
    title: "Gennemgang & forventningsafstemning",
    description: "Vi møder dig på stedet og lytter til, hvad der er vigtigt for dig. Vi gennemgår opgaven realistisk og er ærlige om, hvad der skal til for at opnå det resultat, du ønsker – uden at love noget vi ikke kan holde.",
  },
  {
    number: "02",
    title: "Forberedelse – det usynlige arbejde",
    description: "Når vi aftaler at spartle et rum, for eksempel en stue, så har vi også aftalt, at rummet skal være ryddet. Det gør vi både for at beskytte dine ting og fordi vi ikke er flyttefolk. Vi afdækker grundigt og sørger for, at underlaget er klar, før vi går i gang.",
  },
  {
    number: "03",
    title: "Udførelse med omhu",
    description: "Vi arbejder systematisk og metodisk. Ingen genveje. Vi bruger de rette materialer og teknikker til netop din opgave og kontrollerer løbende kvaliteten undervejs – ikke kun til sidst.",
  },
  {
    number: "04",
    title: "Aflevering & tryghed",
    description: "Vi er ikke færdige, før du er tilfreds. Vi gennemgår sammen, rydder op og sikrer, at du forstår, hvordan overfladerne skal vedligeholdes. Du får også klar besked om, hvad du kan forvente fremover.",
  },
]

export function Process() {
  return (
    <section id="proces" className="section border-t border-white/10 bg-[#0A0A0A]">
      <div className="max-w-screen-2xl mx-auto px-8 md:px-16">
        
        {/* Header */}
        <div className="max-w-3xl mb-14">
          <span className="text-xs tracking-[3px] text-white/50">VORES PROCES</span>
          <h2 className="text-5xl md:text-6xl tracking-[-2.5px] font-semibold mt-4 leading-none">
            Det er ikke kun resultatet,<br />der tæller.
          </h2>
          <p className="mt-6 text-xl text-white/70">
            Mange kan spartle og male. Det, der adskiller os, er måden vi arbejder på – og den tryghed det giver dig.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-16">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="text-[#C5A36E] text-4xl font-semibold tracking-tighter">
                  {step.number}
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-semibold tracking-tight mb-4">
                  {step.title}
                </h3>
                <p className="text-white/75 leading-relaxed text-[15px]">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom reassurance */}
        <div className="mt-16 pt-10 border-t border-white/10 max-w-2xl">
          <p className="text-lg text-white/70">
            Når du vælger os, vælger du ikke bare en håndværker. Du vælger en proces, der er designet til at give dig ro i maven – både under og efter arbejdet.
          </p>
        </div>

      </div>
    </section>
  )
}
