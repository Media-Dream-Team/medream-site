// src/app/[locale]/portfolio/page.tsx
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getPortfolioItems } from '@/lib/notion'
import { PortfolioGrid } from './PortfolioGrid'
import { OrbitHeroDecoration } from '@/components/shared/OrbitHeroDecoration'

export const revalidate = 300

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
  const items = await getPortfolioItems()
  const t = await getTranslations('portfolio')
  return (
    <>
      <section className="relative bg-midnight pt-24 pb-16 px-4 text-center overflow-hidden">
        <OrbitHeroDecoration />
        <div className="relative max-w-2xl mx-auto">
          <h1 className="font-display font-semibold text-white text-4xl md:text-[44px] md:leading-[1.15] tracking-[-.01em] mb-4">
            {t('title')}
          </h1>
          <p className="text-mist text-lg leading-relaxed">{t('subtitle')}</p>
        </div>
      </section>
      <section className="bg-surface-tint border-t border-line py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <PortfolioGrid items={items} locale={locale} />
        </div>
      </section>
    </>
  )
}
