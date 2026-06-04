import fs from 'fs/promises'
import path from 'path'
import { cache } from 'react'
import type { Project, ProcessStep, Inquiry, SiteContent } from '@/types/cms'
import { CMS_KEYS, DEFAULT_COLORS } from '@/types/cms'

const DATA_DIR = path.join(process.cwd(), 'data')

// In development we ALWAYS use fast local data/ JSON files (no network, no heavy deps).
// In production we use Vercel Blob (if token present) for persistence across deploys.
const isDev = process.env.NODE_ENV === 'development'
const USE_BLOB = !isDev && !!process.env.BLOB_READ_WRITE_TOKEN

// Ensure local data dir (dev)
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
  } catch {}
}

// ---------- Generic load/save via blob or fs ----------
async function loadJson<T>(key: string, fallback: T): Promise<T> {
  if (USE_BLOB) {
    try {
      // Dynamic import so the heavy @vercel/blob package is NEVER loaded in dev
      const { list: blobList } = await import('@vercel/blob')
      const { blobs } = await blobList({ prefix: key, limit: 1 })
      if (blobs.length > 0) {
        const res = await fetch(blobs[0].url, { cache: 'no-store' })
        if (res.ok) {
          return (await res.json()) as T
        }
      }
    } catch (e) {
      console.error('[cms] blob load failed for', key, e)
    }
  }

  // Fallback to local fs (dev or no blob token) — fast and offline
  try {
    const filePath = path.join(DATA_DIR, path.basename(key))
    const raw = await fs.readFile(filePath, 'utf8')
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

async function saveJson<T>(key: string, data: T): Promise<void> {
  const json = JSON.stringify(data, null, 2)

  if (USE_BLOB) {
    try {
      const { put: blobPut } = await import('@vercel/blob')
      await blobPut(key, json, {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false, // stable path
      })
      return
    } catch (e) {
      console.error('[cms] blob save failed for', key, e)
      // fall through to fs as last resort
    }
  }

  // fs fallback
  await ensureDataDir()
  const filePath = path.join(DATA_DIR, path.basename(key))
  await fs.writeFile(filePath, json, 'utf8')
}

// ---------- Public API (cached per request for speed) ----------
export const getProjects = cache(async (): Promise<Project[]> => {
  const data = await loadJson<Project[]>(CMS_KEYS.projects, [])
  // ensure order
  return [...data].sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
})

export async function saveProjects(projects: Project[]): Promise<void> {
  // normalize order
  const normalized = projects.map((p, i) => ({ ...p, order: i + 1 }))
  await saveJson(CMS_KEYS.projects, normalized)
}

export const getProcessSteps = cache(async (): Promise<ProcessStep[]> => {
  const data = await loadJson<ProcessStep[]>(CMS_KEYS.process, [])
  return [...data].sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
})

export async function saveProcessSteps(steps: ProcessStep[]): Promise<void> {
  const normalized = steps.map((s, i) => ({ ...s, order: i + 1 }))
  await saveJson(CMS_KEYS.process, normalized)
}

export const getInquiries = cache(async (): Promise<Inquiry[]> => {
  const data = await loadJson<Inquiry[]>(CMS_KEYS.inquiries, [])
  return data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

export async function saveInquiries(inquiries: Inquiry[]): Promise<void> {
  await saveJson(CMS_KEYS.inquiries, inquiries)
}

export async function addInquiry(inq: Omit<Inquiry, 'id' | 'createdAt' | 'read'>): Promise<Inquiry> {
  const all = await getInquiries()
  const newInq: Inquiry = {
    ...inq,
    id: (all[0]?.id ?? 0) + 1,
    createdAt: new Date().toISOString(),
    read: false,
  }
  await saveInquiries([newInq, ...all])
  return newInq
}

export async function markInquiryRead(id: number): Promise<void> {
  const all = await getInquiries()
  const updated = all.map((i) => (i.id === id ? { ...i, read: true } : i))
  await saveInquiries(updated)
}

export async function deleteInquiry(id: number): Promise<void> {
  const all = await getInquiries()
  await saveInquiries(all.filter((i) => i.id !== id))
}

export const getSiteContent = cache(async (): Promise<SiteContent> => {
  const fallback: SiteContent = {
    company: {
      name: 'Højfynsspartel',
      fullName: 'Højfynsspartel & Maling',
      owner: 'Michael Iversen',
      founded: 2009,
      tagline: 'Professionel spartling & maling på Fyn',
      description: 'Erfaren bygningsmaler med fokus på høj kvalitet, ærlighed og godt håndværk.',
      cvr: '41620730',
    },
    contact: {
      phone: '21 63 17 93',
      email: 'info@højfynsspartel.dk',
      address: 'Vissenbjerg, Fyn',
      area: 'Hele Fyn samt opgaver på Sjælland og i Jylland efter aftale.',
    },
    metadata: {
      title: 'Højfynsspartel | Professionel Spartling & Maling på Fyn',
      description: 'Michael Iversen – erfaren bygningsmaler siden 2009. Specialiseret i spartling, pudsning og kvalitetsmaling på hele Fyn.',
      keywords: ['spartling', 'maler', 'Fyn', 'Odense', 'bygningsmaler', 'facademaling', 'Vissenbjerg'],
      ogImage: '/hero-poster.jpg',
    },
    hero: {
      locationLabel: 'VISSENBJERG • FYN',
      headline1: 'Vi laver ikke',
      headline2: 'vægge.',
      headlineAccent: 'Vi laver ro.',
      subheadline: '15 års erfaring. Intet kompromis.\nKun det arbejde vi selv ville være stolte af.',
      ctaPrimary: 'Få et tilbud',
      ctaSecondary: 'Se udvalgte arbejder',
    },
    about: {
      ownerName: 'Michael Iversen',
      intro1: 'Jeg hedder Michael Iversen. Jeg er uddannet bygningsmaler siden 2009 og har arbejdet med spartling, maling og overfladebehandling i mere end 15 år.',
      intro2: 'I 2020 startede jeg Højfynsspartel i Vissenbjerg. Jeg valgte at starte for mig selv, fordi jeg ville have frihed til at gøre tingene ordentligt – uden at skulle skynde mig eller gå på kompromis med kvaliteten.',
      intro3: 'Jeg arbejder tæt sammen med Mikkel, som er særligt dygtig til malerarbejde og beskæring i frihånd. Sammen dækker vi hele processen – fra den grundige forberedelse til den fine finish og de dekorative detaljer.',
      philosophyTitle: 'Kvalitet er ikke noget, man siger. Det er noget, man gør.',
      philosophyText: 'Det betyder, at vi bruger den tid, der skal til. At vi forbereder ordentligt. At vi er ærlige om, hvad en opgave kræver. Og at vi ikke forlader et projekt, før det er færdigt på den måde, vi selv ville acceptere det.',
      factExperience: '15+ år som bygningsmaler',
      factFounded: '2020 i Vissenbjerg',
      aboutImage: '/images/projects/commercial/commercial-hall-plastering-01.jpg',
      ctaText: 'Kontakt os om din opgave →',
    },
    colors: { ...DEFAULT_COLORS },
  }

  const loaded = await loadJson<SiteContent | null>(CMS_KEYS.siteContent, null)
  if (loaded) {
    return {
      ...fallback,
      ...loaded,
      colors: { ...fallback.colors, ...loaded.colors },
    }
  }
  return fallback
})

export async function saveSiteContent(content: SiteContent): Promise<void> {
  await saveJson(CMS_KEYS.siteContent, content)
}

// Helper to get next project id
export async function getNextProjectId(): Promise<number> {
  const projects = await getProjects()
  return projects.length > 0 ? Math.max(...projects.map((p) => p.id)) + 1 : 1
}
