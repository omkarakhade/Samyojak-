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
    '/compare',
    '/compare/samyojak-vs-odoo',
    '/compare/samyojak-vs-zoho',
    '/alternatives',
    '/alternatives/odoo',
    '/alternatives/zoho',
    '/industries',
    '/industries/manufacturing',
    '/industries/retail',
    '/industries/healthcare',
    '/industries/education',
  ]

  return staticRoutes.map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === '' ? 'daily' as const : 'weekly' as const,
    priority: route === '' ? 1 : 0.7,
  }))
}
