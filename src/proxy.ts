import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

const PUBLIC_ROUTES = ['/login']

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

  const userRole = user.user_metadata?.role

  const employeeRestrictedRoutes = ['/dashboard/reports', '/dashboard/imports', '/dashboard/expenses']
  if (userRole === 'EMPLOYEE' && employeeRestrictedRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
}