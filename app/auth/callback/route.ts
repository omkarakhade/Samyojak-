import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = 'omkarakhade083@gmail.com'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

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
