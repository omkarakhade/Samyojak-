'use client'
import Link from 'next/link'

export default function MarketingFooter() {
  return (
    <footer className="px-6 py-16" style={{ background: '#1E293B', borderTop: '2px solid #0F172A' }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm"
                style={{ background: '#8B5CF6', border: '2px solid #334155' }}>
                S
              </div>
              <span className="font-black text-white" style={{ fontFamily: 'Outfit' }}>Samyojak</span>
            </div>
            <p className="text-sm" style={{ color: '#94A3B8' }}>
              The AI-powered ERP that adapts to your business.
            </p>
          </div>
          <div>
            <p className="font-black text-white text-sm mb-3" style={{ fontFamily: 'Outfit' }}>Product</p>
            <div className="space-y-2">
              <Link href="/features" className="block text-sm hover:text-white transition-colors" style={{ color: '#94A3B8' }}>Features</Link>
              <Link href="/pricing" className="block text-sm hover:text-white transition-colors" style={{ color: '#94A3B8' }}>Pricing</Link>
              <Link href="/referral" className="block text-sm hover:text-white transition-colors" style={{ color: '#94A3B8' }}>Referral</Link>
            </div>
          </div>
          <div>
            <p className="font-black text-white text-sm mb-3" style={{ fontFamily: 'Outfit' }}>Compare</p>
            <div className="space-y-2">
              <Link href="/compare/samyojak-vs-odoo" className="block text-sm hover:text-white transition-colors" style={{ color: '#94A3B8' }}>vs Odoo</Link>
              <Link href="/compare/samyojak-vs-zoho" className="block text-sm hover:text-white transition-colors" style={{ color: '#94A3B8' }}>vs Zoho</Link>
              <Link href="/alternatives/odoo" className="block text-sm hover:text-white transition-colors" style={{ color: '#94A3B8' }}>Odoo Alternative</Link>
              <Link href="/alternatives/zoho" className="block text-sm hover:text-white transition-colors" style={{ color: '#94A3B8' }}>Zoho Alternative</Link>
            </div>
          </div>
          <div>
            <p className="font-black text-white text-sm mb-3" style={{ fontFamily: 'Outfit' }}>Company</p>
            <div className="space-y-2">
              <Link href="/about" className="block text-sm hover:text-white transition-colors" style={{ color: '#94A3B8' }}>About</Link>
              <Link href="/contact" className="block text-sm hover:text-white transition-colors" style={{ color: '#94A3B8' }}>Contact</Link>
              <Link href="/support" className="block text-sm hover:text-white transition-colors" style={{ color: '#94A3B8' }}>Support</Link>
            </div>
          </div>
        </div>
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid #334155' }}>
          <p className="text-xs" style={{ color: '#64748B' }}>
            © {new Date().getFullYear()} Samyojak. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs hover:text-white transition-colors" style={{ color: '#64748B' }}>Privacy</Link>
            <Link href="/terms" className="text-xs hover:text-white transition-colors" style={{ color: '#64748B' }}>Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
