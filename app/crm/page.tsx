'use client'
import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import { airtable } from '@/lib/airtable'
import { Plus, Download, Search, AlertCircle, Upload, Trash2 } from 'lucide-react'
import ImportModal from '@/components/ImportModal'

const STATUS_COLORS: Record<string, string> = {
  New: 'bg-blue-100 text-blue-700',
  Contacted: 'bg-yellow-100 text-yellow-700',
  Converted: 'bg-green-100 text-green-700',
  Lost: 'bg-red-100 text-red-700',
}

export default function CRM() {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
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

  const fetchLeads = async () => {
    setLoading(true)
    setError('')
    try {
      const d = await airtable.get('Leads')
      setLeads(d.records || [])
    } catch (e: any) {
      setError('Could not load leads: ' + e.message)
    }
    setLoading(false)
  }

  useEffect(() => { fetchLeads() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.Name.trim()) { setError('Name is required'); return }
    setSaving(true)
    setError('')
    try {
      const fields: Record<string, unknown> = { Name: form.Name.trim(), Status: form.Status }
      if (form.Email.trim()) fields['Email'] = form.Email.trim()
      if (form.Phone.trim()) fields['Phone'] = form.Phone.trim()
      if (form['Lead Source']) fields['Lead Source'] = form['Lead Source']
      if (form.Notes.trim()) fields['Notes'] = form.Notes.trim()
      if (form['Next Follow-up Date']) fields['Next Follow-up Date'] = form['Next Follow-up Date']
      if (form['Business Type'].trim()) fields['Business Type'] = form['Business Type'].trim()
      await airtable.create('Leads', fields)
      setShowModal(false)
      setForm({ Name: '', Email: '', Phone: '', 'Lead Source': 'Website', Status: 'New', Notes: '', 'Next Follow-up Date': '', 'Business Type': '' })
      await fetchLeads()
    } catch (e: any) {
      setError('Failed to save: ' + e.message)
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this lead?')) return
    try {
      await airtable.del('Leads', id)
      await fetchLeads()
    } catch (e: any) {
      setError('Delete failed: ' + e.message)
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await airtable.update('Leads', id, { Status: status })
      await fetchLeads()
    } catch (e: any) {
      setError('Update failed: ' + e.message)
    }
  }

  const exportCSV = () => {
    const rows = [
      ['Name', 'Email', 'Phone', 'Status', 'Lead Source', 'Business Type', 'Score', 'Notes', 'Next Follow-up Date'],
      ...leads.map(l => [
        l.fields?.Name || '',
        l.fields?.Email || '',
        l.fields?.Phone || '',
        l.fields?.Status || '',
        l.fields?.['Lead Source'] || '',
        l.fields?.['Business Type'] || '',
        l.fields?.Score || '',
        l.fields?.Notes || '',
        l.fields?.['Next Follow-up Date'] || '',
      ])
    ]
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'leads.csv'
    a.click()
  }

  const todayFollowUps = leads.filter(l => {
    const d = l.fields?.['Next Follow-up Date']
    return d && new Date(d).toDateString() === new Date().toDateString()
  }).length

  const filtered = leads.filter(l => {
    const q = search.toLowerCase()
    const matchSearch = !search ||
      (l.fields?.Name || '').toLowerCase().includes(q) ||
      (l.fields?.Email || '').toLowerCase().includes(q) ||
      (l.fields?.['Business Type'] || '').toLowerCase().includes(q)
    return matchSearch && (statusFilter === 'All' || l.fields?.Status === statusFilter)
  })

  return (
    <Layout>
      <div className="space-y-4">
        {showImport && (
          <ImportModal module="Leads" onClose={() => setShowImport(false)} onSuccess={fetchLeads} />
        )}

        {todayFollowUps > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3 text-yellow-800">
            <AlertCircle size={18} />
            <span className="text-sm font-medium">📅 {todayFollowUps} follow-up{todayFollowUps > 1 ? 's' : ''} due today</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>CRM</h2>
            <p className="text-gray-500 text-sm">{leads.length} leads · Manage your sales pipeline</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setShowImport(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium"
              style={{ background: '#EDE9FE', color: '#8B5CF6', border: '2px solid #8B5CF6' }}>
              <Upload size={16} /> Import
            </button>
            <button onClick={exportCSV}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-white/20 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-white/10 dark:text-white">
              <Download size={16} /> Export
            </button>
            <button onClick={() => { setShowModal(true); setError('') }}
              className="candy-btn flex items-center gap-2 px-4 py-2 text-sm">
              <Plus size={16} /> Add Lead
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, business..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-white/20 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500 dark:bg-[#1a2740] dark:text-white" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="border border-gray-300 dark:border-white/20 rounded-xl px-3 py-2 text-sm outline-none dark:bg-[#1a2740] dark:text-white">
            {['All', 'New', 'Contacted', 'Converted', 'Lost'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#1a2740] rounded-2xl border border-gray-100 dark:border-white/10">
            <div className="text-5xl mb-4">🚀</div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2" style={{ fontFamily: 'Outfit' }}>
              {leads.length === 0 ? 'No leads yet' : 'No results found'}
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              {leads.length === 0 ? 'Add your first lead or import from any CSV format' : 'Try different search terms'}
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button onClick={() => setShowImport(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                style={{ background: '#EDE9FE', color: '#8B5CF6', border: '2px solid #8B5CF6' }}>
                <Upload size={16} /> Import CSV
              </button>
              <button onClick={() => setShowModal(true)} className="candy-btn px-6 py-2 text-sm">
                Add First Lead
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1a2740] rounded-2xl border border-gray-100 dark:border-white/10 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#0A1628]">
                <tr>
                  {['Name', 'Email', 'Phone', 'Business', 'Source', 'Status', 'Score', ''].map(h => (
                    <th key={h} className="p-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                {filtered.map(lead => {
                  const score = lead.fields?.Score || 0
                  return (
                    <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <td className="p-4 font-medium text-gray-900 dark:text-white text-sm">{lead.fields?.Name}</td>
                      <td className="p-4 text-gray-500 dark:text-gray-400 text-sm">{lead.fields?.Email || '—'}</td>
                      <td className="p-4 text-gray-500 dark:text-gray-400 text-sm">{lead.fields?.Phone || '—'}</td>
                      <td className="p-4 text-gray-500 dark:text-gray-400 text-sm">{lead.fields?.['Business Type'] || '—'}</td>
                      <td className="p-4 text-gray-500 dark:text-gray-400 text-sm">{lead.fields?.['Lead Source'] || '—'}</td>
                      <td className="p-4">
                        <select
                          value={lead.fields?.Status || 'New'}
                          onChange={e => handleStatusChange(lead.id, e.target.value)}
                          className={`px-2 py-1 rounded-full text-xs font-medium border-0 outline-none cursor-pointer ${STATUS_COLORS[lead.fields?.Status] || 'bg-gray-100 text-gray-600'}`}
                        >
                          {['New', 'Contacted', 'Converted', 'Lost'].map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="p-4">
                        {score > 0 ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${score >= 70 ? 'bg-green-100 text-green-700' : score >= 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                            {score}
                          </span>
                        ) : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      <td className="p-4">
                        <button onClick={() => handleDelete(lead.id)}
                          className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              style={{ border: '2px solid #1E293B', boxShadow: '8px 8px 0px #8B5CF6' }}>
              <h3 className="font-black text-lg mb-4 dark:text-white" style={{ fontFamily: 'Outfit' }}>Add New Lead</h3>
              {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-600 text-sm">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-3">
                {[
                  { key: 'Name', label: 'Full Name *', type: 'text', required: true, ph: 'Contact full name' },
                  { key: 'Email', label: 'Email', type: 'email', required: false, ph: 'email@company.com' },
                  { key: 'Phone', label: 'Phone', type: 'tel', required: false, ph: '+91 9876543210' },
                  { key: 'Business Type', label: 'Business Type', type: 'text', required: false, ph: 'e.g. Retail, SaaS' },
                  { key: 'Next Follow-up Date', label: 'Follow-up Date', type: 'date', required: false, ph: '' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-bold uppercase tracking-wide mb-1 dark:text-gray-300" style={{ fontFamily: 'Outfit' }}>{f.label}</label>
                    <input type={f.type} required={f.required} placeholder={f.ph}
                      value={form[f.key as keyof typeof form]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none dark:bg-white/5 dark:text-white" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1 dark:text-gray-300" style={{ fontFamily: 'Outfit' }}>Lead Source</label>
                  <select value={form['Lead Source']} onChange={e => setForm({ ...form, 'Lead Source': e.target.value })}
                    className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-4 py-2 text-sm outline-none dark:bg-[#1a2740] dark:text-white">
                    {['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Trade Show', 'Event', 'Other'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1 dark:text-gray-300" style={{ fontFamily: 'Outfit' }}>Status</label>
                  <select value={form.Status} onChange={e => setForm({ ...form, Status: e.target.value })}
                    className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-4 py-2 text-sm outline-none dark:bg-[#1a2740] dark:text-white">
                    {['New', 'Contacted', 'Converted', 'Lost'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1 dark:text-gray-300" style={{ fontFamily: 'Outfit' }}>Notes</label>
                  <textarea value={form.Notes} onChange={e => setForm({ ...form, Notes: e.target.value })}
                    rows={3} placeholder="Any additional notes..."
                    className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-4 py-2 text-sm outline-none resize-none dark:bg-white/5 dark:text-white" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowModal(false); setError('') }}
                    className="flex-1 border border-gray-300 py-2 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={saving}
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
