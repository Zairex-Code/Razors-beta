import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

const PROTECTED_ROUTES_ADMIN_ONLY = ['/dashboard/users', '/dashboard/settings', '/dashboard/logs']
const PROTECTED_ROUTES_BOSS_AND_ADMIN = [
  '/dashboard/imports',
  '/dashboard/expenses',
  '/dashboard/reports',
]

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const dbUser = await response.cookies.get('sb-access-token')
  const userEmail = user.email

  const { prisma } = await import('@/lib/prisma')
  const dbUserRecord = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { role: true, isActive: true },
  })

  if (!dbUserRecord) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (!dbUserRecord.isActive) {
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const pathname = request.nextUrl.pathname

  if (dbUserRecord.role === 'EMPLOYEE') {
    const isRestricted =
      PROTECTED_ROUTES_ADMIN_ONLY.some(route => pathname.startsWith(route)) ||
      PROTECTED_ROUTES_BOSS_AND_ADMIN.some(route => pathname.startsWith(route))

    if (isRestricted) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  if (dbUserRecord.role === 'BOSS') {
    const isAdminOnly = PROTECTED_ROUTES_ADMIN_ONLY.some(route => pathname.startsWith(route))
    if (isAdminOnly) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
  ],
}
