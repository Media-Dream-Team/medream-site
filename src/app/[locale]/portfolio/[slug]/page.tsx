// src/app/[locale]/portfolio/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { getPortfolioItem } from '@/lib/notion'
import { NotionBlocks } from '@/components/shared/NotionBlocks'
import { Star } from '@/components/ui/Star'

const CHAMFER_STYLE: React.CSSProperties = {
  clipPath: 'polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)',
}

export const revalidate = 300

export default async function PortfolioDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const l = locale as 'th' | 'en'
  const item = await getPortfolioItem(slug, l)
  if (!item) notFound()

  return (
    <>
      <section className="bg-midnight pt-24 pb-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-mist text-sm mb-3">{item.year}</p>
          <h1 className="font-display font-semibold text-white text-3xl md:text-4xl leading-tight mb-6">
            {item.title}
          </h1>
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              style={CHAMFER_STYLE}
              className="inline-flex items-center gap-2 font-display font-semibold text-[15px] leading-none bg-first-light text-navy px-[22px] py-[13px] transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:bg-dawn focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-sky focus-visible:outline-offset-[3px]"
            >
              <Star className="w-[0.9em] h-[0.9em]" />
              {l === 'th' ? 'เล่นเกม' : 'Play'}
            </a>
          )}
        </div>
      </section>
      <article className="bg-surface-tint border-t border-line py-16 md:py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-fg-2 leading-relaxed mb-8">{item.desc}</p>
          <NotionBlocks blocks={item.blocks} />
        </div>
      </article>
    </>
  )
}
