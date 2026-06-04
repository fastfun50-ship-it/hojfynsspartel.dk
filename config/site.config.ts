import type { SiteConfig } from '@/types/config';

// NOTE: Most content (text, projects, hero, about, process) is now managed in the CMS
// via data/*.json + Vercel Blob in production. This file is kept for design tokens
// (colors, typography, animation) and legacy references. Prefer getSiteContent() from @/lib/cms.

export const siteConfig: SiteConfig = {
  // Virksomhedsinfo
  company: {
    name: "Højfynsspartel",
    fullName: "Højfynsspartel & Maling",
    owner: "Michael Iversen",
    founded: 2009,
    tagline: "Professionel spartling & maling på Fyn",
    description: "Erfaren bygningsmaler med fokus på høj kvalitet, ærlighed og godt håndværk.",
    cvr: "41620730",
  },

  // Kontakt
  contact: {
    phone: "21 63 17 93",
    email: "info@højfynsspartel.dk",
    address: "Vissenbjerg, Fyn",
    area: "Hele Fyn samt opgaver på Sjælland og i Jylland efter aftale.",
  },

  // Farvepalette
  colors: {
    primary: "#0A0A0A",      // Mørk baggrund
    secondary: "#1F1F1F",    // Lidt lysere grå
    accent: "#C5A36E",       // Guld / premium farve (matches current theme)
    accentHover: "#D4B47F",
    text: {
      primary: "#FFFFFF",
      secondary: "#E5E5E5",
      muted: "#A3A3A3",
    },
  },

  // Typografi
  typography: {
    fontHeading: "var(--font-playfair)",   // Playfair for headings
    fontBody: "var(--font-inter)",
    sizes: {
      h1: "clamp(2.5rem, 5vw, 4rem)",
      h2: "clamp(2rem, 4vw, 3rem)",
      h3: "clamp(1.5rem, 3vw, 2.25rem)",
    },
  },

  // Animationer & oplevelse
  animation: {
    duration: {
      fast: 0.4,
      medium: 0.7,
      slow: 1.1,
    },
    easing: "power3.out",
    scrollTrigger: {
      start: "top 85%",
      toggleActions: "play none none reverse",
    },
  },

  // SEO & Metadata
  metadata: {
    title: "Højfynsspartel | Professionel Spartling & Maling på Fyn",
    description: "Michael Iversen – erfaren bygningsmaler siden 2009. Specialiseret i spartling, pudsning og kvalitetsmaling på hele Fyn.",
    keywords: ["spartling", "maler", "Fyn", "Odense", "bygningsmaler", "facademaling", "Vissenbjerg"],
    ogImage: "/hero-poster.jpg",
  },

  // Projekt indstillinger
  settings: {
    enableHorizontalScroll: true,
    enableLenis: true,
    enableGSAP: true,
    mobileFirst: true,
    premiumFeel: true,
  },
} as const;
