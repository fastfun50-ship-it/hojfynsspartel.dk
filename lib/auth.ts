import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/**
 * SECURITY NOTES:
 * - ADMIN_PASSWORD is the only authentication mechanism. Use a LONG, RANDOM, UNIQUE password.
 * - ADMIN_JWT_SECRET should be a completely different long random string (not the same as the password).
 *   If not set, it falls back to the password (bad for security).
 * - For production: Always set BOTH as strong secrets in Vercel Environment Variables.
 */
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme-strong-password-here'
const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || process.env.ADMIN_PASSWORD || 'dev-secret-change-in-prod'
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
