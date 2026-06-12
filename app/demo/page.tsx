'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Demo() {
  const router = useRouter()

  useEffect(() => {
    const setupDemo = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Give current user Complete plan temporarily
        await supabase.auth.updateUser({
          data: { plan: 'Complete' }
        })
        router.push('/dashboard')
      } else {
        // Not logged in — go to login first
        router.push('/login')
      }
    }
    setupDemo()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: '#FFFDF5' }}>
      <div className="text-center">
        <div className="text-4xl mb-4 float">🚀</div>
        <p className="font-black text-xl" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
          Loading demo...
        </p>
      </div>
    </div>
  )
}
