// src/app/[locale]/portfolio/page.tsx
import type { Metadata } from 'next'
import { getPortfolioItems } from '@/lib/content'
import { PortfolioGrid } from './PortfolioGrid'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isTh = locale === 'th'
  const title = isTh ? 'ผลงาน | MeDream Studio' : 'Portfolio | MeDream Studio'
  const description = isTh
    ? 'ดูผลงานเกม แอนิเมชัน AR/VR และสื่อดิจิทัลจาก MeDream Studio'
    : 'Browse games, animation, AR/VR and digital media projects built by MeDream Studio.'
  return {
    title,
    description,
    alternates: {
      canonical: `https://medream-studio.com/${locale}/portfolio`,
      languages: { th: 'https://medream-studio.com/th/portfolio', en: 'https://medream-studio.com/en/portfolio' },
    },
    keywords: isTh
      ? ['ผลงานเกม', 'ตัวอย่างผลงาน', 'Thai Game Studio', 'Unity Game', 'เกมไทย', 'แอนิเมชันไทย', 'AR VR ผลงาน', 'MeDream ผลงาน']
      : ['Game Portfolio', 'Thai Game Studio', 'Unity Games', 'Game Demo', 'Animation Portfolio', 'AR VR Projects', 'MeDream Portfolio'],
    openGraph: {
      title,
      description,
      url: `https://medream-studio.com/${locale}/portfolio`,
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'MeDream Studio' }],
    },
  }
}

export default async function PortfolioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const items = getPortfolioItems()
  return (
    <div className="pt-16">
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-dawn-gold mb-12">
            {locale === 'th' ? 'ผลงาน' : 'Portfolio'}
          </h1>
          <PortfolioGrid items={items} locale={locale} />
        </div>
      </section>
    </div>
  )
}
