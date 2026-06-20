'use client'
import React, { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import LockedModule from '@/components/LockedModule'
import { supabase } from '@/lib/supabase'
import { getPlanFromMetadata, canAccessModuleSync } from '@/lib/planAccess'
import { airtable } from '@/lib/airtable'
import { Plus, AlertCircle, Trash2, RefreshCw } from 'lucide-react'
import UniversalDataView from '@/components/UniversalDataView'

const COLUMNS = ['Planning', 'In Progress', 'Review', 'Done']

const COL_STYLES: Record<string, { bg: string; border: string; badge: string }> = {
  Planning: {
    bg: 'bg-gray-50 dark:bg-white/5',
    border: 'border-gray-200 dark:border-white/10',
    badge: 'bg-gray-200 dark:bg-white/20 text-gray-700 dark:text-gray-300',
  },
  'In Progress': {
    bg: 'bg-blue-50 dark:bg-blue-900/10',
    border: 'border-blue-200 dark:border-blue-800',
    badge: 'bg-blue-200 text-blue-800',
  },
  Review: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/10',
    border: 'border-yellow-200 dark:border-yellow-800',
    badge: 'bg-yellow-200 text-yellow-800',
  },
  Done: {
    bg: 'bg-green-50 dark:bg-green-900/10',
    border: 'border-green-200 dark:border-green-800',
    badge: 'bg-green-200 text-green-800',
  },
}

