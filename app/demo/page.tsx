'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Brain, Users, FileText, Package, UserCheck, FolderOpen, BarChart3, ArrowRight, Star } from 'lucide-react'

const DEMO_DATA = {
  leads: [
    { Name: 'Rahul Sharma', Company: 'TechVista Pvt Ltd', Email: 'rahul@techvista.in', Phone: '+91 9876543210', 'Lead Source': 'Referral', Status: 'Contacted', 'Deal Value': 85000, Notes: 'Interested in Business plan. Has 15 employees.' },
    { Name: 'Priya Mehta', Company: 'Mehta Traders', Email: 'priya@mehtatraders.com', Phone: '+91 9123456789', 'Lead Source': 'Website', Status: 'New', 'Deal Value': 45000, Notes: 'Retail chain needs inventory management.' },
    { Name: 'Amit Patel', Company: 'Patel Enterprises', Email: 'amit@patelent.in', Phone: '+91 9988776655', 'Lead Source': 'LinkedIn', Status: 'Converted', 'Deal Value': 120000, Notes: 'Signed up for Complete plan.' },
    { Name: 'Sneha Reddy', Company: 'CloudSoft Solutions', Email: 'sneha@cloudsoft.io', Phone: '+91 8877665544', 'Lead Source': 'LinkedIn', Status: 'Contacted', 'Deal Value': 95000, Notes: 'SaaS startup needs CRM and project tracking.' },
    { Name: 'Vikram Singh', Company: 'Singh Manufacturing', Email: 'vikram@singhmnfg.com', Phone: '+91 7766554433', 'Lead Source': 'Trade Show', Status: 'New', 'Deal Value': 200000, Notes: 'Large manufacturer needs full ERP.' },
    { Name: 'James Wilson', Company: 'BizFlow UK', Email: 'james@bizflow.co.uk', Phone: '+44 7911123456', 'Lead Source': 'Website', Status: 'New', 'Deal Value': 180000, Notes: 'UK software company wants white label.' },
    { Name: 'Sarah Johnson', Company: 'Johnson Retail USA', Email: 'sarah@johnsonretail.com', Phone: '+1 4155552671', 'Lead Source': 'LinkedIn', Status: 'Contacted', 'Deal Value': 220000, Notes: 'US retail chain. Needs inventory module.' },
    { Name: 'Ananya Joshi', Company: 'Joshi Pharmacy', Email: 'ananya@joshipharma.in', Phone: '+91 9900112233', 'Lead Source': 'Website', Status: 'Contacted', 'Deal Value': 75000, Notes: 'Pharmacy chain. Needs invoicing.' },
    { Name: 'Mohammed Al-Rashid', Company: 'Al-Rashid Trading', Email: 'm.rashid@alrashid.ae', Phone: '+971 501234567', 'Lead Source': 'Referral', Status: 'New', 'Deal Value': 300000, Notes: 'Dubai trading company. Full ERP needed.' },
    { Name: 'Deepa Nair', Company: 'Nair Consultants', Email: 'deepa@nairconsult.in', Phone: '+91 6655443322', 'Lead Source': 'Referral', Status: 'Converted', 'Deal Value': 60000, Notes: 'CRM Starter plan signed up.' },
  ],
  invoices: [
    { 'Client Name': 'TechVista Pvt Ltd', 'Invoice No': 'INV-001', Amount: 85000, 'Tax Label': 'GST', 'Tax Rate': 18, 'Tax Amount': 15300, Total: 100300, Status: 'Paid', 'Issue Date': '2026-05-01' },
    { 'Client Name': 'Mehta Traders', 'Invoice No': 'INV-002', Amount: 45000, 'Tax Label': 'GST', 'Tax Rate': 12, 'Tax Amount': 5400, Total: 50400, Status: 'Unpaid', 'Issue Date': '2026-05-05' },
    { 'Client Name': 'Patel Enterprises', 'Invoice No': 'INV-003', Amount: 120000, 'Tax Label': 'GST', 'Tax Rate': 18, 'Tax Amount': 21600, Total: 141600, Status: 'Paid', 'Issue Date': '2026-05-10' },
    { 'Client Name': 'CloudSoft Solutions', 'Invoice No': 'INV-004', Amount: 95000, 'Tax Label': 'GST', 'Tax Rate': 18, 'Tax Amount': 17100, Total: 112100, Status: 'Unpaid', 'Issue Date': '2026-05-12' },
    { 'Client Name': 'Singh Manufacturing', 'Invoice No': 'INV-005', Amount: 200000, 'Tax Label': 'GST', 'Tax Rate': 18, 'Tax Amount': 36000, Total: 236000, Status: 'Paid', 'Issue Date': '2026-04-15' },
    { 'Client Name': 'BizFlow UK', 'Invoice No': 'INV-006', Amount: 1200, 'Tax Label': 'VAT', 'Tax Rate': 20, 'Tax Amount': 240, Total: 1440, Status: 'Paid', 'Issue Date': '2026-05-15' },
    { 'Client Name': 'Johnson Retail', 'Invoice No': 'INV-007', Amount: 1800, 'Tax Label': 'Tax', 'Tax Rate': 8, 'Tax Amount': 144, Total: 1944, Status: 'Paid', 'Issue Date': '2026-05-18' },
    { 'Client Name': 'Joshi Pharmacy', 'Invoice No': 'INV-008', Amount: 75000, 'Tax Label': 'GST', 'Tax Rate': 18, 'Tax Amount': 13500, Total: 88500, Status: 'Overdue', 'Issue Date': '2026-04-25' },
    { 'Client Name': 'Al-Rashid Trading', 'Invoice No': 'INV-009', Amount: 5000, 'Tax Label': 'VAT', 'Tax Rate': 5, 'Tax Amount': 250, Total: 5250, Status: 'Unpaid', 'Issue Date': '2026-05-20' },
    { 'Client Name': 'Nair Consultants', 'Invoice No': 'INV-010', Amount: 60000, 'Tax Label': 'GST', 'Tax Rate': 12, 'Tax Amount': 7200, Total: 67200, Status: 'Paid', 'Issue Date': '2026-05-20' },
  ],
}

