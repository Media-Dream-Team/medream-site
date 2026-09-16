// src/app/[locale]/blog/BlogGrid.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import type { BlogCategoryId } from '@/types/content'
import type { BlogPostSummary } from '@/lib/notion'
import { BlogCard } from '@/components/shared/BlogCard'

interface Category {
  id: BlogCategoryId
  label: string
}

interface Props {
  posts: BlogPostSummary[]
  locale: string
  categories: Category[]
  allLabel: string
  readMoreLabel: string
}

const CATEGORY_STYLE: Record<BlogCategoryId, string> = {
  knowledge: 'bg-blue text-white border-blue',
  devlog: 'bg-sky text-navy border-sky',
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

export function BlogGrid({ posts, locale, categories, allLabel, readMoreLabel }: Props) {
  const [active, setActive] = useState<BlogCategoryId | 'all'>('all')

  const chips: { id: BlogCategoryId | 'all'; label: string; activeClass: string }[] = [
    { id: 'all', label: allLabel, activeClass: 'bg-navy text-white border-navy' },
    ...categories.map(c => ({ id: c.id, label: c.label, activeClass: CATEGORY_STYLE[c.id] })),
  ]

  const filtered = active === 'all' ? posts : posts.filter(post => post.category === active)

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
        {filtered.map((post, i) => {
          const categoryDef = post.category ? categories.find(c => c.id === post.category) : undefined
          return (
            <RevealCard key={post.slug} index={i}>
              <BlogCard
                post={post}
                href={`/${locale}/blog/${post.slug}`}
                readMoreLabel={readMoreLabel}
                categoryBadge={
                  categoryDef ? { label: categoryDef.label, className: CATEGORY_STYLE[categoryDef.id] } : null
                }
              />
            </RevealCard>
          )
        })}
      </div>
    </div>
  )
}
