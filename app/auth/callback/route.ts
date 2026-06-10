import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = 'omkarakhade083@gmail.com'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/dashboard'

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data } = await supabase.auth.exchangeCodeForSession(code)
    const user = data?.user

    if (user?.email === ADMIN_EMAIL) {
      await supabase.auth.updateUser({ data: { plan: 'Complete', is_admin: true } })
      return NextResponse.redirect(new URL('/admin', req.url))
    }

    if (user?.user_metadata?.plan) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.redirect(new URL('/choose-plan', req.url))
  }

  return NextResponse.redirect(new URL('/dashboard', req.url))
}