export default function Projects() {
  const [plan, setPlan] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState('')
  const [form, setForm] = useState({
    'Project Name': '',
    Status: 'Planning',
    Deadline: '',
    'Start Date': '',
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

  const fetchProjects = async () => {
    setLoading(true)
    setError('')
    try {
      const d = await airtable.get('Projects')
      setProjects(d.records || [])
    } catch (e: any) {
      setError('Could not load projects: ' + e.message)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!checking && canAccessModuleSync(plan as any, 'projects')) fetchProjects()
  }, [checking, plan])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form['Project Name'].trim()) { setError('Project name is required'); return }
    setSaving(true)
    setError('')
    try {
      const fields: Record<string, unknown> = {
        'Project Name': form['Project Name'].trim(),
        Status: form.Status,
      }
      if (form.Deadline) fields['Deadline'] = form.Deadline
      if (form['Start Date']) fields['Start Date'] = form['Start Date']
      await airtable.create('Projects', fields)
      setShowModal(false)
      setForm({ 'Project Name': '', Status: 'Planning', Deadline: '', 'Start Date': '' })
      await fetchProjects()
    } catch (e: any) {
      setError('Failed to save: ' + e.message)
    }
    setSaving(false)
  }

  const moveProject = async (id: string, newStatus: string) => {
    try {
      await airtable.update('Projects', id, { Status: newStatus })
      await fetchProjects()
    } catch (e: any) { setError('Move failed: ' + e.message) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return
    try {
      await airtable.del('Projects', id)
      await fetchProjects()
    } catch (e: any) { setError('Delete failed: ' + e.message) }
  }

  const isOverdue = (deadline: string) => deadline && new Date(deadline) < new Date()

  if (checking) return (
    <Layout><div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div></div></Layout>
  )
  if (!canAccessModuleSync(plan as any, 'projects')) {
    return <Layout><LockedModule moduleName="Projects" requiredPlan="Business" /></Layout>
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
            <h2 className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>Projects</h2>
            <p className="text-gray-500 text-sm">{projects.length} projects · Kanban board</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchProjects}
              className="p-2 border border-gray-300 dark:border-white/20 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10">
              <RefreshCw size={16} className="text-gray-500 dark:text-gray-400" />
            </button>
            <button onClick={() => { setShowModal(true); setError('') }}
              className="candy-btn flex items-center gap-2 px-4 py-2 text-sm">
              <Plus size={16} /> Add Project
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div></div>
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
            {COLUMNS.map(col => {
              const colProjects = projects.filter(p => p.fields?.Status === col)
              const style = COL_STYLES[col]
              return (
                <div key={col} className={`${style.bg} border ${style.border} rounded-2xl p-4 min-h-48`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-700 dark:text-gray-200 text-sm">{col}</h3>
                    <span className={`${style.badge} text-xs font-bold px-2 py-0.5 rounded-full`}>
                      {colProjects.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {colProjects.map(p => (
                      <div key={p.id}
                        className="bg-white dark:bg-[#1a2740] rounded-xl p-3 shadow-sm border border-gray-100 dark:border-white/10 relative group">
                        <button onClick={() => handleDelete(p.id)}
                          className="absolute top-2 right-2 p-1 rounded text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                          <Trash2 size={12} />
                        </button>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm pr-6">
                          {p.fields?.['Project Name']}
                        </h4>
                        {p.fields?.['Progress %'] !== undefined && (
                          <div className="mt-2 mb-1">
                            <div className="w-full bg-gray-200 dark:bg-white/20 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full"
                                style={{ width: `${p.fields['Progress %']}%`, background: '#8B5CF6' }} />
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">{p.fields['Progress %']}% complete</p>
                          </div>
                        )}
                        {p.fields?.Deadline && (
                          <p className={`text-xs mt-1 ${isOverdue(p.fields.Deadline) ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                            📅 {new Date(p.fields.Deadline).toLocaleDateString()}
                            {isOverdue(p.fields.Deadline) ? ' · OVERDUE' : ''}
                          </p>
                        )}
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {COLUMNS.filter(c => c !== col).map(c => (
                            <button key={c} onClick={() => moveProject(p.id, c)}
                              className="text-xs bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors">
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

        {/* UNIVERSAL IMPORT SECTION */}
        {userId && (
          <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-200 dark:border-white/10">
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-black dark:text-white" style={{ fontFamily: 'Outfit', color: '#1E293B' }}>
                  📂 Imported Project Data
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: '#EDE9FE', color: '#8B5CF6' }}>
                  Zero data loss
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Imported from any project management tool — every column preserved
              </p>
            </div>
            <UniversalDataView userId={userId} module="Projects" color="#8B5CF6" bg="#EDE9FE" />
          </div>
        )}

        {/* Add Project Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-6 w-full max-w-md"
              style={{ border: '2px solid #1E293B', boxShadow: '8px 8px 0px #8B5CF6' }}>
              <h3 className="font-black text-lg mb-4 dark:text-white" style={{ fontFamily: 'Outfit' }}>Add Project</h3>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-600 text-sm">{error}</div>
              )}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1 dark:text-gray-300"
                    style={{ fontFamily: 'Outfit' }}>Project Name *</label>
                  <input type="text" required value={form['Project Name']}
                    onChange={e => setForm({ ...form, 'Project Name': e.target.value })}
                    placeholder="Project name"
                    className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none dark:bg-white/5 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1 dark:text-gray-300"
                    style={{ fontFamily: 'Outfit' }}>Status</label>
                  <select value={form.Status} onChange={e => setForm({ ...form, Status: e.target.value })}
                    className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-4 py-2 text-sm outline-none dark:bg-[#1a2740] dark:text-white">
                    {COLUMNS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1 dark:text-gray-300"
                    style={{ fontFamily: 'Outfit' }}>Start Date</label>
                  <input type="date" value={form['Start Date']}
                    onChange={e => setForm({ ...form, 'Start Date': e.target.value })}
                    className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-4 py-2 text-sm outline-none dark:bg-white/5 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1 dark:text-gray-300"
                    style={{ fontFamily: 'Outfit' }}>Deadline</label>
                  <input type="date" value={form.Deadline}
                    onChange={e => setForm({ ...form, Deadline: e.target.value })}
                    className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-4 py-2 text-sm outline-none dark:bg-white/5 dark:text-white" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowModal(false); setError('') }}
                    className="flex-1 border border-gray-300 py-2 rounded-xl text-sm">Cancel</button>
                  <button type="submit" disabled={saving}
                    className="candy-btn flex-1 py-2 text-sm disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save Project'}
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
