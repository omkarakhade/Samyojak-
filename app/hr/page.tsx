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
  const [form, setForm] = useState({
    'Full Name': '', Role: '', Department: '',
    Email: '', Phone: '', Salary: '', 'Join Date': '',
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setPlan(getPlanFromMetadata(user))
      setChecking(false)
    })
  }, [])

  const fetchEmployees = async () => {
    try {
      const d = await airtable.get('Employees')
      setEmployees(d.records || [])
    } catch (e) { }
    finally { setLoading(false) }
  }

  useEffect(() => {
    if (!checking && canAccessModuleSync(plan as any, 'hr')) {
      fetchEmployees()
    }
  }, [checking, plan])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await airtable.create('Employees', { ...form, Salary: Number(form.Salary) })
    setShowModal(false)
    setForm({ 'Full Name': '', Role: '', Department: '', Email: '', Phone: '', Salary: '', 'Join Date': '' })
    fetchEmployees()
  }

  const exportCSV = () => {
    const csv = ['Name,Role,Department,Email,Phone,Salary']
      .concat(employees.map(e =>
        `${e.fields?.['Full Name'] || ''},${e.fields?.Role || ''},${e.fields?.Department || ''},${e.fields?.Email || ''},${e.fields?.Phone || ''},${e.fields?.Salary || ''}`
      )).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'employees.csv'
    a.click()
  }

  const getInitials = (name: string) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'

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
          <ImportModal module="Employees" onClose={() => setShowImport(false)} onSuccess={fetchEmployees} />
        )}

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>HR</h2>
            <p className="text-gray-500 text-sm">{employees.length} employees · Manage your team</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setShowImport(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium"
              style={{ background: '#D1FAE5', color: '#065F46', border: '2px solid #34D399' }}>
              <Upload size={16} /> Import CSV
            </button>
            <button onClick={exportCSV}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-xl text-sm hover:bg-gray-50">
              <Download size={16} /> Export
            </button>
            <button onClick={() => setShowModal(true)}
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
            <p className="text-gray-500 text-sm mb-6">Add team members or import from CSV</p>
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
              <div key={emp.id} className="bg-white dark:bg-[#1a2740] rounded-2xl p-5 border border-gray-100 dark:border-white/10 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`${colors[idx % colors.length]} w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                    {getInitials(emp.fields?.['Full Name'] || '')}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm" style={{ fontFamily: 'Outfit' }}>{emp.fields?.['Full Name']}</h3>
                    <p className="text-gray-500 text-xs">{emp.fields?.Role}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-400">Dept: <span className="text-gray-600 dark:text-gray-300">{emp.fields?.Department || 'N/A'}</span></p>
                  <p className="text-xs text-gray-400">Email: <span className="text-gray-600 dark:text-gray-300">{emp.fields?.Email || 'N/A'}</span></p>
                  <p className="text-xs text-gray-400">Salary: <span className="text-gray-900 dark:text-white font-bold">₹{(emp.fields?.Salary || 0).toLocaleString()}/mo</span></p>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              style={{ border: '2px solid #1E293B', boxShadow: '8px 8px 0px #34D399' }}>
              <h3 className="font-black text-lg mb-4" style={{ fontFamily: 'Outfit' }}>Add Employee</h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                {[
                  { key: 'Full Name', label: 'Full Name', type: 'text', required: true },
                  { key: 'Role', label: 'Role / Position', type: 'text' },
                  { key: 'Department', label: 'Department', type: 'text' },
                  { key: 'Email', label: 'Email', type: 'email' },
                  { key: 'Phone', label: 'Phone', type: 'tel' },
                  { key: 'Salary', label: 'Monthly Salary (₹)', type: 'number' },
                  { key: 'Join Date', label: 'Join Date', type: 'date' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: '#1E293B', fontFamily: 'Outfit' }}>{f.label}</label>
                    <input type={f.type} required={f.required} value={form[f.key as keyof typeof form]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none" />
                  </div>
                ))}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
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
