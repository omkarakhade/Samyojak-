'use client'
import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import { airtable } from '@/lib/airtable'
import { Plus } from 'lucide-react'

const columns = ['Planning', 'In Progress', 'Review', 'Done']
const colColors: Record<string, string> = {
  Planning: 'bg-gray-100 dark:bg-white/5',
  'In Progress': 'bg-blue-50 dark:bg-blue-900/20',
  Review: 'bg-yellow-50 dark:bg-yellow-900/20',
  Done: 'bg-green-50 dark:bg-green-900/20',
}

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ 'Project Name': '', Client: '', Deadline: '', Status: 'Planning' })

  const fetchProjects = async () => {
    try {
      const d = await airtable.get('Projects')
      setProjects(d.records || [])
    } catch (e) {}
    finally { setLoading(false) }
  }

  useEffect(() => { fetchProjects() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await airtable.create('Projects', form)
    setShowModal(false)
    setForm({ 'Project Name': '', Client: '', Deadline: '', Status: 'Planning' })
    fetchProjects()
  }

  const moveProject = async (id: string, newStatus: string) => {
    await airtable.update('Projects', id, { Status: newStatus })
    fetchProjects()
  }

  const isOverdue = (deadline: string) =>
    deadline && new Date(deadline) < new Date()

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Projects</h2>
            <p className="text-gray-500 text-sm">Track deadlines and progress</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} /> Add Project
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {columns.map(col => {
              const colProjects = projects.filter(p => p.fields?.Status === col)
              return (
                <div key={col} className={`${colColors[col]} rounded-2xl p-4 min-h-48`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-700 dark:text-gray-200 text-sm">{col}</h3>
                    <span className="bg-white dark:bg-white/10 text-gray-600 dark:text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {colProjects.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {colProjects.map(p => (
                      <div key={p.id} className="bg-white dark:bg-[#1a2740] rounded-xl p-3 shadow-sm border border-gray-100 dark:border-white/10">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                          {p.fields?.['Project Name']}
                        </h4>
                        {p.fields?.Client && (
                          <p className="text-gray-400 text-xs mt-0.5">{p.fields.Client}</p>
                        )}
                        {p.fields?.Deadline && (
                          <p className={`text-xs mt-1 ${isOverdue(p.fields.Deadline) ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                            📅 {new Date(p.fields.Deadline).toLocaleDateString()}
                            {isOverdue(p.fields.Deadline) && ' · OVERDUE'}
                          </p>
                        )}
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {columns
                            .filter(c => c !== col)
                            .map(c => (
                              <button
                                key={c}
                                onClick={() => moveProject(p.id, c)}
                                className="text-xs bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                              >
                                → {c}
                              </button>
                            ))}
                        </div>
                      </div>
                    ))}
                    {colProjects.length === 0 && (
                      <p className="text-gray-400 text-xs text-center py-6">Empty</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {projects.length === 0 && !loading && (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">No projects yet</h3>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm hover:bg-blue-700"
            >
              Create First Project
            </button>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h3 className="font-bold text-lg mb-4">Add Project</h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                {[
                  { key: 'Project Name', label: 'Project Name', type: 'text', required: true },
                  { key: 'Client', label: 'Client', type: 'text' },
                  { key: 'Deadline', label: 'Deadline', type: 'date' },
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
