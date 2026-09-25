import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/crm', '/invoices', '/inventory', '/hr', '/projects', '/reports', '/api', '/upgrade'],
    },
    sitemap: 'https://www.samyojak-erp.com/sitemap.xml',
  }
}
