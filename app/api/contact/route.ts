import { Resend } from 'resend'
import { NextResponse } from 'next/server'

/**
 * Contact form email handler using Resend.
 *
 * CRITICAL SETUP (do this once):
 * 1. Go to https://resend.com/domains and add + verify "højfynsspartel.dk"
 *    (or use a subdomain like "mail.højfynsspartel.dk" for isolation).
 * 2. Add the DKIM + SPF records at your DNS provider.
 * 3. Wait for "Verified" status.
 *
 * Only AFTER domain verification can you send from info@højfynsspartel.dk to any recipient.
 *
 * Environment variables (set in .env.local locally + in Vercel dashboard):
 *   RESEND_API_KEY         (required)
 *   CONTACT_FROM           (optional, defaults to onboarding only while unverified)
 *   CONTACT_TO             (optional, defaults to the value below)
 *
 * See .env.example for recommended values.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.CONTACT_FROM || 'onboarding@resend.dev'
const TO_EMAIL = process.env.CONTACT_TO 
  ? process.env.CONTACT_TO 
  : (() => { 
      console.warn('[contact] CONTACT_TO not set in env – using test fallback fastfun50@gmail.com. Set it in Vercel for production!'); 
      return 'fastfun50@gmail.com'; 
    })();

export async function POST(request: Request) {
  if (!RESEND_API_KEY) {
    console.error('[contact] Missing RESEND_API_KEY environment variable.')
    return NextResponse.json(
      {
        success: false,
        error: 'Der er en midlertidig teknisk fejl. Prøv venligst igen senere eller ring til os.',
      },
      { status: 500 }
    )
  }

  const resend = new Resend(RESEND_API_KEY)

  try {
    const body = await request.json()

    const navn = (body.navn || '').toString().trim()
    const telefon = (body.telefon || '').toString().trim()
    const email = (body.email || '').toString().trim()
    const beskrivelse = (body.beskrivelse || '').toString().trim()
    const starttidspunkt = body.starttidspunkt ? body.starttidspunkt.toString().trim() : undefined

    if (!navn || !telefon || !email || !beskrivelse) {
      return NextResponse.json(
        { success: false, error: 'Udfyld venligst alle påkrævede felter.' },
        { status: 400 }
      )
    }

    // Basic length / sanity limits (prevent abuse)
    if (beskrivelse.length > 5000) {
      return NextResponse.json(
        { success: false, error: 'Din beskrivelse er for lang. Maks 5000 tegn.' },
        { status: 400 }
      )
    }

    console.log(`[contact] Using FROM=${FROM_EMAIL} TO=${TO_EMAIL} (from env or fallback)`)

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      subject: `Ny henvendelse fra ${navn}`,
      replyTo: email,
      html: `
        <h2>Ny henvendelse fra højfynsspartel.dk</h2>
        <p><strong>Navn:</strong> ${navn}</p>
        <p><strong>Telefon:</strong> ${telefon}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${starttidspunkt ? `<p><strong>Ønsket starttidspunkt:</strong> ${starttidspunkt}</p>` : ''}
        <p><strong>Beskrivelse af opgaven:</strong></p>
        <p>${beskrivelse.replace(/\n/g, '<br>')}</p>
        <hr />
        <p style="color:#666;font-size:12px;">Sendt via kontaktformularen på højfynsspartel.dk</p>
      `,
    })

    if (error) {
      // Log the REAL error server-side only (visible in Vercel Function Logs or `npm run dev`)
      console.error('[contact] Resend send failed:', {
        name: (error as any)?.name,
        message: (error as any)?.message,
        code: (error as any)?.code,
        statusCode: (error as any)?.statusCode,
      })

      // Never expose internal Resend details to the visitor
      return NextResponse.json(
        {
          success: false,
          error: 'Der opstod en fejl ved afsendelse af beskeden. Prøv venligst igen, eller ring til os på 21 63 17 93.',
        },
        { status: 500 }
      )
    }

    console.log('[contact] Email sent successfully. Resend id:', data?.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[contact] Unexpected error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Der opstod en uventet teknisk fejl. Prøv venligst igen eller kontakt os direkte.',
      },
      { status: 500 }
    )
  }
}
