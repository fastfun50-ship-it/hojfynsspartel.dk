# Sådan bruger du CMS Build Prompt

Denne fil forklarer, hvordan du bruger `CMS_BUILD_PROMPT.md` til at lave et CMS-dashboard på **enhver eksisterende hjemmeside** (uanset tech stack).

## Hvad er CMS Build Prompt?

`CMS_BUILD_PROMPT.md` er en kraftfuld prompt, du kan kopiere ind i en AI (Grok, Claude, ChatGPT, Cursor osv.).

Prompten er designet til at:
- Først **læse og analysere** den eksisterende hjemmesides struktur
- **Ikke antage** at siden har de samme sektioner som denne her (hero, proces, projekter osv.)
- Bygge et skræddersyet CMS-dashboard **ud fra den faktiske side**
- Understøtte både Next.js og **ikke-Next.js** sites

## Trin-for-trin: Sådan bruger du den

1. **Åbn filen** `CMS_BUILD_PROMPT.md`
2. **Kopiér hele indholdet** (fra "You are an expert..." og ned)
3. **Indsæt det** som system prompt eller første besked i din AI
4. **Fortæl AI'en** hvilket projekt den skal arbejde i:
   - "Arbejd i mappen /path/to/mit-nye-projekt"
   - Eller: "Analysér dette projekt og byg et CMS til det"
5. **Lad AI'en starte** med at udforske projektet (den er tvunget til det)

## Vigtige tips

### 1. Lad den udforske først
Prompten indeholder strenge regler om, at AI'en **skal** bruge tools (list_dir, read_file, grep osv.) til at læse siden **før** den skriver kode.

Du kan hjælpe ved at sige:
> "Start med at udforske projektet grundigt og vis mig et content inventory, før du begynder at kode."

### 2. Tilpas til ikke-Next.js sites (vigtigt!)
Hvis siden **ikke** er Next.js, skal du tilføje en ekstra instruktion i slutningen af prompten.

**Eksempler på ekstra instruktioner du kan tilføje:**

```
Target stack is a plain static HTML + CSS + JS site hosted on Netlify. 
Create a completely separate `admin/` folder with vanilla JavaScript. 
Use Supabase for authentication, data storage and file uploads. 
Store all content in JSON files inside a `data/` folder. 
The public site should read the JSON files at runtime (or at build time).
Provide clear instructions for the site owner on how to rebuild and redeploy the static site after making changes in the admin.
```

```
The project is a Vite + React site with an existing Express backend. 
Build the admin as a protected route inside the React app. 
Use the existing Express backend for auth, data and uploads. 
Do not create a separate Next.js admin.
```

```
This is a Laravel project. 
Integrate the CMS into the existing Laravel backend. 
Build the admin UI as a new section in the existing admin area (or as a separate protected Blade + Vue/Inertia view). 
Use Laravel's existing authentication.
```

### 3. Bedste praksis når du bruger prompten

- **Start altid med at bede om et summary** efter udforskning:
  > "Vis mig først et kort summary af sidens struktur og dit forslag til CMS-arkitektur, før du begynder at implementere."

- **Vær specifik** om dine ønsker:
  - "Hold det så simpelt som muligt"
  - "Brug kun lokale JSON-filer + en lille Express server"
  - "Tilføj kun CMS til tekster og billeder, ikke farver"
  - "Ingen brugerdefinerede presets – kun custom color pickers"

- **Hvis du vil have en mindre version**, kan du tilføje:
  > "Byg kun CMS til tekster og billeder. Drop farve-tema, inquiries og advanced features."

### 4. Hvor lægger du CMS'et?

Prompten tilpasser sig automatisk, men her er typiske resultater:

| Site type              | Typisk CMS placering                  | Persistens anbefaling          |
|------------------------|---------------------------------------|--------------------------------|
| Next.js                | `app/admin/` + server actions         | Local JSON (dev) + Vercel Blob / Supabase (prod) |
| Vite + React/Vue       | `src/admin/` eller separat `admin/` mappe | Supabase / PocketBase / lille backend |
| Rent statisk (HTML)    | Separat `admin/` mappe (egen index.html + JS) | Supabase / PocketBase + JSON-filer |
| Laravel / PHP          | Integreret i eksisterende admin       | Laravel DB + fil uploads       |
| WordPress              | Custom plugin eller headless          | WordPress DB eller ACF         |

## Eksempel på fuld prompt-brug (ikke-Next.js)

Du kan kopiere dette som eksempel:

```
[Indsæt hele indholdet fra CMS_BUILD_PROMPT.md her]

Target stack is a plain vanilla HTML + Tailwind + JavaScript site hosted on Vercel.
Create a separate `admin/` folder that is a small self-contained SPA (vanilla JS or minimal framework).
Use Supabase for auth, content storage and image uploads.
Store all editable content in JSON files inside `data/`.
The public site should read the JSON files at runtime (or at build time).
Provide very clear instructions in a README for the non-technical owner on:
- How to run the admin locally
- How to deploy changes
- How to add new content types later
```

## Ofte stillede spørgsmål

**Q: Skal jeg ændre noget i CMS_BUILD_PROMPT.md selv?**  
A: Normalt nej. Du tilføjer bare ekstra instrukser i slutningen når du bruger den.

**Q: Kan jeg bruge den på et helt nyt projekt uden indhold?**  
A: Ja, men den er bedst til **eksisterende** sider, hvor den kan læse den nuværende struktur.

**Q: Hvad hvis AI'en stadig antager Next.js?**  
A: Gentag gerne: "Husk at dette ikke er et Next.js projekt. Tilpas alt til [din stack]."

**Q: Kan jeg have flere versioner af prompten?**  
A: Ja. Du kan f.eks. lave:
- `CMS_BUILD_PROMPT_MINIMAL.md` (kun tekster + billeder)
- `CMS_BUILD_PROMPT_STATIC.md` (til rene statiske sites)

## Næste skridt

1. Prøv at bruge prompten på et lille test-projekt.
2. Kom tilbage og fortæl, hvad der virkede godt / hvad der manglede.
3. Så kan vi forbedre både prompten og denne brugsvejledning.

---

God fornøjelse med at bygge CMS til alle mulige hjemmesider! 

Hvis du har spørgsmål til en specifik side, så send gerne et link eller beskrivelse af tech stacken, så kan jeg hjælpe dig med den perfekte ekstra instruktion.