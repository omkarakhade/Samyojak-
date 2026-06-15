'use client'
import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import LockedModule from '@/components/LockedModule'
import { supabase } from '@/lib/supabase'
import { getPlanFromMetadata, canAccessModuleSync } from '@/lib/planAccess'
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
  const [plan, setPlan] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    'Project Name': '',
    Status: 'Planning',
    Deadline: '',
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setPlan(getPlanFromMetadata(user))
      setChecking(false)
    })
  }, [])

  const fetchProjects = async () => {
    setLoading(true)
    setError('')
    try {
      const d = await airtable.get('Projects')
      setProjects(d.records || [])
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!checking && canAccessModuleSync(plan as any, 'projects')) {
      fetchProjects()
    }
  }, [checking, plan])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const fields: Record<string, any> = {
        'Project Name': form['Project Name'],
        Status: form.Status || 'Planning',
      }
      if (form.Deadline) fields['Deadline'] = form.Deadline

      await airtable.create('Projects', fields)
      setShowModal(false)
      setForm({ 'Project Name': '', Status: 'Planning', Deadline: '' })
      fetchProjects()
    } catch (e: any) {
      setError('Failed to save: ' + e.message)
    }
  }

  const moveProject = async (id: string, newStatus: string) => {
    try {
      await airtable.update('Projects', id, { Status: newStatus })
      fetchProjects()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const isOverdue = (deadline: string) =>
    deadline && new Date(deadline) < new Date()

  if (checking) return (
    <Layout>
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
      </div>
    </Layout>
  )

  if (!canAccessModuleSync(plan as any, 'projects')) {
    return <Layout><LockedModule moduleName="Projects" requiredPlan="Business" /></Layout>
  }

  return (
    <Layout>
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            ⚠️ {error}
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>Projects</h2>
            <p className="text-gray-500 text-sm">{projects.length} projects · Track deadlines and progress</p>
          </div>
          <button onClick={() => setShowModal(true)} className="candy-btn flex items-center gap-2 px-4 py-2 text-sm">
            <Plus size={16} /> Add Project
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#1a2740] rounded-2xl border border-gray-100 dark:border-white/10">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="font-bold dark:text-white text-lg mb-2" style={{ fontFamily: 'Outfit' }}>No projects yet</h3>
            <button onClick={() => setShowModal(true)} className="candy-btn px-6 py-2 text-sm mt-4">
              Create First Project
            </button>
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
                        {p.fields?.['Progress %'] !== undefined && (
                          <div className="mt-1 mb-1">
                            <div className="w-full bg-gray-200 dark:bg-white/20 rounded-full h-1.5">
                              <div
                                className="h-1.5 rounded-full"
                                style={{ width: `${p.fields['Progress %']}%`, background: '#8B5CF6' }}
                              />
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">{p.fields['Progress %']}% complete</p>
                          </div>
                        )}
                        {p.fields?.Deadline && (
                          <p className={`text-xs mt-1 ${isOverdue(p.fields.Deadline) ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                            📅 {new Date(p.fields.Deadline).toLocaleDateString()}
                            {isOverdue(p.fields.Deadline) && ' · OVERDUE'}
                          </p>
                        )}
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {columns.filter(c => c !== col).map(c => (
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

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
              className="bg-white rounded-2xl p-6 w-full max-w-md"
              style={{ border: '2px solid #1E293B', boxShadow: '8px 8px 0px #8B5CF6' }}
            >
              <h3 className="font-black text-lg mb-4" style={{ fontFamily: 'Outfit' }}>Add Project</h3>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-600 text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: '#1E293B', fontFamily: 'Outfit' }}>Project Name *</label>
                  <input
                    type="text"
                    required
                    value={form['Project Name']}
                    onChange={e => setForm({ ...form, 'Project Name': e.target.value })}
                    placeholder="Project name"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: '#1E293B', fontFamily: 'Outfit' }}>Status</label>
                  <select
                    value={form.Status}
                    onChange={e => setForm({ ...form, Status: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                  >
                    {columns.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: '#1E293B', fontFamily: 'Outfit' }}>Deadline</label>
                  <input
                    type="date"
                    value={form.Deadline}
                    onChange={e => setForm({ ...form, Deadline: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                  />
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
