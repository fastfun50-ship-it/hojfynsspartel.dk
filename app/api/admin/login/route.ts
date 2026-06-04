import { NextResponse } from 'next/server'
import { login } from '@/lib/auth'

// Simple in-memory rate limiter (resets on server restart / new instance)
// For production with real traffic: use Vercel KV / Upstash / Redis instead.
const attempts = new Map<string, { count: number; firstAttempt: number }>()

const MAX_ATTEMPTS = 6
const WINDOW_MS = 5 * 60 * 1000 // 5 minutes

function getClientIp(request: Request): string {
  // Try common headers (works on Vercel and most proxies)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return 'unknown'
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = attempts.get(ip)

  if (!entry) return false

  // Reset window if expired
  if (now - entry.firstAttempt > WINDOW_MS) {
    attempts.delete(ip)
    return false
  }

  return entry.count >= MAX_ATTEMPTS
}

function recordFailedAttempt(ip: string) {
  const now = Date.now()
  const entry = attempts.get(ip)

  if (!entry || now - entry.firstAttempt > WINDOW_MS) {
    attempts.set(ip, { count: 1, firstAttempt: now })
  } else {
    entry.count++
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(request)

  if (isRateLimited(ip)) {
    // Generic message to not help attackers
    return NextResponse.json(
      { success: false, error: 'For mange forsøg. Prøv igen om et par minutter.' },
      { status: 429 }
    )
  }

  try {
    const { password } = await request.json()

    const result = await login(password || '')

    if (result.success) {
      // Clear attempts on successful login
      attempts.delete(ip)
      return NextResponse.json({ success: true })
    }

    // Record failed attempt
    recordFailedAttempt(ip)

    // Always return generic error (do not reveal if password was wrong vs rate limited in a way that helps)
    return NextResponse.json(
      { success: false, error: 'Forkert adgangskode' },
      { status: 401 }
    )
  } catch (e) {
    return NextResponse.json(
      { success: false, error: 'Uventet fejl' },
      { status: 500 }
    )
  }
}
