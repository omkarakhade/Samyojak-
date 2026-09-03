'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { ArrowRight, Lock } from 'lucide-react'

export default function UpgradePage() {
  const [userEmail, setUserEmail] = useState<string>('')
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUserEmail(session.user.email || '')
    }
    loadUser()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#FFFDF5' }}>
      <div
        className="max-w-md w-full text-center p-8 rounded-2xl"
        style={{ background: 'white', border: '2px solid #1E293B', boxShadow: '10px 10px 0px #1E293B' }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: '#FEF3C7', border: '2px solid #1E293B' }}
        >
          <Lock size={28} style={{ color: '#1E293B' }} />
        </div>

        <h1 className="font-black text-2xl mb-3" style={{ fontFamily: 'Outfit, sans-serif', color: '#1E293B' }}>
          Your Free Trial Has Ended
        </h1>

        <p className="text-base mb-2" style={{ color: '#64748B' }}>Your data is safe and waiting for you.</p>
        <p className="text-base mb-6" style={{ color: '#64748B' }}>
          Upgrade now to continue right where you left off — no reconfiguration needed.
        </p>

        {userEmail && (
          <p className="text-xs mb-6" style={{ color: '#94A3B8' }}>Signed in as {userEmail}</p>
        )}

        <Link
          href="/pricing"
          className="w-full flex items-center justify-center gap-2 py-4 rounded-full font-black text-base mb-4"
          style={{ background: '#8B5CF6', color: 'white', border: '2px solid #1E293B', boxShadow: '4px 4px 0px #1E293B' }}
        >
          Choose a Plan <ArrowRight className="h-4 w-4" />
        </Link>

        <p className="text-xs" style={{ color: '#94A3B8' }}>
          Questions?{' '}
          <a href="mailto:hello.samyojak@gmail.com" style={{ color: '#8B5CF6', fontWeight: 700 }}>Talk to us</a>
        </p>
      </div>
    </div>
  )
}
