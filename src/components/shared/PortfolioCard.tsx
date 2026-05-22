import Image from 'next/image'
import type { PortfolioItem } from '@/types/content'

interface Props {
  item: PortfolioItem
  locale: string
}

export function PortfolioCard({ item, locale }: Props) {
  const l = locale as 'th' | 'en'
  return (
    <div className="bg-deep-space border border-nebula rounded-xl overflow-hidden hover:border-electric transition-colors group">
      <div className="relative h-48 bg-nebula overflow-hidden">
        <Image
          src={item.image}
          alt={l === 'th' ? item.title_th : item.title_en}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <div className="flex gap-2 mb-2 flex-wrap">
          {item.tags.map(tag => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded bg-nebula text-horizon"
            >
              {tag}
            </span>
          ))}
          <span className="text-xs px-2 py-0.5 rounded bg-royal-blue/30 text-electric">
            {item.year}
          </span>
        </div>
        <h3 className="text-dream-cream font-bold">
          {l === 'th' ? item.title_th : item.title_en}
        </h3>
        <p className="text-horizon text-sm mt-1 leading-relaxed">
          {l === 'th' ? item.desc_th : item.desc_en}
        </p>
      </div>
    </div>
  )
}
