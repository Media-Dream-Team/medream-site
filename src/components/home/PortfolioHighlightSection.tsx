import Link from 'next/link'
import type { PortfolioItem } from '@/types/content'
import { PortfolioCard } from '@/components/shared/PortfolioCard'

interface Props {
  items: PortfolioItem[]
  locale: string
}

export function PortfolioHighlightSection({ items, locale }: Props) {
  const l = locale as 'th' | 'en'
  return (
    <section className="py-20 px-4 bg-deep-space/30">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black text-dawn-gold mb-10 text-center">
          {l === 'th' ? 'ผลงานที่ผ่านมา' : 'Our Work'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
          {items.map(item => (
            <PortfolioCard key={item.id} item={item} locale={locale} />
          ))}
        </div>
        <div className="text-center">
          <Link
            href={`/${locale}/portfolio`}
            className="inline-block px-8 py-3 border-2 border-electric text-electric hover:bg-electric hover:text-white font-bold rounded transition-colors"
          >
            {l === 'th' ? 'ดูผลงานทั้งหมด' : 'See All Work'}
          </Link>
        </div>
      </div>
    </section>
  )
}
