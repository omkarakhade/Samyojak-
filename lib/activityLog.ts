import { storeCreate } from '@/lib/store'
import type { AgentAction, AddAction, UpdateAction } from '@/lib/agentTools'

const NAME_FIELDS = ['Name', 'Client Name', 'Item Name', 'Project Name', 'Candidate Name', 'Vendor Name', 'Vendor', 'PO Number', 'Customer Name', 'Product Name', 'SKU', 'Item', 'Category', 'Description', 'Title']

function labelOf(rec: Record<string, any>): string {
  for (const f of NAME_FIELDS) {
    const v = rec[f]
    if (v !== undefined && String(v).trim()) return String(v).slice(0, 40)
  }
  const first = Object.values(rec).find(v => typeof v === 'string' && v.trim())
  if (first) return String(first).slice(0, 40)
  return 'a record'
}

export interface ActivityEntry {
  action: 'Added' | 'Changed' | 'Marked paid' | 'Undid'
  where: string
  summary: string
}

/** Turns the actions a person approved into plain-language log lines. */
export function describeApproved(actions: AgentAction[]): ActivityEntry[] {
  const out: ActivityEntry[] = []
  for (const a of actions) {
    if (a.type === 'add') {
      const add = a as AddAction
      const names = add.records.slice(0, 3).map(r => labelOf(r) + (r['Amount'] !== undefined ? ` (${r['Amount']})` : '')).join(', ')
      const more = add.records.length > 3 ? ` and ${add.records.length - 3} more` : ''
      out.push({ action: 'Added', where: add.module, summary: `${add.records.length} record${add.records.length === 1 ? '' : 's'}: ${names}${more}` })
    } else {
      const up = a as UpdateAction
      if (up.kind === 'mark_paid') {
        out.push({ action: 'Marked paid', where: up.module, summary: up.label })
      } else {
        const fields = Object.entries(up.changes).slice(0, 3).map(([k, v]) => `${k} to ${String(v).slice(0, 30)}`).join(', ')
        out.push({ action: 'Changed', where: up.module, summary: `${up.label}: ${fields}` })
      }
    }
  }
  return out
}

/** Saves log lines. A logging problem must never stop the action itself, so errors are swallowed. */
export async function logActivity(userId: string, entries: ActivityEntry[]): Promise<void> {
  if (entries.length === 0) return
  try {
    const now = new Date().toISOString()
    const payloads = entries.map((e, i) => ({
      fields: {
        'User ID': userId,
        'Module': 'Activity',
        'Record Data': JSON.stringify({
          _meta: { source: 'activity_log', importedAt: now, importId: `act_${Date.now()}_${i}` },
          When: now,
          Action: e.action,
          Where: e.where,
          Summary: e.summary.slice(0, 200),
          By: 'You approved it in the chat',
        }),
        'Source': 'activity_log',
        'Created At': now.split('T')[0],
      },
    }))
    await storeCreate(userId, payloads)
  } catch (e: any) {
    console.error('activity log failed:', e?.message)
  }
}
