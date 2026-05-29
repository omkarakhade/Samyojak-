'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'

const PUBLIC = ['/', '/login', '/signup', '/privacy', '/terms']
const TIMEOUT = 30 * 60 * 1000
const WARNING = 25 * 60 * 1000

export default function SessionManager() {
  const [showWarning, setShowWarning] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (PUBLIC.includes(pathname)) return

    let warnTimer: NodeJS.Timeout
    let logoutTimer: NodeJS.Timeout

    const reset = () => {
      clearTimeout(warnTimer)
      clearTimeout(logoutTimer)
      setShowWarning(false)
      warnTimer = setTimeout(() => setShowWarning(true), WARNING)
      logoutTimer = setTimeout(async () => {
        await supabase.auth.signOut()
        router.push('/login')
      }, TIMEOUT)
    }

    const events = ['mousedown', 'keypress', 'scroll', 'touchstart']
    events.forEach(e => document.addEventListener(e, reset))
    reset()

    return () => {
      events.forEach(e => document.removeEventListener(e, reset))
      clearTimeout(warnTimer)
      clearTimeout(logoutTimer)
    }
  }, [pathname, router])

  if (!showWarning) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="text-4xl mb-4">⏱️</div>
        <h3 className="font-bold text-gray-900 text-lg mb-2">Still there?</h3>
        <p className="text-gray-500 text-sm mb-6">
          You will be logged out in 5 minutes due to inactivity.
        </p>
        <div className="flex gap-3">
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              router.push('/login')
            }}
            className="flex-1 border border-gray-300 py-2 rounded-xl text-sm"
          >
            Logout
          </button>
          <button
            onClick={() => setShowWarning(false)}
            className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-sm font-semibold"
          >
            Stay Logged In
          </button>
        </div>
      </div>
    </div>
  )
}
