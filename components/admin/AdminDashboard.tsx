'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  updateSiteContent,
  createProject,
  updateProject,
  deleteProject,
  reorderProjects,
  updateProcessSteps,
  markAsRead,
  removeInquiry,
  uploadImage,
} from '@/lib/cms-actions'
import type { Project, ProcessStep, SiteContent, Inquiry } from '@/types/cms'
import { DEFAULT_COLORS } from '@/types/cms'
import { Plus, Trash2, Save, Upload, Eye, Check, X } from 'lucide-react'

interface Props {
  initialProjects: Project[]
  initialSteps: ProcessStep[]
  initialContent: SiteContent
  initialInquiries: Inquiry[]
}

export function AdminDashboard({ initialProjects, initialSteps, initialContent, initialInquiries }: Props) {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [steps, setSteps] = useState<ProcessStep[]>(initialSteps)
  const [content, setContent] = useState<SiteContent>(initialContent)
  const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries)

  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'theme' | 'projects' | 'process' | 'inquiries'>('overview')
  const [isPending, startTransition] = useTransition()
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [uploading, setUploading] = useState(false)

  // ===== SITE CONTENT SAVE =====
  async function saveContent(partial: Partial<SiteContent>) {
    startTransition(async () => {
      const res = await updateSiteContent(partial)
      if (res.success) {
        setContent((c) => ({ ...c, ...partial }))
        toast.success('Indhold gemt — live på hjemmesiden')
      } else {
        toast.error('Kunne ikke gemme')
      }
    })
  }

  // ===== PROJECTS =====
  async function handleCreateProject() {
    const newP: Omit<Project, 'id' | 'order'> = {
      title: 'Nyt projekt',
      location: 'Fyn',
      category: 'Renovering',
      challenge: 'Beskriv udfordringen her...',
      approach: 'Sådan greb vi det an...',
      result: 'Resultatet blev...',
      beforeImages: [],
      afterImages: [],
      featuredOnHome: false,
    }
    startTransition(async () => {
      const created = await createProject(newP)
      setProjects((p) => [...p, created])
      setEditingProject(created)
      toast.success('Nyt projekt oprettet')
    })
  }

  async function handleSaveProject(proj: Project) {
    startTransition(async () => {
      await updateProject(proj.id, {
        title: proj.title,
        location: proj.location,
        category: proj.category,
        challenge: proj.challenge,
        approach: proj.approach,
        result: proj.result,
        beforeImages: proj.beforeImages || [],
        afterImages: proj.afterImages || [],
        featuredOnHome: proj.featuredOnHome || false,
      })
      setProjects((prev) => prev.map((p) => (p.id === proj.id ? proj : p)))
      setEditingProject(null)
      toast.success('Projekt gemt')
    })
  }

  async function handleDeleteProject(id: number) {
    if (!confirm('Slet dette projekt permanent?')) return
    startTransition(async () => {
      await deleteProject(id)
      setProjects((p) => p.filter((x) => x.id !== id))
      if (editingProject?.id === id) setEditingProject(null)
      toast.success('Projekt slettet')
    })
  }

  async function handleAddImageToProject(projId: number, file: File, target: 'before' | 'after') {
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const { url } = await uploadImage(fd)
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projId) return p
          if (target === 'before') {
            return { ...p, beforeImages: [...(p.beforeImages || []), url] }
          } else {
            return { ...p, afterImages: [...(p.afterImages || []), url] }
          }
        })
      )
      if (editingProject && editingProject.id === projId) {
        if (target === 'before') {
          setEditingProject({ ...editingProject, beforeImages: [...(editingProject.beforeImages || []), url] })
        } else {
          setEditingProject({ ...editingProject, afterImages: [...(editingProject.afterImages || []), url] })
        }
      }
      toast.success(`Billede uploadet som ${target === 'before' ? 'FØR' : 'EFTER'}`)
    } catch (e: any) {
      toast.error('Upload fejlede: ' + (e.message || ''))
    } finally {
      setUploading(false)
    }
  }

  async function handleRemoveImage(projId: number, imgUrl: string, target: 'before' | 'after') {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projId) return p
        if (target === 'before') {
          return { ...p, beforeImages: (p.beforeImages || []).filter((u) => u !== imgUrl) }
        } else {
          return { ...p, afterImages: (p.afterImages || []).filter((u) => u !== imgUrl) }
        }
      })
    )
    if (editingProject && editingProject.id === projId) {
      if (target === 'before') {
        setEditingProject({
          ...editingProject,
          beforeImages: (editingProject.beforeImages || []).filter((u) => u !== imgUrl),
        })
      } else {
        setEditingProject({
          ...editingProject,
          afterImages: (editingProject.afterImages || []).filter((u) => u !== imgUrl),
        })
      }
    }
  }

  // ===== PROCESS =====
  function updateStep(idx: number, field: keyof ProcessStep, value: string) {
    const copy = [...steps]
    copy[idx] = { ...copy[idx], [field]: value }
    setSteps(copy)
  }

  async function saveProcess() {
    startTransition(async () => {
      await updateProcessSteps(steps)
      toast.success('Proces gemt')
    })
  }

  // ===== INQUIRIES =====
  async function handleMarkRead(id: number) {
    startTransition(async () => {
      await markAsRead(id)
      setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, read: true } : i)))
    })
  }

  async function handleDeleteInquiry(id: number) {
    if (!confirm('Slet denne henvendelse?')) return
    startTransition(async () => {
      await removeInquiry(id)
      setInquiries((prev) => prev.filter((i) => i.id !== id))
    })
  }

  const unreadCount = inquiries.filter((i) => !i.read).length

  const lightenColor = (hex: string, amount: number = 25) => {
    let col = hex.replace('#', '');
    if (col.length === 3) col = col.split('').map(c => c + c).join('');
    const num = parseInt(col, 16);
    let r = Math.min(255, ((num >> 16) & 0xFF) + amount);
    let g = Math.min(255, ((num >> 8) & 0xFF) + amount);
    let b = Math.min(255, (num & 0xFF) + amount);
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4 mb-8">
        {[
          { key: 'overview', label: 'Oversigt' },
          { key: 'content', label: 'Generelt indhold' },
          { key: 'theme', label: 'Farver / Tema' },
          { key: 'projects', label: 'Projekter' },
          { key: 'process', label: 'Proces' },
          { key: 'inquiries', label: `Henvendelser ${unreadCount ? `(${unreadCount})` : ''}` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === t.key
                ? 'bg-[#C5A36E] text-[#0A0A0A]'
                : 'bg-white/5 hover:bg-white/10 text-white/70'
            }`}
          >
            {t.label}
          </button>
        ))}
        <a
          href="/"
          target="_blank"
          className="ml-auto flex items-center gap-1.5 px-4 py-2 text-sm text-[#C5A36E] hover:underline"
        >
          <Eye className="w-4 h-4" /> Se live site
        </a>
      </div>

      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card p-6 rounded-3xl">
            <div className="text-[#C5A36E] text-sm tracking-widest">PROJEKTER</div>
            <div className="text-5xl font-semibold mt-2">{projects.length}</div>
            <button onClick={() => setActiveTab('projects')} className="mt-4 text-sm text-[#C5A36E] hover:underline">Administrer projekter →</button>
          </div>
          <div className="card p-6 rounded-3xl">
            <div className="text-[#C5A36E] text-sm tracking-widest">HENVENDELSER</div>
            <div className="text-5xl font-semibold mt-2">{inquiries.length}</div>
            <div className="text-white/60">{unreadCount} ulæste</div>
            <button onClick={() => setActiveTab('inquiries')} className="mt-4 text-sm text-[#C5A36E] hover:underline">Se alle henvendelser →</button>
          </div>
          <div className="card p-6 rounded-3xl">
            <div className="text-[#C5A36E] text-sm tracking-widest">NÆSTE SKRIDT</div>
            <ul className="mt-3 space-y-2 text-sm text-white/80">
              <li>• Upload nye projektbilleder</li>
              <li>• Opdater tekster i "Om os"</li>
              <li>• Tilføj flere proces trin hvis nødvendigt</li>
              <li>• Tjek indbakken for nye leads</li>
            </ul>
          </div>
        </div>
      )}

      {/* CONTENT - Hero, About, Company, Contact, SEO (farver flyttet til egen fane) */}
      {activeTab === 'content' && (
        <div className="max-w-4xl space-y-10">
          {/* Company & Contact */}
          <section>
            <h2 className="text-xl font-semibold mb-4 tracking-tight">Virksomhed &amp; Kontakt</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Input label="Navn (kort)" value={content.company.name} onChange={(v) => setContent(c => ({...c, company: {...c.company, name: v}}))} />
                <Input label="Fuldt navn" value={content.company.fullName} onChange={(v) => setContent(c => ({...c, company: {...c.company, fullName: v}}))} />
                <Input label="Ejer" value={content.company.owner} onChange={(v) => setContent(c => ({...c, company: {...c.company, owner: v}}))} />
                <Input label="Grundlagt år" type="number" value={String(content.company.founded)} onChange={(v) => setContent(c => ({...c, company: {...c.company, founded: parseInt(v)||2009}}))} />
                <Input label="CVR" value={content.company.cvr} onChange={(v) => setContent(c => ({...c, company: {...c.company, cvr: v}}))} />
              </div>
              <div className="space-y-3">
                <Input label="Telefon" value={content.contact.phone} onChange={(v) => setContent(c => ({...c, contact: {...c.contact, phone: v}}))} />
                <Input label="Email" value={content.contact.email} onChange={(v) => setContent(c => ({...c, contact: {...c.contact, email: v}}))} />
                <Input label="Adresse" value={content.contact.address} onChange={(v) => setContent(c => ({...c, contact: {...c.contact, address: v}}))} />
                <Input label="Dækningsområde" value={content.contact.area} onChange={(v) => setContent(c => ({...c, contact: {...c.contact, area: v}}))} />
              </div>
            </div>
            <button onClick={() => saveContent({ company: content.company, contact: content.contact })} disabled={isPending} className="mt-4 btn btn-primary px-6">Gem virksomhed &amp; kontakt</button>
          </section>

          {/* Hero */}
          <section>
            <h2 className="text-xl font-semibold mb-4 tracking-tight">Hero sektion</h2>
            <p className="text-xs text-white/50 mb-3">De tre første headline-felter styrer den store kunstneriske overskrift (sidste linje vises i guld). Du kan nu også ændre knapperne nedenfor.</p>
            <div className="space-y-3">
              <Input label="Lokation label" value={content.hero.locationLabel} onChange={(v) => setContent(c => ({...c, hero: {...c.hero, locationLabel: v}}))} />
              <Input label="Headline del 1" value={content.hero.headline1} onChange={(v) => setContent(c => ({...c, hero: {...c.hero, headline1: v}}))} />
              <Input label="Headline del 2" value={content.hero.headline2} onChange={(v) => setContent(c => ({...c, hero: {...c.hero, headline2: v}}))} />
              <Input label="Accent (guld) tekst" value={content.hero.headlineAccent} onChange={(v) => setContent(c => ({...c, hero: {...c.hero, headlineAccent: v}}))} />
              <div>
                <label className="text-xs tracking-widest text-white/50 mb-1.5 block">SUBHEADLINE</label>
                <textarea value={content.hero.subheadline} onChange={(e) => setContent(c => ({...c, hero: {...c.hero, subheadline: e.target.value}}))} rows={2} className="w-full bg-[var(--surface)] border border-white/20 rounded-2xl p-4 text-sm" />
              </div>
              <Input label="CTA primær knap (stor guld-knap)" value={content.hero.ctaPrimary} onChange={(v) => setContent(c => ({...c, hero: {...c.hero, ctaPrimary: v}}))} />
              <Input label="CTA sekundær knap (tekst-link)" value={content.hero.ctaSecondary} onChange={(v) => setContent(c => ({...c, hero: {...c.hero, ctaSecondary: v}}))} />
            </div>
            <button onClick={() => saveContent({ hero: content.hero })} disabled={isPending} className="mt-4 btn btn-primary px-6">Gem hero</button>
          </section>

          {/* About */}
          <section>
            <h2 className="text-xl font-semibold mb-4 tracking-tight">Om os</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs tracking-widest text-white/50 mb-1.5 block">OM BILLEDE URL</label>
                <input value={content.about.aboutImage} onChange={(e) => setContent(c => ({...c, about: {...c.about, aboutImage: e.target.value}}))} className="w-full bg-[var(--surface)] border border-white/20 rounded-2xl px-4 py-2 text-sm" />
                <p className="text-[10px] text-white/40 mt-1">Brug eksisterende /images/... eller upload via Projekter og kopiér URL</p>
              </div>
              <Textarea label="Intro 1" value={content.about.intro1} onChange={(v) => setContent(c => ({...c, about: {...c.about, intro1: v}}))} rows={3} />
              <Textarea label="Intro 2" value={content.about.intro2} onChange={(v) => setContent(c => ({...c, about: {...c.about, intro2: v}}))} rows={3} />
              <Textarea label="Intro 3 (om Mikkel)" value={content.about.intro3} onChange={(v) => setContent(c => ({...c, about: {...c.about, intro3: v}}))} rows={3} />
              <Input label="Filosofi overskrift" value={content.about.philosophyTitle} onChange={(v) => setContent(c => ({...c, about: {...c.about, philosophyTitle: v}}))} />
              <Textarea label="Filosofi tekst" value={content.about.philosophyText} onChange={(v) => setContent(c => ({...c, about: {...c.about, philosophyText: v}}))} rows={3} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="Fact: Erfaring" value={content.about.factExperience} onChange={(v) => setContent(c => ({...c, about: {...c.about, factExperience: v}}))} />
                <Input label="Fact: Grundlagt" value={content.about.factFounded} onChange={(v) => setContent(c => ({...c, about: {...c.about, factFounded: v}}))} />
              </div>
            </div>
            <button onClick={() => saveContent({ about: content.about })} disabled={isPending} className="mt-4 btn btn-primary px-6">Gem Om os</button>
          </section>

          {/* SEO */}
          <section>
            <h2 className="text-xl font-semibold mb-4 tracking-tight">SEO &amp; Metadata</h2>
            <div className="space-y-3">
              <Input label="Page title" value={content.metadata.title} onChange={(v) => setContent(c => ({...c, metadata: {...c.metadata, title: v}}))} />
              <Textarea label="Meta description" value={content.metadata.description} onChange={(v) => setContent(c => ({...c, metadata: {...c.metadata, description: v}}))} rows={2} />
              <Input label="OG image path" value={content.metadata.ogImage} onChange={(v) => setContent(c => ({...c, metadata: {...c.metadata, ogImage: v}}))} />
            </div>
            <button onClick={() => saveContent({ metadata: content.metadata })} disabled={isPending} className="mt-4 btn btn-primary px-6">Gem SEO</button>
          </section>

        </div>
      )}

      {/* THEME / FARVER - egen fane */}
      {activeTab === 'theme' && (
        <div 
          className="max-w-3xl"
          style={{
            '--background': content.colors?.background || '#0A0A0A',
            '--surface': content.colors?.surface || '#121212',
            '--surface-2': content.colors?.surface2 || '#1C1C1C',
            '--border': content.colors?.border || '#252525',
            '--text-primary': content.colors?.textPrimary || '#F5F5F5',
            '--text-muted': content.colors?.textMuted || '#A1A1AA',
            '--gold': content.colors?.accent || '#C5A36E',
            '--gold-hover': content.colors?.accentHover || '#D4B47F',
          } as React.CSSProperties}
        >
          <section className="bg-[var(--surface)] text-[var(--text-primary)] rounded-3xl border border-[var(--border)] p-6">
            <h2 className="text-xl font-semibold mb-4 tracking-tight">Farver / Tema</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              Vælg hele farveskemaet (baggrunde, surfaces, tekst og accent). Du ser ændringerne live i forhåndsvisningen nedenfor. Gem for at opdatere den offentlige side.
            </p>

            <div className="mb-4">
              <div className="text-xs tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>FORVALGTE TEMAER (baggrund + accent)</div>
              <div className="flex flex-wrap gap-2">
                {[
                  { 
                    name: 'Klassisk Guld (mørk)', 
                    colors: { ...DEFAULT_COLORS } 
                  },
                  { 
                    name: 'Varm Bronze', 
                    colors: { background: '#0F0C0A', surface: '#1A1612', surface2: '#221D18', border: '#2E2822', textPrimary: '#F5F0E9', textMuted: '#A89B8C', accent: '#8B5E3C', accentHover: '#A67C52' } 
                  },
                  { 
                    name: 'Kølig Kul (mørkere)', 
                    colors: { background: '#050505', surface: '#0F0F0F', surface2: '#161616', border: '#1F1F1F', textPrimary: '#F5F5F5', textMuted: '#A1A1AA', accent: '#9CA3AF', accentHover: '#D1D5DB' } 
                  },
                  { 
                    name: 'Dyb Blå Nat', 
                    colors: { background: '#0A0C10', surface: '#111418', surface2: '#161B21', border: '#1E252E', textPrimary: '#F0F4F8', textMuted: '#9CA3AF', accent: '#3B82F6', accentHover: '#60A5FA' } 
                  },
                  { 
                    name: 'Skov Grøn Mørk', 
                    colors: { background: '#0A0D0A', surface: '#111611', surface2: '#171C17', border: '#1F261F', textPrimary: '#F0F5F0', textMuted: '#A1A8A1', accent: '#10B981', accentHover: '#34D399' } 
                  },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setContent(c => ({...c, colors: preset.colors }))}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${content.colors?.accent === preset.colors.accent && content.colors?.background === preset.colors.background ? 'border-[var(--gold)] bg-white/5' : 'border-white/20 hover:bg-white/5'}`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setContent(c => ({ ...c, colors: { ...DEFAULT_COLORS } }))}
                className="mt-2 text-xs text-white/50 hover:text-white underline"
              >
                Nulstil til standard (Klassisk Guld)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mb-4">
              {/* Baggrundsfarver */}
              <div>
                <label className="text-xs tracking-widest text-white/50 mb-1.5 block">BAGGRUND (main)</label>
                <input
                  type="color"
                  value={content.colors?.background || DEFAULT_COLORS.background}
                  onChange={(e) => setContent(c => ({...c, colors: { ...c.colors, background: e.target.value } }))}
                  className="w-full h-10 rounded border border-white/20 bg-transparent cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs tracking-widest text-white/50 mb-1.5 block">SURFACE (cards, bokse)</label>
                <input
                  type="color"
                  value={content.colors?.surface || DEFAULT_COLORS.surface}
                  onChange={(e) => setContent(c => ({...c, colors: { ...c.colors, surface: e.target.value } }))}
                  className="w-full h-10 rounded border border-white/20 bg-transparent cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs tracking-widest text-white/50 mb-1.5 block">SURFACE 2 (lettere overflader)</label>
                <input
                  type="color"
                  value={content.colors?.surface2 || DEFAULT_COLORS.surface2}
                  onChange={(e) => setContent(c => ({...c, colors: { ...c.colors, surface2: e.target.value } }))}
                  className="w-full h-10 rounded border border-white/20 bg-transparent cursor-pointer"
                />
              </div>

              {/* Tekst */}
              <div>
                <label className="text-xs tracking-widest text-white/50 mb-1.5 block">TEKST PRIMÆR</label>
                <input
                  type="color"
                  value={content.colors?.textPrimary || DEFAULT_COLORS.textPrimary}
                  onChange={(e) => setContent(c => ({...c, colors: { ...c.colors, textPrimary: e.target.value } }))}
                  className="w-full h-10 rounded border border-white/20 bg-transparent cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs tracking-widest text-white/50 mb-1.5 block">TEKST MUTED</label>
                <input
                  type="color"
                  value={content.colors?.textMuted || DEFAULT_COLORS.textMuted}
                  onChange={(e) => setContent(c => ({...c, colors: { ...c.colors, textMuted: e.target.value } }))}
                  className="w-full h-10 rounded border border-white/20 bg-transparent cursor-pointer"
                />
              </div>

              {/* Accent */}
              <div>
                <label className="text-xs tracking-widest text-white/50 mb-1.5 block">ACCENT FARVE (knapper, links)</label>
                <input
                  type="color"
                  value={content.colors?.accent || DEFAULT_COLORS.accent}
                  onChange={(e) => {
                    const accent = e.target.value;
                    const accentHover = lightenColor(accent, 25);
                    setContent(c => ({...c, colors: { ...c.colors, accent, accentHover } }));
                  }}
                  className="w-full h-10 rounded border border-white/20 bg-transparent cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs tracking-widest text-white/50 mb-1.5 block">ACCENT HOVER</label>
                <input
                  type="color"
                  value={content.colors?.accentHover || DEFAULT_COLORS.accentHover}
                  onChange={(e) => setContent(c => ({...c, colors: { ...c.colors, accentHover: e.target.value } }))}
                  className="w-full h-10 rounded border border-white/20 bg-transparent cursor-pointer"
                />
              </div>
            </div>

            {/* LIVE PREVIEW - så man kan se farveændringer i admin */}
            <div className="mt-6">
              <div className="text-xs tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>LIVE FORHÅNDSVISNING (opdateres med det samme)</div>
              <div className="rounded-3xl overflow-hidden border border-white/20 p-1" style={{ background: 'var(--background)' }}>
                <div className="bg-[var(--background)] text-[var(--text-primary)] p-5 rounded-2xl border border-[var(--border)]">
                  <div className="text-[10px] tracking-[2px] mb-1" style={{ color: 'var(--text-muted)' }}>EKSEMPEL PÅ OFFENTLIG SIDE</div>

                  <div className="text-xl font-semibold tracking-tight mb-3">
                    Overskrift med <span style={{ color: 'var(--gold)' }}>accent-farve</span>
                  </div>

                  <div className="bg-[var(--surface)] rounded-2xl p-4 border border-[var(--border)] mb-4 text-[14px]">
                    <div className="text-[10px] tracking-widest mb-1" style={{ color: 'var(--gold)' }}>UDFORDRINGEN</div>
                    <div>Primær tekst på surface.</div>
                    <div className="mt-1 text-[13px]" style={{ color: 'var(--text-muted)' }}>Muted / sekundær tekst.</div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={e => e.preventDefault()} 
                      className="inline-flex items-center justify-center px-5 py-2 rounded-full font-semibold text-sm transition"
                      style={{ background: 'var(--gold)', color: 'var(--background)' }}
                    >
                      Primær knap
                    </button>
                    <button 
                      onClick={e => e.preventDefault()} 
                      className="inline-flex items-center justify-center px-5 py-2 rounded-full font-semibold text-sm border transition"
                      style={{ borderColor: 'rgba(255,255,255,0.25)', color: 'var(--text-primary)' }}
                    >
                      Outline
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-[10px] mt-1.5" style={{ color: 'var(--text-muted)' }}>Forhåndsvisningen viser hvordan baggrund, surfaces, tekst og accent kommer til at se ud på den rigtige side. Selve editor-panelet herover skifter også farve efter dit valg.</p>
            </div>

            <button onClick={() => saveContent({ colors: content.colors })} disabled={isPending} className="mt-6 btn btn-primary px-6">Gem farver</button>
            <p className="text-[10px] text-white/40 mt-2">Gemmer til den offentlige side. Admin-dashboard forbliver altid i det klassiske mørke tema for at være læsbart.</p>
          </section>
        </div>
      )}

      {/* PROJECTS */}
      {activeTab === 'projects' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Udvalgte arbejder / projekter</h2>
              <p className="text-sm text-white/60">Hvert projekt viser Udfordring → Greb an → Resultat + billeder</p>
            </div>
            <button onClick={handleCreateProject} className="btn btn-primary flex items-center gap-2 px-5">
              <Plus className="w-4 h-4" /> Nyt projekt
            </button>
          </div>

          <div className="space-y-4">
            {projects.length === 0 && <p className="text-white/50">Ingen projekter endnu.</p>}
            {projects.map((p) => (
              <div key={p.id} className="card rounded-3xl p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs text-white/50">{p.location} • {p.category}</div>
                    <div className="text-2xl font-semibold tracking-tight mt-1 flex items-center gap-2">
                      {p.title}
                      {p.featuredOnHome && <span className="text-[10px] bg-[#C5A36E] text-black px-1.5 py-0.5 rounded">PÅ FORSIDEN</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingProject(p)} className="px-4 py-1.5 text-sm rounded-full bg-white/5 hover:bg-white/10">Rediger</button>
                    <button onClick={() => handleDeleteProject(p.id)} className="px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 rounded-full"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>

                <div className="mt-2">
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={p.featuredOnHome || false}
                      onChange={async (e) => {
                        const val = e.target.checked;
                        if (val) {
                          const count = projects.filter(pp => pp.featuredOnHome && pp.id !== p.id).length;
                          if (count >= 2) {
                            toast.error("Max 2 projekter kan være valgt til forsiden.");
                            return;
                          }
                        }
                        const updated = { ...p, featuredOnHome: val };
                        await updateProject(p.id, { featuredOnHome: val });
                        setProjects(prev => prev.map(pp => pp.id === p.id ? updated : pp));
                        toast.success(val ? "Tilføjet til forside" : "Fjernet fra forside");
                      }}
                    />
                    <span>Vis på forsiden</span>
                  </label>
                </div>

                <div className="mt-4 text-sm text-white/70 line-clamp-2">{p.challenge}</div>

                {/* images preview - støtter før/efter */}
                {((p.beforeImages?.length || 0) + (p.afterImages?.length || 0) > 0) && (
                  <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                    {(p.beforeImages || []).slice(0, 2).map((img, i) => (
                      <div key={`b-${i}`} className="relative">
                        <img src={img} alt="Før" className="h-16 w-24 object-cover rounded-xl border border-white/10 flex-shrink-0" />
                        <div className="absolute top-0 left-0 bg-black/70 text-[8px] px-1 text-white">FØR</div>
                      </div>
                    ))}
                    {(p.afterImages || []).slice(0, 2).map((img, i) => (
                      <div key={`a-${i}`} className="relative">
                        <img src={img} alt="Efter" className="h-16 w-24 object-cover rounded-xl border border-white/10 flex-shrink-0" />
                        <div className="absolute top-0 left-0 bg-black/70 text-[8px] px-1 text-white">EFTER</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Edit modal */}
          {editingProject && (
            <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
              <div className="bg-[var(--surface)] rounded-3xl max-w-4xl w-full max-h-[92dvh] overflow-auto p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-semibold">Rediger projekt</h3>
                  <button onClick={() => setEditingProject(null)}><X /></button>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input label="Titel" value={editingProject.title} onChange={(v) => setEditingProject({...editingProject, title: v})} />
                    <Input label="Lokation" value={editingProject.location} onChange={(v) => setEditingProject({...editingProject, location: v})} />
                    <Input label="Kategori" value={editingProject.category} onChange={(v) => setEditingProject({...editingProject, category: v})} />
                  </div>

                  <Textarea label="UDFORDRINGEN" value={editingProject.challenge} onChange={(v) => setEditingProject({...editingProject, challenge: v})} rows={4} />
                  <Textarea label="SÅDAN GREB VI DET AN" value={editingProject.approach} onChange={(v) => setEditingProject({...editingProject, approach: v})} rows={4} />
                  <Textarea label="RESULTATET" value={editingProject.result} onChange={(v) => setEditingProject({...editingProject, result: v})} rows={4} />

                  {/* Vælg om på forsiden */}
                  <div className="pt-2 border-t border-white/10">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={editingProject.featuredOnHome || false}
                        onChange={(e) => {
                          const val = e.target.checked;
                          if (val) {
                            const count = projects.filter(pp => pp.featuredOnHome && pp.id !== editingProject.id).length;
                            if (count >= 2) {
                              toast.error("Max 2 projekter kan være valgt til forsiden.");
                              return;
                            }
                          }
                          setEditingProject({...editingProject, featuredOnHome: val});
                        }}
                      />
                      <span>Vis på forsiden (max 2)</span>
                    </label>
                    <p className="text-[10px] text-white/40 mt-1">Kun valgte projekter vises i "Udvalgt arbejde" på forsiden.</p>
                  </div>

                  {/* Før og Efter billeder - eksplicit understøttelse af før/efter uploads */}
                  <div className="space-y-5">
                    {/* FØR billeder */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs tracking-widest text-white/50">BILLEDER FØR ({(editingProject.beforeImages || []).length})</label>
                        <label className="cursor-pointer inline-flex items-center gap-2 text-sm text-[#C5A36E] hover:underline">
                          <Upload className="w-4 h-4" /> Upload FØR billede(r)
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || [])
                              files.forEach(f => handleAddImageToProject(editingProject.id, f, 'before'))
                              e.target.value = ''
                            }}
                          />
                        </label>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 min-h-[70px]">
                        {(editingProject.beforeImages || []).map((url, idx) => (
                          <div key={idx} className="relative group aspect-[16/10] bg-[var(--surface)] rounded-2xl overflow-hidden border border-white/10">
                            <img src={url} alt="Før" className="absolute inset-0 w-full h-full object-cover" />
                            <button
                              onClick={() => handleRemoveImage(editingProject.id, url, 'before')}
                              className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        {(editingProject.beforeImages || []).length === 0 && (
                          <div className="col-span-full text-sm text-white/50 border border-dashed border-white/20 rounded-2xl p-4 text-center">Ingen FØR billeder endnu.</div>
                        )}
                      </div>
                    </div>

                    {/* EFTER billeder */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs tracking-widest text-white/50">BILLEDER EFTER ({(editingProject.afterImages || []).length})</label>
                        <label className="cursor-pointer inline-flex items-center gap-2 text-sm text-[#C5A36E] hover:underline">
                          <Upload className="w-4 h-4" /> Upload EFTER billede(r)
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || [])
                              files.forEach(f => handleAddImageToProject(editingProject.id, f, 'after'))
                              e.target.value = ''
                            }}
                          />
                        </label>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 min-h-[70px]">
                        {(editingProject.afterImages || []).map((url, idx) => (
                          <div key={idx} className="relative group aspect-[16/10] bg-[var(--surface)] rounded-2xl overflow-hidden border border-white/10">
                            <img src={url} alt="Efter" className="absolute inset-0 w-full h-full object-cover" />
                            <button
                              onClick={() => handleRemoveImage(editingProject.id, url, 'after')}
                              className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        {(editingProject.afterImages || []).length === 0 && (
                          <div className="col-span-full text-sm text-white/50 border border-dashed border-white/20 rounded-2xl p-4 text-center">Ingen EFTER billeder endnu. Upload ovenfor.</div>
                        )}
                      </div>
                    </div>
                    <p className="text-[10px] text-white/40 -mt-1">Anbefalet 16:10. Upload flere FØR + EFTER – vises automatisk opdelt med labels på hjemmesiden.</p>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button onClick={() => handleSaveProject(editingProject)} disabled={isPending} className="btn btn-primary flex-1 flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" /> Gem projekt
                  </button>
                  <button onClick={() => setEditingProject(null)} className="px-8 rounded-2xl border border-white/20">Annuller</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PROCESS */}
      {activeTab === 'process' && (
        <div className="max-w-3xl">
          <h2 className="text-xl font-semibold mb-2 tracking-tight">Din proces (4 trin)</h2>
          <p className="text-white/60 mb-6">Rediger teksterne. Rækkefølgen er fast (01-04). Gem når du er færdig.</p>

          <div className="space-y-8">
            {steps.map((step, idx) => (
              <div key={step.id} className="border-l-2 border-[#C5A36E]/60 pl-6">
                <div className="text-[#C5A36E] font-mono text-sm mb-1">{step.number}</div>
                <input
                  value={step.title}
                  onChange={(e) => updateStep(idx, 'title', e.target.value)}
                  className="text-2xl font-semibold tracking-tight bg-transparent border-b border-white/20 focus:border-[#C5A36E] w-full py-1 outline-none"
                />
                <textarea
                  value={step.description}
                  onChange={(e) => updateStep(idx, 'description', e.target.value)}
                  rows={4}
                  className="mt-3 w-full bg-[var(--surface)] border border-white/10 rounded-2xl p-4 text-[15px] leading-relaxed"
                />
              </div>
            ))}
          </div>

          <button onClick={saveProcess} disabled={isPending} className="mt-8 btn btn-primary px-9 flex items-center gap-2">
            <Save className="w-4 h-4" /> Gem proces trin
          </button>
        </div>
      )}

      {/* INQUIRIES */}
      {activeTab === 'inquiries' && (
        <div>
          <h2 className="text-xl font-semibold tracking-tight mb-6">Indkomne henvendelser ({inquiries.length})</h2>

          {inquiries.length === 0 && <p className="text-white/60">Ingen henvendelser endnu.</p>}

          <div className="space-y-4">
            {inquiries.map((inq) => (
              <div key={inq.id} className={`card rounded-3xl p-6 ${inq.read ? 'opacity-70' : 'border-[#C5A36E]/40'}`}>
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">{inq.navn} <span className="text-white/50 text-sm">• {new Date(inq.createdAt).toLocaleDateString('da-DK')}</span></div>
                    <div className="text-sm text-[#C5A36E]">{inq.telefon} • {inq.email}</div>
                  </div>
                  <div className="flex gap-2">
                    {!inq.read && (
                      <button onClick={() => handleMarkRead(inq.id)} className="text-xs px-3 py-1 rounded-full bg-[#C5A36E] text-black flex items-center gap-1"><Check className="w-3 h-3"/> Marker læst</button>
                    )}
                    <button onClick={() => handleDeleteInquiry(inq.id)} className="text-xs px-3 py-1 rounded-full border border-white/20 text-white/70">Slet</button>
                  </div>
                </div>

                {inq.starttidspunkt && <div className="text-sm mt-2 text-white/60">Ønsket start: {inq.starttidspunkt}</div>}
                <div className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed border-t border-white/10 pt-3 text-white/85">{inq.beskrivelse}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-12 text-xs text-white/40 border-t border-white/10 pt-6">
        Tip: Brug rigtige billeder. Når du uploader via projekter, får du en blob-URL der virker live overalt.
      </div>
    </div>
  )
}

/* Small form helpers */
function Input({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-[10px] tracking-[1.5px] text-white/50 mb-1.5">{label.toUpperCase()}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[var(--surface)] border border-white/20 rounded-2xl px-4 py-2.5 text-sm focus:border-[#C5A36E] outline-none"
      />
    </div>
  )
}

function Textarea({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <label className="block text-[10px] tracking-[1.5px] text-white/50 mb-1.5">{label.toUpperCase()}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full bg-[var(--surface)] border border-white/20 rounded-2xl px-4 py-3 text-sm focus:border-[#C5A36E] outline-none resize-y"
      />
    </div>
  )
}
