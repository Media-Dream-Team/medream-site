// src/app/[locale]/portfolio/page.tsx
import type { Metadata } from 'next'
import { getPortfolioItems } from '@/lib/content'
import { PortfolioGrid } from './PortfolioGrid'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return { title: locale === 'th' ? 'ผลงาน' : 'Portfolio' }
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
