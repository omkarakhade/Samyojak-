import { NextRequest, NextResponse } from 'next/server'

const TOKEN = process.env.NEXT_PUBLIC_AIRTABLE_TOKEN || ''
const BASE = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || ''

// Fields that are computed/formula in Airtable — never write to these
const COMPUTED_FIELDS: Record<string, string[]> = {
  Leads: ['Conversion Value', 'Days Since Last Contact', 'Last Modified Time', 'Created Time', 'Follow-ups', 'Client'],
  Invoices: ['Invoice No', 'Total', 'Last Modified Time', 'Created Time', 'Line Items', 'Client', 'Payments', 'Razorpay Link'],
  Products: ['Last Modified Time', 'Created Time', 'Stock Movements', 'Line Items', 'QR Code URL'],
  Employees: ['Employee ID', 'Last Modified Time', 'Created Time', 'Attendance', 'Time Logs', 'Leaves', 'Net Pay', 'Payroll', 'Leave Balance'],
  Projects: ['Last Modified Time', 'Created Time', 'Tasks', 'Client', 'Progress %'],
}

// Writable fields per table — only these can be written
const WRITABLE_FIELDS: Record<string, string[]> = {
  Leads: ['Name', 'Email', 'Phone', 'Lead Source', 'Status', 'Notes', 'Next Follow-up Date', 'Business Type', 'Score'],
  Invoices: ['Payment Status', 'Due Date', 'Issue Date', 'GST %', 'Notes'],
  Products: ['Item Name', 'SKU', 'Category', 'Current Stock', 'Reorder Level', 'Unit Price'],
  Employees: ['Name', 'Role', 'Department', 'Salary', 'Joining Date'],
  Projects: ['Project Name', 'Status', 'Deadline', 'Start Date'],
}

const NUMERIC_FIELDS = [
  'Score', 'Deal Value', 'Amount', 'GST %', 'Tax Rate', 'Tax Amount',
  'Total', 'Salary', 'Current Stock', 'Reorder Level', 'Unit Price'
]

function smartMap(headers: string[], module: string): Record<string, string> {
  const mapping: Record<string, string> = {}
  const writable = WRITABLE_FIELDS[module] || []

  const aliases: Record<string, string[]> = {
    'Name': ['name', 'full name', 'contact name', 'person', 'lead name', 'first name', 'contact'],
    'Email': ['email', 'email address', 'e-mail', 'mail'],
    'Phone': ['phone', 'mobile', 'telephone', 'contact number', 'cell', 'tel'],
    'Lead Source': ['source', 'lead source', 'channel', 'origin', 'referred by'],
    'Status': ['status', 'stage', 'state', 'lead status', 'pipeline stage', 'payment status'],
    'Notes': ['notes', 'note', 'comments', 'description', 'remarks', 'details'],
    'Next Follow-up Date': ['follow up', 'follow-up', 'next contact', 'followup', 'reminder'],
    'Business Type': ['business', 'business type', 'industry', 'type', 'sector'],
    'Score': ['score', 'lead score', 'rating', 'priority'],
    'Payment Status': ['payment status', 'paid', 'payment', 'status'],
    'Due Date': ['due date', 'payment due', 'due by'],
    'Issue Date': ['issue date', 'invoice date', 'date', 'created'],
    'GST %': ['gst', 'gst %', 'tax rate', 'tax %', 'vat', 'vat %'],
    'Item Name': ['item', 'product', 'product name', 'item name', 'name', 'description'],
    'SKU': ['sku', 'code', 'product code', 'item code', 'barcode'],
    'Category': ['category', 'type', 'department', 'group'],
    'Current Stock': ['stock', 'quantity', 'qty', 'on hand', 'inventory'],
    'Reorder Level': ['reorder', 'reorder level', 'min stock', 'minimum'],
    'Unit Price': ['price', 'unit price', 'cost', 'rate', 'mrp', 'selling price'],
    'Role': ['role', 'position', 'designation', 'job title', 'title'],
    'Department': ['department', 'dept', 'team', 'division'],
    'Salary': ['salary', 'pay', 'wages', 'ctc', 'compensation'],
    'Joining Date': ['joining date', 'join date', 'start date', 'date of joining', 'hire date'],
    'Project Name': ['project', 'project name', 'name', 'title'],
    'Deadline': ['deadline', 'end date', 'due date', 'completion date', 'finish'],
    'Start Date': ['start date', 'start', 'begin date', 'kick off'],
  }

  headers.forEach(header => {
    const h = header.toLowerCase().trim()
    let matched = false

    for (const [field, aliasList] of Object.entries(aliases)) {
      if (!writable.includes(field)) continue
      if (aliasList.some(a => h.includes(a) || a.includes(h))) {
        if (!mapping[header]) {
          mapping[header] = field
          matched = true
          break
        }
      }
    }

    if (!matched) mapping[header] = 'skip'
  })

  return mapping
}

async function createRecord(table: string, fields: Record<string, unknown>) {
  const res = await fetch(`https://api.airtable.com/v0/${BASE}/${encodeURIComponent(table)}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Airtable ${res.status}: ${err}`)
  }
  return res.json()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, module, headers, rows, mapping } = body

    if (action === 'analyze') {
      const smartMapping = smartMap(headers as string[], module as string)
      return NextResponse.json({ mapping: smartMapping })
    }

    if (action === 'import') {
      const results = { success: 0, failed: 0, errors: [] as string[] }
      const typedRows = rows as Record<string, string>[]
      const typedMapping = mapping as Record<string, string>
      const computed = COMPUTED_FIELDS[module as string] || []

      for (const row of typedRows) {
        try {
          const fields: Record<string, unknown> = {}

          for (const [csvCol, ourField] of Object.entries(typedMapping)) {
            if (ourField === 'skip' || !ourField) continue
            // Never write computed fields
            if (computed.includes(ourField)) continue

            const rawValue = row[csvCol]
            if (rawValue === undefined || rawValue === null || rawValue === '') continue
            const valueStr = String(rawValue).trim()

            if (NUMERIC_FIELDS.includes(ourField)) {
              const num = parseFloat(valueStr.replace(/[₹$,£€\s]/g, ''))
              if (!isNaN(num)) fields[ourField] = num
            } else {
              fields[ourField] = valueStr
            }
          }

          // Add smart defaults
          if (module === 'Leads' && !fields['Status']) fields['Status'] = 'New'
          if (module === 'Invoices' && !fields['Payment Status']) fields['Payment Status'] = 'Unpaid'
          if (module === 'Invoices' && !fields['Issue Date']) {
            fields['Issue Date'] = new Date().toISOString().split('T')[0]
          }
          if (module === 'Products' && !fields['SKU']) {
            fields['SKU'] = 'SKU-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5)
          }

          if (Object.keys(fields).length > 0) {
            await createRecord(module as string, fields)
            results.success++
            await new Promise(r => setTimeout(r, 150))
          }
        } catch (e: unknown) {
          results.failed++
          const msg = e instanceof Error ? e.message : 'Unknown error'
          results.errors.push(msg)
          console.error('Import row error:', msg)
        }
      }

      return NextResponse.json(results)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
