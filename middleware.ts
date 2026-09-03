import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_ROUTES = ['/dashboard', '/crm', '/invoices', '/inventory', '/hr', '/projects', '/reports']

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const { data: { session } } = await supabase.auth.getSession()
  const pathname = req.nextUrl.pathname
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route))

  if (!isProtectedRoute) return res

  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  try {
    const statusRes = await fetch(new URL('/api/trial-status', req.url), {
      headers: { cookie: req.headers.get('cookie') || '' },
    })

    if (statusRes.ok) {
      const { isLocked } = await statusRes.json()
      if (isLocked) {
        return NextResponse.redirect(new URL('/upgrade?reason=trial_expired', req.url))
      }
    }
  } catch (err) {
    console.error('Trial status check failed in middleware:', err)
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/crm/:path*', '/invoices/:path*', '/inventory/:path*', '/hr/:path*', '/projects/:path*', '/reports/:path*'],
}
