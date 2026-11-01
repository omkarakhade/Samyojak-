import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

const ADMIN_EMAIL = 'omkarakhade083@gmail.com'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')

  if (code) {
    // Server client reads the PKCE verifier cookie and writes session cookies
    const supabase = await createSupabaseServerClient()

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data?.user) {
      const user = data.user

      if (user.email === ADMIN_EMAIL) {
        await supabase.auth.updateUser({
          data: { plan: 'Complete', is_admin: true }
        })
        return NextResponse.redirect(new URL('/admin', origin))
      }

      if (user.user_metadata?.plan) {
        return NextResponse.redirect(new URL('/dashboard', origin))
      }

      return NextResponse.redirect(new URL('/choose-plan', origin))
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth_failed', origin))
}
