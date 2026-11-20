'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { checkPassword } from '@/lib/passwordClient'
import { checkPasswordRules } from '@/lib/passwordRules'

export default function ResetPassword() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setEmail(user.email || '')
        setName(user.user_metadata?.full_name || '')
        setReady(true)
      } else {
        router.replace('/login?error=reset_link_expired')
      }
    })
  }, [router])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('The two passwords do not match.')
      return
    }
    setLoading(true)
    const verdict = await checkPassword(password, { email, name })
    if (!verdict.ok) {
      setError(verdict.problems[0])
      setLoading(false)
      return
    }
    const { error: err } = await supabase.auth.updateUser({ password })
    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }
    setDone(true)
    setLoading(false)
    setTimeout(() => router.push('/dashboard'), 1500)
  }

  const live = password ? checkPasswordRules(password, { email, name }) : null
  const labels = ['Too weak', 'Weak', 'Okay', 'Good', 'Strong']
  const colors = ['#DC2626', '#DC2626', '#F59E0B', '#16A34A', '#16A34A']

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#FFFDF5' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-2" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>Set a new password</h1>
          <p className="text-sm" style={{ color: '#64748B' }}>Choose something only you would think of. A short phrase works well.</p>
        </div>
        <div className="p-8 rounded-2xl" style={{ background: 'white', border: '2px solid #1E293B', boxShadow: '8px 8px 0px #8B5CF6' }}>
          {done ? (
            <p className="text-sm font-bold" style={{ color: '#16A34A' }}>Password updated. Taking you to your dashboard...</p>
          ) : !ready ? (
            <p className="text-sm" style={{ color: '#64748B' }}>Checking your reset link...</p>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl text-sm font-medium" style={{ background: '#FEE2E2', color: '#DC2626', border: '2px solid #FCA5A5' }}>{error}</div>
              )}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#1E293B', fontFamily: 'Outfit' }}>New password</label>
                <input type="password" required autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="At least 10 characters" className="w-full px-4 py-3 rounded-xl outline-none"
                  style={{ border: '2px solid #CBD5E1', color: '#1E293B' }} />
                {live && (
                  <p className="text-xs mt-1 font-medium" style={{ color: colors[live.score] }}>
                    {labels[live.score]}{live.problems[0] ? ` — ${live.problems[0]}` : ''}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#1E293B', fontFamily: 'Outfit' }}>Repeat new password</label>
                <input type="password" required autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl outline-none" style={{ border: '2px solid #CBD5E1', color: '#1E293B' }} />
              </div>
              <button type="submit" disabled={loading} className="candy-btn w-full py-4 text-base disabled:opacity-50">
                {loading ? 'Saving...' : 'Save new password'}
              </button>
            </form>
          )}
          <p className="text-center text-sm mt-4" style={{ color: '#94A3B8' }}>
            <Link href="/login" className="font-bold hover:underline" style={{ color: '#8B5CF6' }}>Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
