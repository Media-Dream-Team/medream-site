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

export function BlogCard({ post, href, readMoreLabel, categoryBadge }: Props) {
  return (
    <Link
      href={href}
      className="group block border border-line bg-white overflow-hidden hover:border-blue transition-colors"
      style={CHAMFER_STYLE}
    >
      <div className="relative aspect-[16/10] bg-navy-card overflow-hidden">
        <Image src={post.cover || '/images/portfolio/placeholder.png'} alt={post.title} fill className="object-cover" />
        {categoryBadge && (
          <span
            className={`absolute top-3 left-3 font-display font-bold text-xs px-3 py-[5px] whitespace-nowrap ${categoryBadge.className}`}
          >
            {categoryBadge.label}
          </span>
        )}
      </div>
      <div className="p-5">
        <p className="font-display font-semibold text-fg-3 text-xs mb-2">{post.date}</p>
        <h3 className="font-display font-semibold text-ink text-lg mb-1">{post.title}</h3>
        <p className="text-fg-2 text-sm leading-relaxed">{post.excerpt}</p>
        <span className="inline-flex items-center gap-1.5 mt-3 font-display font-semibold text-sm text-blue group-hover:text-navy transition-colors">
          {readMoreLabel}
          <svg viewBox="0 0 16 16" className="w-[0.85em] h-[0.85em]" fill="currentColor" aria-hidden="true">
            <path d={ARROW_PATH} />
          </svg>
        </span>
      </div>
    </Link>
  )
}
