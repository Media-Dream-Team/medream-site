// src/app/[locale]/portfolio/PortfolioGrid.tsx
'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import type { PortfolioItem } from '@/types/content'
import { PortfolioCard } from '@/components/shared/PortfolioCard'

type Filter = 'all' | 'own-ip' | 'client'

interface Props {
  items: PortfolioItem[]
  locale: string
}

export function PortfolioGrid({ items, locale }: Props) {
  const t = useTranslations('portfolio')
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = filter === 'all' ? items : items.filter(i => i.type === filter)

  const btnClass = (active: boolean) =>
    `px-4 py-1.5 rounded font-bold text-sm transition-colors ${
      active
        ? 'bg-royal-blue text-white'
        : 'border border-nebula text-horizon hover:border-electric hover:text-electric'
    }`

  return (
    <>
      <div className="flex gap-3 mb-8 flex-wrap">
        <button className={btnClass(filter === 'all')} onClick={() => setFilter('all')}>
          {t('filter_all')}
        </button>
        <button className={btnClass(filter === 'own-ip')} onClick={() => setFilter('own-ip')}>
          {t('filter_own_ip')}
        </button>
        <button className={btnClass(filter === 'client')} onClick={() => setFilter('client')}>
          {t('filter_client')}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map(item => (
          <PortfolioCard key={item.id} item={item} locale={locale} />
        ))}
      </div>
    </>
  )
}
