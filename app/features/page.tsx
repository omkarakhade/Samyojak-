'use client'
import React from 'react'
import Link from 'next/link'
import {
  Users, FileText, Package, UserCheck, FolderOpen,
  BarChart3, Brain, Globe, Zap, Shield, ArrowRight,
  Check, FileCheck, RefreshCw, UserPlus, TrendingUp
} from 'lucide-react'

const MODULES = [
  {
    icon: Users,
    title: 'CRM with AI Lead Scoring',
    color: '#8B5CF6',
    bg: '#EDE9FE',
    badge: null,
    desc: 'Manage your entire sales pipeline with AI-powered lead scoring, follow-up reminders, and status tracking.',
    features: [
      'AI lead scoring 0–100',
      'Pipeline stages — New, Contacted, Converted, Lost',
      'Follow-up date reminders with alerts',
      'Import leads from any CSV format',
      'Export to CSV anytime',
      'Business type categorization',
      'Search and filter by any field',
    ],
  },
  {
    icon: FileCheck,
    title: 'Sales Quotations',
    color: '#34D399',
    bg: '#D1FAE5',
    badge: '🆕 New',
    desc: 'Build professional sales quotes in seconds. Download as PDF and convert to invoice in one click.',
    features: [
      'Professional quote builder',
      'Line items with quantity and price',
      'Automatic tax calculation',
      'PDF download instantly',
      'Convert quote to invoice in one click',
      'Quote status — Draft, Sent, Accepted, Rejected',
      'Client email and phone stored',
    ],
  },
  {
    icon: FileText,
    title: 'Universal Tax Invoicing',
    color: '#F472B6',
    bg: '#FCE7F3',
    badge: null,
    desc: 'Create professional invoices with automatic tax calculation for any country in one click.',
    features: [
      'GST for India (0%, 5%, 12%, 18%, 28%)',
      'VAT for UK, Germany, UAE, France, South Africa',
      'HST/GST for Canada',
      'Sales Tax for USA',
      'GST for Australia, New Zealand, Singapore',
      'WhatsApp invoice sending built in',
      'Mark paid / unpaid / overdue',
    ],
  },
  {
    icon: RefreshCw,
    title: 'Recurring Invoices',
    color: '#FBBF24',
    bg: '#FEF3C7',
    badge: '🆕 New',
    desc: 'Set up automatic recurring invoices for your retainer clients. Never miss a billing cycle again.',
    features: [
      'Weekly, monthly, and yearly recurring schedules',
      'Auto-invoice generation on schedule',
      'Client notification on each invoice',
      'Pause or cancel recurring at any time',
      'Full history of all recurring invoices',
      'Same tax system support as regular invoices',
      'Dashboard shows upcoming recurring invoices',
    ],
  },
  {
    icon: Package,
    title: 'Inventory + Free QR Codes',
    color: '#FBBF24',
    bg: '#FEF3C7',
    badge: null,
    desc: 'Track your stock with automatic QR code generation, low stock alerts, and reorder management.',
    features: [
      'Free auto-generated QR codes for every product',
      'Real-time stock level tracking',
      'Low stock alerts and reorder levels',
      'Category management',
      'SKU tracking',
      'Import products from any CSV',
      'Export inventory to CSV',
    ],
  },
  {
    icon: UserCheck,
    title: 'HR & Payroll',
    color: '#34D399',
    bg: '#D1FAE5',
    badge: null,
    desc: 'Manage your entire team — salaries, departments, joining dates, leave balance, and more.',
    features: [
      'Employee profiles with roles and departments',
      'Monthly salary tracking',
      'Total payroll calculation',
      'Leave balance tracking',
      'Joining date management',
      'Import team from any CSV',
      'Export HR data anytime',
    ],
  },
  {
    icon: UserPlus,
    title: 'Recruiting Tracker',
    color: '#8B5CF6',
    bg: '#EDE9FE',
    badge: '🆕 New',
    desc: 'Track job candidates through every stage of your hiring pipeline from Applied to Hired.',
    features: [
      'Kanban stages — Applied, Screening, Interview, Offer, Hired',
      'Candidate profile with resume link',
      'Role and department tracking',
      'Interview date scheduling',
      'Move candidates between stages',
      'Import candidates from any CSV',
      'Export recruiting data anytime',
    ],
  },
  {
    icon: FolderOpen,
    title: 'Project Management Kanban',
    color: '#F472B6',
    bg: '#FCE7F3',
    badge: null,
    desc: 'Track all your client projects on a visual Kanban board with deadlines and progress.',
    features: [
      '4-column Kanban — Planning, In Progress, Review, Done',
      'Deadline tracking with overdue alerts',
      'Progress percentage tracking',
      'One-click status moves between columns',
      'Project start date and deadline',
      'Client assignment per project',
    ],
  },
  {
    icon: BarChart3,
    title: 'BI Dashboard + Charts',
    color: '#8B5CF6',
    bg: '#EDE9FE',
    badge: '🆕 New',
    desc: 'Live business intelligence charts across all modules. Revenue trends, pipeline health, payroll overview.',
    features: [
      'Revenue trend line chart by month',
      'Lead pipeline bar chart by status',
      'Invoice status pie chart',
      'Inventory stock level bar chart',
      'Payroll breakdown by department',
      'Project completion rate chart',
      'Reads live data from all modules',
    ],
  },
  {
    icon: TrendingUp,
    title: 'Reports & Analytics',
    color: '#34D399',
    bg: '#D1FAE5',
    badge: null,
    desc: 'Generate tax reports, monthly breakdowns, and revenue analytics across all modules.',
    features: [
      'GST / VAT / HST tax reports',
      'Monthly revenue summaries',
      'Tax collected by rate breakdown',
      'Paid vs unpaid vs overdue breakdown',
      'HR and payroll reports',
      'Export all reports to CSV',
    ],
  },
  {
    icon: Brain,
    title: 'AI Business Intelligence',
    color: '#FBBF24',
    bg: '#FEF3C7',
    badge: 'Complete plan',
    desc: 'Ask your AI assistant anything about your business. It reads your live data and gives real answers.',
    features: [
      'Reads your live data in real-time',
      'Analyzes leads, invoices, inventory, HR, projects',
      'Gives specific answers using your actual numbers',
      'Quick question buttons for common queries',
      'Floating AI bubble available on every page',
      'Powered by Groq AI — lightning fast',
    ],
  },
  {
    icon: Globe,
    title: 'Import Any CSV Format',
    color: '#F472B6',
    bg: '#FCE7F3',
    badge: null,
    desc: 'Migrate from any existing ERP or spreadsheet without renaming a single column.',
    features: [
      'Accepts any CSV column naming convention',
      'Every column preserved exactly as-is',
      'Every row imported — zero loss',
      'No field mapping required',
      'Works with exports from any software',
      'Source tracking — know where data came from',
      'Batch import hundreds of records',
    ],
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
            <Link href="/features" className="text-sm font-medium" style={{ color: '#8B5CF6' }}>Features</Link>
            {[['Pricing', '/pricing'], ['About', '/about'], ['Contact', '/contact']].map(([l, h]) => (
              <Link key={h} href={h}
                className="text-sm font-medium hover:text-violet-600 transition-colors"
                style={{ color: '#64748B' }}>{l}</Link>
            ))}
          </div>
          <Link href="/signup"
            className="px-5 py-2 rounded-full text-sm font-black text-white transition-all hover:opacity-90"
            style={{ background: '#8B5CF6', border: '2px solid #1E293B', boxShadow: '3px 3px 0px #1E293B' }}>
            Start Trial
          </Link>
        </div>
      </nav>

      {/* HEADER */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-semibold"
            style={{ background: '#EDE9FE', border: '2px solid #8B5CF6', color: '#8B5CF6' }}>
            <Zap size={14} /> 12 powerful modules — 4 just added
          </div>
          <h1 className="text-5xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Everything your business
            <br />
            <span style={{ color: '#8B5CF6' }}>needs to grow</span>
          </h1>
          <p className="text-lg" style={{ color: '#64748B' }}>
            CRM, Quotations, Invoicing, Recurring Billing, Inventory, HR, Recruiting, Projects, BI Charts, AI Intelligence, Reports, and Universal Import. All in one adaptive workspace.
          </p>
        </div>
      </section>

      {/* NEW FEATURES HIGHLIGHT */}
      <section className="px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="p-6 rounded-2xl mb-10"
            style={{ background: '#0F172A', border: '2px solid #334155' }}>
            <p className="text-sm font-black mb-4" style={{ color: '#8B5CF6' }}>🆕 JUST ADDED</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: FileCheck, title: 'Sales Quotations', desc: 'Quote builder + PDF + convert to invoice', color: '#34D399' },
                { icon: BarChart3, title: 'BI Dashboard', desc: 'Live charts across all modules', color: '#8B5CF6' },
                { icon: RefreshCw, title: 'Recurring Invoices', desc: 'Auto-invoice on any schedule', color: '#F472B6' },
                { icon: UserPlus, title: 'Recruiting Tracker', desc: 'Applied to Hired pipeline', color: '#FBBF24' },
              ].map(f => (
                <div key={f.title} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${f.color}20`, border: `1.5px solid ${f.color}` }}>
                    <f.icon size={16} style={{ color: f.color }} />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm" style={{ fontFamily: 'Outfit' }}>{f.title}</p>
                    <p className="text-xs" style={{ color: '#64748B' }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto space-y-8">
          {MODULES.map(mod => (
            <div key={mod.title}
              className="rounded-2xl overflow-hidden"
              style={{ border: '2px solid #E2E8F0', background: 'white', boxShadow: '6px 6px 0px #F1F5F9' }}>
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: mod.bg, border: `2px solid ${mod.color}` }}>
                      <mod.icon size={24} style={{ color: mod.color }} />
                    </div>
                    {mod.badge && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{
                          background: mod.badge === '🆕 New' ? '#D1FAE5' : '#FEF3C7',
                          color: mod.badge === '🆕 New' ? '#065F46' : '#92400E',
                        }}>
                        {mod.badge}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-black mb-3" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
                    {mod.title}
                  </h2>
                  <p className="mb-4" style={{ color: '#64748B' }}>{mod.desc}</p>
                  <Link href="/signup"
                    className="inline-flex items-center gap-2 text-sm font-bold hover:opacity-80 transition-opacity"
                    style={{ color: mod.color }}>
                    Try it free <ArrowRight size={16} />
                  </Link>
                </div>
                <div className="p-8 border-t md:border-t-0 md:border-l border-gray-100">
                  <p className="text-xs font-bold uppercase tracking-wide mb-4" style={{ color: '#94A3B8' }}>
                    What is included
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
          <h2 className="text-3xl font-black mb-8" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Enterprise-grade security
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'SSL Encrypted', desc: 'All data in transit' },
              { label: 'Supabase Auth', desc: 'Enterprise authentication' },
              { label: 'Rate Limited', desc: '5 attempts max lockout' },
              { label: 'Session Timeout', desc: '30 min auto logout' },
            ].map(s => (
              <div key={s.label} className="p-4 rounded-2xl"
                style={{ background: 'white', border: '2px solid #E2E8F0' }}>
                <p className="font-bold text-sm mb-1" style={{ color: '#1E293B', fontFamily: 'Outfit' }}>
                  ✅ {s.label}
                </p>
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
        <p className="text-lg mb-8" style={{ color: '#94A3B8' }}>
          Set up your ERP in 5 minutes. No configuration. No consultants. No field mapping.
        </p>
        <Link href="/signup"
          className="px-10 py-5 text-xl rounded-full font-black text-white inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
          style={{ background: '#8B5CF6', border: '2px solid white', boxShadow: '4px 4px 0px rgba(255,255,255,0.3)' }}>
          Start Trial <ArrowRight size={20} />
        </Link>
      </section>

    </div>
  )
}
