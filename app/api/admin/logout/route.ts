import { NextResponse } from 'next/server'
import { logout } from '@/lib/auth'

export async function POST(request: Request) {
  await logout()
  // Form posts from admin chrome — redirect back to login
  const url = new URL('/admin/login', request.url)
  return NextResponse.redirect(url, { status: 303 })
}
