import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

const PUBLIC_ROUTES = ['/login']

const ADMIN_ROUTES = ['/dashboard/users', '/dashboard/settings', '/dashboard/logs']
const BOSS_ROUTES = ['/dashboard/reports', '/dashboard/imports', '/dashboard/expenses']

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

  const userRole = user.user_metadata?.role || 'EMPLOYEE'

  if (ADMIN_ROUTES.some(route => pathname.startsWith(route)) && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (BOSS_ROUTES.some(route => pathname.startsWith(route)) && userRole === 'EMPLOYEE') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  response.headers.set('x-user-role', userRole)
  response.headers.set('x-user-id', user.id)

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
}