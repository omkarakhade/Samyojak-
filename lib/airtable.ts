const TOKEN = process.env.NEXT_PUBLIC_AIRTABLE_TOKEN || ''
const BASE = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || ''
const BASE_URL = `https://api.airtable.com/v0/${BASE}`

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
}

export const airtable = {
  async get(table: string, params?: string) {
    const url = params
      ? `${BASE_URL}/${table}?${params}`
      : `${BASE_URL}/${table}`
    const r = await fetch(url, { headers })
    if (!r.ok) throw new Error(`Airtable error: ${r.statusText}`)
    return r.json()
  },

  async create(table: string, fields: Record<string, any>) {
    const r = await fetch(`${BASE_URL}/${table}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ fields }),
    })
    if (!r.ok) throw new Error(`Airtable error: ${r.statusText}`)
    return r.json()
  },

  async update(table: string, id: string, fields: Record<string, any>) {
    const r = await fetch(`${BASE_URL}/${table}/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ fields }),
    })
    if (!r.ok) throw new Error(`Airtable error: ${r.statusText}`)
    return r.json()
  },

  async del(table: string, id: string) {
    const r = await fetch(`${BASE_URL}/${table}/${id}`, {
      method: 'DELETE',
      headers,
    })
    if (!r.ok) throw new Error(`Airtable error: ${r.statusText}`)
    return r.json()
  },
}
