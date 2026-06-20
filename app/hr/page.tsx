'use client'
import React, { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import LockedModule from '@/components/LockedModule'
import { supabase } from '@/lib/supabase'
import { getPlanFromMetadata, canAccessModuleSync } from '@/lib/planAccess'
import { airtable } from '@/lib/airtable'
import { Plus, Download, Upload, AlertCircle, Trash2, RefreshCw } from 'lucide-react'
import ImportModal from '@/components/ImportModal'
import UniversalDataView from '@/components/UniversalDataView'

const COLORS = [
  'bg-violet-500', 'bg-pink-500', 'bg-green-500',
  'bg-orange-500', 'bg-blue-500', 'bg-teal-500',
  'bg-red-500', 'bg-yellow-500',
]

export default function HR() {
  const [plan, setPlan] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState('')
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

  const fetchEmployees = async () => {
    setLoading(true)
    setError('')
    try {
      const d = await airtable.get('Employees')
      setEmployees(d.records || [])
    } catch (e: any) {
      setError('Could not load employees: ' + e.message)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!checking && canAccessModuleSync(plan as any, 'hr')) fetchEmployees()
  }, [checking, plan])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.Name.trim()) { setError('Name is required'); return }
    setSaving(true)
    setError('')
    try {
      const fields: Record<string, unknown> = { Name: form.Name.trim() }
      if (form.Role.trim()) fields['Role'] = form.Role.trim()
      if (form.Department.trim()) fields['Department'] = form.Department.trim()
      if (form.Salary) fields['Salary'] = Number(form.Salary)
      if (form['Joining Date']) fields['Joining Date'] = form['Joining Date']
      await airtable.create('Employees', fields)
      setShowModal(false)
      setForm({ Name: '', Role: '', Department: '', Salary: '', 'Joining Date': '' })
      await fetchEmployees()
    } catch (e: any) {
      setError('Failed to save: ' + e.message)
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this employee?')) return
    try {
      await airtable.del('Employees', id)
      await fetchEmployees()
    } catch (e: any) { setError('Delete failed: ' + e.message) }
  }

  const exportCSV = () => {
    const rows = [
      ['Name', 'Role', 'Department', 'Salary', 'Joining Date', 'Leave Balance'],
      ...employees.map(e => [
        e.fields?.Name || '',
        e.fields?.Role || '',
        e.fields?.Department || '',
        e.fields?.Salary || '',
        e.fields?.['Joining Date'] || '',
        e.fields?.['Leave Balance'] || '',
      ])
    ]
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'employees.csv'
    a.click()
  }

  const getInitials = (name: string) =>
    (name || '??').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const totalPayroll = employees.reduce((s, e) => s + (e.fields?.Salary || 0), 0)

  if (checking) return (
    <Layout><div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div></div></Layout>
  )
  if (!canAccessModuleSync(plan as any, 'hr')) {
    return <Layout><LockedModule moduleName="HR" requiredPlan="Business" /></Layout>
  }

  return (
    <Layout>
      <div className="space-y-4">

        {showImport && (
          <ImportModal module="HR" onClose={() => setShowImport(false)} onSuccess={fetchEmployees} />
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
            <h2 className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>HR</h2>
            <p className="text-gray-500 text-sm">
              {employees.length} employees · Total payroll ₹{totalPayroll.toLocaleString()}/mo
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setShowImport(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium"
              style={{ background: '#D1FAE5', color: '#065F46', border: '2px solid #34D399' }}>
              <Upload size={16} /> Import CSV
            </button>
            <button onClick={exportCSV}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-white/20 rounded-xl text-sm hover:bg-gray-50 dark:text-white">
              <Download size={16} /> Export
            </button>
            <button onClick={fetchEmployees}
              className="p-2 border border-gray-300 dark:border-white/20 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10">
              <RefreshCw size={16} className="text-gray-500 dark:text-gray-400" />
            </button>
            <button onClick={() => { setShowModal(true); setError('') }}
              className="candy-btn flex items-center gap-2 px-4 py-2 text-sm">
              <Plus size={16} /> Add Employee
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div></div>
        ) : employees.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#1a2740] rounded-2xl border border-gray-100 dark:border-white/10">
            <div className="text-5xl mb-4">👥</div>
            <h3 className="font-bold dark:text-white text-lg mb-2" style={{ fontFamily: 'Outfit' }}>No employees yet</h3>
            <p className="text-gray-500 text-sm mb-4">Import from any HR or payroll system</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowImport(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                style={{ background: '#D1FAE5', color: '#065F46', border: '2px solid #34D399' }}>
                <Upload size={16} /> Import CSV
              </button>
              <button onClick={() => setShowModal(true)} className="candy-btn px-6 py-2 text-sm">
                Add First Employee
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((emp, idx) => (
              <div key={emp.id}
                className="bg-white dark:bg-[#1a2740] rounded-2xl p-5 border border-gray-100 dark:border-white/10 hover:shadow-md transition-shadow relative group">
                <button onClick={() => handleDelete(emp.id)}
                  className="absolute top-3 right-3 p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 size={14} />
                </button>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`${COLORS[idx % COLORS.length]} w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                    {getInitials(emp.fields?.Name || '')}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm pr-6" style={{ fontFamily: 'Outfit' }}>
                      {emp.fields?.Name}
                    </h3>
                    <p className="text-gray-500 text-xs">{emp.fields?.Role || 'No role set'}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-gray-400">
                    Dept: <span className="text-gray-600 dark:text-gray-300">{emp.fields?.Department || 'N/A'}</span>
                  </p>
                  <p className="text-xs text-gray-400">
                    Joined: <span className="text-gray-600 dark:text-gray-300">{emp.fields?.['Joining Date'] || 'N/A'}</span>
                  </p>
                  <p className="text-xs text-gray-400">
                    Salary: <span className="font-bold text-gray-900 dark:text-white">
                      ₹{(emp.fields?.Salary || 0).toLocaleString()}/mo
                    </span>
                  </p>
                  {emp.fields?.['Leave Balance'] !== undefined && (
                    <p className="text-xs text-gray-400">
                      Leave: <span className="text-gray-600 dark:text-gray-300">{emp.fields['Leave Balance']} days</span>
                    </p>
                  )}
                  {emp.fields?.['Employee ID'] && (
                    <p className="text-xs text-gray-400">
                      ID: <span className="font-mono text-gray-600 dark:text-gray-300">#{emp.fields['Employee ID']}</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* UNIVERSAL IMPORT SECTION */}
        {userId && (
          <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-200 dark:border-white/10">
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-black dark:text-white" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
                  📂 Imported HR Data
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: '#D1FAE5', color: '#065F46' }}>
                  Zero data loss
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Imported from any HR, payroll, or attendance system — every column preserved
              </p>
            </div>
            <UniversalDataView userId={userId} module="HR" color="#34D399" bg="#D1FAE5" />
          </div>
        )}

        {/* Add Employee Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              style={{ border: '2px solid #1E293B', boxShadow: '8px 8px 0px #34D399' }}>
              <h3 className="font-black text-lg mb-4 dark:text-white" style={{ fontFamily: 'Outfit' }}>Add Employee</h3>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-600 text-sm">{error}</div>
              )}
              <form onSubmit={handleSubmit} className="space-y-3">
                {[
                  { key: 'Name', label: 'Full Name *', type: 'text', required: true, ph: 'Employee name' },
                  { key: 'Role', label: 'Role / Position', type: 'text', required: false, ph: 'e.g. Software Engineer' },
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
