import { Navbar } from '@/components/layout/Navbar'
import { SelectedWork } from '@/components/sections/SelectedWork'
import { Contact } from '@/components/sections/Contact'
import { getProjects, getSiteContent } from '@/lib/cms'

export const dynamic = 'force-dynamic'

export default async function Projekter() {
  const [projects, content] = await Promise.all([
    getProjects(),
    getSiteContent(),
  ])

  return (
    <main>
      <Navbar content={content} />
      
      <div className="pt-20 border-b border-white/10 bg-[var(--background)]">
        <div className="max-w-screen-2xl mx-auto px-8 md:px-16 py-12">
          <span className="text-xs tracking-[3px] text-white/50">ARKIV</span>
          <h1 className="text-5xl md:text-6xl tracking-[-2.5px] font-semibold mt-4 leading-none">
            Tidligere projekter
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-white/70">
            Et overblik over de opgaver vi har løst. Fra små boligrenoveringer til større erhvervsprojekter.
          </p>
        </div>
      </div>

      <SelectedWork 
        projects={projects}
        title="TIDLIGERE PROJEKTER"
        headline="Et udvalg af vores arbejde<br />gennem årene."
        description="Her er alle vores tidligere projekter. Vi viser ikke alt, men her kan du dykke ned i de opgaver vi har løst – fra små renoveringer til store erhvervsopgaver."
        showFullListLink={false}
      />
      
      <Contact content={content} />
    </main>
  )
}
