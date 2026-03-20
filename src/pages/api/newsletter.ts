export const prerender = false

import type { APIRoute } from 'astro'

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()
    const { email, honeypot } = body

    // Honeypot check
    if (honeypot) {
      return new Response(JSON.stringify({ success: true, message: 'Danke!' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, message: 'Bitte gib eine gueltige E-Mail-Adresse ein.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Forward to newsletter service if configured
    const endpoint = import.meta.env.NEWSLETTER_ENDPOINT
    if (endpoint) {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Gold gesichert! Check dein Postfach.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch {
    return new Response(
      JSON.stringify({ success: false, message: 'Etwas ist schiefgelaufen. Versuch es spaeter nochmal.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
