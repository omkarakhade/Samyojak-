// Loads the app's TypeScript files for tests without Next.js. Run with: npm test
const ts = require('typescript')
const fs = require('fs')
const path = require('path')
const Module = require('module')

const ROOT = path.resolve(__dirname, '..')
const cache = {}

/** In-memory stand-ins, so tests never touch Supabase, Airtable or the AI model. */
const state = { rows: [] }
const fakeStore = () => ({
  storeList: async () => state.rows,
  storeGet: async () => null,
  storeCreate: async () => ({ id: 'rec_test' }),
  storeWrite: async () => {},
  storeDelete: async () => {},
  storeFindBatch: async () => [],
})
const fakeStock = () => ({
  deductStock: async () => ({ changes: [], missing: [] }),
  formatDeducted: () => '',
  restoreStock: async () => 0,
  describeStock: () => [],
})

function loadTs(rel, opts = {}) {
  const file = path.join(ROOT, rel)
  const key = rel + (opts.realStock ? ':real' : '')
  if (cache[key]) return cache[key]
  const out = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: 'commonjs', target: 'es2020' },
  }).outputText
  const m = new Module(file)
  m.filename = file
  m.paths = Module._nodeModulePaths(ROOT)
  cache[key] = m.exports
  m.require = req => {
    if (req === '@/lib/store') return fakeStore()
    if (req === '@/lib/stockSync' && !opts.realStock) return fakeStock()
    if (req.startsWith('@/')) return loadTs(req.slice(2) + '.ts', opts)
    return require(req)
  }
  m._compile(out, file)
  cache[key] = m.exports
  return m.exports
}

const USER = '3f2b8c1e-5d4a-4b7e-9a10-1c2d3e4f5a6b'
const invoiceRow = (client, amount, status = 'Unpaid') => ({
  id: 'recABCDEFGHIJKLMN',
  fields: { Module: 'Invoices', 'Record Data': JSON.stringify({ 'Client Name': client, Amount: amount, 'Payment Status': status }) },
})

module.exports = { loadTs, state, USER, invoiceRow }
