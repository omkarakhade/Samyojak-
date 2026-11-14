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


/** Turn rows from an Excel sheet (array of arrays) into the same shape as parseSheetText. First row = headers. */
export function matrixToSheet(matrix: unknown[][]): ParsedSheet {
  const cell = (v: unknown): string => {
    if (v === null || v === undefined) return ''
    if (v instanceof Date) return v.toISOString().slice(0, 10)
    return String(v).trim()
  }
  const rowsRaw = matrix.filter(r => Array.isArray(r) && r.some(c => cell(c) !== ''))
  if (rowsRaw.length < 2) return { headers: [], rows: [], totalRows: 0 }
  const seen = new Set<string>()
  const headers = rowsRaw[0].map((h, i) => {
    let name = cell(h) || `Column ${i + 1}`
    while (seen.has(name)) name = `${name} (${i + 1})`
    seen.add(name)
    return name
  })
  const rows = rowsRaw.slice(1).map(r => {
    const o: Record<string, string> = {}
    headers.forEach((h, i) => { o[h] = cell(r[i]) })
    return o
  })
  return { headers, rows, totalRows: rows.length }
}
