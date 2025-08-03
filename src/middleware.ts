import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
  const isAuthRoute = req.nextUrl.pathname.startsWith('/login')
  const isProfileRoute = req.nextUrl.pathname.startsWith('/profile')

  if (isAdminRoute) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!user || user.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  if (isProfileRoute && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/profile/:path*',
    '/login'
  ]
}