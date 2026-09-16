// src/app/[locale]/blog/BlogFeaturedCard.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { BlogPostSummary } from '@/lib/notion'

interface CategoryBadge {
  label: string
  className: string
}

interface Props {
  post: BlogPostSummary
  href: string
  readMoreLabel: string
  categoryBadge?: CategoryBadge | null
}

const CHAMFER_STYLE: React.CSSProperties = {
  clipPath: 'polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)',
}

const ARROW_PATH = 'M2 7h9.2L7.6 3.4 9 2l6 6-6 6-1.4-1.4L11.2 9H2z'

export function BlogFeaturedCard({ post, href, readMoreLabel, categoryBadge }: Props) {
  const ref = useRef<HTMLAnchorElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      entries => entries.forEach(entry => { if (entry.isIntersecting) setVisible(true) }),
      { threshold: 0 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Link
      ref={ref}
      href={href}
      className="group grid grid-cols-1 md:grid-cols-[1.2fr_1fr] border border-line bg-white overflow-hidden transition-[opacity,transform] duration-[550ms] ease-out"
      style={{
        ...CHAMFER_STYLE,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-40px)',
      }}
    >
      <div className="relative aspect-[16/10] bg-navy-card">
        <Image src={post.cover || '/images/portfolio/placeholder.png'} alt={post.title} fill className="object-cover" />
        {categoryBadge && (
          <span
            className={`absolute top-4 left-4 font-display font-bold text-xs px-3.5 py-[6px] whitespace-nowrap ${categoryBadge.className}`}
          >
            {categoryBadge.label}
          </span>
        )}
      </div>
      <div className="p-8 md:p-10 flex flex-col justify-center gap-3">
        <p className="font-display font-semibold text-fg-3 text-xs">{post.date}</p>
        <h2 className="font-display font-semibold text-ink text-2xl md:text-[28px] leading-tight">{post.title}</h2>
        <p className="text-fg-2 leading-relaxed">{post.excerpt}</p>
        <span className="inline-flex items-center gap-2 font-display font-bold text-sm text-blue mt-1 group-hover:text-navy transition-colors">
          {readMoreLabel}
          <svg viewBox="0 0 16 16" className="w-[0.85em] h-[0.85em]" fill="currentColor" aria-hidden="true">
            <path d={ARROW_PATH} />
          </svg>
        </span>
      </div>
    </Link>
  )
}
