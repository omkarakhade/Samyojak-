'use client'
import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import { airtable } from '@/lib/airtable'
import { Plus, Download } from 'lucide-react'

const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500']

export default function HR() {
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    'Full Name': '', Role: '', Department: '',
    Email: '', Phone: '', Salary: '', 'Join Date': '',
  })

  const fetchEmployees = async () => {
    try {
      const d = await airtable.get('Employees')
      setEmployees(d.records || [])
    } catch (e) {}
    finally { setLoading(false) }
  }

  useEffect(() => { fetchEmployees() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await airtable.create('Employees', {
      ...form,
      Salary: Number(form.Salary),
    })
    setShowModal(false)
    setForm({ 'Full Name': '', Role: '', Department: '', Email: '', Phone: '', Salary: '', 'Join Date': '' })
    fetchEmployees()
  }

  const exportCSV = () => {
    const csv = ['Name,Role,Department,Email,Phone,Salary']
      .concat(employees.map(e =>
        `${e.fields?.['Full Name'] || ''},${e.fields?.Role || ''},${e.fields?.Department || ''},${e.fields?.Email || ''},${e.fields?.Phone || ''},${e.fields?.Salary || ''}`
      ))
      .join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'employees.csv'
    a.click()
  }

  const getInitials = (name: string) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">HR</h2>
            <p className="text-gray-500 text-sm">Manage your team</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              <Download size={16} /> Export
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} /> Add Employee
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#1a2740] rounded-2xl border border-gray-100 dark:border-white/10">
            <div className="text-5xl mb-4">👥</div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">No employees yet</h3>
            <p className="text-gray-500 text-sm mb-6">Add your first team member</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm hover:bg-blue-700"
            >
              Add First Employee
            </button>
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
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">{emp.fields?.['Full Name']}</h3>
                    <p className="text-gray-500 text-xs">{emp.fields?.Role}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-gray-400">
                    Dept: <span className="text-gray-600 dark:text-gray-300">{emp.fields?.Department || 'N/A'}</span>
                  </p>
                  <p className="text-xs text-gray-400">
                    Email: <span className="text-gray-600 dark:text-gray-300">{emp.fields?.Email || 'N/A'}</span>
                  </p>
                  <p className="text-xs text-gray-400">
                    Salary: <span className="text-gray-900 dark:text-white font-bold">₹{(emp.fields?.Salary || 0).toLocaleString()}/mo</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="font-bold text-lg mb-4">Add Employee</h3>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                    <input
                      type={f.type}
                      required={f.required}
                      value={form[f.key as keyof typeof form]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                ))}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 py-2 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-sm hover:bg-blue-700">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
