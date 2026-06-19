import Link from 'next/link'
import { ArrowRight, Brain, Globe, Shield, Zap } from 'lucide-react'

export default function About() {
  return (
    <div style={{ background: '#FFFDF5', fontFamily: 'Plus Jakarta Sans' }}>

      {/* NAV */}
      <nav className="sticky top-0 z-50 px-6 py-4"
        style={{ background: 'rgba(255,253,245,0.95)', backdropFilter: 'blur(12px)', borderBottom: '2px solid #E2E8F0' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg"
              style={{ background: '#8B5CF6', border: '2px solid #1E293B', boxShadow: '3px 3px 0px #1E293B' }}>
              S
            </div>
            <span className="font-black text-xl" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>Samyojak</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/features" className="text-sm font-medium hover:text-violet-600" style={{ color: '#64748B' }}>Features</Link>
            <Link href="/pricing" className="text-sm font-medium hover:text-violet-600" style={{ color: '#64748B' }}>Pricing</Link>
            <Link href="/about" className="text-sm font-medium" style={{ color: '#8B5CF6' }}>About</Link>
            <Link href="/contact" className="text-sm font-medium hover:text-violet-600" style={{ color: '#64748B' }}>Contact</Link>
          </div>
          <Link href="/signup" className="candy-btn px-4 py-2 text-sm">Start Free</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-semibold"
            style={{ background: '#EDE9FE', border: '2px solid #8B5CF6', color: '#8B5CF6' }}>
            🌍 Made for the world
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight"
            style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            The ERP that adapts to you.
            <br />
            <span style={{ color: '#8B5CF6' }}>Not the other way around.</span>
          </h1>
          <p className="text-xl leading-relaxed" style={{ color: '#64748B' }}>
            Samyojak was built on a simple belief: every business deserves powerful software that fits how they already work — not software that forces them to change.
          </p>
        </div>
      </section>

      {/* STORY */}
      <section className="px-6 py-16" style={{ background: '#0F172A' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-white mb-8" style={{ fontFamily: 'Outfit' }}>
            The story behind Samyojak
          </h2>
          <div className="space-y-6" style={{ color: '#94A3B8', fontSize: '1.05rem', lineHeight: '1.8' }}>
            <p>
              Samyojak was built by a solo founder using only an Android phone — no laptop, no funding, no team. The entire product was designed, coded, and deployed from a mobile device. That constraint became the product's greatest strength: everything had to be simple, fast, and mobile-first by necessity.
            </p>
            <p>
              The name Samyojak comes from Sanskrit — meaning <em style={{ color: '#C4B5FD' }}>"the one who coordinates and connects."</em> That is exactly what the product does: connects your CRM, invoicing, inventory, HR, projects, and AI intelligence into one unified workspace.
            </p>
            <p>
              We watched small and medium businesses struggle with ERP software that was built for enterprises. They were forced to spend weeks configuring systems, hire consultants to migrate their data, and retrain their teams on entirely new workflows. The result? Most gave up and stayed on Excel.
            </p>
            <p>
              We built Samyojak to change that. A business should be able to sign up, import their existing data in whatever format it is in, and be running in under 5 minutes. The AI should understand their data structure — not force them to restructure it.
            </p>
          </div>
        </div>
      </section>

      {/* VISION */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black mb-8" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Our vision
          </h2>
          <div className="p-8 rounded-2xl mb-8"
            style={{ background: '#EDE9FE', border: '2px solid #8B5CF6', boxShadow: '6px 6px 0px #8B5CF6' }}>
            <Brain size={36} className="mb-4" style={{ color: '#8B5CF6' }} />
            <p className="text-xl font-bold leading-relaxed" style={{ color: '#1E293B', fontFamily: 'Outfit' }}>
              "We are building the world's first truly universal ERP — one that intelligently generates the right structure, fields, and workflows for any business type automatically. Every business is different. Every business deserves software that understands that."
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: Brain, title: 'AI-First', desc: 'AI that reads your real data and gives you specific, actionable business insights — not generic advice.', color: '#8B5CF6', bg: '#EDE9FE' },
              { icon: Globe, title: 'Global by Design', desc: 'Built for every country — GST, VAT, HST, Sales Tax, local currencies, and geo-based pricing that respects where you are.', color: '#34D399', bg: '#D1FAE5' },
              { icon: Zap, title: 'Instant Setup', desc: 'From signup to fully running ERP in 5 minutes. Import your existing data in any format. Zero configuration.', color: '#FBBF24', bg: '#FEF3C7' },
              { icon: Shield, title: 'Business-First Security', desc: 'Enterprise authentication, encrypted data, rate limiting, session timeouts — security that does not compromise usability.', color: '#F472B6', bg: '#FCE7F3' },
            ].map(item => (
              <div key={item.title} className="p-6 rounded-2xl"
                style={{ background: 'white', border: '2px solid #E2E8F0', boxShadow: '4px 4px 0px #F1F5F9' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: item.bg, border: `2px solid ${item.color}` }}>
                  <item.icon size={22} style={{ color: item.color }} />
                </div>
                <h3 className="font-black text-lg mb-2" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>{item.title}</h3>
                <p className="text-sm" style={{ color: '#64748B' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BUILT FOR THE WORLD */}
      <section className="px-6 py-16" style={{ background: '#F8FAFC' }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-6">🌍</div>
          <h2 className="text-3xl font-black mb-4" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Made for the world
          </h2>
          <p className="text-lg mb-8" style={{ color: '#64748B' }}>
            Samyojak is not built for any one country, industry, or type of business. It is built for every person who runs a business, anywhere on the planet. Universal tax support. Multi-currency. Geo-based pricing. Global from day one.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { flag: '🇮🇳', country: 'India', tax: 'GST' },
              { flag: '🇬🇧', country: 'United Kingdom', tax: 'VAT' },
              { flag: '🇺🇸', country: 'United States', tax: 'Sales Tax' },
              { flag: '🇦🇪', country: 'UAE', tax: 'VAT 5%' },
              { flag: '🇦🇺', country: 'Australia', tax: 'GST 10%' },
              { flag: '🇨🇦', country: 'Canada', tax: 'HST/GST' },
              { flag: '🇩🇪', country: 'Germany', tax: 'VAT 19%' },
              { flag: '🌍', country: '8+ more', tax: 'Universal' },
            ].map(item => (
              <div key={item.country} className="p-4 rounded-xl text-center"
                style={{ background: 'white', border: '1.5px solid #E2E8F0' }}>
                <span className="text-2xl block mb-1">{item.flag}</span>
                <p className="font-bold text-xs" style={{ color: '#1E293B' }}>{item.country}</p>
                <p className="text-xs" style={{ color: '#94A3B8' }}>{item.tax}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INFRASTRUCTURE */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black mb-8 text-center" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Built on infrastructure you can trust
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: '▲ Vercel', desc: 'The same infrastructure used by Fortune 500 companies. Global edge network. 99.99% uptime.' },
              { name: '⚡ Supabase', desc: 'Open-source Firebase alternative. Enterprise-grade PostgreSQL database with row-level security.' },
              { name: '🤖 Groq AI', desc: 'The fastest AI inference in the world. Real-time business intelligence from your live data.' },
            ].map(item => (
              <div key={item.name} className="p-6 rounded-2xl"
                style={{ background: '#F8FAFC', border: '2px solid #E2E8F0' }}>
                <p className="font-black text-lg mb-2" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>{item.name}</p>
                <p className="text-sm" style={{ color: '#64748B' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — Start Trial only, no Live Demo */}
      <section className="px-6 py-20 text-center" style={{ background: '#1E293B' }}>
        <h2 className="text-4xl font-black text-white mb-4" style={{ fontFamily: 'Outfit' }}>
          Join us in building the future of ERP
        </h2>
        <p className="mb-8" style={{ color: '#94A3B8' }}>
          Start your trial. Set up in 5 minutes. Cancel anytime.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/signup" className="candy-btn px-8 py-4 text-base inline-flex items-center gap-2">
            Start Trial <ArrowRight size={18} />
          </Link>
          <Link href="/contact"
            className="px-8 py-4 text-base rounded-full font-bold inline-flex items-center gap-2"
            style={{ border: '2px solid rgba(255,255,255,0.3)', color: 'white' }}>
            Talk to Us
          </Link>
        </div>
      </section>
