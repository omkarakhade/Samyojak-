import Link from 'next/link'
import {
  Users, FileText, Package, UserCheck,
  FolderOpen, BarChart3, Brain, Globe,
  Zap, Shield, ArrowRight, Check,
} from 'lucide-react'

const MODULES = [
  {
    icon: Users, title: 'CRM with AI Lead Scoring', color: '#8B5CF6', bg: '#EDE9FE',
    desc: 'Manage your entire sales pipeline with AI-powered lead scoring, follow-up reminders, and status tracking.',
    features: ['AI lead scoring 0-100', 'Pipeline stages — New, Contacted, Converted, Lost', 'Follow-up date reminders', 'Import leads from any CSV format', 'Export to CSV anytime', 'Business type categorization'],
  },
  {
    icon: FileText, title: 'Universal Tax Invoicing', color: '#F472B6', bg: '#FCE7F3',
    desc: 'Create professional invoices with automatic tax calculation for any country in one click.',
    features: ['GST for India (0%, 5%, 12%, 18%, 28%)', 'VAT for UK, Germany, UAE, France, South Africa', 'HST/GST for Canada', 'Sales Tax for USA', 'GST for Australia, New Zealand, Singapore', 'WhatsApp invoice sending', 'Mark paid / unpaid / overdue', 'Export all invoices to CSV'],
  },
  {
    icon: Package, title: 'Inventory + Free QR Codes', color: '#FBBF24', bg: '#FEF3C7',
    desc: 'Track your stock with automatic QR code generation, low stock alerts, and reorder management.',
    features: ['Free auto-generated QR codes for every product', 'Real-time stock level tracking', 'Low stock alerts and reorder levels', 'Category management', 'SKU tracking', 'Import products from CSV', 'Export inventory to CSV'],
  },
  {
    icon: UserCheck, title: 'HR & Payroll', color: '#34D399', bg: '#D1FAE5',
    desc: 'Manage your entire team — salaries, departments, joining dates, leave balance, and more.',
    features: ['Employee profiles with roles and departments', 'Monthly salary tracking', 'Total payroll calculation', 'Leave balance tracking', 'Joining date management', 'Import team from CSV', 'Export HR data anytime'],
  },
  {
    icon: FolderOpen, title: 'Project Management Kanban', color: '#8B5CF6', bg: '#EDE9FE',
    desc: 'Track all your client projects on a visual Kanban board with deadlines and progress.',
    features: ['4-column Kanban — Planning, In Progress, Review, Done', 'Deadline tracking with overdue alerts', 'Progress percentage tracking', 'One-click status moves between columns', 'Project start date and deadline', 'Create and delete projects instantly'],
  },
  {
    icon: BarChart3, title: 'Tax Reports & Analytics', color: '#F472B6', bg: '#FCE7F3',
    desc: 'Generate GSTR-1 compatible reports, monthly tax breakdowns, and revenue analytics.',
    features: ['GSTR-1 format tax reports', 'Monthly revenue summaries', 'Tax collected by rate (5%, 12%, 18%, 28%)', 'Paid vs unpaid vs overdue breakdown', 'Collection rate by month', 'Export reports to CSV'],
  },
  {
    icon: Brain, title: 'AI Business Intelligence', color: '#FBBF24', bg: '#FEF3C7',
    desc: 'Ask your AI assistant anything about your business. It reads your live data and gives real answers.',
    features: ['Reads your live Airtable data in real-time', 'Analyzes leads, invoices, inventory, HR, projects', 'Gives specific answers using your actual numbers', 'Quick question buttons for common queries', 'Floating AI bubble available on every page', 'Powered by Groq AI — free and fast'],
    badge: 'Complete plan only',
  },
  {
    icon: Globe, title: 'Import Any CSV Format', color: '#34D399', bg: '#D1FAE5',
    desc: 'Migrate from any existing ERP or spreadsheet without renaming a single column.',
    features: ['Accepts any CSV column naming convention', 'Smart AI mapping of your columns to our fields', 'Preview before importing', 'Batch import hundreds of records', 'Source tracking — know where data came from', 'Works with exports from any business software'],
  },
]

