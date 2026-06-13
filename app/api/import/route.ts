import { NextRequest, NextResponse } from 'next/server'

const TOKEN = process.env.NEXT_PUBLIC_AIRTABLE_TOKEN || ''
const BASE = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || ''

function smartMap(headers: string[], module: string): Record<string, string> {
  const mapping: Record<string, string> = {}

  const fieldMaps: Record<string, Record<string, string[]>> = {
    Leads: {
      'Name': ['name', 'full name', 'fullname', 'contact name', 'contact', 'person', 'client name', 'lead name', 'first name', 'firstname'],
      'Company': ['company', 'company name', 'business', 'business name', 'organization', 'organisation', 'firm', 'account'],
      'Email': ['email', 'email address', 'e-mail', 'mail'],
      'Phone': ['phone', 'phone number', 'mobile', 'mobile number', 'contact number', 'cell', 'telephone', 'tel'],
      'Lead Source': ['source', 'lead source', 'channel', 'how did you hear', 'referred by', 'origin'],
      'Status': ['status', 'stage', 'pipeline stage', 'lead status', 'state'],
      'Deal Value': ['value', 'deal value', 'amount', 'deal size', 'revenue', 'potential', 'opportunity value', 'budget'],
      'Notes': ['notes', 'note', 'comments', 'comment', 'description', 'details', 'remarks'],
      'Next Follow-up Date': ['follow up', 'follow-up', 'next contact', 'followup date', 'next follow up', 'reminder'],
    },
    Invoices: {
      'Client Name': ['client', 'client name', 'customer', 'customer name', 'bill to', 'company', 'name'],
      'Client Email': ['email', 'client email', 'customer email', 'contact email'],
      'Client Phone': ['phone', 'mobile', 'client phone', 'customer phone'],
      'Amount': ['amount', 'subtotal', 'price', 'base amount', 'net amount', 'value'],
      'Tax Rate': ['tax rate', 'gst rate', 'vat rate', 'tax %', 'gst %'],
      'Tax Amount': ['tax amount', 'gst amount', 'vat amount', 'tax'],
      'Total': ['total', 'grand total', 'invoice total', 'final amount'],
      'Status': ['status', 'payment status', 'paid', 'invoice status'],
      'Due Date': ['due date', 'payment due', 'due by', 'payment date'],
      'Notes': ['notes', 'description', 'comments', 'remarks'],
    },
    Products: {
      'Item Name': ['name', 'item name', 'product name', 'product', 'item', 'description', 'title'],
      'SKU': ['sku', 'code', 'product code', 'item code', 'barcode', 'part number', 'id'],
      'Category': ['category', 'type', 'product type', 'department', 'group'],
      'Current Stock': ['stock', 'quantity', 'qty', 'current stock', 'inventory', 'units', 'on hand'],
      'Reorder Level': ['reorder', 'reorder level', 'minimum stock', 'min qty', 'reorder point', 'alert level'],
      'Unit Price': ['price', 'unit price', 'cost', 'selling price', 'rate', 'mrp', 'amount'],
      'Supplier': ['supplier', 'vendor', 'manufacturer', 'brand', 'supplier name'],
    },
    Employees: {
      'Full Name': ['name', 'full name', 'employee name', 'employee', 'staff name', 'contact'],
      'Role': ['role', 'position', 'designation', 'job title', 'title', 'job role'],
      'Department': ['department', 'dept', 'team', 'division', 'group'],
      'Email': ['email', 'work email', 'company email', 'employee email'],
      'Phone': ['phone', 'mobile', 'contact number', 'cell phone'],
      'Salary': ['salary', 'ctc', 'pay', 'monthly salary', 'compensation', 'wages'],
      'Join Date': ['join date', 'joining date', 'start date', 'date of joining', 'doj', 'hire date'],
    },
    Projects: {
      'Project Name': ['project', 'project name', 'name', 'title', 'task', 'job name'],
      'Client': ['client', 'customer', 'account', 'company', 'client name'],
      'Status': ['status', 'stage', 'state', 'project status', 'progress'],
      'Deadline': ['deadline', 'due date', 'end date', 'target date', 'completion date', 'finish date'],
    },
  }

  const moduleFields = fieldMaps[module] || {}

  headers.forEach(header => {
    const headerLower = header.toLowerCase().trim()
    let matched = false

    for (const [ourField, aliases] of Object.entries(moduleFields)) {
      if (aliases.some(alias =>
        headerLower.includes(alias) || alias.includes(headerLower)
      )) {
        if (!mapping[header]) {
          mapping[header] = ourField
          matched = true
          break
        }
      }
    }

    if (!matched) {
      mapping[header] = 'skip'
    }
  })

  return mapping
}

const NUMERIC_FIELDS = [
  'Deal Value', 'Amount', 'Tax Rate', 'Tax Amount',
  'Total', 'Salary', 'Current Stock', 'Reorder Level', 'Unit Price'
]

async function createAirtableRecord(table: string, fields: Record<string, unknown>) {
  const res = await fetch(`https://api.airtable.com/v0/${BASE}/${table}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  })
  return res.json()
}

function getAirtableTable(module: string): string {
  const tables: Record<string, string> = {
    Leads: 'Leads',
    Invoices: 'Invoices',
    Products: 'Products',
    Employees: 'Employees',
    Projects: 'Projects',
  }
  return tables[module] || module
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
      const tableName = getAirtableTable(module as string)

      for (const row of typedRows) {
        try {
          const fields: Record<string, unknown> = {}

          for (const [csvCol, ourField] of Object.entries(typedMapping)) {
            if (ourField === 'skip' || !ourField) continue
            const rawValue = row[csvCol]
            if (rawValue === undefined || rawValue === null || rawValue === '') continue

            const valueStr = String(rawValue).trim()

            if (NUMERIC_FIELDS.includes(ourField)) {
              const num = parseFloat(valueStr.replace(/[₹$,£€\s]/g, ''))
              if (!isNaN(num)) {
                fields[ourField] = num
              }
            } else {
              fields[ourField] = valueStr
            }
          }

          // Add defaults
          if (module === 'Leads' && !fields['Status']) {
            fields['Status'] = 'New'
          }
          if (module === 'Invoices' && !fields['Status']) {
            fields['Status'] = 'Unpaid'
          }
          if (module === 'Invoices' && !fields['Invoice No']) {
            fields['Invoice No'] = 'IMP-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5).toUpperCase()
          }
          if (module === 'Products' && !fields['SKU']) {
            fields['SKU'] = 'SKU-' + Date.now()
          }

          if (Object.keys(fields).length > 0) {
            await createAirtableRecord(tableName, fields)
            results.success++
            await new Promise(r => setTimeout(r, 150))
          }
        } catch (e: unknown) {
          results.failed++
          const msg = e instanceof Error ? e.message : 'Unknown error'
          results.errors.push(msg)
        }
      }

      return NextResponse.json(results)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('Import error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
