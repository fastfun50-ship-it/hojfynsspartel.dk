import type { Project } from '@/types/cms'

interface SelectedWorkProps {
  projects: Project[]
  title?: string
  headline?: string
  description?: string
  showFullListLink?: boolean
}

export function SelectedWork({ 
  projects, 
  title = "UDVALGT ARBEJDE",
  headline = "Ikke mængde.<br />Kvalitet og gennemsigtighed.",
  description = "Vi viser ikke alt, vi laver. Her er nogle af de opgaver, der bedst viser, hvordan vi arbejder, og hvad du kan forvente.",
  showFullListLink = true 
}: SelectedWorkProps) {
  if (!projects || projects.length === 0) {
    return (
      <section id="arbejde" className="section border-t border-white/10 bg-[var(--background)]">
        <div className="max-w-screen-2xl mx-auto px-8 md:px-16 text-white/60">
          Ingen projekter at vise endnu.
        </div>
      </section>
    )
  }

  return (
    <section id="arbejde" className="section border-t border-white/10 bg-[var(--background)]">
      <div className="max-w-screen-2xl mx-auto px-8 md:px-16">
        
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <span className="text-xs tracking-[3px] text-white/50">{title}</span>
          <h2 className="text-5xl md:text-6xl tracking-[-2.5px] font-semibold mt-4 leading-none" dangerouslySetInnerHTML={{ __html: headline }} />
          <p className="mt-6 text-xl text-white/70">
            {description}
          </p>
        </div>

        {/* Projects */}
        <div className="space-y-20">
          {projects.map((project) => (
            <div key={project.id} className="grid md:grid-cols-12 gap-x-12 gap-y-8 items-start">
              
              {/* Images - understøtter før/efter med labels. For klassiske før/efter projekter vises de side om side. */}
              <div className="md:col-span-7">
                {(project.beforeImages?.length || project.afterImages?.length) ? (
                  (project.beforeImages?.length && project.afterImages?.length) ? (
                    // Side-by-side for før/efter sammenligning
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <div className="text-[10px] tracking-[2px] text-white/40 mb-1.5 pl-1">FØR</div>
                        <div className="space-y-2">
                          {project.beforeImages.map((img, index) => (
                            <div key={`before-${index}`} className="relative aspect-[16/10] bg-[var(--surface)] rounded-3xl overflow-hidden border border-white/10">
                              <img src={img} alt={`${project.title} - før ${index + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] tracking-[2px] text-white/40 mb-1.5 pl-1">EFTER</div>
                        <div className="space-y-2">
                          {project.afterImages.map((img, index) => (
                            <div key={`after-${index}`} className="relative aspect-[16/10] bg-[var(--surface)] rounded-3xl overflow-hidden border border-white/10">
                              <img src={img} alt={`${project.title} - efter ${index + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Stacked hvis kun før eller kun efter
                    <div className="space-y-4">
                      {project.beforeImages && project.beforeImages.length > 0 && (
                        <div>
                          <div className="text-[10px] tracking-[2px] text-white/40 mb-1.5 pl-1">FØR</div>
                          <div className="grid grid-cols-1 gap-3">
                            {project.beforeImages.map((img, index) => (
                              <div key={`before-${index}`} className="relative aspect-[16/10] bg-[var(--surface)] rounded-3xl overflow-hidden border border-white/10">
                                <img src={img} alt={`${project.title} - før ${index + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {project.afterImages && project.afterImages.length > 0 && (
                        <div>
                          <div className="text-[10px] tracking-[2px] text-white/40 mb-1.5 pl-1">EFTER</div>
                          <div className="grid grid-cols-1 gap-3">
                            {project.afterImages.map((img, index) => (
                              <div key={`after-${index}`} className="relative aspect-[16/10] bg-[var(--surface)] rounded-3xl overflow-hidden border border-white/10">
                                <img src={img} alt={`${project.title} - efter ${index + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  // Fallback for gamle projekter
                  <div className="grid grid-cols-1 gap-3">
                    {(project as any).images?.map((img: string, index: number) => (
                      <div key={index} className="relative aspect-[16/10] bg-[var(--surface)] rounded-3xl overflow-hidden border border-white/10">
                        <img src={img} alt={`${project.title} - billede ${index + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
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
                    <div className="text-[var(--gold)] text-sm tracking-wider mb-1.5">UDFORDRINGEN</div>
                    <p>{project.challenge}</p>
                  </div>

                  <div>
                    <div className="text-[var(--gold)] text-sm tracking-wider mb-1.5">SÅDAN GREB VI DET AN</div>
                    <p>{project.approach}</p>
                  </div>

                  <div>
                    <div className="text-[var(--gold)] text-sm tracking-wider mb-1.5">RESULTATET</div>
                    <p>{project.result}</p>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Bottom note */}
        {showFullListLink && (
          <div className="mt-16 pt-10 border-t border-white/10 max-w-2xl">
            <p className="text-white/70">
              Dette er kun et udvalg. Brug "Se mere" i menuen ovenfor for at se flere projekter.
            </p>
          </div>
        )}

      </div>
    </section>
  )
}

