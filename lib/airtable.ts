const TOKEN = process.env.NEXT_PUBLIC_AIRTABLE_TOKEN || ''
const BASE = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || ''
const BASE_URL = `https://api.airtable.com/v0/${BASE}`

const cache = new Map<string, { data: any; expires: number }>()
const CACHE_TTL = 60 * 1000

const getHeaders = () => ({
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
})

function invalidateTable(table: string) {
  Array.from(cache.keys()).forEach(key => {
    if (key.startsWith(`${table}:`)) cache.delete(key)
  })
}

export const airtable = {
  async get(table: string, params?: string) {
    const cacheKey = `${table}:${params || ''}`
    const cached = cache.get(cacheKey)
    if (cached && cached.expires > Date.now()) {
      return cached.data
    }
    const url = params
      ? `${BASE_URL}/${encodeURIComponent(table)}?${params}`
      : `${BASE_URL}/${encodeURIComponent(table)}`
    const r = await fetch(url, { headers: getHeaders() })
    if (!r.ok) {
      const err = await r.text()
      throw new Error(`Airtable GET ${table} failed ${r.status}: ${err}`)
    }
    const data = await r.json()
    cache.set(cacheKey, { data, expires: Date.now() + CACHE_TTL })
    return data
  },

  async create(table: string, fields: Record<string, unknown>) {
    invalidateTable(table)
    const url = `${BASE_URL}/${encodeURIComponent(table)}`
    const r = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ fields }),
    })
    if (!r.ok) {
      const err = await r.text()
      throw new Error(`Airtable CREATE ${table} failed ${r.status}: ${err}`)
    }
    return r.json()
  },

  async update(table: string, id: string, fields: Record<string, unknown>) {
    invalidateTable(table)
    const url = `${BASE_URL}/${encodeURIComponent(table)}/${id}`
    const r = await fetch(url, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ fields }),
    })
    if (!r.ok) {
      const err = await r.text()
      throw new Error(`Airtable UPDATE ${table} failed ${r.status}: ${err}`)
    }
    return r.json()
  },

  async del(table: string, id: string) {
    invalidateTable(table)
    const url = `${BASE_URL}/${encodeURIComponent(table)}/${id}`
    const r = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders(),
    })
    if (!r.ok) {
      const err = await r.text()
      throw new Error(`Airtable DELETE ${table} failed ${r.status}: ${err}`)
    }
    return r.json()
  },

  async getForce(table: string, params?: string) {
    const cacheKey = `${table}:${params || ''}`
    cache.delete(cacheKey)
    return this.get(table, params)
  },
}
