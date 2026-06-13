import { NextRequest, NextResponse } from 'next/server'

const TOKEN = process.env.NEXT_PUBLIC_AIRTABLE_TOKEN || ''
const BASE = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || ''

// Smart column mapping — maps any column name to our field names
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
      'Notes': ['notes', 'note', 'comments', 'comment', 'description', 'details', 'remarks', 'additional info'],
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
      if (aliases.some(alias => headerLower.includes(alias) || alias.includes(headerLower))) {
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

async function createRecord(table: string, fields: Record<string, any>) {
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, module, headers, rows, mapping } = body

    // Step 1: Analyze headers and return smart mapping
    if (action === 'analyze') {
      const smartMapping = smartMap(headers, module)
      return NextResponse.json({ mapping: smartMapping })
    }

    // Step 2: Import rows with confirmed mapping
    if (action === 'import') {
      const results = { success: 0, failed: 0, errors: [] as string[] }

      for (const row of rows) {
        try {
          const fields: Record<string, any> = {}

          for (const [csvCol, ourField] of Object.entries(mapping)) {
            if (ourField === 'skip' || !ourField) continue
            const value = row[csvCol]
            if (!value && value !== 0) continue

            // Type conversion
            if (['Deal Value', 'Amount', 'Tax Rate', 'Tax Amount', 'Total', 'Salary', 'Current Stock', 'Reorder Level', 'Unit Price'].includes(ourField)) {
              const num = parseFloat(String(value).replace(/[₹$,£€\s]/g, ''))
              if (!isNaN(num)) fields[ourField] = num
            } else {
              fields[ourField] = String(value).trim()
            }
          }

          // Add defaults based on module
          if (module === 'Leads' && !fields['Status']) fields['Status'] = 'New'
          if (module === 'Invoices' && !fields['Status']) fields['Status'] = 'Unpaid'
          if (module === 'Invoices' && !fields['Invoice No']) {
            fields['Invoice No'] = 'IMP-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5).toUpperCase()
          }

          if (Object.keys(fields).length > 0) {
            await createRecord(module === 'Leads' ? 'Leads' :
              module === 'Invoices' ? 'Invoices' :
              module === 'Products' ? 'Products' :
              module === 'Employees' ? 'Employees' : 'Projects', fields)
            results.success++
            // Small delay to avoid Airtable rate limiting
            await new Promise(r => setTimeout(r, 100))
          }
        } catch (e: any) {
          results.failed++
          results.errors.push(e.message)
        }
      }

      return NextResponse.json(results)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error: any) {
    console.error('Import error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
