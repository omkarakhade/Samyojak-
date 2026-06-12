'use client'
import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'
import { Send, CheckCircle, AlertCircle, Clock, HelpCircle } from 'lucide-react'

const CATEGORIES = [
  'CRM & Leads',
  'Invoicing & Payments',
  'Inventory & QR Codes',
  'HR & Employees',
  'Projects',
  'GST Reports',
  'Account & Billing',
  'AI Features',
  'Technical Issue',
  'Other',
]

const PRIORITIES = [
  { value: 'Low', label: 'Low', desc: 'General question or feedback', color: '#34D399', bg: '#D1FAE5' },
  { value: 'Medium', label: 'Medium', desc: 'Feature not working as expected', color: '#FBBF24', bg: '#FEF3C7' },
  { value: 'High', label: 'High', desc: 'Business operations blocked', color: '#EF4444', bg: '#FEE2E2' },
]

export default function Support() {
  const [form, setForm] = useState({
    subject: '',
    category: 'Technical Issue',
    priority: 'Medium',
    message: '',
  })
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [ticketId, setTicketId] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email || '')
        setUserName(user.user_metadata?.full_name || '')
      }
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.message.trim() || !form.subject.trim()) {
      setError('Please fill in subject and message.')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          userEmail,
          userName,
        }),
      })
      const data = await res.json()

      if (data.success) {
        setSent(true)
        setTicketId(data.ticketId || 'TKT-' + Date.now())
      } else {
        setError(data.error || 'Failed to send. Try emailing samyojak@gmail.com directly.')
      }
    } catch (e: any) {
      setError('Network error. Please email samyojak@gmail.com directly.')
    }
    setLoading(false)
  }

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl">

        <div>
          <h2 className="text-2xl font-black" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
            Support Center 🎯
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            We respond within 24 hours · Email: samyojak@gmail.com
          </p>
        </div>

        {/* Quick Help Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: HelpCircle, title: 'Documentation', desc: 'Browse help articles', color: '#8B5CF6', bg: '#EDE9FE', action: 'View Docs' },
            { icon: Clock, title: 'Response Time', desc: 'Usually under 24 hours', color: '#34D399', bg: '#D1FAE5', action: '24h SLA' },
            { icon: AlertCircle, title: 'Emergency', desc: 'Email us directly', color: '#F472B6', bg: '#FCE7F3', action: 'samyojak@gmail.com' },
          ].map(item => (
            <div key={item.title} className="p-4 rounded-2xl"
              style={{ background: item.bg, border: `2px solid ${item.color}` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: 'white', border: `2px solid ${item.color}` }}>
                <item.icon size={20} style={{ color: item.color }} />
              </div>
              <h3 className="font-black text-sm mb-1" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
                {item.title}
              </h3>
              <p className="text-xs mb-2" style={{ color: '#64748B' }}>{item.desc}</p>
              <p className="text-xs font-bold" style={{ color: item.color }}>{item.action}</p>
            </div>
          ))}
        </div>

        {/* Ticket Form */}
        {sent ? (
          <div className="p-8 rounded-2xl text-center"
            style={{ background: 'white', border: '2px solid #1E293B', boxShadow: '8px 8px 0px #34D399' }}>
            <div className="text-6xl mb-4 float">✅</div>
            <h3 className="text-2xl font-black mb-3" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
              Ticket Submitted!
            </h3>
            <p className="text-gray-500 mb-2">
              Your support ticket has been received and sent to our team.
            </p>
            <p className="text-sm font-bold mb-6" style={{ color: '#8B5CF6' }}>
              Ticket ID: {ticketId}
            </p>
            <p className="text-sm text-gray-400 mb-6">
              We will reply to <strong>{userEmail}</strong> within 24 hours.
            </p>
            <button
              onClick={() => { setSent(false); setForm({ subject: '', category: 'Technical Issue', priority: 'Medium', message: '' }) }}
              className="outline-btn px-6 py-2 text-sm"
            >
              Submit Another Ticket
            </button>
          </div>
        ) : (
          <div className="p-6 rounded-2xl"
            style={{ background: 'white', border: '2px solid #1E293B', boxShadow: '6px 6px 0px #E2E8F0' }}>
            <h3 className="font-black text-lg mb-6" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
              Submit a Support Ticket
            </h3>

            {error && (
              <div className="p-4 rounded-xl mb-4"
                style={{ background: '#FEE2E2', border: '2px solid #FCA5A5' }}>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-2"
                  style={{ color: '#1E293B', fontFamily: 'Outfit' }}>
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Brief description of your issue"
                  value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                  style={{ border: '2px solid #CBD5E1', fontFamily: 'Plus Jakarta Sans', color: '#1E293B' }}
                  onFocus={e => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '4px 4px 0px #8B5CF6' }}
                  onBlur={e => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = 'none' }}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-2"
                  style={{ color: '#1E293B', fontFamily: 'Outfit' }}>
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={{ border: '2px solid #CBD5E1', fontFamily: 'Plus Jakarta Sans', color: '#1E293B' }}
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-2"
                  style={{ color: '#1E293B', fontFamily: 'Outfit' }}>
                  Priority
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {PRIORITIES.map(p => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setForm({ ...form, priority: p.value })}
                      className="p-3 rounded-xl text-left transition-all"
                      style={{
                        background: form.priority === p.value ? p.bg : '#F8FAFC',
                        border: `2px solid ${form.priority === p.value ? p.color : '#E2E8F0'}`,
                      }}
                    >
                      <p className="text-xs font-black mb-1"
                        style={{ color: form.priority === p.value ? p.color : '#1E293B', fontFamily: 'Outfit' }}>
                        {p.label}
                      </p>
                      <p className="text-xs" style={{ color: '#64748B' }}>{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-2"
                  style={{ color: '#1E293B', fontFamily: 'Outfit' }}>
                  Describe Your Issue *
                </label>
                <textarea
                  required
                  placeholder="Please describe what happened, what you expected, and what steps you took..."
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl outline-none resize-none transition-all"
                  style={{ border: '2px solid #CBD5E1', fontFamily: 'Plus Jakarta Sans', color: '#1E293B' }}
                  onFocus={e => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '4px 4px 0px #8B5CF6' }}
                  onBlur={e => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = 'none' }}
                />
              </div>

              {/* From Info */}
              <div className="p-3 rounded-xl"
                style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0' }}>
                <p className="text-xs" style={{ color: '#64748B', fontFamily: 'Plus Jakarta Sans' }}>
                  Submitting as: <strong style={{ color: '#1E293B' }}>{userName || 'You'}</strong>
                  {' · '}
                  Reply to: <strong style={{ color: '#1E293B' }}>{userEmail}</strong>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="candy-btn w-full py-4 flex items-center justify-center gap-3 text-base disabled:opacity-50"
              >
                {loading ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Submitting...</>
                ) : (
                  <><Send size={20} /> Submit Ticket</>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </Layout>
  )
}
