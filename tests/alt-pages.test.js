const test = require('node:test')
const assert = require('node:assert/strict')
const { loadTs } = require('./helpers')
const { ALT_PAGES } = loadTs('lib/altPages.ts')

test('alternative pages are complete, unique and fair to the other tool', () => {
  const slugs = new Set()
  for (const p of ALT_PAGES) {
    assert.ok(!slugs.has(p.slug), p.slug); slugs.add(p.slug)
    assert.ok(p.title.length <= 62, p.slug + ' title')
    assert.ok(p.description.length <= 165, p.slug + ' description')
    assert.ok(p.items.length >= 5 && p.faqs.length >= 3 && p.related.length >= 1, p.slug)
    assert.ok(p.faqs[0].q.startsWith('When should I stay with'), p.slug + ' says when the other tool is better')
  }
  assert.ok(['tally', 'vyapar', 'mybillbook', 'zoho-books', 'quickbooks'].every(s => slugs.has(s)))
})
