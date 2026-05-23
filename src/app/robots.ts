import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/th/team/', '/en/team/'],
    },
    sitemap: 'https://medream-studio.com/sitemap.xml',
  }
}
