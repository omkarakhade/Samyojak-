'use client'
import React, { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import LockedModule from '@/components/LockedModule'
import { supabase } from '@/lib/supabase'
import { getPlanFromMetadata, canAccessModuleSync } from '@/lib/planAccess'
import { Plus, AlertCircle, RefreshCw } from 'lucide-react'
import UniversalDataView from '@/components/UniversalDataView'
import UniversalImport from '@/components/UniversalImport'

export default function HR() {
  const [plan, setPlan] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  const [userId, setUserId] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [form, setForm] = useState({
    Name: '',
    Role: '',
    Department: '',
    Salary: '',
    'Joining Date': '',
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
    if (!form.Name.trim()) { setError('Name is required'); return }
    setSaving(true)
    setError('')
    try {
      const record: Record<string, string> = {
        Name: form.Name.trim(),
        Source: 'manual_entry',
      }
      if (form.Role.trim()) record['Role'] = form.Role.trim()
      if (form.Department.trim()) record['Department'] = form.Department.trim()
      if (form.Salary) record['Salary'] = form.Salary
      if (form['Joining Date']) record['Joining Date'] = form['Joining Date']

      const res = await fetch('/api/add-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, module: 'HR', record }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Failed to save')

      setShowModal(false)
      setForm({ Name: '', Role: '', Department: '', Salary: '', 'Joining Date': '' })
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
    return <Layout><LockedModule moduleName="HR" requiredPlan="Business" /></Layout>
  }

  return (
    <Layout>
      <div className="space-y-4">

        {showImport && userId && (
          <UniversalImport
            userId={userId}
            module="HR"
            onSuccess={() => setRefreshKey(k => k + 1)}
            onClose={() => setShowImport(false)}
          />
        )}

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
              HR & Team
            </h2>
            <p className="text-gray-500 text-sm">Employees, salaries, and payroll</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setShowImport(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium"
              style={{ background: '#D1FAE5', color: '#065F46', border: '2px solid #34D399' }}>
              Import CSV
            </button>
            <button onClick={() => setRefreshKey(k => k + 1)}
              className="p-2 border border-gray-300 dark:border-white/20 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10">
              <RefreshCw size={16} className="text-gray-500 dark:text-gray-400" />
            </button>
            <button onClick={() => { setShowModal(true); setError('') }}
              className="candy-btn flex items-center gap-2 px-4 py-2 text-sm">
              <Plus size={16} /> Add Employee
            </button>
          </div>
        </div>

        {/* ONE UNIFIED DATA VIEW */}
        {userId && (
          <UniversalDataView
            key={refreshKey}
            userId={userId}
            module="HR"
            color="#34D399"
            bg="#D1FAE5"
          />
        )}

        {/* Add Employee Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              style={{ border: '2px solid #1E293B', boxShadow: '8px 8px 0px #34D399' }}>
              <h3 className="font-black text-lg mb-4 dark:text-white" style={{ fontFamily: 'Outfit' }}>
                Add Employee
              </h3>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-600 text-sm">{error}</div>
              )}
              <form onSubmit={handleSubmit} className="space-y-3">
                {[
                  { key: 'Name', label: 'Full Name *', type: 'text', required: true, ph: 'Employee name' },
                  { key: 'Role', label: 'Role / Position', type: 'text', required: false, ph: 'e.g. Engineer' },
                  { key: 'Department', label: 'Department', type: 'text', required: false, ph: 'e.g. Engineering' },
                  { key: 'Salary', label: 'Monthly Salary (₹)', type: 'number', required: false, ph: '0' },
                  { key: 'Joining Date', label: 'Joining Date', type: 'date', required: false, ph: '' },
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
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowModal(false); setError('') }}
                    className="flex-1 border border-gray-300 py-2 rounded-xl text-sm">Cancel</button>
                  <button type="submit" disabled={saving}
                    className="candy-btn flex-1 py-2 text-sm disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save Employee'}
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
