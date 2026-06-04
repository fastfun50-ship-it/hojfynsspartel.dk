import { NextRequest, NextResponse } from 'next/server'
import { getAuthFromRequest } from './lib/auth'

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Only protect /admin routes (except login and its assets)
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login' || pathname.startsWith('/admin/login/')) {
      // Allow login page through, but add a header so the layout knows to skip auth guard
      const response = NextResponse.next()
      response.headers.set('x-admin-pathname', pathname)
      return response
    }

    const isAuthed = await getAuthFromRequest(req)

    if (!isAuthed) {
      const loginUrl = new URL('/admin/login', req.url)
      // Preserve attempted url for redirect after login (optional)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
