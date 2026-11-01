'use client'
import Link from 'next/link'

interface MarketingNavProps {
  active?: 'features' | 'pricing' | 'about' | 'contact' | null
}

export default function MarketingNav({ active = null }: MarketingNavProps) {
  const links: { label: string; href: string; key: 'features' | 'pricing' | 'about' | 'contact' }[] = [
    { label: 'Features', href: '/features', key: 'features' },
    { label: 'Pricing', href: '/pricing', key: 'pricing' },
    { label: 'About', href: '/about', key: 'about' },
    { label: 'Contact', href: '/contact', key: 'contact' },
  ]

  return (
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
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className="text-sm font-medium transition-colors"
              style={{ color: active === l.key ? '#8B5CF6' : '#64748B' }}>
              {l.label}
            </Link>
          ))}
        </div>
        <Link href="/signup"
          className="px-5 py-2 rounded-full text-sm font-black text-white transition-all hover:opacity-90"
          style={{ background: '#8B5CF6', border: '2px solid #1E293B', boxShadow: '3px 3px 0px #1E293B' }}>
          Start Trial
        </Link>
      </div>
    </nav>
  )
}