export default function Demo() {
  const router = useRouter()
  const [step, setStep] = useState<'loading' | 'preview' | 'entering'>('loading')
  const [aiMessage, setAiMessage] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const totalRevenue = DEMO_DATA.invoices
    .filter(i => i.Status === 'Paid')
    .reduce((s, i) => s + i.Total, 0)

  const pipelineValue = DEMO_DATA.leads
    .reduce((s, l) => s + l['Deal Value'], 0)

  const convertedLeads = DEMO_DATA.leads.filter(l => l.Status === 'Converted').length

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      // Give Complete plan for demo
      await supabase.auth.updateUser({
        data: { plan: 'Complete', is_demo: true }
      })
      setStep('preview')

      // Get AI welcome
      setAiLoading(true)
      try {
        const res = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: 'Give me a quick exciting summary of this demo business data and what opportunities I should focus on',
            context: {
              totalLeads: DEMO_DATA.leads.length,
              convertedLeads,
              totalRevenue,
              pipelineValue,
              overdueInvoices: DEMO_DATA.invoices.filter(i => i.Status === 'Overdue').length,
              topLead: 'Al-Rashid Trading — ₹3,00,000 deal',
            },
            isOnboarding: false,
          }),
        })
        const data = await res.json()
        setAiMessage(data.reply || '')
      } catch (e) {
        setAiMessage('🚀 Your demo data shows strong pipeline value of ₹13.8 lakhs with 2 converted clients already! Focus on Al-Rashid Trading and Johnson Retail — they are your biggest opportunities.')
      }
      setAiLoading(false)
    }
    check()
  }, [router])

  const enterDemo = async () => {
    setStep('entering')
    router.push('/dashboard')
  }

  if (step === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFFDF5' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent mx-auto mb-4"></div>
          <p className="font-black text-xl" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>Setting up demo...</p>
        </div>
      </div>
    )
  }

  if (step === 'entering') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFFDF5' }}>
        <div className="text-center">
          <div className="text-6xl mb-4 float">🚀</div>
          <p className="font-black text-xl" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>Launching dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: '#FFFDF5' }}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 text-sm font-semibold"
            style={{ background: '#EDE9FE', border: '2px solid #8B5CF6', color: '#8B5CF6' }}>
            <Star size={14} fill="#8B5CF6" /> Samyojak Live Demo
          </div>
          <h1 className="text-4xl font-black mb-2" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            See Samyojak in action
          </h1>
          <p style={{ color: '#64748B', fontFamily: 'Plus Jakarta Sans' }}>
            Complete plan unlocked · All modules active · Real AI insights
          </p>
        </div>

        {/* AI Insight Card */}
        <div className="p-6 rounded-2xl mb-6"
          style={{ background: '#0F172A', border: '2px solid #334155', boxShadow: '8px 8px 0px #8B5CF6' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#8B5CF6' }}>
              <Brain size={20} className="text-white" />
            </div>
            <div>
              <p className="font-black text-white" style={{ fontFamily: 'Outfit' }}>Samyojak AI Analysis</p>
              <p className="text-xs" style={{ color: '#64748B' }}>Powered by Groq · Real insights from demo data</p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span className="text-xs text-green-400">Live</span>
            </div>
          </div>
          {aiLoading ? (
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <span className="text-xs" style={{ color: '#64748B' }}>AI analyzing your data...</span>
            </div>
          ) : (
            <p className="text-sm leading-relaxed" style={{ color: '#C4B5FD', fontFamily: 'Plus Jakarta Sans' }}>
              {aiMessage}
            </p>
          )}
        </div>

        {/* Demo Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Leads', value: DEMO_DATA.leads.length, icon: Users, color: '#8B5CF6', bg: '#EDE9FE', note: `${convertedLeads} converted` },
            { label: 'Revenue', value: `₹${(totalRevenue / 100000).toFixed(1)}L`, icon: FileText, color: '#34D399', bg: '#D1FAE5', note: 'paid invoices' },
            { label: 'Pipeline', value: `₹${(pipelineValue / 100000).toFixed(1)}L`, icon: BarChart3, color: '#FBBF24', bg: '#FEF3C7', note: 'total value' },
            { label: 'Invoices', value: DEMO_DATA.invoices.length, icon: Package, color: '#F472B6', bg: '#FCE7F3', note: '7 paid' },
          ].map(m => (
            <div key={m.label} className="p-4 rounded-2xl"
              style={{ background: 'white', border: '2px solid #1E293B', boxShadow: '4px 4px 0px #E2E8F0' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: m.bg, border: `2px solid ${m.color}` }}>
                <m.icon size={18} style={{ color: m.color }} />
              </div>
              <p className="text-xs text-gray-500 mb-1">{m.label}</p>
              <p className="text-2xl font-black" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>{m.value}</p>
              <p className="text-xs mt-1" style={{ color: m.color }}>{m.note}</p>
            </div>
          ))}
        </div>

        {/* What You Will See */}
        <div className="p-6 rounded-2xl mb-6"
          style={{ background: 'white', border: '2px solid #1E293B', boxShadow: '6px 6px 0px #E2E8F0' }}>
          <h3 className="font-black text-lg mb-4" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            What is included in this demo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { icon: Users, label: 'CRM with 10 sample leads', desc: 'AI scored, pipeline tracked', color: '#8B5CF6' },
              { icon: FileText, label: 'Invoices with universal tax', desc: 'GST, VAT, Sales Tax examples', color: '#F472B6' },
              { icon: Package, label: 'Inventory with QR codes', desc: '10 products, low stock alerts', color: '#FBBF24' },
              { icon: UserCheck, label: 'HR with team members', desc: '10 employees, departments', color: '#34D399' },
              { icon: FolderOpen, label: 'Projects on Kanban board', desc: '10 projects in progress', color: '#8B5CF6' },
              { icon: Brain, label: 'AI Business Assistant', desc: 'Ask anything about your data', color: '#F472B6' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: item.color + '20', border: `1.5px solid ${item.color}` }}>
                  <item.icon size={16} style={{ color: item.color }} />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: '#1E293B', fontFamily: 'Outfit' }}>{item.label}</p>
                  <p className="text-xs" style={{ color: '#64748B' }}>{item.desc}</p>
                </div>
                <div className="ml-auto text-xs font-bold px-2 py-1 rounded-full"
                  style={{ background: '#D1FAE5', color: '#065F46' }}>
                  ✓ Live
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leads Preview */}
        <div className="p-6 rounded-2xl mb-6"
          style={{ background: 'white', border: '2px solid #1E293B', boxShadow: '6px 6px 0px #F472B6' }}>
          <h3 className="font-black text-lg mb-4" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            👥 Sample CRM Leads
          </h3>
          <div className="space-y-2 overflow-hidden max-h-64 overflow-y-auto">
            {DEMO_DATA.leads.map((lead, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: ['#8B5CF6', '#F472B6', '#34D399', '#FBBF24'][i % 4] }}>
                  {lead.Name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: '#1E293B' }}>{lead.Name}</p>
                  <p className="text-xs truncate" style={{ color: '#64748B' }}>{lead.Company}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold" style={{ color: '#1E293B' }}>₹{lead['Deal Value'].toLocaleString()}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    lead.Status === 'Converted' ? 'bg-green-100 text-green-700' :
                    lead.Status === 'Contacted' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {lead.Status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enter Demo Button */}
        <div className="text-center">
          <button
            onClick={enterDemo}
            className="candy-btn px-12 py-5 text-xl inline-flex items-center gap-3"
          >
            Enter Full Demo Dashboard
            <ArrowRight size={24} />
          </button>
          <p className="mt-4 text-sm" style={{ color: '#94A3B8' }}>
            Complete plan active · All modules unlocked · AI assistant ready
          </p>
        </div>
      </div>
    </div>
  )
}
