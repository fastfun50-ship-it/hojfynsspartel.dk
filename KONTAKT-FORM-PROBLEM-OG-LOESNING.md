# Kontaktformular - Problemstilling og Løsning

## Problemstilling
Kontaktformularen på hjemmesiden (Next.js + Resend) havde flere problemer med at sende emails:

1. **Emails sendte ikke overhovedet** (500 fejl i API, generic "Der opstod en fejl ved afsendelse af beskeden").
   - RESEND_API_KEY var kun sat for Production, ikke for Preview i Vercel.
   - Nye deploys (f.eks. git-main previews) fejlede.

2. **Emails landede kun i test-inbox (fastfun50@gmail.com)** i stedet for den rigtige info@højfynsspartel.dk.
   - Koden havde fallback: TO_EMAIL = process.env.CONTACT_TO || 'fastfun50@gmail.com'.
   - Brugt som test-mode mens domænet ikke var verificeret.

3. **Resend valideringsfejl når rigtig inbox blev forsøgt**:
   - "Invalid 'from' field. The email address contains non-ASCII characters."
   - "Invalid rom field. The email address is not verified."
   - Årsag: Non-ASCII tegn (ø, å) i email-adresser (højfynsspartel.dk). Resend kræver ASCII (Punycode) i adresse-delen af FROM/TO.
   - Plus: Domænet var ikke verificeret i Resend, så kun tilladt at sende til egen konto-email med onboarding@resend.dev.

4. **Client-side JS fejl efter successful submit**:
   - "Cannot read properties of null (reading 'reset')"
   - Form ref (e.currentTarget) blev tilgået efter async fetch (React synthetic event pooling frigiver eventet).

5. **Andre udfordringer**:
   - Sensitive env vars i Vercel viser ikke værdi ved edit (skal re-indtastes).
   - Custom domain pegede ofte på gammel production-deploy.
   - Mange deploys under debugging.
   - Behov for redeploy efter env-var ændringer.

## Løsning
- **Vercel Environment Variables** (Production + Preview):
  - RESEND_API_KEY: Din rigtige key.
  - CONTACT_FROM: "Højfynsspartel <info@xn--hjfynsspartel-bnb.dk>" (Punycode i adresse-delen + unicode i display name).
  - CONTACT_TO: "info@xn--hjfynsspartel-bnb.dk" (Punycode).

- **Punycode for domænet**:
  - højfynsspartel.dk → xn--hjfynsspartel-bnb.dk.
  - Brug dette i email-adresser for at undgå non-ASCII fejl.
  - Beregn selv: 
node -e "console.log(require('punycode').toASCII('højfynsspartel.dk'))"

- **Domain verification i Resend** (nødvendigt for at sende fra eget domæne uden begrænsninger):
  - Gå til https://resend.com/domains.
  - Add Domain (anbefal subdomæne mail.højfynsspartel.dk for isolation).
  - Tilføj DNS records (DKIM TXT + SPF opdatering).
  - Vent på "Verified".
  - Derefter kan FROM bruges med verificeret domæne.

- **Kode-ændringer** (i pp/api/contact/route.ts og components/sections/Contact.tsx):
  - Capture form ref **synkront** før async: const form = e.currentTarget; ... form.reset();.
  - Debug logs: [contact] Using FROM=... TO=... og detaljeret error logging + HINT for restriction.
  - Fjernede hardcoded test-fallback til fastfun50 (nu strict required fra env).
  - Early error hvis manglende vars.
  - Bedre error messages og HINTs i logs for Resend begrænsninger.

- **Vercel praksis**:
  - Sensitive vars: Value-feltet er blank ved edit – re-indtast altid fuld værdi.
  - Copy-paste virker som regel, men re-type hvis UI problemer.
  - Efter env-var ændring: Altid Redeploy den nyeste deployment.
  - Test på specifik deployment URL (via "Visit" på deployen, f.eks. git-main preview), ikke kun custom domain.
  - Custom domain opdateres når en production-deploy med korrekte vars er aktiv (promote hvis nødvendigt).
  - Tjek altid **Runtime Logs** på den specifikke deployment for debug logs og fejl.

- **Oprydning**:
  - Fjernede midlertidige debug-logs og test-fallback fra kode (nu stabil produktion).
  - Gitignored temp debug-filer (f.eks. *-FORM-FIX*.md).
  - Mange gamle deploys kan ignoreres; brug de nyeste.

## Sådan sætter du det op (fremtidig reference)
1. I Vercel (Environment Variables):
   - Tilføj/rediger CONTACT_FROM og CONTACT_TO som beskrevet ovenfor (Punycode).
   - Husk Production + Preview.
   - Re-enter værdier i edit (sensitive).

2. Redeploy nyeste commit.

3. Verificer domæne i Resend (se ovenfor).

