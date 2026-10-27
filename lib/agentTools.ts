const TOKEN = process.env.NEXT_PUBLIC_AIRTABLE_TOKEN || ''
const BASE = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || ''

export const AGENT_MODULES = [
  'CRM',
  'Invoices',
  'Quotations',
  'Inventory',
  'HR',
  'Projects',
  'Recruiting',
] as const

export type AgentModule = (typeof AGENT_MODULES)[number]
export type AgentRecord = Record<string, string | number>

export interface ProposedAction {
  module: AgentModule
  records: AgentRecord[]
}

export const MAX_RECORDS_PER_REQUEST = 10

export const AGENT_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'add_records',
      description:
        'Prepare new records to be saved in the user\'s ERP. Nothing is saved until the user confirms. Call once per module.',
      parameters: {
        type: 'object',
        properties: {
          module: {
            type: 'string',
            enum: [...AGENT_MODULES],
            description: 'Which ERP module the records belong to',
          },
          records: {
            type: 'array',
            description: 'One object per record. Keys are field names, values are text or numbers.',
            items: { type: 'object' },
          },
        },
        required: ['module', 'records'],
      },
    },
  },
]

function sanitizeRecord(raw: any): AgentRecord | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const out: AgentRecord = {}
  let count = 0
  for (const [key, value] of Object.entries(raw)) {
    if (count >= 20) break
    const cleanKey = String(key).trim().slice(0, 60)
    if (!cleanKey || cleanKey.startsWith('_')) continue
    if (typeof value === 'number' && Number.isFinite(value)) {
      out[cleanKey] = value
      count++
    } else if (typeof value === 'string' && value.trim() !== '') {
      out[cleanKey] = value.trim().slice(0, 500)
      count++
    }
  }
  return count > 0 ? out : null
}

export function sanitizeActions(raw: any): ProposedAction[] {
  if (!Array.isArray(raw)) return []
  const actions: ProposedAction[] = []
  let total = 0

  for (const item of raw) {
    if (!item || !AGENT_MODULES.includes(item.module)) continue
    if (!Array.isArray(item.records)) continue

    const records: AgentRecord[] = []
    for (const r of item.records) {
      if (total >= MAX_RECORDS_PER_REQUEST) break
      const clean = sanitizeRecord(r)
      if (clean) {
        records.push(clean)
        total++
      }
    }
    if (records.length > 0) actions.push({ module: item.module, records })
  }
  return actions
}

function airtableHeaders() {
  return {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  }
}

export async function createAgentRecords(userId: string, actions: ProposedAction[]) {
  const batchId = `agent_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const importedAt = new Date().toISOString()
  const today = importedAt.split('T')[0]

  const rows: { fields: Record<string, any> }[] = []
  let rowIndex = 0

  for (const action of actions) {
    for (const record of action.records) {
      rows.push({
        fields: {
          'User ID': userId,
          Module: action.module,
          'Record Data': JSON.stringify({
            _meta: {
              importId: batchId,
              rowIndex: rowIndex++,
              source: 'agent_entry',
              importedAt,
              originalHeaders: Object.keys(record),
              totalColumns: Object.keys(record).length,
            },
            ...record,
          }),
          Source: 'agent_entry',
          'Created At': today,
        },
      })
    }
  }

  let created = 0
  for (let i = 0; i < rows.length; i += 10) {
    const chunk = rows.slice(i, i + 10)
    const res = await fetch(`https://api.airtable.com/v0/${BASE}/UserData`, {
      method: 'POST',
      headers: airtableHeaders(),
      body: JSON.stringify({ records: chunk }),
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Airtable error ${res.status}: ${err}`)
    }
    created += chunk.length
  }

  return { batchId, created }
}

export async function undoAgentBatch(userId: string, batchId: string) {
  // Strict format check so nothing unexpected can reach the Airtable formula
  if (!/^agent_\d+_[a-z0-9]+$/.test(batchId)) throw new Error('Invalid batch id')
  if (!/^[A-Za-z0-9-]+$/.test(userId)) throw new Error('Invalid user id')

  const formula = `AND({User ID}="${userId}",FIND("${batchId}",{Record Data}))`
  const ids: string[] = []
  let offset: string | undefined

  do {
    const url =
      `https://api.airtable.com/v0/${BASE}/UserData?filterByFormula=${encodeURIComponent(formula)}` +
      `&fields%5B%5D=User%20ID&pageSize=100${offset ? `&offset=${offset}` : ''}`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } })
    if (!res.ok) throw new Error(`Airtable error ${res.status}`)
    const data = await res.json()
    for (const r of data.records || []) ids.push(r.id)
    offset = data.offset
  } while (offset)

  let deleted = 0
  for (let i = 0; i < ids.length; i += 10) {
    const chunk = ids.slice(i, i + 10)
    const query = chunk.map(id => `records[]=${id}`).join('&')
    const res = await fetch(`https://api.airtable.com/v0/${BASE}/UserData?${query}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${TOKEN}` },
    })
    if (!res.ok) throw new Error(`Airtable delete error ${res.status}`)
    deleted += chunk.length
  }

  return { deleted }
}
