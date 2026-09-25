import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/crm', '/invoices', '/inventory', '/hr', '/projects', '/reports', '/api', '/upgrade'],
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/dashboard', '/crm', '/invoices', '/inventory', '/hr', '/projects', '/reports', '/api', '/upgrade'],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: ['/dashboard', '/crm', '/invoices', '/inventory', '/hr', '/projects', '/reports', '/api', '/upgrade'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/dashboard', '/crm', '/invoices', '/inventory', '/hr', '/projects', '/reports', '/api', '/upgrade'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: ['/dashboard', '/crm', '/invoices', '/inventory', '/hr', '/projects', '/reports', '/api', '/upgrade'],
      },
      {
        userAgent: 'anthropic-ai',
        allow: '/',
        disallow: ['/dashboard', '/crm', '/invoices', '/inventory', '/hr', '/projects', '/reports', '/api', '/upgrade'],
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: ['/dashboard', '/crm', '/invoices', '/inventory', '/hr', '/projects', '/reports', '/api', '/upgrade'],
      },
    ],
    sitemap: 'https://www.samyojak-erp.com/sitemap.xml',
  }
}
