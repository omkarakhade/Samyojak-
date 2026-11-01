interface ComparisonRow {
  feature: string
  samyojak: string
  competitor: string
}

interface SeoComparisonTableProps {
  competitorName: string
  rows: ComparisonRow[]
}

export default function SeoComparisonTable({ competitorName, rows }: SeoComparisonTableProps) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '2px solid #1E293B' }}>
      <table className="w-full">
        <thead>
          <tr style={{ background: '#1E293B' }}>
            <th className="p-4 text-left text-sm font-bold text-white">Feature</th>
            <th className="p-4 text-center text-sm font-bold" style={{ color: '#8B5CF6' }}>Samyojak</th>
            <th className="p-4 text-center text-sm font-bold text-white/60">{competitorName}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map(row => (
            <tr key={row.feature} className="hover:bg-gray-50">
              <td className="p-4 text-sm font-medium text-gray-700">{row.feature}</td>
              <td className="p-4 text-center text-sm font-bold" style={{ color: '#8B5CF6' }}>{row.samyojak}</td>
              <td className="p-4 text-center text-sm text-gray-500">{row.competitor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