4. Test:
   - Brug Visit på nyeste deployment.
   - Send formular.
   - Tjek Runtime Logs for "Using FROM= TO=info@xn--...".
   - Tjek inbox for info@højfynsspartel.dk.

5. Hvis custom domain stadig gammel: Promote nyeste deployment til Production.

Se også .env.example for fuld eksempel og .env setup.

Dette fikser både sending, korrekt modtager, ingen non-ASCII fejl og stabil UX.

## Flytning af domæne (højfynsspartel.dk) til Vercel / denne side

**Spørgsmål: Domænet ligger på Simply.com – er det en god idé at flytte hele DNS-styringen (nameservers) over på Vercel?**

**Svar: Nej – behold DNS på Simply.com og peg kun websitet (A + CNAME).**  
Det er den sikreste løsning når I har email (info@højfynsspartel.dk) hos Simply.

**Hvorfor ikke flytte hele domænet til Vercel?**
- Email-modtagelse styres af MX-records på Simply.
- Ved nameserver-skift skal I kopiere **alle** records (MX, SPF, DKIM, TXT, osv.) perfekt over til Vercel.
- Én fejl = email stopper med at virke for kunderne.
- For en lille håndværksvirksomhed er det unødvendig risiko.

**Den rigtige måde (anbefalet):**
- Tilføj domænet i Vercel (så siden "bor" på Vercel).
- Opdater **kun** A-record (apex) og CNAME (www) hos Simply.com til de værdier Vercel viser.
- Lad MX, alle TXT og alt andet være præcis som det er.

Dette flytter hjemmesiden til https://højfynsspartel.dk uden at røre email overhovedet.

---

**Svar på det oprindelige spørgsmål: Ja, I skal flytte/pointere domænet til denne Vercel-side for at få den rigtige branded URL live (i stedet for hojfnysspartel-dk.vercel.app).**

Dette gør siden tilgængelig på https://højfynsspartel.dk (og www hvis ønsket).

**Hvad der allerede er forberedt i repoet:**
- `vercel.json` med www → non-www redirect
- `app/sitemap.ts` og `app/robots.ts` (SEO klar til det rigtige domæne)
- `metadataBase`, OG image og alle interne links bruger allerede højfynsspartel.dk
- Kontaktformular + Resend er stabil med punycode

Alt er additive og ændrer ikke på den fungerende formular.

**Vigtigt før du starter:**
- **Email må ikke brydes!** Domænet har sandsynligvis MX-records til Simply.com eller anden email-udbyder (info@højfynsspartel.dk). 
  - **Rør ALDRIG MX, SPF, DKIM for email** når du ændrer A/CNAME.
  - Hvis du ændrer nameservers, skal du kopiere ALLE eksisterende records (MX, TXT, etc.).
- Anbefaling: Behold nuværende DNS-udbyder (registrar). Opdater kun A og CNAME records. Skift IKKE nameservers.
- For Resend (emails fra formularen): Du skal verificere domænet separat (se nedenfor) for at kunne sende fra info@højfynsspartel.dk uden restriktioner.
- Test altid på en Vercel preview URL først (f.eks. hojfnysspartel-dk-git-main-....vercel.app) før du peger det rigtige domæne.

### Trin-for-trin: Tilføj domæne i Vercel og opdater DNS