export default function Features() {
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
            <a href="/#features" className="text-sm font-medium" style={{ color: '#8B5CF6' }}>Features</a>
            <a href="/#pricing" className="text-sm font-medium hover:text-violet-600" style={{ color: '#64748B' }}>Pricing</a>
            <Link href="/about" className="text-sm font-medium hover:text-violet-600" style={{ color: '#64748B' }}>About</Link>
            <Link href="/contact" className="text-sm font-medium hover:text-violet-600" style={{ color: '#64748B' }}>Contact</Link>
          </div>
          <Link href="/signup" className="candy-btn px-4 py-2 text-sm">Start Free</Link>
        </div>
      </nav>

      {/* HEADER */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-semibold"
            style={{ background: '#EDE9FE', border: '2px solid #8B5CF6', color: '#8B5CF6' }}>
            <Zap size={14} /> 8 powerful modules in one platform
          </div>
          <h1 className="text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Everything your business
            <br />
            <span style={{ color: '#8B5CF6' }}>needs to grow</span>
          </h1>
          <p className="text-lg" style={{ color: '#64748B' }}>
            Six ERP modules plus AI intelligence and universal data import. All in one workspace. Set up in 5 minutes.
          </p>
        </div>
      </section>

      {/* MODULES */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto space-y-8">
          {MODULES.map((mod, i) => (
            <div key={mod.title}
              className="rounded-2xl overflow-hidden"
              style={{ border: '2px solid #E2E8F0', background: 'white', boxShadow: '6px 6px 0px #F1F5F9' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                {/* Left */}
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: mod.bg, border: `2px solid ${mod.color}` }}>
                      <mod.icon size={24} style={{ color: mod.color }} />
                    </div>
                    {mod.badge && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{ background: '#FEF3C7', color: '#92400E' }}>
                        {mod.badge}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-black mb-3" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
                    {mod.title}
                  </h2>
                  <p className="mb-4" style={{ color: '#64748B' }}>{mod.desc}</p>
                  <Link href="/signup"
                    className="inline-flex items-center gap-2 text-sm font-bold"
                    style={{ color: mod.color }}>
                    Try it free <ArrowRight size={16} />
                  </Link>
                </div>
                {/* Right */}
                <div className="p-8 border-t md:border-t-0 md:border-l border-gray-100">
                  <p className="text-xs font-bold uppercase tracking-wide mb-4" style={{ color: '#94A3B8' }}>
                    What's included
                  </p>
                  <ul className="space-y-3">
                    {mod.features.map(f => (
                      <li key={f} className="flex items-start gap-3 text-sm" style={{ color: '#475569' }}>
                        <Check size={16} className="flex-shrink-0 mt-0.5" style={{ color: mod.color }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECURITY */}
      <section className="px-6 py-16" style={{ background: '#F8FAFC' }}>
        <div className="max-w-4xl mx-auto text-center">
          <Shield size={40} className="mx-auto mb-4" style={{ color: '#8B5CF6' }} />
          <h2 className="text-3xl font-black mb-4" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Enterprise-grade security
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'SSL Encrypted', desc: 'All data in transit' },
              { label: 'Supabase Auth', desc: 'Enterprise authentication' },
              { label: 'Rate Limited', desc: '5 attempts max lockout' },
              { label: 'Session Timeout', desc: '30 min auto logout' },
            ].map(s => (
              <div key={s.label} className="p-4 rounded-2xl"
                style={{ background: 'white', border: '2px solid #E2E8F0' }}>
                <p className="font-bold text-sm mb-1" style={{ color: '#1E293B', fontFamily: 'Outfit' }}>✅ {s.label}</p>
                <p className="text-xs" style={{ color: '#64748B' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center" style={{ background: '#1E293B' }}>
        <h2 className="text-4xl font-black text-white mb-6" style={{ fontFamily: 'Outfit' }}>
          Ready to see it in action?
        </h2>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/signup" className="candy-btn px-8 py-4 text-lg inline-flex items-center gap-2">
            Start Free <ArrowRight size={20} />
          </Link>
          <Link href="/demo"
            className="px-8 py-4 text-lg rounded-full font-bold inline-flex items-center gap-2"
            style={{ border: '2px solid rgba(255,255,255,0.3)', color: 'white' }}>
            Live Demo
          </Link>
        </div>
      </section>
    </div>
  )
}
