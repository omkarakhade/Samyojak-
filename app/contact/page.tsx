'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Mail, MessageSquare, Phone, MapPin, ArrowRight, Send } from 'lucide-react'

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
                <div className="space-y-6">
                  {[
                    { icon: Mail, label: 'Email Us', value: 'hello@samyojak.app', color: '#8B5CF6', bg: '#EDE9FE' },
                    { icon: MessageSquare, label: 'WhatsApp', value: '+91 Your Number', color: '#34D399', bg: '#D1FAE5' },
                    { icon: MapPin, label: 'Location', value: 'India 🇮🇳', color: '#F472B6', bg: '#FCE7F3' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 wiggle" style={{ background: item.bg, border: `2px solid ${item.color}` }}>
                        <item.icon size={22} strokeWidth={2.5} style={{ color: item.color }} />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: '#94A3B8', fontFamily: 'Outfit' }}>{item.label}</p>
                        <p className="font-semibold" style={{ color: '#1E293B', fontFamily: 'Plus Jakarta Sans' }}>{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 rounded-2xl" style={{ background: '#8B5CF6', border: '2px solid #1E293B', boxShadow: '6px 6px 0px #FBBF24' }}>
                <div className="text-4xl mb-4 float">💬</div>
                <h3 className="text-2xl font-black text-white mb-3" style={{ fontFamily: 'Outfit' }}>Want a demo?</h3>
                <p className="text-white/80 mb-6" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                  We can walk you through Samyojak in 15 minutes and show you exactly how it fits your business.
                </p>
                <Link href="/signup" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold" style={{ background: 'white', color: '#8B5CF6', border: '2px solid white', fontFamily: 'Outfit' }}>
                  Book a Demo <ArrowRight size={18} />
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
                      { key: 'name', label: 'Your Name', type: 'text', placeholder: 'Omkar Akhade', required: true },
                      { key: 'email', label: 'Email Address', type: 'email', placeholder: 'you@company.com', required: true },
                      { key: 'company', label: 'Company Name', type: 'text', placeholder: 'Your Business', required: false },
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
                          style={{
                            border: '2px solid #CBD5E1',
                            background: 'white',
                            fontFamily: 'Plus Jakarta Sans',
                            color: '#1E293B',
                          }}
                          onFocus={e => {
                            e.target.style.borderColor = '#8B5CF6'
                            e.target.style.boxShadow = '4px 4px 0px #8B5CF6'
                          }}
                          onBlur={e => {
                            e.target.style.borderColor = '#CBD5E1'
                            e.target.style.boxShadow = 'none'
                          }}
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
                        onFocus={e => {
                          e.target.style.borderColor = '#8B5CF6'
                          e.target.style.boxShadow = '4px 4px 0px #8B5CF6'
                        }}
                        onBlur={e => {
                          e.target.style.borderColor = '#CBD5E1'
                          e.target.style.boxShadow = 'none'
                        }}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="candy-btn w-full py-4 flex items-center justify-center gap-3 text-lg"
                    >
                      {loading ? 'Sending...' : (
                        <>Send Message <Send size={20} /></>
                      )}
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
