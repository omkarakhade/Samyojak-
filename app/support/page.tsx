'use client'
import React, { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'
import { airtable } from '@/lib/airtable'
import { Plus, AlertCircle, RefreshCw, Check, Mail, MessageSquare, Zap } from 'lucide-react'
import UniversalDataView from '@/components/UniversalDataView'

const PRIORITY_COLORS: Record<string, { bg: string; color: string }> = {
  Low: { bg: '#F1F5F9', color: '#64748B' },
  Medium: { bg: '#FEF3C7', color: '#92400E' },
  High: { bg: '#FEE2E2', color: '#DC2626' },
  Emergency: { bg: '#450a0a', color: '#FCA5A5' },
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Open: { bg: '#EDE9FE', color: '#8B5CF6' },
  'In Progress': { bg: '#FEF3C7', color: '#92400E' },
  Resolved: { bg: '#D1FAE5', color: '#065F46' },
  Closed: { bg: '#F1F5F9', color: '#64748B' },
}

const CORRECT_EMAIL = 'hello.samyojak@gmail.com'

export default function Support() {
  const [userId, setUserId] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [form, setForm] = useState({
    subject: '',
    description: '',
    priority: 'Medium',
    category: 'General',
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id)
        setUserEmail(user.email || '')
      }
    })
  }, [])

  const fetchTickets = async () => {
    setLoading(true)
    setError('')
    try {
      const d = await airtable.get('Support_Tickets')
      setTickets(d.records || [])
    } catch (e: any) {
      setError('Could not load tickets: ' + e.message)
    }
    setLoading(false)
  }

  useEffect(() => { fetchTickets() }, [refreshKey])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.subject.trim()) { setError('Subject is required'); return }
    if (!form.description.trim()) { setError('Please describe your issue'); return }
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const fields: Record<string, unknown> = {
        Subject: form.subject.trim(),
        Description: form.description.trim(),
        Priority: form.priority,
        Category: form.category,
        Status: 'Open',
        'User Email': userEmail,
        'User ID': userId,
        'Created At': new Date().toISOString().split('T')[0],
      }
      await airtable.create('Support_Tickets', fields)
      setSuccess('Ticket submitted successfully! We will respond to ' + userEmail + ' within 24 hours.')
      setShowModal(false)
      setForm({ subject: '', description: '', priority: 'Medium', category: 'General' })
      setRefreshKey(k => k + 1)
    } catch (e: any) {
      setError('Failed to submit ticket: ' + e.message)
    }
    setSaving(false)
  }

  const myTickets = tickets.filter(t =>
    t.fields?.['User Email'] === userEmail ||
    t.fields?.['User ID'] === userId
  )

  return (
    <Layout>
      <div className="space-y-5 max-w-3xl">

        {error && (
          <div className="p-4 rounded-xl flex items-center gap-2 text-sm"
            style={{ background: '#FEE2E2', border: '1.5px solid #FCA5A5', color: '#DC2626' }}>
            <AlertCircle size={16} className="flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError('')}>✕</button>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl flex items-center gap-2 text-sm"
            style={{ background: '#D1FAE5', border: '1.5px solid #34D399', color: '#065F46' }}>
            <Check size={16} className="flex-shrink-0" />
            <span className="flex-1">{success}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>
              Support
            </h2>
            <p className="text-gray-500 text-sm">
              {myTickets.length} ticket{myTickets.length !== 1 ? 's' : ''} · We respond within 24 hours
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setRefreshKey(k => k + 1)}
              className="p-2 border border-gray-300 dark:border-white/20 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
              <RefreshCw size={16} className="text-gray-500 dark:text-gray-400" />
            </button>
            <button
              onClick={() => { setShowModal(true); setError(''); setSuccess('') }}
              className="candy-btn flex items-center gap-2 px-4 py-2 text-sm">
              <Plus size={16} /> New Ticket
            </button>
          </div>
        </div>

        {/* Emergency contact card — CORRECT EMAIL */}
        <div className="p-5 rounded-2xl"
          style={{ background: '#0F172A', border: '2px solid #334155' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#EDE9FE' }}>
                <MessageSquare size={18} style={{ color: '#8B5CF6' }} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                  Standard Support
                </p>
                <p className="text-sm font-bold text-white">Submit a ticket</p>
                <p className="text-xs text-gray-400">Response within 24 hours</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#D1FAE5' }}>
                <Mail size={18} style={{ color: '#34D399' }} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                  Email Support
                </p>
                <a href={`mailto:${CORRECT_EMAIL}`}
                  className="text-sm font-bold hover:opacity-80 transition-opacity"
                  style={{ color: '#34D399' }}>
                  {CORRECT_EMAIL}
                </a>
                <p className="text-xs text-gray-400">For billing and account issues</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#FEE2E2' }}>
                <Zap size={18} style={{ color: '#EF4444' }} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                  🚨 Emergency Contact
                </p>
                <a href={`mailto:${CORRECT_EMAIL}?subject=EMERGENCY`}
                  className="text-sm font-bold hover:opacity-80 transition-opacity"
                  style={{ color: '#EF4444' }}>
                  {CORRECT_EMAIL}
                </a>
                <p className="text-xs text-gray-400">Mark subject line: EMERGENCY</p>
              </div>
            </div>
          </div>
        </div>

        {/* My tickets */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-violet-500"></div>
          </div>
        ) : myTickets.length === 0 ? (
          <div className="text-center py-14 bg-white dark:bg-[#1a2740] rounded-2xl"
            style={{ border: '2px solid #E2E8F0' }}>
            <div className="text-5xl mb-4">🎫</div>
            <h3 className="font-bold dark:text-white text-lg mb-2" style={{ fontFamily: 'Outfit' }}>
              No support tickets yet
            </h3>
            <p className="text-gray-400 text-sm mb-5">
              Having an issue? Submit a ticket and we will help you.
            </p>
            <button onClick={() => setShowModal(true)} className="candy-btn px-6 py-2.5 text-sm">
              Submit First Ticket
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">
              Your Tickets
            </p>
            {myTickets.map(ticket => {
              const priority = ticket.fields?.Priority || 'Medium'
              const status = ticket.fields?.Status || 'Open'
              const pc = PRIORITY_COLORS[priority] || PRIORITY_COLORS.Medium
              const sc = STATUS_COLORS[status] || STATUS_COLORS.Open
              return (
                <div key={ticket.id}
                  className="bg-white dark:bg-[#1a2740] rounded-2xl p-5"
                  style={{ border: '2px solid #E2E8F0' }}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1 truncate"
                        style={{ fontFamily: 'Outfit' }}>
                        {ticket.fields?.Subject || 'No subject'}
                      </h4>
                      <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                        {ticket.fields?.Description || '—'}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                          style={{ background: pc.bg, color: pc.color }}>
                          {priority}
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                          style={{ background: sc.bg, color: sc.color }}>
                          {status}
                        </span>
                        {ticket.fields?.Category && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium"
                            style={{ background: '#F1F5F9', color: '#64748B' }}>
                            {ticket.fields.Category}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-400">
                        {ticket.fields?.['Created At'] || '—'}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* New Ticket Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              style={{ border: '2px solid #1E293B', boxShadow: '8px 8px 0px #8B5CF6' }}>

              <h3 className="font-black text-lg mb-1 dark:text-white" style={{ fontFamily: 'Outfit' }}>
                Submit Support Ticket
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                We will respond to <strong>{userEmail}</strong> within 24 hours
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1.5 dark:text-gray-300"
                    style={{ fontFamily: 'Outfit' }}>
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    placeholder="Brief description of the issue"
                    className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none dark:bg-white/5 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1.5 dark:text-gray-300"
                    style={{ fontFamily: 'Outfit' }}>
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-4 py-2.5 text-sm outline-none dark:bg-[#1a2740] dark:text-white">
                    {[
                      'General',
                      'Technical Issue',
                      'Billing',
                      'Import / Export',
                      'AI Assistant',
                      'Account Access',
                      'Feature Request',
                      'Bug Report',
                    ].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1.5 dark:text-gray-300"
                    style={{ fontFamily: 'Outfit' }}>
                    Priority
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['Low', 'Medium', 'High', 'Emergency'].map(p => {
                      const pc = PRIORITY_COLORS[p]
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setForm({ ...form, priority: p })}
                          className="py-2 rounded-xl text-xs font-bold transition-all"
                          style={{
                            background: form.priority === p ? pc.color : pc.bg,
                            color: form.priority === p ? 'white' : pc.color,
                            border: `2px solid ${pc.color}`,
                          }}>
                          {p}
                        </button>
                      )
                    })}
                  </div>
                  {form.priority === 'Emergency' && (
                    <div className="mt-2 p-3 rounded-xl text-xs"
                      style={{ background: '#FEE2E2', color: '#DC2626' }}>
                      🚨 For true emergencies, also email{' '}
                      <a href={`mailto:${CORRECT_EMAIL}?subject=EMERGENCY`}
                        className="font-bold underline">
                        {CORRECT_EMAIL}
                      </a>
                      {' '}with subject line: EMERGENCY
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1.5 dark:text-gray-300"
                    style={{ fontFamily: 'Outfit' }}>
                    Describe the issue *
                  </label>
                  <textarea
                    required
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={5}
                    placeholder="Please describe the issue in detail. Include what you were trying to do, what happened, and any error messages you saw."
                    className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-4 py-2.5 text-sm outline-none resize-none focus:ring-2 focus:ring-violet-500 dark:bg-white/5 dark:text-white"
                  />
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setError('') }}
                    className="flex-1 border border-gray-300 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="candy-btn flex-1 py-2.5 text-sm disabled:opacity-50">
                    {saving ? 'Submitting...' : 'Submit Ticket'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </Layout>
  )
}
