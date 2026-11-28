const test = require('node:test')
const assert = require('node:assert')
const { loadTs } = require('./helpers')
const { FEATURE_PAGES, TAX_PAGES } = loadTs('lib/seoPages.ts')
const { suggestTax } = loadTs('lib/worldTax.ts')

test('SEO pages have unique slugs, sane titles and descriptions, and FAQs', () => {
  const all = [...FEATURE_PAGES, ...TAX_PAGES]
  const slugs = FEATURE_PAGES.map(p => p.slug)
  assert.equal(new Set(slugs).size, slugs.length)
  assert.equal(new Set(TAX_PAGES.map(p => p.slug)).size, TAX_PAGES.length)
  for (const p of all) {
    assert.ok(p.title.length <= 66, `${p.slug} title too long`)
    assert.ok(p.description.length >= 90 && p.description.length <= 170, `${p.slug} description length ${p.description.length}`)
    assert.ok(p.faqs.length >= 1 && p.items.length >= 3)
  }
})
test('Tax page rates agree with the rates the product applies', () => {
  const rate = (cur, extra = {}) => suggestTax({ Currency: cur, 'Line Items': 'Desk x1 @100', Amount: 100, ...extra }).rate
  assert.equal(rate('GBP'), 20)
  assert.equal(rate('AED'), 5)
  assert.equal(rate('SGD'), 9)
  assert.equal(rate('AUD'), 10)
  assert.equal(rate('NZD'), 15)
  assert.equal(rate('CAD', { Province: 'Ontario' }), 13)
  assert.equal(rate('USD', { State: 'Texas' }), 6.25)
})
