'use client'
import React, { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import LockedModule from '@/components/LockedModule'
import { supabase } from '@/lib/supabase'
import { getPlanFromMetadata, canAccessModuleSync } from '@/lib/planAccess'
import { Plus, AlertCircle, RefreshCw } from 'lucide-react'
import UniversalDataView from '@/components/UniversalDataView'

const STAGES = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected']

const STAGE_COLORS: Record<string, { bg: string; color: string }> = {
  Applied: { bg: '#F1F5F9', color: '#64748B' },
  Screening: { bg: '#EDE9FE', color: '#8B5CF6' },
  Interview: { bg: '#FEF3C7', color: '#92400E' },
  Offer: { bg: '#D1FAE5', color: '#065F46' },
  Hired: { bg: '#D1FAE5', color: '#059669' },
  Rejected: { bg: '#FEE2E2', color: '#DC2626' },
}

export default function Recruiting() {
  const [plan, setPlan] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  const [userId, setUserId] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [form, setForm] = useState({
    'Candidate Name': '',
    'Role': '',
    'Department': '',
    'Email': '',
    'Phone': '',
    'Stage': 'Applied',
    'Interview Date': '',
    'Resume Link': '',
    'Notes': '',
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setPlan(getPlanFromMetadata(user))
        setUserId(user.id)
        setChecking(false)
      }
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form['Candidate Name'].trim()) { setError('Candidate name is required'); return }
    setSaving(true)
    setError('')
    try {
      const record: Record<string, string> = {
        'Candidate Name': form['Candidate Name'].trim(),
        'Stage': form['Stage'],
        'Applied Date': new Date().toISOString().split('T')[0],
        Source: 'manual_entry',
      }
      if (form['Role'].trim()) record['Role'] = form['Role'].trim()
      if (form['Department'].trim()) record['Department'] = form['Department'].trim()
      if (form['Email'].trim()) record['Email'] = form['Email'].trim()
      if (form['Phone'].trim()) record['Phone'] = form['Phone'].trim()
      if (form['Interview Date']) record['Interview Date'] = form['Interview Date']
      if (form['Resume Link'].trim()) record['Resume Link'] = form['Resume Link'].trim()
      if (form['Notes'].trim()) record['Notes'] = form['Notes'].trim()

      const res = await fetch('/api/add-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, module: 'Recruiting', record }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Failed to save')

      setShowModal(false)
      setForm({ 'Candidate Name': '', 'Role': '', 'Department': '', 'Email': '', 'Phone': '', 'Stage': 'Applied', 'Interview Date': '', 'Resume Link': '', 'Notes': '' })
      setRefreshKey(k => k + 1)
    } catch (e: any) {
      setError('Failed to save: ' + e.message)
    }
    setSaving(false)
  }

  if (checking) return (
    <Layout><div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div></div></Layout>
  )
  if (!canAccessModuleSync(plan as any, 'hr')) {
    return <Layout><LockedModule moduleName="Recruiting" requiredPlan="Business" /></Layout>
  }

  return (
    <Layout>
      <div className="space-y-4">

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError('')}>✕</button>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>
              Recruiting
            </h2>
            <p className="text-gray-500 text-sm">Track candidates from Applied to Hired</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setRefreshKey(k => k + 1)}
              className="p-2 border border-gray-300 dark:border-white/20 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
              <RefreshCw size={16} className="text-gray-500 dark:text-gray-400" />
            </button>
            <button onClick={() => { setShowModal(true); setError('') }}
              className="candy-btn flex items-center gap-2 px-4 py-2 text-sm">
              <Plus size={16} /> Add Candidate
            </button>
          </div>
        </div>

        {/* Stage legend */}
        <div className="flex gap-2 flex-wrap">
          {STAGES.map(stage => (
            <span key={stage} className="px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: STAGE_COLORS[stage].bg, color: STAGE_COLORS[stage].color }}>
              {stage}
            </span>
          ))}
        </div>

        {userId && (
          <UniversalDataView
            key={refreshKey}
            userId={userId}
            module="Recruiting"
            color="#8B5CF6"
            bg="#EDE9FE"
          />
        )}

        {/* Add Candidate Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              style={{ border: '2px solid #1E293B', boxShadow: '8px 8px 0px #8B5CF6' }}>
              <h3 className="font-black text-lg mb-4 dark:text-white" style={{ fontFamily: 'Outfit' }}>
                Add Candidate
              </h3>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-600 text-sm">{error}</div>
              )}
              <form onSubmit={handleSubmit} className="space-y-3">
                {[
                  { key: 'Candidate Name', label: 'Candidate Name *', type: 'text', required: true, ph: 'Full name' },
                  { key: 'Role', label: 'Role Applied For', type: 'text', required: false, ph: 'e.g. Software Engineer' },
                  { key: 'Department', label: 'Department', type: 'text', required: false, ph: 'e.g. Engineering' },
                  { key: 'Email', label: 'Email', type: 'email', required: false, ph: 'candidate@email.com' },
                  { key: 'Phone', label: 'Phone', type: 'tel', required: false, ph: '+91 9876543210' },
                  { key: 'Interview Date', label: 'Interview Date', type: 'date', required: false, ph: '' },
                  { key: 'Resume Link', label: 'Resume Link', type: 'url', required: false, ph: 'https://drive.google.com/...' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-bold uppercase tracking-wide mb-1 dark:text-gray-300"
                      style={{ fontFamily: 'Outfit' }}>{f.label}</label>
                    <input type={f.type} required={f.required} placeholder={f.ph}
                      value={form[f.key as keyof typeof form]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none dark:bg-white/5 dark:text-white" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1 dark:text-gray-300"
                    style={{ fontFamily: 'Outfit' }}>Stage</label>
                  <select value={form['Stage']} onChange={e => setForm({ ...form, 'Stage': e.target.value })}
                    className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-4 py-2 text-sm outline-none dark:bg-[#1a2740] dark:text-white">
                    {STAGES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1 dark:text-gray-300"
                    style={{ fontFamily: 'Outfit' }}>Notes</label>
                  <textarea value={form['Notes']} onChange={e => setForm({ ...form, 'Notes': e.target.value })}
                    rows={3} placeholder="Interview notes, skills, impressions..."
                    className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-4 py-2 text-sm outline-none resize-none dark:bg-white/5 dark:text-white" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowModal(false); setError('') }}
                    className="flex-1 border border-gray-300 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="candy-btn flex-1 py-2 text-sm disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save Candidate'}
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
