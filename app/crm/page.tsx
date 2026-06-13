'use client'
import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import { airtable } from '@/lib/airtable'
import { Plus, Download, Search, AlertCircle, Upload } from 'lucide-react'
import ImportModal from '@/components/ImportModal'

const statusColors: Record<string, string> = {
  New: 'bg-blue-100 text-blue-700',
  Contacted: 'bg-yellow-100 text-yellow-700',
  Converted: 'bg-green-100 text-green-700',
  Lost: 'bg-red-100 text-red-700',
}

function calcScore(lead: any) {
  let score = 0
  const src = lead.fields?.['Lead Source'] || ''
  if (src === 'Referral') score += 30
  else if (src === 'Website') score += 20
  else if (src === 'LinkedIn') score += 15
  else score += 10
  const status = lead.fields?.Status || ''
  if (status === 'Converted') score += 40
  else if (status === 'Contacted') score += 20
  else score += 10
  const followUp = lead.fields?.['Next Follow-up Date']
  if (followUp) {
    const days = Math.ceil((new Date(followUp).getTime() - Date.now()) / 86400000)
    if (days >= 0 && days <= 7) score += 20
  }
  if ((lead.fields?.['Deal Value'] || 0) > 50000) score += 10
  return Math.min(score, 100)
}

export default function CRM() {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [form, setForm] = useState({
    Name: '', Company: '', Phone: '', Email: '',
    'Lead Source': 'Website', 'Deal Value': '',
    Notes: '', 'Next Follow-up Date': '',
  })

  const fetchLeads = async () => {
    try {
      const d = await airtable.get('Leads')
      setLeads(d.records || [])
    } catch (e) { }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchLeads() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await airtable.create('Leads', {
        ...form,
        Status: 'New',
        'Deal Value': Number(form['Deal Value']),
      })
      setShowModal(false)
      setForm({ Name: '', Company: '', Phone: '', Email: '', 'Lead Source': 'Website', 'Deal Value': '', Notes: '', 'Next Follow-up Date': '' })
      fetchLeads()
    } catch (e) { }
  }

  const exportCSV = () => {
    const csv = ['Name,Company,Email,Phone,Status,Source,Value,Score']
      .concat(leads.map(l => {
        const score = calcScore(l)
        return `${l.fields?.Name || ''},${l.fields?.Company || ''},${l.fields?.Email || ''},${l.fields?.Phone || ''},${l.fields?.Status || ''},${l.fields?.['Lead Source'] || ''},${l.fields?.['Deal Value'] || ''},${score}`
      }))
      .join('\n')
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
    const matchSearch = !search ||
      l.fields?.Name?.toLowerCase().includes(search.toLowerCase()) ||
      l.fields?.Company?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || l.fields?.Status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <Layout>
      <div className="space-y-4">
        {showImport && (
          <ImportModal
            module="Leads"
            onClose={() => setShowImport(false)}
            onSuccess={fetchLeads}
          />
        )}

        {todayFollowUps > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3 text-yellow-800">
            <AlertCircle size={18} />
            <span className="text-sm font-medium">
              📅 {todayFollowUps} follow-up{todayFollowUps > 1 ? 's' : ''} due today
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>CRM</h2>
            <p className="text-gray-500 text-sm">{leads.length} leads · Manage your pipeline</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setShowImport(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{ background: '#EDE9FE', color: '#8B5CF6', border: '2px solid #8B5CF6' }}>
              <Upload size={16} /> Import CSV
            </button>
            <button onClick={exportCSV}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-white/20 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-white/10 dark:text-white transition-colors">
              <Download size={16} /> Export
            </button>
            <button onClick={() => setShowModal(true)}
              className="candy-btn flex items-center gap-2 px-4 py-2 text-sm">
              <Plus size={16} /> Add Lead
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search leads..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-white/20 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none dark:bg-[#1a2740] dark:text-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-gray-300 dark:border-white/20 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none dark:bg-[#1a2740] dark:text-white"
          >
            {['All', 'New', 'Contacted', 'Converted', 'Lost'].map(s => (
              <option key={s}>{s}</option>
            ))}
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
              {leads.length === 0 ? 'Add your first lead or import from CSV' : 'Try a different search'}
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button onClick={() => setShowImport(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                style={{ background: '#EDE9FE', color: '#8B5CF6', border: '2px solid #8B5CF6' }}>
                <Upload size={16} /> Import CSV
              </button>
              <button onClick={() => setShowModal(true)}
                className="candy-btn px-6 py-2 text-sm">
                Add First Lead
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1a2740] rounded-2xl border border-gray-100 dark:border-white/10 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#0A1628]">
                <tr>
                  {['Lead', 'Company', 'Contact', 'Source', 'Status', 'Value', 'AI Score'].map(h => (
                    <th key={h} className="p-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                {filtered.map(lead => {
                  const score = calcScore(lead)
                  return (
                    <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <td className="p-4 font-medium text-gray-900 dark:text-white text-sm">{lead.fields?.Name}</td>
                      <td className="p-4 text-gray-500 dark:text-gray-400 text-sm">{lead.fields?.Company}</td>
                      <td className="p-4 text-sm">
                        <div className="text-gray-600 dark:text-gray-300 text-xs">{lead.fields?.Email}</div>
                        <div className="text-gray-400 text-xs">{lead.fields?.Phone}</div>
                      </td>
                      <td className="p-4 text-gray-500 dark:text-gray-400 text-sm">{lead.fields?.['Lead Source']}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[lead.fields?.Status] || 'bg-gray-100 text-gray-600'}`}>
                          {lead.fields?.Status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-900 dark:text-white text-sm font-medium">
                        ₹{(lead.fields?.['Deal Value'] || 0).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${score >= 70 ? 'bg-green-100 text-green-700' : score >= 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {score}
                        </span>
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
            <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              style={{ border: '2px solid #1E293B', boxShadow: '8px 8px 0px #8B5CF6' }}>
              <h3 className="font-black text-lg mb-4" style={{ fontFamily: 'Outfit' }}>Add New Lead</h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                {[
                  { key: 'Name', label: 'Full Name', type: 'text', required: true },
                  { key: 'Company', label: 'Company', type: 'text' },
                  { key: 'Phone', label: 'Phone', type: 'tel' },
                  { key: 'Email', label: 'Email', type: 'email' },
                  { key: 'Deal Value', label: 'Deal Value (₹)', type: 'number' },
                  { key: 'Next Follow-up Date', label: 'Follow-up Date', type: 'date' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: '#1E293B', fontFamily: 'Outfit' }}>{f.label}</label>
                    <input
                      type={f.type}
                      required={f.required}
                      value={form[f.key as keyof typeof form]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: '#1E293B', fontFamily: 'Outfit' }}>Lead Source</label>
                  <select
                    value={form['Lead Source']}
                    onChange={e => setForm({ ...form, 'Lead Source': e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                  >
                    {['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Trade Show', 'Event', 'Other'].map(s => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: '#1E293B', fontFamily: 'Outfit' }}>Notes</label>
                  <textarea
                    value={form.Notes}
                    onChange={e => setForm({ ...form, Notes: e.target.value })}
                    rows={3}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 border border-gray-300 py-2 rounded-xl text-sm hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit"
                    className="candy-btn flex-1 py-2 text-sm">
                    Save Lead
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
