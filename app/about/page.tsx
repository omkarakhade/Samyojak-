import Link from 'next/link'
import { ArrowRight, Target, Heart, Zap, Shield } from 'lucide-react'

export default function About() {
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

      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute top-20 right-20 w-48 h-48 rounded-full opacity-20 float" style={{ background: '#FBBF24' }}></div>
        <div className="absolute bottom-20 left-20 w-32 h-32 rounded-full opacity-20" style={{ background: '#34D399' }}></div>

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-semibold" style={{ background: '#EDE9FE', border: '2px solid #8B5CF6', color: '#8B5CF6' }}>
            <Heart size={14} fill="#8B5CF6" /> Our Story
          </div>
          <h1 className="text-5xl lg:text-6xl font-black mb-8" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Built by a one-person<br />
            <span style={{ color: '#8B5CF6' }}>team. For everyone.</span>
          </h1>
          <p className="text-xl leading-relaxed" style={{ color: '#64748B', fontFamily: 'Plus Jakarta Sans' }}>
            Samyojak was born from a simple observation — Indian small businesses deserve world-class software at fair prices. Zoho and Odoo were too complex, too expensive, and not built for how Indian businesses actually work.
          </p>
        </div>
      </section>

      <section className="py-16 px-6" style={{ background: '#1E293B' }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { number: '500+', label: 'Businesses Served', color: '#8B5CF6' },
            { number: '₹0', label: 'Setup Cost', color: '#34D399' },
            { number: '6', label: 'Modules in One App', color: '#FBBF24' },
          ].map(stat => (
            <div key={stat.label}>
              <p className="text-5xl font-black mb-2" style={{ fontFamily: 'Outfit', color: stat.color }}>{stat.number}</p>
              <p className="font-semibold" style={{ color: '#94A3B8', fontFamily: 'Plus Jakarta Sans' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-16" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { icon: Target, title: 'Simplicity First', desc: 'Every feature must be usable in under 60 seconds. If it takes longer, we redesign it.', color: '#8B5CF6', bg: '#EDE9FE' },
              { icon: Heart, title: 'India at Heart', desc: 'Built for GST, WhatsApp, UPI, and the way Indian businesses actually operate day to day.', color: '#F472B6', bg: '#FCE7F3' },
              { icon: Zap, title: 'Speed Over Everything', desc: 'Setup in minutes not weeks. Your business cannot wait for month-long implementations.', color: '#FBBF24', bg: '#FEF3C7' },
              { icon: Shield, title: 'Your Data, Your Control', desc: 'Export everything anytime. No lock-in. No hidden fees. Your data belongs to you.', color: '#34D399', bg: '#D1FAE5' },
            ].map(v => (
              <div key={v.title} className="sticker-card p-8">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 wiggle" style={{ background: v.bg, border: `2px solid ${v.color}` }}>
                  <v.icon size={26} strokeWidth={2.5} style={{ color: v.color }} />
                </div>
                <h3 className="text-2xl font-black mb-3" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>{v.title}</h3>
                <p className="leading-relaxed" style={{ color: '#64748B', fontFamily: 'Plus Jakarta Sans' }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6" style={{ background: '#8B5CF6' }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-black text-white mb-6" style={{ fontFamily: 'Outfit' }}>Ready to join us?</h2>
          <p className="text-white/80 mb-8" style={{ fontFamily: 'Plus Jakarta Sans' }}>Start your free trial today. No credit card required.</p>
          <Link href="/signup" className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg" style={{ background: 'white', color: '#8B5CF6', border: '2px solid #1E293B', boxShadow: '4px 4px 0px #1E293B', fontFamily: 'Outfit' }}>
            Get Started Free <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  )
}
