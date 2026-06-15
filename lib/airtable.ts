const TOKEN = process.env.NEXT_PUBLIC_AIRTABLE_TOKEN || ''
const BASE = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || ''
const BASE_URL = `https://api.airtable.com/v0/${BASE}`

const getHeaders = () => ({
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
})

export const airtable = {
  async get(table: string, params?: string) {
    const url = params
      ? `${BASE_URL}/${encodeURIComponent(table)}?${params}`
      : `${BASE_URL}/${encodeURIComponent(table)}`
    const r = await fetch(url, { headers: getHeaders() })
    if (!r.ok) {
      const err = await r.text()
      throw new Error(`Airtable GET error ${r.status}: ${err}`)
    }
    return r.json()
  },

  async create(table: string, fields: Record<string, any>) {
    const url = `${BASE_URL}/${encodeURIComponent(table)}`
    const body = JSON.stringify({ fields })
    const r = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body,
    })
    if (!r.ok) {
      const err = await r.text()
      throw new Error(`Airtable CREATE error ${r.status}: ${err}`)
    }
    return r.json()
  },

  async update(table: string, id: string, fields: Record<string, any>) {
    const url = `${BASE_URL}/${encodeURIComponent(table)}/${id}`
    const r = await fetch(url, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ fields }),
    })
    if (!r.ok) {
      const err = await r.text()
      throw new Error(`Airtable UPDATE error ${r.status}: ${err}`)
    }
    return r.json()
  },

  async del(table: string, id: string) {
    const url = `${BASE_URL}/${encodeURIComponent(table)}/${id}`
    const r = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders(),
    })
    if (!r.ok) {
      const err = await r.text()
      throw new Error(`Airtable DELETE error ${r.status}: ${err}`)
    }
    return r.json()
  },
}
