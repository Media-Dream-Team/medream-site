// src/app/[locale]/portfolio/PortfolioGrid.tsx
import type { PortfolioItem } from '@/types/content'
import { PortfolioCard } from '@/components/shared/PortfolioCard'

interface Props {
  items: PortfolioItem[]
  locale: string
}

// Cycling aspect ratios (portrait/landscape/square) gives the grid masonry-style
// visual rhythm even though items sit in a plain responsive grid.
const ASPECTS = ['4/5', '16/10', '1/1'] as const

export function PortfolioGrid({ items, locale }: Props) {
  return (
    <div className="grid [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))] gap-6">
      {items.map((item, i) => (
        <PortfolioCard
          key={item.id}
          item={item}
          locale={locale}
          detailHref={`/${locale}/portfolio/${item.id}`}
          aspect={ASPECTS[i % ASPECTS.length]}
        />
      ))}
    </div>
  )
}
