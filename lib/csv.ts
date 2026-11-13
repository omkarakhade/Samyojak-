/**
 * Small, forgiving CSV/TSV reader used by guided migration (runs in the browser).
 * Handles: BOM, CRLF, quoted fields with commas/newlines/"" escapes,
 * and comma, tab, semicolon or pipe delimiters (detected from the header line).
 */

export interface ParsedSheet {
  headers: string[]
  rows: Record<string, string>[]
  totalRows: number
}

function detectDelimiter(firstLine: string): string {
  const candidates = [',', '\t', ';', '|']
  let best = ','
  let bestCount = 0
  for (const d of candidates) {
    const count = firstLine.split(d).length - 1
    if (count > bestCount) {
      best = d
      bestCount = count
    }
  }
  return best
}

export function parseSheetText(raw: string): ParsedSheet {
  const text = raw.replace(/^﻿/, '')
  const firstLine = text.split(/\r?\n/, 1)[0] || ''
  const delimiter = detectDelimiter(firstLine)

  const records: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === delimiter) {
      row.push(field)
      field = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      field = ''
      records.push(row)
      row = []
    } else {
      field += ch
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    records.push(row)
  }

  const nonEmpty = records.filter(r => r.some(c => c.trim().length > 0))
  if (nonEmpty.length < 1) return { headers: [], rows: [], totalRows: 0 }

  // Unique, non-empty header names
  const seen = new Map<string, number>()
  const headers = nonEmpty[0].map((h, i) => {
    let name = h.trim() || `Column ${i + 1}`
    const n = (seen.get(name) || 0) + 1
    seen.set(name, n)
    if (n > 1) name = `${name} (${n})`
    return name
  })

  const rows = nonEmpty.slice(1).map(cells => {
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => {
      obj[h] = (cells[i] ?? '').trim()
    })
    return obj
  })

  return { headers, rows, totalRows: rows.length }
}
