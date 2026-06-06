# Højfynsspartel.dk — CMS

Professionel spartling & maling på Fyn. Hjemmeside + fuldt CMS så Michael selv kan styre alt indhold, projekter, billeder og se henvendelser.

## Sådan kører du lokalt

1. Clone repoet
2. `npm install`
3. Kopiér `.env.example` → `.env.local` og sæt en stærk `ADMIN_PASSWORD`
4. `npm run dev`
5. Åbn http://localhost:3000

**CMS login:** Gå til http://localhost:3000/admin og brug adgangskoden fra `.env.local`

## CMS – Michael kan selv styre

- **/admin** — Beskyttet med adgangskode (JWT cookie)
  - Rediger hero tekst, om os, virksomhedsoplysninger, kontakt, SEO
  - Tilføj / rediger / slet projekter (med challenge/approach/resultat)
  - Upload billeder direkte (gemmes via Vercel Blob i prod, local /uploads i dev)
  - Rediger proces trin
  - Se og marker alle indkomne henvendelser (gemmes automatisk når nogen bruger kontaktformularen)

Alt er **live** med det samme takket være server actions + revalidate.

### Billeder & uploads
- I prod: kræver `BLOB_READ_WRITE_TOKEN` (opret Blob store i Vercel Dashboard → Storage)
- Lokalt: billeder gemmes i `public/uploads/` og virker med det samme

## Miljøvariabler (Vercel + local)

Se `.env.example`. Vigtigste for CMS:
- `ADMIN_PASSWORD` (påkrævet)
- `BLOB_READ_WRITE_TOKEN` (til billeder + persistent indhold i prod)

Kontaktformularen bruger fortsat:
- `RESEND_API_KEY`
- `CONTACT_FROM` / `CONTACT_TO` (med punycode for højfynsspartel.dk)

## Produktion / Deploy

Siden deployes på Vercel. Custom domain peger allerede (A + CNAME).

Når du pusher til main → auto deploy.

For at aktivere fuld CMS i prod:
1. Tilføj Blob store i Vercel (Storage)
2. Sæt `ADMIN_PASSWORD` i Vercel envs (Production + Preview)
3. (Valgfrit) Tilføj `BLOB_READ_WRITE_TOKEN` via Storage integrationen

Efter deploy: test /admin på det rigtige domæne.

## Data

- Indledende indhold ligger i `data/*.json` (commit'et)
- I prod med Blob: ændringer overskriver i Blob storage (persistent på tværs af deploys)
- Uden Blob token: kun local `data/` filer (god til udvikling)

## Struktur (vigtig)

- `lib/cms.ts` — load/save af indhold (blob eller fs fallback)
- `lib/cms-actions.ts` — alle server actions (beskyttet)
- `lib/auth.ts` + `proxy.ts` — simpel password + JWT auth
- `components/admin/AdminDashboard.tsx` — hele CMS UI'et
- `app/admin/*` — login + beskyttet dashboard
- Offentlige komponenter importerer nu data fra CMS i stedet for hardkodet

## Kvalitet & polish

Siden følger højfynsspartel.dk standarden:
- Generøs padding på mobil (`px-8 md:px-16`)
- Premium mørk/guld tema
- Video hero + detaljerede case studies
- Kontaktformular med Resend (logs også til CMS)
- Mobile-first, ingen clipping af lange ord

## Nyttige kommandoer

```bash
npm run dev
npm run build   # skal være grøn før push
npm run lint
```

## Sikkerhed (vigtigt!)

Det nuværende CMS bruger en **meget simpel password-baseret login** (intet brugernavn, ingen 2FA).

**Aktuelle risici:**
- Ingen rate limiting på login (kan brute-forces)
- Enkelt delt password for alle
- Hvis passwordet er svagt eller det samme som JWT secret → nemt at hacke
- Ingen logning af mislykkede login-forsøg

**Hvad vi har gjort for at gøre det bedre:**
- Rate limiting på login-API (max 6 forsøg pr. IP pr. 5 minutter)
- Generiske fejlmeddelelser (afslører ikke om password var forkert)
- httpOnly + secure cookies
- JWT signing med separat secret (hvis sat). Login virker stadig, selv hvis ADMIN_JWT_SECRET mangler (falder tilbage til passwordet), men giver sikkerhedsadvarsler i logs.

**Anbefalinger til Michael:**
1. Brug et **meget stærkt, tilfældigt password** (20+ tegn). Generer det f.eks. med 1Password eller Bitwarden.
2. Sæt **både** `ADMIN_PASSWORD` og `ADMIN_JWT_SECRET` til to **helt forskellige** lange random strings i Vercel.
3. Skift password med jævne mellemrum.
4. For rigtig sikkerhed på sigt: overvej at opgradere til NextAuth / Auth.js med magic links eller en rigtig bruger-database.

**Aldrig** commit passwords eller sæt dem i kode.

## Kontakt / support

Hvis Michael har brug for hjælp til at logge ind eller uploade billeder: ring eller skriv.

Godt arbejde!
