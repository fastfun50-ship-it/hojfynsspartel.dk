import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/**
 * SECURITY NOTES:
 * - ADMIN_PASSWORD is the only authentication mechanism. Use a LONG, RANDOM, UNIQUE password.
 * - ADMIN_JWT_SECRET should be a completely different long random string (not the same as the password).
 *   If not set, it falls back to the password (less secure).
 * - For production: Always set BOTH as strong secrets in Vercel Environment Variables.
 *
 * IMPORTANT (login safety):
 * We do NOT crash the app if ADMIN_JWT_SECRET is missing or equals the password.
 * This is intentional, so we don't accidentally lock the real admin (Michael) out.
 * Instead we log clear warnings (visible in Vercel logs and dev terminal).
 *
 * NOTE: A strong, unique ADMIN_PASSWORD has been configured for this project
 * (set via .env.local locally and in Vercel environment variables in production).
 * The fallback below is only for first-time setup and will be rejected in production.
 */
const PLACEHOLDER_PASSWORD = 'changeme-strong-password-here'

// Read the password from env (this is the real source of truth)
const envPassword = process.env.ADMIN_PASSWORD

// Strong guard: Never allow the placeholder (or missing value) in production
if (!envPassword || envPassword === PLACEHOLDER_PASSWORD) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'CRITICAL SECURITY ERROR: ADMIN_PASSWORD must be set to a strong unique password in production! ' +
      'Set it in Vercel → Settings → Environment Variables (Production + Preview).'
    )
  }
  // In development: allow running but warn loudly
  console.warn(
    '\n⚠️  ADMIN PASSWORD WARNING: Using placeholder or no ADMIN_PASSWORD.\n' +
    '   For real use, copy .env.example → .env.local and set a strong password (20+ chars).\n'
  )
}

const ADMIN_PASSWORD = envPassword || PLACEHOLDER_PASSWORD

// === JWT SECRET HANDLING (non-breaking for login) ===
// We deliberately do NOT throw here, so we don't accidentally lock the real admin out.
// Instead we warn loudly in logs if it's missing or the same as the password.
const envJwtSecret = process.env.ADMIN_JWT_SECRET

if (!envJwtSecret) {
  if (process.env.NODE_ENV === 'production') {
    console.error(
      '\n⚠️  SECURITY WARNING (ADMIN_JWT_SECRET):\n' +
      '   ADMIN_JWT_SECRET is NOT set in production.\n' +
      '   Falling back to using ADMIN_PASSWORD for signing JWT tokens.\n' +
      '   This is less secure. Please set a completely different long random string as ADMIN_JWT_SECRET in Vercel.\n'
    )
  } else {
    console.warn(
      '\n⚠️  ADMIN_JWT_SECRET not set.\n' +
      '   Using ADMIN_PASSWORD as fallback for JWT signing (works, but less secure).\n' +
      '   Recommendation: Set a different random 32+ character string in .env.local\n'
    )
  }
} else if (envJwtSecret === ADMIN_PASSWORD) {
  console.error(
    '\n⚠️  SECURITY WARNING (ADMIN_JWT_SECRET):\n' +
    '   ADMIN_JWT_SECRET is set to THE SAME VALUE as ADMIN_PASSWORD.\n' +
    '   This is not ideal. Use two completely different long random strings.\n' +
    '   Login will still work, but security is reduced.\n'
  )
}

const JWT_SECRET = new TextEncoder().encode(
  envJwtSecret || ADMIN_PASSWORD || 'dev-secret-change-in-prod'
)

const COOKIE_NAME = 'admin_token'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export async function login(password: string): Promise<{ success: boolean; error?: string }> {
  if (!password || password !== ADMIN_PASSWORD) {
    return { success: false, error: 'Forkert adgangskode' }
  }

  const token = await new SignJWT({ sub: 'admin', role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/admin', // Only sent to admin routes
    maxAge: COOKIE_MAX_AGE,
  })

  return { success: true }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function verifyAuth(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return false

    await jwtVerify(token, JWT_SECRET)
    return true
  } catch {
    return false
  }
}

export async function getAuthFromRequest(req: NextRequest): Promise<boolean> {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value
    if (!token) return false
    await jwtVerify(token, JWT_SECRET)
    return true
  } catch {
    return false
  }
}

// Middleware helper: returns response if unauthorized (redirects to login)
export function requireAdmin(req: NextRequest, pathname: string) {
  // Allow login page without auth
  if (pathname === '/admin/login') {
    return null
  }

  // For API routes under admin or pages, check
  // We do the check in middleware.ts
  return null
}

export async function requireAdminOrRedirect() {
  const authed = await verifyAuth()
  if (!authed) {
    // This is for server components / actions to throw or redirect
    // Use in layout or pages: if (!authed) redirect('/admin/login')
  }
  return authed
}
