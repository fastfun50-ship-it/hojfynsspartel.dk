import { Navbar } from '@/components/layout/Navbar'
import { Hero } from '@/components/sections/Hero'
import { SelectedWork } from '@/components/sections/SelectedWork'
import { Process } from '@/components/sections/Process'
import { About } from '@/components/sections/About'
import { Contact } from '@/components/sections/Contact'
import { getProjects, getProcessSteps, getSiteContent } from '@/lib/cms'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [allProjects, steps, content] = await Promise.all([
    getProjects(),
    getProcessSteps(),
    getSiteContent(),
  ])

  // Kun de projekter markeret som featuredOnHome (max 2) på forsiden – resten via "Se mere" popup (global in layout)
  const featuredProjects = allProjects.filter(p => p.featuredOnHome).slice(0, 2)

  return (
    <main>
      <Navbar content={content} />
      <Hero content={content} />
      <SelectedWork 
        projects={featuredProjects} 
        showFullListLink={true}
      />
      <Process steps={steps} />
      <About content={content} />
      <Contact content={content} />
    </main>
  )
}

