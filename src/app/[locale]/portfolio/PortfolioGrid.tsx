// src/app/[locale]/portfolio/PortfolioGrid.tsx
import type { PortfolioItem } from '@/types/content'
import { PortfolioCard } from '@/components/shared/PortfolioCard'

interface Props {
  items: PortfolioItem[]
  locale: string
}

export function PortfolioGrid({ items, locale }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {items.map(item => (
        <PortfolioCard key={item.id} item={item} locale={locale} />
      ))}
    </div>
  )
}
