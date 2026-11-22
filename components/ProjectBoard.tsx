'use client'
import React, { useEffect, useState } from 'react'

const COLUMNS = ['Planning', 'In Progress', 'Review', 'Done']

type Card = { id: string; name: string; client: string; deadline: string; status: string }

function pick(data: Record<string, any>, pattern: RegExp): string {
  const k = Object.keys(data || {}).find(key => pattern.test(key) && data[key] !== '' && data[key] != null)
  return k ? String(data[k]) : ''
}

function column(status: string): string {
  const s = status.toLowerCase()
  if (/done|complete|finish|closed/.test(s)) return 'Done'
  if (/review|testing|qa/.test(s)) return 'Review'
  if (/progress|active|ongoing|started|doing/.test(s)) return 'In Progress'
  return 'Planning'
}

export default function ProjectBoard({ userId, refreshKey }: { userId: string; refreshKey: number }) {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch('/api/universal-data?' + new URLSearchParams({ userId, module: 'Projects' }))
      .then(r => r.json())
      .then(json => {
        if (cancelled) return
        if (json.error) throw new Error(json.error)
        setCards((json.records || []).map((r: any) => ({
          id: r.id,
          name: pick(r.data, /project.?name|^name$|title/i) || 'Untitled',
          client: pick(r.data, /client|customer/i),
          deadline: pick(r.data, /deadline|due/i),
          status: column(pick(r.data, /^status$|^stage$/i)),
        })))
        setLoading(false)
      })
      .catch((e: any) => { if (!cancelled) { setError(e.message || 'Could not load projects.'); setLoading(false) } })
    return () => { cancelled = true }
  }, [userId, refreshKey])

  const move = async (card: Card, status: string) => {
    const before = cards
    setCards(cards.map(c => (c.id === card.id ? { ...c, status } : c)))
    try {
      const res = await fetch('/api/universal-data', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: card.id, status }),
      })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error || 'Could not move it')
    } catch (e: any) {
      setCards(before)
      setError(e.message)
    }
  }

  if (loading) return <p className="text-gray-500 text-sm">Loading board...</p>
  return (
    <div className="space-y-2">
      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {COLUMNS.map((col, ci) => {
          const items = cards.filter(c => c.status === col)
          return (
            <div key={col} className="bg-gray-50 dark:bg-white/5 rounded-2xl p-3 border border-gray-200 dark:border-white/10">
              <div className="flex justify-between text-sm font-bold text-gray-800 dark:text-white mb-2">
                <span>{col}</span><span className="text-gray-400">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map(c => (
                  <div key={c.id} className="bg-white dark:bg-[#1a2740] rounded-xl p-3 border border-gray-200 dark:border-white/10">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white break-words">{c.name}</div>
                    {(c.client || c.deadline) && (
                      <div className="text-xs text-gray-500 mt-0.5">{[c.client, c.deadline && 'due ' + c.deadline].filter(Boolean).join(' · ')}</div>
                    )}
                    <div className="flex gap-2 mt-2">
                      {ci > 0 && <button onClick={() => move(c, COLUMNS[ci - 1])} className="text-xs px-2 py-1 rounded-lg border border-gray-300 dark:border-white/20 text-gray-600 dark:text-gray-300">← {COLUMNS[ci - 1]}</button>}
                      {ci < COLUMNS.length - 1 && <button onClick={() => move(c, COLUMNS[ci + 1])} className="text-xs px-2 py-1 rounded-lg bg-violet-500 text-white">{COLUMNS[ci + 1]} →</button>}
                    </div>
                  </div>
                ))}
                {items.length === 0 && <p className="text-xs text-gray-400">Nothing here</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
