import Image from 'next/image'
import type { PortfolioItem } from '@/types/content'
import { Badge } from '@/components/ui/Badge'

interface Props {
  item: PortfolioItem
  locale: string
}

export function PortfolioCard({ item, locale }: Props) {
  const l = locale as 'th' | 'en'
  return (
    <div className="border border-line bg-white overflow-hidden hover:border-blue transition-colors">
      <div className="relative h-48 bg-navy-card overflow-hidden">
        <Image
          src={item.image}
          alt={l === 'th' ? item.title_th : item.title_en}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {item.featured && <Badge>{l === 'th' ? 'ผลงานเด่น' : 'Featured'}</Badge>}
          {item.tags.map(tag => (
            <span key={tag} className="text-xs font-display font-medium text-fg-3 border border-line px-2 py-0.5">
              {tag}
            </span>
          ))}
          <span className="text-xs text-fg-3">{item.year}</span>
        </div>
        <h3 className="font-display font-semibold text-ink text-lg">
          {l === 'th' ? item.title_th : item.title_en}
        </h3>
        <p className="text-fg-2 text-sm mt-1 leading-relaxed">
          {l === 'th' ? item.desc_th : item.desc_en}
        </p>
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 font-display font-semibold text-sm text-blue hover:text-navy transition-colors"
          >
            {l === 'th' ? 'เล่นเกม' : 'Play'}
            <svg viewBox="0 0 16 16" className="w-[0.85em] h-[0.85em]" fill="currentColor" aria-hidden="true">
              <path d="M2 7h9.2L7.6 3.4 9 2l6 6-6 6-1.4-1.4L11.2 9H2z" />
            </svg>
          </a>
        )}
      </div>
    </div>
  )
}
