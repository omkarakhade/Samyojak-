import type { MetadataRoute } from 'next'

const PRIVATE = ['/dashboard', '/crm', '/invoices', '/inventory', '/hr', '/projects', '/reports', '/api', '/upgrade', '/debug', '/debug-airtable', '/debug-payment', '/admin']

// Bots that collect pages to train AI models or bulk-copy sites: blocked everywhere.
const TRAINING_BOTS = [
  'GPTBot',
  'ClaudeBot',
  'anthropic-ai',
  'Google-Extended',
  'CCBot',
  'Bytespider',
  'Applebot-Extended',
  'meta-externalagent',
  'FacebookBot',
  'Diffbot',
  'ImagesiftBot',
  'Omgilibot',
  'cohere-ai',
  'PetalBot',
  'AhrefsBot',
  'SemrushBot',
  'MJ12bot',
]

// Search and answer bots stay allowed on public pages so people can still find Samyojak when they ask an AI.
const SEARCH_BOTS = ['OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'Claude-SearchBot', 'Claude-User']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE },
      ...SEARCH_BOTS.map(userAgent => ({ userAgent, allow: '/', disallow: PRIVATE })),
      ...TRAINING_BOTS.map(userAgent => ({ userAgent, disallow: '/' })),
    ],
    sitemap: 'https://www.samyojak-erp.com/sitemap.xml',
  }
}
