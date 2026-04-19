import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

const PUBLIC_ROUTES = ['/login']

const ADMIN_ROUTES = ['/dashboard/users', '/dashboard/settings', '/dashboard/logs']
const BOSS_AND_ADMIN_ROUTES = ['/dashboard/reports', '/dashboard/imports', '/dashboard/expenses']

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({
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
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  if (PUBLIC_ROUTES.includes(pathname)) {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return response
  }

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const { prisma } = await import('@/lib/prisma')
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
    select: { role: true, isActive: true },
  })

  if (!dbUser) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (!dbUser.isActive) {
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (dbUser.role === 'EMPLOYEE') {
    const isRestricted =
      ADMIN_ROUTES.some(route => pathname.startsWith(route)) ||
      BOSS_AND_ADMIN_ROUTES.some(route => pathname.startsWith(route))
    if (isRestricted) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  if (dbUser.role === 'BOSS') {
    const isAdminOnly = ADMIN_ROUTES.some(route => pathname.startsWith(route))
    if (isAdminOnly) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  response.headers.set('x-user-role', dbUser.role)
  response.headers.set('x-user-id', user.id)

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
}
