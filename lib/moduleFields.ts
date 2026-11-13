/** The standard column names each module page and the AI agent understand. */
export const MODULE_FIELDS: Record<string, string[]> = {
  CRM: ['Name', 'Email', 'Phone', 'Lead Source', 'Status', 'Notes', 'Next Follow-up Date', 'Business Type', 'Company'],
  Invoices: ['Invoice No', 'Client Name', 'Amount', 'Tax Amount', 'GSTIN', 'Payment Status', 'Issue Date', 'Due Date', 'Notes'],
  Quotations: ['Client Name', 'Amount', 'Status', 'Notes'],
  Inventory: ['Item Name', 'SKU', 'Category', 'Current Stock', 'Reorder Level', 'Unit Price'],
  HR: ['Name', 'Role', 'Department', 'Salary', 'Joining Date'],
  Projects: ['Project Name', 'Client', 'Status', 'Start Date', 'Deadline', 'Description'],
  Recruiting: ['Candidate Name', 'Role', 'Department', 'Stage', 'Email', 'Phone', 'Interview Date'],
}

export const MODULE_LABELS: Record<string, string> = {
  CRM: 'Leads & CRM',
  Invoices: 'Invoices',
  Quotations: 'Quotations',
  Inventory: 'Inventory',
  HR: 'HR & Payroll',
  Projects: 'Projects',
  Recruiting: 'Recruiting',
}

/** Match sheet columns to standard columns by name only (no AI). */
export function exactFieldMapping(module: string, headers: string[]): Record<string, string | null> {
  const fields = MODULE_FIELDS[module] || []
  const mapping: Record<string, string | null> = {}
  const used = new Set<string>()
  for (const h of headers) {
    const hit = fields.find(f => f.toLowerCase() === h.trim().toLowerCase() && !used.has(f))
    if (hit) {
      mapping[h] = hit
      used.add(hit)
    } else {
      mapping[h] = null
    }
  }
  return mapping
}
