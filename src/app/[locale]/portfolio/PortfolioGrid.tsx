// src/app/[locale]/portfolio/PortfolioGrid.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import type { PortfolioItem, ServiceGroup, ServiceGroupId } from '@/types/content'
import { PortfolioCard } from '@/components/shared/PortfolioCard'

interface Props {
  items: PortfolioItem[]
  locale: string
  groups: ServiceGroup[]
  allLabel: string
}

const CATEGORY_STYLE: Record<ServiceGroupId, string> = {
  'marketing-event': 'bg-blue text-white border-blue',
  crm: 'bg-sky text-navy border-sky',
  learning: 'bg-dawn text-navy border-dawn',
  games: 'bg-first-light text-navy border-first-light',
}

function RevealCard({ index, children }: { index: number; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      entries => entries.forEach(entry => { if (entry.isIntersecting) setVisible(true) }),
      { threshold: 0.1, rootMargin: '0px 0px -10px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="transition-[opacity,transform] duration-[550ms] ease-out"
      style={{
        transitionDelay: visible ? `${index * 90}ms` : '0ms',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-40px)',
      }}
    >
      {children}
    </div>
  )
}

export function PortfolioGrid({ items, locale, groups, allLabel }: Props) {
  const [active, setActive] = useState<ServiceGroupId | 'all'>('all')
  const l = locale as 'th' | 'en'

  const chips: { id: ServiceGroupId | 'all'; label: string; activeClass: string }[] = [
    { id: 'all', label: allLabel, activeClass: 'bg-navy text-white border-navy' },
    ...groups.map(g => ({
      id: g.id,
      label: l === 'th' ? g.title_th : g.title_en,
      activeClass: CATEGORY_STYLE[g.id],
    })),
  ]

  const filtered = active === 'all' ? items : items.filter(item => item.category === active)

  return (
    <div>
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2 mb-8 -mx-4 px-4 md:mx-0 md:px-0">
        {chips.map(chip => {
          const isActive = active === chip.id
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => setActive(chip.id)}
              className={`font-display font-semibold text-sm whitespace-nowrap flex-shrink-0 px-[18px] py-[9px] rounded-full border transition-colors duration-200 ease-out ${
                isActive ? chip.activeClass : 'border-line text-fg-2 bg-transparent'
              }`}
            >
              {chip.label}
            </button>
          )
        })}
      </div>
      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))] gap-6">
        {filtered.map((item, i) => {
          const categoryGroup = item.category ? groups.find(g => g.id === item.category) : undefined
          return (
            <RevealCard key={item.id} index={i}>
              <PortfolioCard
                item={item}
                locale={locale}
                detailHref={`/${locale}/portfolio/${item.id}`}
                categoryBadge={
                  categoryGroup
                    ? {
                        label: l === 'th' ? categoryGroup.title_th : categoryGroup.title_en,
                        className: CATEGORY_STYLE[categoryGroup.id],
                      }
                    : null
                }
              />
            </RevealCard>
          )
        })}
      </div>
    </div>
  )
}
