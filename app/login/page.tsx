'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowRight } from 'lucide-react'

const ADMIN_EMAIL = 'omkarakhade083@gmail.com'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [locked, setLocked] = useState(false)
  const [lockTimer, setLockTimer] = useState(0)
  const router = useRouter()

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (locked && lockTimer > 0) {
      interval = setInterval(() => {
        setLockTimer(t => {
          if (t <= 1) { setLocked(false); return 0 }
          return t - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [locked, lockTimer])

  // Check if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        if (session.user.email === ADMIN_EMAIL) {
          router.push('/admin')
        } else if (session.user.user_metadata?.plan) {
          router.push('/dashboard')
        } else {
          router.push('/choose-plan')
        }
      }
    })
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (locked) return
    if (attempts >= 5) {
      setLocked(true)
      setLockTimer(900)
      return
    }
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setAttempts(a => a + 1)
      const remaining = 4 - attempts
      setError(`Invalid credentials. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`)
      setLoading(false)
      return
    }

    const user = data.user

    // Admin goes to admin panel immediately
    if (user?.email === ADMIN_EMAIL) {
      // Ensure admin always has Complete plan
      await supabase.auth.updateUser({
        data: {
          plan: 'Complete',
          is_admin: true,
          full_name: 'Omkar Akhade',
        }
      })
      router.push('/admin')
      return
    }

    // Regular user
    const plan = user?.user_metadata?.plan
    if (plan) {
      router.push('/dashboard')
    } else {
      router.push('/choose-plan')
    }

    setLoading(false)
  }

  const handleGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#FFFDF5' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black"
              style={{ background: '#8B5CF6', border: '2px solid #1E293B', boxShadow: '3px 3px 0px #1E293B' }}>S</div>
            <span className="font-black text-xl" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>Samyojak</span>
          </Link>
          <h1 className="text-3xl font-black mb-2" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>Welcome back</h1>
          <p className="text-sm" style={{ color: '#64748B' }}>Sign in to your Samyojak workspace</p>
        </div>

        <div className="p-8 rounded-2xl" style={{ background: 'white', border: '2px solid #1E293B', boxShadow: '8px 8px 0px #8B5CF6' }}>
          {locked && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm text-center">
              🔒 Too many attempts. Try again in {Math.floor(lockTimer / 60)}:{String(lockTimer % 60).padStart(2, '0')}
            </div>
          )}

          <button
            onClick={handleGoogle}
            disabled={locked}
            className="w-full border border-gray-300 rounded-xl py-3 flex items-center justify-center gap-3 hover:bg-gray-50 mb-6 disabled:opacity-50 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="font-medium text-gray-700">Continue with Google</span>
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="text-gray-400 text-sm">OR</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-4 text-sm">{error}</div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#1E293B', fontFamily: 'Outfit' }}>Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                required disabled={locked} placeholder="you@company.com"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500 outline-none disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#1E293B', fontFamily: 'Outfit' }}>Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                required disabled={locked} placeholder="••••••••"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500 outline-none disabled:bg-gray-50"
              />
            </div>
            <button
              type="submit" disabled={loading || locked}
              className="candy-btn w-full py-3 flex items-center justify-center gap-2 text-base disabled:opacity-50"
            >
              {loading ? 'Signing in...' : <><span>Sign in</span><ArrowRight size={18} /></>}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            No account?{' '}
            <Link href="/signup" className="font-bold hover:underline" style={{ color: '#8B5CF6' }}>Create one</Link>
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6 text-xs" style={{ color: '#94A3B8' }}>
          <span>Powered by</span>
          <span className="font-black" style={{ color: '#000' }}>▲ Vercel</span>
        </div>
      </div>
    </div>
  )
}
