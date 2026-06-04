export interface SiteConfig {
  // Virksomhedsinfo
  company: {
    name: string;
    fullName: string;
    owner: string;
    founded: number;
    tagline: string;
    description: string;
    cvr?: string;
  };

  // Kontakt
  contact: {
    phone: string;
    email: string;
    address: string;
    area: string;
  };

  // Farvepalette
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    accentHover: string;
    text: {
      primary: string;
      secondary: string;
      muted: string;
    };
  };

  // Typografi
  typography: {
    fontHeading: string;
    fontBody: string;
    sizes: {
      h1: string;
      h2: string;
      h3: string;
    };
  };

  // Animationer & oplevelse
  animation: {
    duration: {
      fast: number;
      medium: number;
      slow: number;
    };
    easing: string;
    scrollTrigger: {
      start: string;
      toggleActions: string;
    };
  };

  // SEO & Metadata
  metadata: {
    title: string;
    description: string;
    keywords: string[];
    ogImage: string;
  };

  // Projekt indstillinger
  settings: {
    enableHorizontalScroll: boolean;
    enableLenis: boolean;
    enableGSAP: boolean;
    mobileFirst: boolean;
    premiumFeel: boolean;
  };
}
