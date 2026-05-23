// next.config.ts
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.medream-studio.com' }],
        destination: 'https://medream-studio.com/:path*',
        permanent: true,
      },
    ]
  },
}

export default withNextIntl(nextConfig)
