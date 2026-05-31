'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowRight } from 'lucide-react'

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.name, company: form.company },
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/choose-plan')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#FFFDF5' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black" style={{ background: '#8B5CF6', border: '2px solid #1E293B', boxShadow: '3px 3px 0px #1E293B' }}>S</div>
            <span className="font-black text-xl" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>Samyojak</span>
          </Link>
          <h1 className="text-3xl font-black mb-2" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>Create your account</h1>
          <p className="text-sm" style={{ color: '#64748B' }}>Step 1 of 2 — Account details</p>
        </div>

        <div className="p-8 rounded-2xl" style={{ background: 'white', border: '2px solid #1E293B', boxShadow: '8px 8px 0px #8B5CF6' }}>
          {error && (
            <div className="p-3 rounded-xl mb-4 text-sm font-medium" style={{ background: '#FEE2E2', color: '#DC2626', border: '2px solid #FCA5A5' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            {[
              { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name' },
              { key: 'email', label: 'Work Email', type: 'email', placeholder: 'you@company.com' },
              { key: 'password', label: 'Password', type: 'password', placeholder: 'Min 8 characters' },
              { key: 'company', label: 'Company Name', type: 'text', placeholder: 'Your business name' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#1E293B', fontFamily: 'Outfit' }}>
                  {f.label}
                </label>
                <input
                  type={f.type}
                  required
                  placeholder={f.placeholder}
                  value={form[f.key as keyof typeof form]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                  style={{ border: '2px solid #CBD5E1', background: 'white', fontFamily: 'Plus Jakarta Sans', color: '#1E293B' }}
                  onFocus={e => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '4px 4px 0px #8B5CF6' }}
                  onBlur={e => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="candy-btn w-full py-4 flex items-center justify-center gap-3 text-base"
            >
              {loading ? 'Creating account...' : (
                <>Continue to Plan Selection <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm mt-4" style={{ color: '#94A3B8', fontFamily: 'Plus Jakarta Sans' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-bold hover:underline" style={{ color: '#8B5CF6' }}>Sign in</Link>
          </p>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: '#94A3B8' }}>
          By signing up you agree to our{' '}
          <Link href="/terms" className="hover:underline" style={{ color: '#8B5CF6' }}>Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" className="hover:underline" style={{ color: '#8B5CF6' }}>Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}
