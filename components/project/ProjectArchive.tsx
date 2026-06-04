'use client'

import { useState } from 'react'
import type { Project } from '@/types/cms'
import { ProjectModal } from './ProjectModal'

interface ProjectArchiveProps {
  projects: Project[]
}

export function ProjectArchive({ projects }: ProjectArchiveProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  if (!projects || projects.length === 0) {
    return (
      <div className="max-w-screen-2xl mx-auto px-8 md:px-16 py-12 text-white/60">
        Ingen projekter at vise endnu.
      </div>
    )
  }

  return (
    <>
      <div className="max-w-screen-2xl mx-auto px-8 md:px-16 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            // Brug første efter-billede som hovedbillede, ellers første før, ellers fallback
            const mainImage = 
              (project.afterImages && project.afterImages[0]) || 
              (project.beforeImages && project.beforeImages[0]) ||
              (project as any).images?.[0] ||
              '/images/projects/commercial/commercial-hall-plastering-01.jpg'

            const hasBeforeAfter = (project.beforeImages?.length || 0) > 0 && (project.afterImages?.length || 0) > 0

            return (
              <div 
                key={project.id} 
                className="card group rounded-3xl overflow-hidden flex flex-col"
              >
                <div className="relative aspect-[16/10] bg-[var(--surface)]">
                  <img 
                    src={mainImage} 
                    alt={project.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-[1.02]"
                  />
                  
                  {hasBeforeAfter && (
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="text-[10px] bg-black/70 text-white px-2 py-0.5 rounded">FØR + EFTER</span>
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-xs text-white/50 mb-1">
                    <span>{project.location}</span>
                    <span>•</span>
                    <span>{project.category}</span>
                  </div>

                  <h3 className="text-xl font-semibold tracking-tight mb-2 line-clamp-2">
                    {project.title}
                  </h3>

                  <p className="text-sm text-white/70 line-clamp-3 flex-1">
                    {project.challenge}
                  </p>

                  <button
                    onClick={() => setSelectedProject(project)}
                    className="mt-4 inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-sm font-medium hover:bg-white/5 transition-colors"
                  >
                    Se mere
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <ProjectModal 
        project={selectedProject} 
        isOpen={!!selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />
    </>
  )
}
