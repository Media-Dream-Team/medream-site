import type { MetadataRoute } from 'next'

const BASE_URL = 'https://medream-studio.com'
const locales = ['th', 'en']
const staticRoutes = ['', '/services', '/portfolio', '/about', '/faq', '/contact', '/blog', '/careers', '/team']

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []

  for (const locale of locales) {
    for (const route of staticRoutes) {
      if (route === '/team') continue // hidden pages excluded
      entries.push({
        url: `${BASE_URL}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'weekly' : 'monthly',
        priority: route === '' ? 1 : 0.8,
      })
    }
  }

  return entries
}
