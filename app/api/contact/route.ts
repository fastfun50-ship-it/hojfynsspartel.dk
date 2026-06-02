import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { navn, telefon, email, beskrivelse, starttidspunkt } = body

    if (!navn || !telefon || !email || !beskrivelse) {
      return NextResponse.json(
        { success: false, error: 'Udfyld venligst alle påkrævede felter.' },
        { status: 400 }
      )
    }

    const { data, error } = await resend.emails.send({
      from: 'Højfynsspartel <onboarding@resend.dev>',
      to: ['info@højfynsspartel.dk'],
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
      console.error('Resend error:', error)
      return NextResponse.json(
        { success: false, error: 'Der opstod en fejl ved afsendelse af beskeden.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Der opstod en uventet fejl. Prøv venligst igen.' },
      { status: 500 }
    )
  }
}
