/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://www.medream-studio.com',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    additionalSitemaps: [],
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/th/team/', '/en/team/'],
      },
    ],
  },
  exclude: [
    '/th/team/*',
    '/en/team/*',
    '*/team/*',
  ],
}
