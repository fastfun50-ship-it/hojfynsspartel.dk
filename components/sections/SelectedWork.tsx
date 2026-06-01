'use client'

type Project = {
  id: number
  title: string
  location: string
  category: string
  challenge: string
  approach: string
  result: string
  images: string[]
}

const projects: Project[] = [
  {
    id: 1,
    title: "Stort erhvervsbyggeri",
    location: "Fyn",
    category: "Erhverv",
    challenge: "Der skulle spartles store flader i en aktiv byggeplads med stramme tidsplaner og høje krav til ensartethed.",
    approach: "Vi lagde en klar plan for etaper, daglig oprydning og tæt dialog med de andre håndværkere på pladsen for at undgå forsinkelser.",
    result: "Fladerne blev leveret til tiden og med en ensartet finish, som maleren kunne arbejde videre med uden ekstra forberedelse.",
    images: [
      "/images/projects/commercial/commercial-hall-plastering-01.jpg",
      "/images/projects/commercial/commercial-hall-plastering-02.jpg",
      "/images/projects/commercial/commercial-hall-plastering-03.jpg",
    ],
  },
  {
    id: 2,
    title: "Før og efter – privat bolig",
    location: "Fyn",
    category: "Renovering",
    challenge: "De eksisterende vægge var ujævne med gamle lag spartelmasse og tapet. Kunden ville have helt glatte overflader uden at skulle starte forfra.",
    approach: "Vi gennemgik væggene grundigt, fjernede det nødvendige og byggede nye, plane overflader op med flere lag og mellemslibninger.",
    result: "Væggene blev helt glatte og ensartede. Kunden kunne efterfølgende male selv uden at skulle bruge tid på yderligere forberedelse.",
    images: [
      "/images/projects/before-after/before-01.jpg",
      "/images/projects/before-after/after-01.jpg",
    ],
  },
]

export function SelectedWork() {
  return (
    <section id="arbejde" className="section border-t border-white/10 bg-[#0A0A0A]">
      <div className="max-w-screen-2xl mx-auto px-8 md:px-16">
        
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <span className="text-xs tracking-[3px] text-white/50">UDVALGT ARBEJDE</span>
          <h2 className="text-5xl md:text-6xl tracking-[-2.5px] font-semibold mt-4 leading-none">
            Ikke mængde.<br />Kvalitet og gennemsigtighed.
          </h2>
          <p className="mt-6 text-xl text-white/70">
            Vi viser ikke alt, vi laver. Her er nogle af de opgaver, der bedst viser, hvordan vi arbejder, og hvad du kan forvente.
          </p>
        </div>

        {/* Projects */}
        <div className="space-y-20">
          {projects.map((project) => (
            <div key={project.id} className="grid md:grid-cols-12 gap-x-12 gap-y-8 items-start">
              
              {/* Images */}
              <div className="md:col-span-7">
                <div className="grid grid-cols-1 gap-3">
                  {project.images.map((img, index) => (
                    <div 
                      key={index} 
                      className="relative aspect-[16/10] bg-zinc-900 rounded-3xl overflow-hidden border border-white/10"
                    >
                      <img 
                        src={img} 
                        alt={`${project.title} - billede ${index + 1}`}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Text content */}
              <div className="md:col-span-5 pt-2">
                <div className="flex items-center gap-3 text-sm text-white/50 mb-3">
                  <span>{project.location}</span>
                  <span className="h-px w-6 bg-white/30" />
                  <span>{project.category}</span>
                </div>

                <h3 className="text-3xl font-semibold tracking-tight mb-6">
                  {project.title}
                </h3>

                <div className="space-y-6 text-[15px] leading-relaxed text-white/80">
                  <div>
                    <div className="text-[#C5A36E] text-sm tracking-wider mb-1.5">UDFORDRINGEN</div>
                    <p>{project.challenge}</p>
                  </div>

                  <div>
                    <div className="text-[#C5A36E] text-sm tracking-wider mb-1.5">SÅDAN GREB VI DET AN</div>
                    <p>{project.approach}</p>
                  </div>

                  <div>
                    <div className="text-[#C5A36E] text-sm tracking-wider mb-1.5">RESULTATET</div>
                    <p>{project.result}</p>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-16 pt-10 border-t border-white/10 max-w-2xl">
          <p className="text-white/70">
            Dette er kun et udvalg. Når vi har flere billeder klar, udvider vi sektionen med flere projekter og flere detaljer.
          </p>
          <a 
            href="#kontakt" 
            className="inline-block mt-5 text-sm font-medium text-[#C5A36E] hover:underline"
          >
            Kontakt os om dit projekt →
          </a>
        </div>

      </div>
    </section>
  )
}
