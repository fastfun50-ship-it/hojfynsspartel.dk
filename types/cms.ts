export interface Project {
  id: number
  title: string
  location: string
  category: string
  challenge: string
  approach: string
  result: string
  // Support for "før og efter" billeder + generelle billeder
  beforeImages: string[]   // Før billeder
  afterImages: string[]    // Efter billeder (eller generelle billeder hvis ikke før/efter projekt)
  order?: number
  featuredOnHome?: boolean  // Vælg om dette projekt skal vises på forsiden (max 2)
}

export interface ProcessStep {
  id: number
  number: string
  title: string
  description: string
  order?: number
}

export interface Inquiry {
  id: number
  navn: string
  telefon: string
  email: string
  beskrivelse: string
  starttidspunkt?: string
  createdAt: string // iso
  read: boolean
}

export interface HeroContent {
  locationLabel: string
  headline1: string
  headline2: string
  headlineAccent: string
  subheadline: string
  ctaPrimary: string
  ctaSecondary: string
}

export interface AboutContent {
  ownerName: string
  intro1: string
  intro2: string
  intro3: string
  philosophyTitle: string
  philosophyText: string
  factExperience: string
  factFounded: string
  aboutImage: string // url
  ctaText: string
}

export interface SiteMeta {
  title: string
  description: string
  keywords: string[]
  ogImage: string
}

export interface CompanyInfo {
  name: string
  fullName: string
  owner: string
  founded: number
  tagline: string
  description: string
  cvr: string
}

export interface ContactInfo {
  phone: string
  email: string
  address: string
  area: string
}

export interface SiteContent {
  company: CompanyInfo
  contact: ContactInfo
  metadata: SiteMeta
  hero: HeroContent
  about: AboutContent
  colors: {
    // Backgrounds
    background: string;      // main bg e.g. #0A0A0A
    surface: string;         // cards etc. e.g. #121212
    surface2?: string;       // lighter surfaces
    border?: string;
    // Text
    textPrimary?: string;
    textMuted?: string;
    // Accent (gold etc)
    accent: string;
    accentHover: string;
  }
}

export const DEFAULT_COLORS: SiteContent['colors'] = {
  background: '#0A0A0A',
  surface: '#121212',
  surface2: '#1C1C1C',
  border: '#252525',
  textPrimary: '#F5F5F5',
  textMuted: '#A1A1AA',
  accent: '#C5A36E',
  accentHover: '#D4B47F',
} as const

// For local dev / blob storage keys
export const CMS_KEYS = {
  projects: 'cms/projects.json',
  process: 'cms/process.json',
  inquiries: 'cms/inquiries.json',
  siteContent: 'cms/site-content.json',
} as const
