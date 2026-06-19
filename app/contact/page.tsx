'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Mail, MapPin, ArrowRight, Send, MessageSquare } from 'lucide-react'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', company: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        setSent(true)
      } else {
        setError(data.error || 'Failed to send. Please email us directly at hello.samyojak@gmail.com')
      }
    } catch {
      setError('Failed to send. Please email us directly at hello.samyojak@gmail.com')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen" style={{ background: '#FFFDF5' }}>

      <nav className="px-6 py-4 sticky top-0 z-50"
        style={{ background: 'rgba(255,253,245,0.95)', backdropFilter: 'blur(12px)', borderBottom: '2px solid #E2E8F0' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black"
              style={{ background: '#8B5CF6', border: '2px solid #1E293B', boxShadow: '3px 3px 0px #1E293B' }}>S</div>
            <span className="font-black text-xl" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>Samyojak</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/features" className="text-sm font-medium hover:text-violet-600" style={{ color: '#64748B' }}>Features</Link>
            <Link href="/pricing" className="text-sm font-medium hover:text-violet-600" style={{ color: '#64748B' }}>Pricing</Link>
            <Link href="/about" className="text-sm font-medium hover:text-violet-600" style={{ color: '#64748B' }}>About</Link>
            <Link href="/contact" className="text-sm font-medium" style={{ color: '#8B5CF6' }}>Contact</Link>
          </div>
          <Link href="/signup" className="candy-btn px-4 py-2 text-sm">Start Trial</Link>
        </div>
      </nav>

      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-semibold"
              style={{ background: '#D1FAE5', border: '2px solid #34D399', color: '#065F46' }}>
              <MessageSquare size={14} /> Get In Touch
            </div>
            <h1 className="text-5xl font-black mb-4" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
              We would love to<br />
              <span style={{ color: '#34D399' }}>hear from you</span>
            </h1>
            <p className="text-lg" style={{ color: '#64748B' }}>
              Have questions? We respond within 24 hours on business days.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Left info */}
            <div className="space-y-6">
              <div className="p-8 rounded-2xl"
                style={{ background: 'white', border: '2px solid #1E293B', boxShadow: '6px 6px 0px #E2E8F0' }}>
                <h3 className="text-2xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
                  Contact Information
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-6">

                  {/* Email */}
                  <div className="flex flex-col items-center text-center p-4 rounded-2xl"
                    style={{ background: '#EDE9FE', border: '2px solid #8B5CF6' }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: 'white', border: '2px solid #8B5CF6' }}>
                      <Mail size={22} strokeWidth={2.5} style={{ color: '#8B5CF6' }} />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wide mb-1"
                      style={{ color: '#8B5CF6', fontFamily: 'Outfit' }}>Email Us</p>
                    <p className="text-sm font-semibold break-all"
                      style={{ color: '#1E293B', fontFamily: 'Plus Jakarta Sans' }}>
                      hello.samyojak@gmail.com
                    </p>
                  </div>

                  {/* Location — INDIA */}
                  <div className="flex flex-col items-center text-center p-4 rounded-2xl"
                    style={{ background: '#FCE7F3', border: '2px solid #F472B6' }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: 'white', border: '2px solid #F472B6' }}>
                      <MapPin size={22} strokeWidth={2.5} style={{ color: '#F472B6' }} />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wide mb-1"
                      style={{ color: '#F472B6', fontFamily: 'Outfit' }}>Based In</p>
                    <p className="text-sm font-semibold"
                      style={{ color: '#1E293B', fontFamily: 'Plus Jakarta Sans' }}>
                      🇮🇳 Pune, India
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl"
                  style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0' }}>
                  <p className="text-sm" style={{ color: '#64748B', fontFamily: 'Plus Jakarta Sans' }}>
                    💬 We typically respond within <strong>24 hours</strong> on business days.
                    For urgent matters email directly at{' '}
                    <a href="mailto:hello.samyojak@gmail.com" style={{ color: '#8B5CF6', fontWeight: 700 }}>
                      hello.samyojak@gmail.com
                    </a>
                  </p>
                </div>
              </div>

              <div className="p-8 rounded-2xl"
                style={{ background: '#8B5CF6', border: '2px solid #1E293B', boxShadow: '6px 6px 0px #FBBF24' }}>
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-2xl font-black text-white mb-3" style={{ fontFamily: 'Outfit' }}>
                  Ready to get started?
                </h3>
                <p className="text-white/80 mb-6" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                  Start your trial and see how Samyojak adapts to your business in minutes.
                </p>
                <Link href="/signup"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all hover:scale-105"
                  style={{ background: 'white', color: '#8B5CF6', fontFamily: 'Outfit' }}>
                  Start Trial <ArrowRight size={18} />
                </Link>
              </div>
            </div>

            {/* Right form */}
            <div className="p-8 rounded-2xl"
              style={{ background: 'white', border: '2px solid #1E293B', boxShadow: '8px 8px 0px #F472B6' }}>
              {sent ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-6">🎉</div>
                  <h3 className="text-2xl font-black mb-4" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
                    Message Sent!
                  </h3>
                  <p className="mb-2" style={{ color: '#64748B' }}>
                    We will get back to you within 24 hours at
                  </p>
                  <p className="font-bold mb-6" style={{ color: '#8B5CF6' }}>{form.email}</p>
                  <button
                    onClick={() => { setSent(false); setForm({ name: '', email: '', company: '', subject: '', message: '' }) }}
                    className="outline-btn px-6 py-2 text-sm">
                    Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
                    Send us a message
                  </h3>

                  {error && (
                    <div className="p-3 rounded-xl mb-4 text-sm"
                      style={{ background: '#FEE2E2', color: '#DC2626', border: '1.5px solid #FCA5A5' }}>
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {[
                      { key: 'name', label: 'Your Name', type: 'text', ph: 'Your full name', required: true },
                      { key: 'email', label: 'Email Address', type: 'email', ph: 'you@company.com', required: true },
                      { key: 'company', label: 'Company Name', type: 'text', ph: 'Your business name', required: false },
                      { key: 'subject', label: 'Subject', type: 'text', ph: 'How can we help?', required: true },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-xs font-bold uppercase tracking-wide mb-2"
                          style={{ color: '#1E293B', fontFamily: 'Outfit' }}>
                          {f.label}{f.required && ' *'}
                        </label>
                        <input
                          type={f.type}
                          required={f.required}
                          placeholder={f.ph}
                          value={form[f.key as keyof typeof form]}
                          onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                          style={{ border: '2px solid #E2E8F0', fontFamily: 'Plus Jakarta Sans', color: '#1E293B', background: '#FAFBFF' }}
                          onFocus={e => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '3px 3px 0px #8B5CF6' }}
                          onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }}
                        />
                      </div>
                    ))}

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide mb-2"
                        style={{ color: '#1E293B', fontFamily: 'Outfit' }}>
                        Message *
                      </label>
                      <textarea
                        required
                        placeholder="Tell us how we can help..."
                        value={form.message}
                        onChange={e => setForm({ ...form, message: e.target.value })}
                        rows={5}
                        className="w-full px-4 py-3 rounded-xl outline-none transition-all resize-none"
                        style={{ border: '2px solid #E2E8F0', fontFamily: 'Plus Jakarta Sans', color: '#1E293B', background: '#FAFBFF' }}
                        onFocus={e => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '3px 3px 0px #8B5CF6' }}
                        onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }}
                      />
                    </div>

                    <button type="submit" disabled={loading}
                      className="candy-btn w-full py-4 flex items-center justify-center gap-3 text-base disabled:opacity-50">
                      {loading
                        ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Sending...</>
                        : <><Send size={20} /> Send Message</>}
                    </button>
                    <p className="text-center text-xs" style={{ color: '#94A3B8' }}>
                      We reply to every message within 24 hours
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
