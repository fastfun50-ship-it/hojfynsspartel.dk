'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { Project } from '@/types/cms'

interface SeMoreModalProps {
  projects: Project[]
}

export function SeMoreModal({ projects }: SeMoreModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const openHandler = () => setIsOpen(true)
    window.addEventListener('open-se-more', openHandler)

    // Also expose global as fallback
    ;(window as any).__openSeMore = openHandler

    return () => {
      window.removeEventListener('open-se-more', openHandler)
      delete (window as any).__openSeMore
    }
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-16 pb-8 px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90" 
        onClick={() => setIsOpen(false)}
      />

      {/* Large popup window */}
      <div className="relative w-full max-w-screen-2xl max-h-[calc(100vh-4rem)] overflow-auto bg-[var(--background)] border border-white/10 rounded-3xl shadow-2xl">
        
        {/* Header with white X */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[var(--background)]/95 backdrop-blur px-8 py-5">
          <div>
            <span className="text-xs tracking-[3px] text-white/50">SE MERE</span>
            <h2 className="text-3xl font-semibold tracking-tight">Tidligere projekter</h2>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-[var(--gold)] transition p-2 -mr-2"
            aria-label="Luk"
          >
            <X className="w-7 h-7" />
          </button>
        </div>

        <div className="p-8 md:p-12 space-y-16">
          {projects.length === 0 ? (
            <p className="text-white/60">Ingen yderligere projekter at vise endnu.</p>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="grid md:grid-cols-12 gap-x-12 gap-y-8 items-start border-b border-white/10 pb-12 last:border-0 last:pb-0">
                
                {/* Images */}
                <div className="md:col-span-7">
                  {(project.beforeImages?.length || project.afterImages?.length) ? (
                    <div className="space-y-4">
                      {project.beforeImages && project.beforeImages.length > 0 && (
                        <div>
                          <div className="text-[10px] tracking-[2px] text-white/40 mb-1.5 pl-1">FØR</div>
                          <div className="grid grid-cols-1 gap-3">
                            {project.beforeImages.map((img, index) => (
                              <div key={`b-${index}`} className="relative aspect-[16/10] bg-[var(--surface)] rounded-3xl overflow-hidden border border-white/10">
                                <img src={img} alt={`${project.title} - før`} className="absolute inset-0 w-full h-full object-cover" />
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
                              <div key={`a-${index}`} className="relative aspect-[16/10] bg-[var(--surface)] rounded-3xl overflow-hidden border border-white/10">
                                <img src={img} alt={`${project.title} - efter`} className="absolute inset-0 w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {(project as any).images?.map((img: string, index: number) => (
                        <div key={index} className="relative aspect-[16/10] bg-[var(--surface)] rounded-3xl overflow-hidden border border-white/10">
                          <img src={img} alt={project.title} className="absolute inset-0 w-full h-full object-cover" />
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
            ))
          )}
        </div>

        <div className="border-t border-white/10 p-8 text-xs text-white/50 text-center">
          Luk vinduet med det hvide kryds i højre hjørne.
        </div>

      </div>
    </div>
  )
}
