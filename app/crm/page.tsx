'use client'
import React, { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'
import { Plus, AlertCircle, RefreshCw } from 'lucide-react'
import UniversalDataView from '@/components/UniversalDataView'

export default function CRM() {
  const [userId, setUserId] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [form, setForm] = useState({
    Name: '',
    Email: '',
    Phone: '',
    'Lead Source': 'Website',
    Status: 'New',
    Notes: '',
    'Next Follow-up Date': '',
    'Business Type': '',
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
  }, [])

  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.Name.trim()) { setError('Name is required'); return }
    setSaving(true)
    setError('')
    try {
      const record: Record<string, string> = {
        Name: form.Name.trim(),
        Status: form.Status,
        Source: 'manual_entry',
      }
      if (form.Email) record['Email'] = form.Email.trim()
      if (form.Phone) record['Phone'] = form.Phone.trim()
      if (form['Lead Source']) record['Lead Source'] = form['Lead Source']
      if (form.Notes) record['Notes'] = form.Notes.trim()
      if (form['Next Follow-up Date']) record['Next Follow-up Date'] = form['Next Follow-up Date']
      if (form['Business Type']) record['Business Type'] = form['Business Type'].trim()

      const res = await fetch('/api/add-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, module: 'CRM', record }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Failed to save')

      setShowAddModal(false)
      setForm({
        Name: '', Email: '', Phone: '',
        'Lead Source': 'Website', Status: 'New',
        Notes: '', 'Next Follow-up Date': '', 'Business Type': '',
      })
      setRefreshKey(k => k + 1)
    } catch (e: any) {
      setError('Failed to save: ' + e.message)
    }
    setSaving(false)
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

        {/* HEADER — no Import button here, Import lives inside UniversalDataView */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>
              Leads
            </h2>
            <p className="text-gray-500 text-sm">Manage your sales pipeline</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setRefreshKey(k => k + 1)}
              className="p-2 border border-gray-300 dark:border-white/20 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
              <RefreshCw size={16} className="text-gray-500 dark:text-gray-400" />
            </button>
            <button
              onClick={() => { setShowAddModal(true); setError('') }}
              className="candy-btn flex items-center gap-2 px-4 py-2 text-sm">
              <Plus size={16} /> Add Lead
            </button>
          </div>
        </div>

        {/* UNIFIED DATA VIEW — contains the one and only Import button */}
        {userId && (
          <UniversalDataView
            key={refreshKey}
            userId={userId}
            module="CRM"
            color="#8B5CF6"
            bg="#EDE9FE"
          />
        )}

        {/* Add Lead Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
              className="bg-white dark:bg-[#1a2740] rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              style={{ border: '2px solid #1E293B', boxShadow: '8px 8px 0px #8B5CF6' }}>
              <h3 className="font-black text-lg mb-4 dark:text-white" style={{ fontFamily: 'Outfit' }}>
                Add New Lead
              </h3>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-600 text-sm">{error}</div>
              )}
              <form onSubmit={handleAddManual} className="space-y-3">
                {[
                  { key: 'Name', label: 'Full Name *', type: 'text', required: true, ph: 'Contact full name' },
                  { key: 'Email', label: 'Email', type: 'email', required: false, ph: 'email@company.com' },
                  { key: 'Phone', label: 'Phone', type: 'tel', required: false, ph: '+91 9876543210' },
                  { key: 'Business Type', label: 'Business Type', type: 'text', required: false, ph: 'e.g. Retail, SaaS' },
                  { key: 'Next Follow-up Date', label: 'Follow-up Date', type: 'date', required: false, ph: '' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-bold uppercase tracking-wide mb-1 dark:text-gray-300"
                      style={{ fontFamily: 'Outfit' }}>{f.label}</label>
                    <input
                      type={f.type}
                      required={f.required}
                      placeholder={f.ph}
                      value={form[f.key as keyof typeof form]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none dark:bg-white/5 dark:text-white" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1 dark:text-gray-300"
                    style={{ fontFamily: 'Outfit' }}>Lead Source</label>
                  <select
                    value={form['Lead Source']}
                    onChange={e => setForm({ ...form, 'Lead Source': e.target.value })}
                    className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-4 py-2 text-sm outline-none dark:bg-[#1a2740] dark:text-white">
                    {['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Trade Show', 'Event', 'Other'].map(s => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1 dark:text-gray-300"
                    style={{ fontFamily: 'Outfit' }}>Status</label>
                  <select
                    value={form.Status}
                    onChange={e => setForm({ ...form, Status: e.target.value })}
                    className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-4 py-2 text-sm outline-none dark:bg-[#1a2740] dark:text-white">
                    {['New', 'Contacted', 'Converted', 'Lost'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1 dark:text-gray-300"
                    style={{ fontFamily: 'Outfit' }}>Notes</label>
                  <textarea
                    value={form.Notes}
                    onChange={e => setForm({ ...form, Notes: e.target.value })}
                    rows={3}
                    placeholder="Any additional notes..."
                    className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-4 py-2 text-sm outline-none resize-none dark:bg-white/5 dark:text-white" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowAddModal(false); setError('') }}
                    className="flex-1 border border-gray-300 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="candy-btn flex-1 py-2 text-sm disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save Lead'}
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
