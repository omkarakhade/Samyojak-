/** The standard column names each module page and the AI agent understand. */
export const MODULE_FIELDS: Record<string, string[]> = {
  CRM: ['Name', 'Email', 'Phone', 'Lead Source', 'Status', 'Notes', 'Next Follow-up Date', 'Business Type', 'Company'],
  Invoices: ['Invoice No', 'Client Name', 'Line Items', 'Amount', 'Tax Amount', 'GSTIN', 'Payment Status', 'Issue Date', 'Due Date', 'Notes'],
  Quotations: ['Client Name', 'Amount', 'Status', 'Notes'],
  Inventory: ['Item Name', 'SKU', 'Category', 'Current Stock', 'Reorder Level', 'Unit Price'],
  HR: ['Name', 'Role', 'Department', 'Salary', 'Joining Date'],
  Projects: ['Project Name', 'Client', 'Status', 'Start Date', 'Deadline', 'Description'],
  Recruiting: ['Candidate Name', 'Role', 'Department', 'Stage', 'Email', 'Phone', 'Interview Date'],
  'Production Jobs': ['Job No', 'Product', 'Quantity Planned', 'Quantity Made', 'Start Date', 'Due Date', 'Status', 'Line', 'Notes'],
  'Quality Issues': ['Issue No', 'Product', 'Defect', 'Quantity Affected', 'Severity', 'Root Cause', 'Corrective Action', 'Status', 'Reported Date', 'Owner'],
  'Bills of Materials': ['Product', 'Components', 'Labour Cost', 'Notes'],
  'Journal Entries': ['Date', 'Debit Account', 'Credit Account', 'Amount', 'Narration'],
  Timesheets: ['Date', 'Person', 'Project', 'Client', 'Task', 'Hours', 'Billable', 'Hourly Rate', 'Notes'],
  Assets: ['Asset Name', 'Category', 'Serial No', 'Purchase Date', 'Purchase Cost', 'Assigned To', 'Location', 'Status', 'Warranty Until', 'Notes'],
  'Recurring Invoices': ['Client Name', 'Description', 'Amount', 'Frequency', 'Next Date', 'Status', 'Notes'],
  'Sales Orders': ['Order No', 'Client Name', 'Line Items', 'Amount', 'Order Date', 'Delivery Date', 'Status', 'Notes'],
  Returns: ['Return No', 'Customer', 'Item', 'Quantity', 'Refund Amount', 'Reason', 'Condition', 'Decision', 'Status', 'Return Date', 'Notes'],
}

export const MODULE_LABELS: Record<string, string> = {
  CRM: 'Leads & CRM',
  Invoices: 'Invoices',
  Quotations: 'Quotations',
  Inventory: 'Inventory',
  HR: 'HR & Payroll',
  Projects: 'Projects',
  Recruiting: 'Recruiting',
  Returns: 'Returns & Refunds',
  'Recurring Invoices': 'Recurring Invoices',
  'Sales Orders': 'Sales Orders',
  'Bills of Materials': 'Bills of Materials',
  'Journal Entries': 'Journal Entries',
  Timesheets: 'Timesheets',
  Assets: 'Assets',
  'Production Jobs': 'Production Jobs',
  'Quality Issues': 'Quality Issues',
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
