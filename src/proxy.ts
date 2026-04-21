import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

interface SupabaseAuthToken {
  user: {
    id: string
    email: string
    user_metadata: {
      name?: string
      role?: string
    }
  }
}

function parseAuthCookie(cookieValue: string): SupabaseAuthToken['user'] | null {
  try {
    if (cookieValue.startsWith('base64-')) {
      const jsonStr = Buffer.from(cookieValue.replace('base64-', ''), 'base64').toString('utf-8')
      const parsed = JSON.parse(jsonStr)
      return parsed.user || null
    }
    return null
  } catch {
    return null
  }
}

const USER_COOKIE_OPTIONS: CookieOptions = {
  path: '/',
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24,
}

export async function proxy(request: NextRequest) {
  console.log('[PROXY] ========== REQUEST START ==========')
  console.log('[PROXY] Pathname:', request.nextUrl.pathname)

  const authCookie = request.cookies.get('sb-glkztpuzyjzksaoialvn-auth-token')
  let user: SupabaseAuthToken['user'] | null = null

  if (authCookie) {
    user = parseAuthCookie(authCookie.value)
    console.log('[PROXY] Manual parse user:', user?.id, user?.email)
  }

  const pathname = request.nextUrl.pathname
  const isPublicRoute = pathname === '/login' || pathname.startsWith('/auth/')
  const isProtectedRoute = pathname.startsWith('/dashboard')

  // Handle redirect to login (no user for protected route)
  if (isProtectedRoute && !user) {
    console.log('[PROXY] No user, redirecting to /login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Handle redirect to dashboard (user already logged in on login page)
  if (isPublicRoute && user) {
    console.log('[PROXY] Already logged in, redirecting to /dashboard')
    const redirectUrl = new URL('/dashboard', request.url)
    const response = NextResponse.redirect(redirectUrl)

    // Need to verify user in DB first and set cookies on redirect response
    try {
      const { prisma } = await import('@/lib/prisma')
      const dbUser = await prisma.user.findFirst({
        where: { email: { equals: user.email!, mode: 'insensitive' } },
        select: { id: true, role: true, isActive: true },
      })

      if (dbUser?.isActive) {
        response.cookies.set('x-user-id', dbUser.id, USER_COOKIE_OPTIONS)
        response.cookies.set('x-user-role', dbUser.role, USER_COOKIE_OPTIONS)
        response.cookies.set('x-user-email', user.email!, USER_COOKIE_OPTIONS)
        console.log('[PROXY] Set cookies on redirect, user:', dbUser.role)
      }
    } catch (e) {
      console.log('[PROXY] Error verifying user in DB:', e)
    }

    return response
  }

  // Normal flow - set user cookies and continue
  if (user) {
    const response = NextResponse.next({ request })

    try {
      const { prisma } = await import('@/lib/prisma')
      const dbUser = await prisma.user.findFirst({
        where: { email: { equals: user.email!, mode: 'insensitive' } },
        select: { id: true, role: true, isActive: true },
      })

      if (dbUser?.isActive) {
        response.cookies.set('x-user-id', dbUser.id, USER_COOKIE_OPTIONS)
        response.cookies.set('x-user-role', dbUser.role, USER_COOKIE_OPTIONS)
        response.cookies.set('x-user-email', user.email!, USER_COOKIE_OPTIONS)
        console.log('[PROXY] User authorized:', dbUser.role)
      }
    } catch (e) {
      console.log('[PROXY] Error verifying user in DB:', e)
    }

    return response
  }

  // No user, public route, continue
  return NextResponse.next({ request })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