1. **I Vercel Dashboard** (https://vercel.com):
   - Gå til dit projekt "hojfnysspartel-dk".
   - Klik **Settings** (øverst) > **Domains** (i venstre menu).
   - Tilføj domænerne **en ad gangen** (eller brug "paste multiple domains, one per line" i tilføj-vinduet hvis du vil gøre begge på én gang):
     - Brug de korrekte navne (med ø og å):
       - `højfynsspartel.dk`
       - `www.højfynsspartel.dk`
     - I "Add Domains"-vinduet: Fjern fluebenet i "Redirect apex domains to www (recommended)" hvis du vil have primær adresse uden www (anbefalet – passer til din metadataBase og vercel.json som redirecter www → non-www).
   - Når begge er tilføjet uden røde fejl, viser Vercel præcise DNS-instruktioner (A-record og CNAME) for hver.
     - Typisk:
       - For apex (@ eller højfynsspartel.dk): A record til 76.76.21.21 (Vercels IP).
       - For www: CNAME til cname.vercel-dns.com (eller dit projekts .vercel.app target).
   - Notér de præcise værdier Vercel giver (de kan være projektspecifikke).

2. **Hos din nuværende domæne-registrar / DNS-udbyder** (det sted hvor du administrerer DNS for højfynsspartel.dk – sandsynligvis hvor email/MX er sat op, f.eks. Simply.com eller anden):
   - Log ind på DNS management / DNS records.
   - Tilføj de records Vercel viste:
     - A record: Host @ (eller tomt/ apex), Type A, Value 76.76.21.21 (TTL lav, f.eks. 300 sekunder for hurtig test).
     - CNAME record: Host www, Type CNAME, Value den Vercel angiver (f.eks. cname.vercel-dns.com).
   - **Lad alle andre records være uændrede** (MX for email, TXT for SPF/DKIM/verificering, etc.).
   - Slet ikke gamle records.

   **Vigtigt hvis du bruger "Forward / Viderestilling / Redirect" hos Simply:**
   - Tilføj de nye A + CNAME records først.
   - Sluk eller slet den gamle forward/viderestilling for både højfynsspartel.dk og www.højfynsspartel.dk (i samme omgang eller lige efter).
   - Hvis du slukker forwarden **før** de nye records er sat og propagated, vil domænet vise fejl eller parked side for besøgende indtil DNS er opdateret.

3. **Vent på propagation**:
   - DNS ændringer kan tage 5 minutter til 48 timer (ofte <1 time).
   - Tjek med tools som https://www.whatsmydns.net/ eller 
slookup højfynsspartel.dk.
   - Vercel checker automatisk og provisionerer SSL (Let's Encrypt) når DNS er korrekt – det kan tage op til 24 timer, men ofte hurtigere.

4. **Konfigurer redirects (anbefalet)**:
   - I Vercel: Project > Settings > Domains > find dit domæne > konfigurer redirect (f.eks. www -> non-www eller omvendt).
   - Eller tilføj vercel.json i projektet for mere kontrol (se nedenfor).

5. **For Resend email-sending (vigtigt for kontaktformularen)**:
   - Gå til https://resend.com/domains.
   - Tilføj/verifier "højfynsspartel.dk" (eller subdomæne mail.højfynsspartel.dk – anbefalet).
   - Tilføj de TXT records Resend giver til din DNS-udbyder (samme sted som A/CNAME).
   - Vent på Verified.
   - Dette tillader dig at sende fra info@højfynsspartel.dk (eller anden på domænet) uden at skulle bruge onboarding@resend.dev.
   - Opdater derefter Vercel env vars:
     - CONTACT_FROM: "Højfynsspartel <info@xn--hjfynsspartel-bnb.dk>" (eller med verificeret subdomæne).
     - CONTACT_TO: info@xn--hjfynsspartel-bnb.dk
   - Redeploy.

6. **Opdater Vercel custom domain**:
   - Når DNS peger korrekt, går Vercel automatisk i gang med SSL.
   - Gå til Domains i Vercel og bekræft at det er "Valid Configuration".
   - Hvis custom-domænet stadig peger på gammel version: I Deployments, find nyeste production-deploy og "Promote to Production" eller brug "Assign Domain" i domain settings.

### Anbefalet: Tilføj vercel.json for bedre kontrol (valgfrit men godt)
Projektet har nu en `vercel.json` i roden med redirect fra www til non-www (siden `metadataBase` bruger https://højfynsspartel.dk uden www). Den sørger for at www.højfynsspartel.dk automatisk sender folk til den primære adresse.

Du kan også konfigurere redirects direkte i Vercel UI under Domains for det enkelte domæne hvis du vil have mere fleksibilitet.

Push og deploy.

### Test efter ændring
- Besøg https://højfynsspartel.dk og https://www.højfynsspartel.dk
- Test kontaktformularen – tjek at emails lander i den rigtige indbakke (info@).
- Tjek SSL (grøn lås).
- Opdater Google Search Console, Analytics, etc. med det nye domæne (tilføj property, verificer via HTML tag eller DNS, submit sitemap).
- Overvåg logs i Vercel for eventuelle problemer.
- Hvis email brydes: Gå tilbage til gamle DNS records (A/CNAME) – MX var ikke rørt.

### Potentielle faldgruber
- **Email tabt**: Hvis du ændrer nameservers, kopier MX-records først. Bedre at opdatere kun A/CNAME.
- **Propagation**: Brug https://dnschecker.org eller lign. til at tjekke globalt.
- **Resend**: Uden domain verification kan du ikke bruge fra-adresse på domænet – kun test til din egen email.
- **www vs non-www**: Vælg en primary (metadataBase er uden www). Redirect den anden.
- **Gamle deploys**: Custom domain følger ofte "production" deployment. Sørg for at den nyeste main er promoted til production.
- **IDN domæne**: DNS bruger punycode internt (xn--...), men registrar viser unicode.

### Næste skridt efter domæne peger
- Verificer fuldt i Resend for emails.
- Fjern gamle Vercel preview deploys hvis ønsket (men behold for backup).
- Test alt: formular, links, SEO, mobil.
- Overvåg Vercel logs og uptime.

Hvis du støder på specifikke DNS-records fra Vercel eller Resend, del dem her, så kan jeg hjælpe med præcis opsætning.

Dette burde få siden live på det rigtige domæne uden at bryde email. Held og lykke – sig til hvis du har brug for hjælp til specifikke records eller vercel.json!