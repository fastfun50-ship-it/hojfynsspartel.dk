import type { ProcessStep } from '@/types/cms'

interface ProcessProps {
  steps: ProcessStep[]
}

export function Process({ steps }: ProcessProps) {
  const displaySteps = steps && steps.length > 0 ? steps : []

  return (
    <section id="proces" className="section border-t border-white/10 bg-[var(--background)]">
      <div className="max-w-screen-2xl mx-auto px-8 md:px-16">
        
        {/* Header */}
        <div className="max-w-3xl mb-14">
          <span className="text-xs tracking-[3px] text-[var(--text-muted)]">VORES PROCES</span>
          <h2 className="text-5xl md:text-6xl tracking-[-2.5px] font-semibold mt-4 leading-none">
            Det er ikke kun resultatet,<br />der tæller.
          </h2>
          <p className="mt-6 text-xl text-[var(--text-muted)]">
            Mange kan spartle og male. Det, der adskiller os, er måden vi arbejder på – og den tryghed det giver dig.
          </p>
        </div>

        {/* Steps */}
        {displaySteps.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-16">
            {displaySteps.map((step, index) => (
              <div key={index} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="text-[var(--gold)] text-4xl font-semibold tracking-tighter">
                    {step.number}
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold tracking-tight mb-4">
                    {step.title}
                  </h3>
                  <p className="text-[var(--text-muted)] leading-relaxed text-[15px]">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[var(--text-muted)]">Ingen proces trin konfigureret endnu.</p>
        )}

        {/* Bottom reassurance */}
        <div className="mt-16 pt-10 border-t border-white/10 max-w-2xl">
          <p className="text-lg text-[var(--text-muted)]">
            Når du vælger os, vælger du ikke bare en håndværker. Du vælger en proces, der er designet til at give dig ro i maven – både under og efter arbejdet.
          </p>
        </div>

      </div>
    </section>
  )
}

