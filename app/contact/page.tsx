'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Mail, MapPin, ArrowRight, Send, MessageSquare } from 'lucide-react'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen" style={{ background: '#FFFDF5' }}>
      <nav className="px-6 py-4" style={{ borderBottom: '2px solid #E2E8F0', background: '#FFFDF5' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black" style={{ background: '#8B5CF6', border: '2px solid #1E293B', boxShadow: '3px 3px 0px #1E293B' }}>S</div>
            <span className="font-black text-xl" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>Samyojak</span>
          </Link>
          <Link href="/" className="outline-btn px-4 py-2 text-sm">← Back</Link>
        </div>
      </nav>

      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-semibold" style={{ background: '#D1FAE5', border: '2px solid #34D399', color: '#065F46' }}>
              <MessageSquare size={14} /> Get In Touch
            </div>
            <h1 className="text-5xl font-black mb-4" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
              We would love to<br />
              <span style={{ color: '#34D399' }}>hear from you</span>
            </h1>
            <p className="text-lg" style={{ color: '#64748B', fontFamily: 'Plus Jakarta Sans' }}>
              Have questions? We respond within 24 hours on business days.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Contact Info */}
            <div className="space-y-6">
              <div className="sticker-card p-8">
                <h3 className="text-2xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>Contact Information</h3>

                {/* Email and Location side by side */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex flex-col items-center text-center p-4 rounded-2xl" style={{ background: '#EDE9FE', border: '2px solid #8B5CF6' }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 wiggle" style={{ background: 'white', border: '2px solid #8B5CF6' }}>
                      <Mail size={22} strokeWidth={2.5} style={{ color: '#8B5CF6' }} />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: '#8B5CF6', fontFamily: 'Outfit' }}>Email Us</p>
                    <p className="text-sm font-semibold" style={{ color: '#1E293B', fontFamily: 'Plus Jakarta Sans' }}>hello@samyojak.app</p>
                  </div>

                  <div className="flex flex-col items-center text-center p-4 rounded-2xl" style={{ background: '#FCE7F3', border: '2px solid #F472B6' }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 wiggle" style={{ background: 'white', border: '2px solid #F472B6' }}>
                      <MapPin size={22} strokeWidth={2.5} style={{ color: '#F472B6' }} />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: '#F472B6', fontFamily: 'Outfit' }}>Location</p>
                    <p className="text-sm font-semibold" style={{ color: '#1E293B', fontFamily: 'Plus Jakarta Sans' }}>India 🇮🇳</p>
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-2xl" style={{ background: '#8B5CF6', border: '2px solid #1E293B', boxShadow: '6px 6px 0px #FBBF24' }}>
                <div className="text-4xl mb-4 float">🚀</div>
                <h3 className="text-2xl font-black text-white mb-3" style={{ fontFamily: 'Outfit' }}>Want to try it out?</h3>
                <p className="text-white/80 mb-6" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                  Jump straight into Samyojak with a full trial. See exactly how it fits your business in minutes.
                </p>
                <Link href="/signup" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold" style={{ background: 'white', color: '#8B5CF6', border: '2px solid white', fontFamily: 'Outfit' }}>
                  Start Trial <ArrowRight size={18} />
                </Link>
              </div>
            </div>

            {/* Contact Form */}
            <div className="sticker-card p-8">
              {sent ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-6 float">🎉</div>
                  <h3 className="text-2xl font-black mb-4" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>Message Sent!</h3>
                  <p style={{ color: '#64748B', fontFamily: 'Plus Jakarta Sans' }}>We will get back to you within 24 hours.</p>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>Send us a message</h3>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {[
                      { key: 'name', label: 'Your Name', type: 'text', placeholder: 'Your full name', required: true },
                      { key: 'email', label: 'Email Address', type: 'email', placeholder: 'you@company.com', required: true },
                      { key: 'company', label: 'Company Name', type: 'text', placeholder: 'Your business name', required: false },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#1E293B', fontFamily: 'Outfit' }}>{f.label}</label>
                        <input
                          type={f.type}
                          required={f.required}
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
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#1E293B', fontFamily: 'Outfit' }}>Message</label>
                      <textarea
                        required
                        placeholder="Tell us how we can help..."
                        value={form.message}
                        onChange={e => setForm({ ...form, message: e.target.value })}
                        rows={5}
                        className="w-full px-4 py-3 rounded-xl outline-none transition-all resize-none"
                        style={{ border: '2px solid #CBD5E1', background: 'white', fontFamily: 'Plus Jakarta Sans', color: '#1E293B' }}
                        onFocus={e => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '4px 4px 0px #8B5CF6' }}
                        onBlur={e => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = 'none' }}
                      />
                    </div>
                    <button type="submit" disabled={loading} className="candy-btn w-full py-4 flex items-center justify-center gap-3 text-lg">
                      {loading ? 'Sending...' : <><Send size={20} /> Send Message</>}
                    </button>
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
