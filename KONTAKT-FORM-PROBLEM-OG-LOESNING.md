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
ode -e "console.log(require('punycode').toASCII('højfynsspartel.dk'))".

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