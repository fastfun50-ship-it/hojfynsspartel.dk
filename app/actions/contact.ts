'use server'

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface ContactFormData {
  navn: string
  telefon: string
  email: string
  beskrivelse: string
  starttidspunkt?: string
}

export async function sendContactEmail(formData: ContactFormData) {
  const { navn, telefon, email, beskrivelse, starttidspunkt } = formData

  try {
    const { data, error } = await resend.emails.send({
      from: 'Højfynsspartel <onboarding@resend.dev>', // Du kan ændre dette senere til et verificeret domæne
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
      return { success: false, error: 'Der opstod en fejl ved afsendelse af beskeden.' }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Der opstod en uventet fejl. Prøv venligst igen.' }
  }
}
