import Link from 'next/link'
import { ArrowRight, Users, FileText, Package, UserCheck, FolderOpen, BarChart3, Zap, Star } from 'lucide-react'

const services = [
  {
    icon: Users,
    title: 'CRM & Lead Management',
    desc: 'Capture leads from any source, score them with AI, track every interaction, and never miss a follow-up. Pipeline automation turns converted leads into invoices automatically.',
    features: ['AI Lead Scoring 0-100', 'Kanban Pipeline View', 'Follow-up Reminders', 'WhatsApp Integration', 'CSV Export'],
    color: '#8B5CF6', bg: '#EDE9FE', emoji: '👥',
  },
  {
    icon: FileText,
    title: 'GST Invoicing & Payments',
    desc: 'Create professional GST-compliant invoices in seconds. Accept payments via Stripe or UPI. Send invoices directly to clients via WhatsApp with one click.',
    features: ['GST 5% 12% 18% 28%', 'Stripe Payment Integration', 'WhatsApp Invoice Sending', 'PDF Download', 'Overdue Tracking'],
    color: '#F472B6', bg: '#FCE7F3', emoji: '📄',
  },
  {
    icon: Package,
    title: 'Inventory with Free QR Codes',
    desc: 'Track all products with auto-generated QR codes. Get instant alerts when stock falls below reorder levels. Every product gets a scannable QR code — free forever.',
    features: ['Auto QR Code Generation', 'Low Stock Alerts', 'Supplier Management', 'Stock Movement Tracking', 'CSV Export'],
    color: '#FBBF24', bg: '#FEF3C7', emoji: '📦',
  },
  {
    icon: UserCheck,
    title: 'HR & Payroll',
    desc: 'Manage your entire team from one place. Track attendance, process payroll, manage leave requests, and generate payslips without any external software.',
    features: ['Employee Management', 'Attendance Tracking', 'Payroll Calculator', 'Leave Management', 'Payslip Generation'],
    color: '#34D399', bg: '#D1FAE5', emoji: '👔',
  },
  {
    icon: FolderOpen,
    title: 'Project Management',
    desc: 'Beautiful Kanban board to track all your projects from Planning to Done. Add tasks, assign team members, track progress, and never miss a deadline.',
    features: ['Kanban Board', 'Task Management', 'Deadline Tracking', 'Progress Percentage', 'Team Assignment'],
    color: '#8B5CF6', bg: '#EDE9FE', emoji: '🎯',
  },
  {
    icon: BarChart3,
    title: 'GST Reports & Analytics',
    desc: 'Automatic GSTR-1 format reports with full tax breakdown by rate. Monthly summaries, trend charts, and one-click CSV export ready for your CA.',
    features: ['GSTR-1 Format', 'Monthly Breakdown', 'Tax Rate Analysis', 'PDF Export', 'CA-Ready Reports'],
    color: '#F472B6', bg: '#FCE7F3', emoji: '📊',
  },
]

export default function Services() {
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
        <div className="absolute top-10 right-10 w-48 h-48 rounded-full opacity-20 float" style={{ background: '#F472B6' }}></div>
        <div className="absolute bottom-0 left-20 w-32 h-32 rotate-45 opacity-10" style={{ background: '#FBBF24' }}></div>

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-semibold" style={{ background: '#FCE7F3', border: '2px solid #F472B6', color: '#F472B6' }}>
            <Zap size={14} /> What We Offer
          </div>
          <h1 className="text-5xl lg:text-6xl font-black mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Six modules.<br />
            <span style={{ color: '#F472B6' }}>One powerful platform.</span>
          </h1>
          <p className="text-xl leading-relaxed" style={{ color: '#64748B', fontFamily: 'Plus Jakarta Sans' }}>
            Everything your business needs to operate efficiently — CRM, invoicing, inventory, HR, projects, and GST reports — unified in one beautiful workspace.
          </p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {services.map((s, i) => (
            <div key={s.title} className="sticker-card p-8">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl wiggle" style={{ background: s.bg, border: `2px solid ${s.color}`, boxShadow: `4px 4px 0px ${s.color}` }}>
                    {s.emoji}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-black mb-3" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>{s.title}</h3>
                  <p className="leading-relaxed mb-6" style={{ color: '#64748B', fontFamily: 'Plus Jakarta Sans' }}>{s.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {s.features.map(f => (
                      <span key={f} className="px-3 py-1 rounded-full text-sm font-semibold" style={{ background: s.bg, color: s.color, border: `1.5px solid ${s.color}`, fontFamily: 'Plus Jakarta Sans' }}>
                        ✓ {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 px-6" style={{ background: '#1E293B' }}>
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-5xl mb-6 float">💎</div>
          <h2 className="text-4xl font-black text-white mb-6" style={{ fontFamily: 'Outfit' }}>All six modules included in every plan</h2>
          <p className="text-white/70 mb-8" style={{ fontFamily: 'Plus Jakarta Sans' }}>No per-module pricing. No hidden fees. Get everything from day one.</p>
          <Link href="/signup" className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg" style={{ background: '#8B5CF6', color: 'white', border: '2px solid #8B5CF6', boxShadow: '4px 4px 0px #FBBF24', fontFamily: 'Outfit' }}>
            Start Free Trial <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  )
}
