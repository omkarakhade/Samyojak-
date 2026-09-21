import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://samyojak.vercel.app'
  const now = new Date()

  const staticRoutes = [
    '',
    '/features',
    '/pricing',
    '/about',
    '/contact',
    '/support',
    '/referral',
    '/compare/samyojak-vs-odoo',
    '/compare/samyojak-vs-zoho',
    '/alternatives/odoo',
    '/alternatives/zoho',
  ]

  return staticRoutes.map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === '' ? 'daily' as const : 'weekly' as const,
    priority: route === '' ? 1 : 0.7,
  }))
}
