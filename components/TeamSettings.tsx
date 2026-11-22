'use client'
import React, { useEffect, useState } from 'react'
import { Trash2, UserPlus } from 'lucide-react'

type Member = { id: string; email: string; name: string; added: string }

export default function TeamSettings() {
  const [members, setMembers] = useState<Member[]>([])
  const [limit, setLimit] = useState(0)
  const [plan, setPlan] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  useEffect(() => {
    fetch('/api/team').then(r => r.json()).then(j => {
      if (j.error) setError(j.error)
      else { setMembers(j.members || []); setLimit(j.limit || 0); setPlan(j.plan || '') }
      setLoading(false)
    }).catch(() => { setError('Could not load your team.'); setLoading(false) })
  }, [])

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true); setError(''); setNotice('')
    try {
      const res = await fetch('/api/team', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const j = await res.json()
      if (!res.ok || j.error) throw new Error(j.error || 'Could not add them.')
      setMembers(j.members || [])
      setNotice(`Added ${form.email}. Tell them to sign in at the login page with this email and the password you set.`)
      setForm({ name: '', email: '', password: '' })
    } catch (err: any) { setError(err.message) }
    setBusy(false)
  }

  const remove = async (m: Member) => {
    if (!confirm(`Remove ${m.email}? They will lose access right away.`)) return
    setError(''); setNotice('')
    const res = await fetch('/api/team?id=' + encodeURIComponent(m.id), { method: 'DELETE' })
    const j = await res.json().catch(() => ({}))
    if (!res.ok || j.error) setError(j.error || 'Could not remove them.')
    else setMembers(j.members || [])
  }

  if (loading) return <p className="text-sm text-gray-500">Loading team...</p>

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-bold text-gray-900 dark:text-white">Team logins</h3>
        <p className="text-sm text-gray-500">
          {limit > 0
            ? `Add up to ${limit} people. Each gets their own login and works in this same business. Only you can manage billing and the team.`
            : `Team logins are part of the Complete plan${plan ? ` (you are on ${plan})` : ''}. Upgrade to let your staff sign in with their own email and password.`}
        </p>
      </div>
      {error && <div className="p-3 rounded-xl text-sm bg-red-50 border border-red-200 text-red-700">{error}</div>}
      {notice && <div className="p-3 rounded-xl text-sm bg-green-50 border border-green-200 text-green-700">{notice}</div>}
      {members.length > 0 && (
        <ul className="divide-y divide-gray-100 dark:divide-white/10 border border-gray-200 dark:border-white/10 rounded-xl">
          {members.map(m => (
            <li key={m.id} className="flex items-center justify-between gap-2 p-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{m.name || m.email}</div>
                <div className="text-xs text-gray-500 truncate">{m.email}{m.added ? ` · added ${m.added}` : ''}</div>
              </div>
              <button onClick={() => remove(m)} title="Remove" className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
            </li>
          ))}
        </ul>
      )}
      {limit > 0 && members.length < limit && (
        <form onSubmit={add} className="space-y-2 border border-gray-200 dark:border-white/10 rounded-xl p-3">
          <div className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"><UserPlus size={16} /> Add a person ({members.length}/{limit})</div>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name" className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-3 py-2 text-sm bg-transparent dark:text-white" />
          <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email" required placeholder="Their email" className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-3 py-2 text-sm bg-transparent dark:text-white" />
          <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} type="text" required minLength={10} placeholder="Set a password for them (10+ characters)" className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-3 py-2 text-sm bg-transparent dark:text-white" />
          <button disabled={busy} className="candy-btn px-4 py-2 text-sm disabled:opacity-50">{busy ? 'Adding...' : 'Add person'}</button>
        </form>
      )}
    </div>
  )
}
