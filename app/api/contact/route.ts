import { Resend } from 'resend'
import { NextResponse } from 'next/server'

// IMPORTANT: For the contact form emails to work to arbitrary recipients (info@højfynsspartel.dk etc),
// you MUST verify a domain in the Resend dashboard: https://resend.com/domains
//
// Steps:
// 1. Sign up / log in at resend.com
// 2. Go to Domains → Add Domain (use højfynsspartel.dk or e.g. mail.højfynsspartel.dk for isolation)
// 3. Copy the DNS records shown (usually 2x DKIM CNAME + update your SPF TXT to include Resend)
// 4. Add the records at your DNS provider (the one hosting your domain)
// 5. Wait for "Verified" status (usually 1-10 mins, sometimes longer)
// 6. Then you can send from addresses on that domain to anyone.
//
// Until the domain is verified, you can only send TEST emails using from: onboarding@resend.dev
// and ONLY TO the email address you signed up to Resend with.
//
// After verification, change the from below if desired (info@ is fine if you own the mailbox).

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.error('[contact] RESEND_API_KEY is missing. Set it in .env.local (local) or in your hosting platform env vars.')
    return NextResponse.json(
      { success: false, error: 'Der opstod en konfigurationsfejl. Kontakt os venligst på telefon.' },
      { status: 500 }
    )
  }

  const resend = new Resend(apiKey)

  try {
    const body = await request.json()
    const { navn, telefon, email, beskrivelse, starttidspunkt } = body

    if (!navn || !telefon || !email || !beskrivelse) {
      return NextResponse.json(
        { success: false, error: 'Udfyld venligst alle påkrævede felter.' },
        { status: 400 }
      )
    }

    // === TEMP DIAGNOSTIC MODE (for testing while domain is not verified) ===
    // Using onboarding@resend.dev + sending only to the Resend account owner's email (fastfun50@gmail.com)
    // allows us to test if the API key itself works.
    // Once we confirm emails arrive, the permanent fix is to verify the domain at https://resend.com/domains
    // and switch back to from: 'Højfynsspartel <info@højfynsspartel.dk>' (or your sending address).
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: ['fastfun50@gmail.com'],   // TEMP: must be the email associated with your Resend account for test mode
      subject: `Ny henvendelse fra ${navn}`,
      replyTo: email,
      html: `
        <h2>Ny henvendelse fra hjemmesiden</h2>
        <p><strong>Navn:</strong> ${navn}</p>
        <p><strong>Telefon:</strong> ${telefon}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${starttidspunkt ? `<p><strong>Ønsket starttidspunkt:</strong> ${starttidspunkt}</p>` : ''}
        <p><strong>Beskrivelse af opgaven:</strong></p>
        <p>${beskrivelse.replace(/\n/g, '<br>')}</p>
      `,
    })

    if (error) {
      // Full error is logged server-side (Vercel Function Logs, or terminal during `npm run dev`).
      // Check the logs there to see the exact Resend error (e.g. invalid_from_address, missing permissions, etc).
      console.error('[contact] Resend send failed. Full error object:', error)
      // Safe debug info for browser devtools (works even if error object is special)
      const debugInfo = {
        name: (error as any)?.name || 'unknown',
        message: (error as any)?.message || String(error),
        // Some Resend errors have more fields
        code: (error as any)?.code,
        statusCode: (error as any)?.statusCode,
      }
      console.error('[contact] Resend error summary for debug:', debugInfo)

      return NextResponse.json(
        {
          success: false,
          error: 'Der opstod en fejl ved afsendelse af beskeden.',
          debug: debugInfo
        },
        { status: 500 }
      )
    }

    console.log('[contact] Email sent successfully. Resend id:', data?.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[contact] Unexpected error in contact route:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Der opstod en uventet fejl. Prøv venligst igen.',
        debug: { message: error instanceof Error ? error.message : String(error) }
      },
      { status: 500 }
    )
  }
}
