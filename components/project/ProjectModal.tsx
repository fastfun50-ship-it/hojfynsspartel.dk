'use client'

import { X } from 'lucide-react'
import type { Project } from '@/types/cms'

interface ProjectModalProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
}

export function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  if (!isOpen || !project) return null

  const hasBeforeAfter = (project.beforeImages?.length || 0) > 0 || (project.afterImages?.length || 0) > 0

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal content - lidt mindre end fuld side */}
      <div className="relative w-full max-w-4xl max-h-[90dvh] overflow-auto bg-[var(--background)] border border-white/10 rounded-3xl shadow-2xl">
        
        {/* Header with close button */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[var(--background)]/95 backdrop-blur px-6 py-4">
          <div>
            <div className="flex items-center gap-3 text-sm text-white/50">
              <span>{project.location}</span>
              <span className="h-px w-4 bg-white/30" />
              <span>{project.category}</span>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight pr-8">{project.title}</h2>
          </div>
          
          <button 
            onClick={onClose}
            className="text-white/60 hover:text-white transition p-2 -mr-2"
            aria-label="Luk"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          
          {/* Images */}
          {hasBeforeAfter ? (
            <div className="grid md:grid-cols-2 gap-4">
              {project.beforeImages && project.beforeImages.length > 0 && (
                <div>
                  <div className="text-xs tracking-[2px] text-white/40 mb-2">FØR</div>
                  <div className="space-y-3">
                    {project.beforeImages.map((img, i) => (
                      <div key={i} className="relative aspect-[16/10] bg-[var(--surface)] rounded-2xl overflow-hidden border border-white/10">
                        <img src={img} alt={`Før ${i + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {project.afterImages && project.afterImages.length > 0 && (
                <div>
                  <div className="text-xs tracking-[2px] text-white/40 mb-2">EFTER</div>
                  <div className="space-y-3">
                    {project.afterImages.map((img, i) => (
                      <div key={i} className="relative aspect-[16/10] bg-[var(--surface)] rounded-2xl overflow-hidden border border-white/10">
                        <img src={img} alt={`Efter ${i + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Fallback
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(project as any).images?.slice(0, 4).map((img: string, i: number) => (
                <div key={i} className="relative aspect-[16/10] bg-[var(--surface)] rounded-2xl overflow-hidden border border-white/10">
                  <img src={img} alt={`Billede ${i + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* Details */}
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

        {/* Footer note */}
        <div className="border-t border-white/10 px-6 py-4 text-xs text-white/50">
          Luk vinduet med X'et eller klik udenfor.
        </div>

      </div>
    </div>
  )
}
