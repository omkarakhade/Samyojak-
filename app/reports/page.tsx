'use client'
import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import { airtable } from '@/lib/airtable'
import { Download } from 'lucide-react'

export default function Reports() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    airtable.get('Invoices')
      .then(d => { setInvoices(d.records || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const monthlyData = months.map((month, idx) => {
    const mi = invoices.filter(i => {
      const d = i.fields?.['Issue Date']
      return d && new Date(d).getMonth() === idx
    })
    const taxable = mi.reduce((s, i) => s + (i.fields?.Amount || 0), 0)
    const gst5 = mi.filter(i => i.fields?.['GST Rate'] === 5).reduce((s, i) => s + (i.fields?.['GST Amount'] || 0), 0)
    const gst12 = mi.filter(i => i.fields?.['GST Rate'] === 12).reduce((s, i) => s + (i.fields?.['GST Amount'] || 0), 0)
    const gst18 = mi.filter(i => i.fields?.['GST Rate'] === 18).reduce((s, i) => s + (i.fields?.['GST Amount'] || 0), 0)
    const gst28 = mi.filter(i => i.fields?.['GST Rate'] === 28).reduce((s, i) => s + (i.fields?.['GST Amount'] || 0), 0)
    const totalGST = gst5 + gst12 + gst18 + gst28
    return { month, taxable, gst5, gst12, gst18, gst28, totalGST }
  }).filter(m => m.taxable > 0)

  const totalGSTYear = monthlyData.reduce((s, m) => s + m.totalGST, 0)
  const avgGST = monthlyData.length > 0 ? Math.floor(totalGSTYear / monthlyData.length) : 0

  const exportCSV = () => {
    const csv = ['Month,Taxable Amount,GST 5%,GST 12%,GST 18%,GST 28%,Total GST']
      .concat(monthlyData.map(m =>
        `${m.month},${m.taxable},${m.gst5},${m.gst12},${m.gst18},${m.gst28},${m.totalGST}`
      ))
      .join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'gst-report.csv'
    a.click()
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">GST Reports</h2>
            <p className="text-gray-500 text-sm">GSTR-1 format tax summary</p>
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl text-sm hover:bg-gray-50 transition-colors"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-5 border border-gray-100 dark:border-white/10">
            <p className="text-gray-500 text-xs uppercase mb-1">Total GST This Year</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white">₹{totalGSTYear.toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-5 border border-gray-100 dark:border-white/10">
            <p className="text-gray-500 text-xs uppercase mb-1">Average Monthly GST</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white">₹{avgGST.toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-[#1a2740] rounded-2xl p-5 border border-gray-100 dark:border-white/10">
            <p className="text-gray-500 text-xs uppercase mb-1">Total Invoices</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{invoices.length}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : monthlyData.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#1a2740] rounded-2xl border border-gray-100 dark:border-white/10">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="font-bold dark:text-white text-lg mb-2">No invoice data yet</h3>
            <p className="text-gray-500 text-sm">Create invoices to see GST reports here</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1a2740] rounded-2xl border border-gray-100 dark:border-white/10 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#0A1628]">
                <tr>
                  {['Month', 'Taxable Amount', 'GST 5%', 'GST 12%', 'GST 18%', 'GST 28%', 'Total GST'].map(h => (
                    <th key={h} className="p-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                {monthlyData.map(m => (
                  <tr key={m.month} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4 font-medium text-gray-900 dark:text-white">{m.month}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">₹{m.taxable.toLocaleString()}</td>
                    <td className="p-4 text-gray-500">₹{m.gst5.toLocaleString()}</td>
                    <td className="p-4 text-gray-500">₹{m.gst12.toLocaleString()}</td>
                    <td className="p-4 text-gray-500">₹{m.gst18.toLocaleString()}</td>
                    <td className="p-4 text-gray-500">₹{m.gst28.toLocaleString()}</td>
                    <td className="p-4 font-bold text-gray-900 dark:text-white">₹{m.totalGST.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}
