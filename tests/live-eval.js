// Checks the REAL model with the CURRENT prompt against tests/agent-cases.js.
// Run before and after any change to the prompt or knowledge:
//   GROQ_API_KEY=... npm run test:live
// Costs a few cents. Not part of `npm test`, because it needs the key and the network.
const { loadTs } = require('./helpers')
const cases = require('./agent-cases')
const { buildSystemPrompt, stripJson } = loadTs('lib/agentPlan.ts')

const KEY = process.env.GROQ_API_KEY
if (!KEY) {
  console.error('Set GROQ_API_KEY first.')
  process.exit(2)
}
const MODEL = process.env.AGENT_MODEL || 'openai/gpt-oss-120b'
const RUNS = Number(process.env.RUNS || 1)

async function ask(message) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'system', content: buildSystemPrompt() }, { role: 'user', content: message }],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      reasoning_effort: 'low',
      max_tokens: 3500,
    }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} ${(await res.text()).slice(0, 200)}`)
  const data = await res.json()
  return stripJson(data.choices?.[0]?.message?.content || '') || {}
}

;(async () => {
  let failed = 0
  for (const c of cases) {
    let passes = 0
    let last = null
    for (let i = 0; i < RUNS; i++) {
      try {
        const parsed = await ask(c.say)
        last = parsed
        if (c.check(Array.isArray(parsed.operations) ? parsed.operations : [], parsed)) passes++
      } catch (e) {
        last = { error: e.message }
      }
    }
    const ok = passes === RUNS
    if (!ok) failed++
    console.log(`${ok ? 'PASS' : 'FAIL'} (${passes}/${RUNS})  ${c.name}`)
    if (!ok) console.log('   said:', c.say, '\n   got :', JSON.stringify(last).slice(0, 400))
  }
  console.log(failed ? `\n${failed} case(s) failed` : '\nAll cases passed')
  process.exit(failed ? 1 : 0)
})()
