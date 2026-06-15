'use client'
import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import LockedModule from '@/components/LockedModule'
import { supabase } from '@/lib/supabase'
import { getPlanFromMetadata, canAccessModuleSync } from '@/lib/planAccess'
import { airtable } from '@/lib/airtable'
import { Plus, Download, Upload } from 'lucide-react'
import ImportModal from '@/components/ImportModal'

const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500']

export default function HR() {
  const [plan, setPlan] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    Name: '',
    Role: '',
    Department: '',
    Salary: '',
    'Joining Date': '',
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setPlan(getPlanFromMetadata(user))
      setChecking(false)
    })
  }, [])

  const fetchEmployees = async () => {
    setLoading(true)
    setError('')
    try {
      const d = await airtable.get('Employees')
      setEmployees(d.records || [])
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!checking && canAccessModuleSync(plan as any, 'hr')) {
      fetchEmployees()
    }
  }, [checking, plan])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const fields: Record<string, any> = {
        Name: form.Name,
      }
      if (form.Role) fields['Role'] = form.Role
      if (form.Department) fields['Department'] = form.Department
      if (form.Salary) fields['Salary'] = Number(form.Salary)
      if (form['Joining Date']) fields['Joining Date'] = form['Joining Date']

      await airtable.create('Employees', fields)
      setShowModal(false)
      setForm({ Name: '', Role: '', Department: '', Salary: '', 'Joining Date': '' })
      fetchEmployees()
    } catch (e: any) {
      setError('Failed to save: ' + e.message)
    }
  }

  const exportCSV = () => {
    const csv = ['Name,Role,Department,Salary,Joining Date']
      .concat(employees.map(e =>
        `"${e.fields?.Name || ''}","${e.fields?.Role || ''}","${e.fields?.Department || ''}","${e.fields?.Salary || ''}","${e.fields?.['Joining Date'] || ''}"`
      )).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'employees.csv'
    a.click()
  }

  const getInitials = (name: string) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'

  if (checking) return (
    <Layout>
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
      </div>
    </Layout>
  )

  if (!canAccessModuleSync(plan as any, 'hr')) {
    return <Layout><LockedModule moduleName="HR" requiredPlan="Business" /></Layout>
  }

  return (
    <Layout>
      <div className="space-y-4">
        {showImport && (
          <ImportModal module="Employees" onClose={() => setShowImport(false)} onSuccess={fetchEmployees} />
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            ⚠️ {error}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>HR</h2>
            <p className="text-gray-500 text-sm">{employees.length} employees · Manage your team</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowImport(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium"
              style={{ background: '#D1FAE5', color: '#065F46', border: '2px solid #34D399' }}
            >
              <Upload size={16} /> Import CSV
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-xl text-sm hover:bg-gray-50"
            >
              <Download size={16} /> Export
            </button>
            <button onClick={() => setShowModal(true)} className="candy-btn flex items-center gap-2 px-4 py-2 text-sm">
              <Plus size={16} /> Add Employee
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#1a2740] rounded-2xl border border-gray-100 dark:border-white/10">
            <div className="text-5xl mb-4">👥</div>
            <h3 className="font-bold dark:text-white text-lg mb-2" style={{ fontFamily: 'Outfit' }}>No employees yet</h3>
            <p className="text-gray-500 text-sm mb-6">Add team members or import from CSV</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowImport(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                style={{ background: '#D1FAE5', color: '#065F46', border: '2px solid #34D399' }}
              >
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
              <div key={emp.id} className="bg-white dark:bg-[#1a2740] rounded-2xl p-5 border border-gray-100 dark:border-white/10 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`${colors[idx % colors.length]} w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                    {getInitials(emp.fields?.Name || '')}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm" style={{ fontFamily: 'Outfit' }}>
                      {emp.fields?.Name}
                    </h3>
                    <p className="text-gray-500 text-xs">{emp.fields?.Role}</p>
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
                    Salary: <span className="text-gray-900 dark:text-white font-bold">
                      ₹{(emp.fields?.Salary || 0).toLocaleString()}/mo
                    </span>
                  </p>
                  {emp.fields?.['Leave Balance'] !== undefined && (
                    <p className="text-xs text-gray-400">
                      Leave Balance: <span className="text-gray-600 dark:text-gray-300">{emp.fields['Leave Balance']} days</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
              className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              style={{ border: '2px solid #1E293B', boxShadow: '8px 8px 0px #34D399' }}
            >
              <h3 className="font-black text-lg mb-4" style={{ fontFamily: 'Outfit' }}>Add Employee</h3>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-600 text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: '#1E293B', fontFamily: 'Outfit' }}>Full Name *</label>
                  <input type="text" required value={form.Name}
                    onChange={e => setForm({ ...form, Name: e.target.value })}
                    placeholder="Employee full name"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: '#1E293B', fontFamily: 'Outfit' }}>Role / Position</label>
                  <input type="text" value={form.Role}
                    onChange={e => setForm({ ...form, Role: e.target.value })}
                    placeholder="e.g. Software Engineer"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: '#1E293B', fontFamily: 'Outfit' }}>Department</label>
                  <input type="text" value={form.Department}
                    onChange={e => setForm({ ...form, Department: e.target.value })}
                    placeholder="e.g. Engineering"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: '#1E293B', fontFamily: 'Outfit' }}>Monthly Salary (₹)</label>
                  <input type="number" value={form.Salary}
                    onChange={e => setForm({ ...form, Salary: e.target.value })}
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: '#1E293B', fontFamily: 'Outfit' }}>Joining Date</label>
                  <input type="date" value={form['Joining Date']}
                    onChange={e => setForm({ ...form, 'Joining Date': e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowModal(false); setError('') }}
                    className="flex-1 border border-gray-300 py-2 rounded-xl text-sm">Cancel</button>
                  <button type="submit" className="candy-btn flex-1 py-2 text-sm">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
