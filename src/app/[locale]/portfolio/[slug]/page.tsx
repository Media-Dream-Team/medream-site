// src/app/[locale]/portfolio/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { getPortfolioItem } from '@/lib/notion'
import { NotionBlocks } from '@/components/shared/NotionBlocks'

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
    <div className="pt-16">
      <article className="py-20 px-4 max-w-3xl mx-auto">
        <p className="text-horizon text-sm mb-2">{item.year}</p>
        <h1 className="text-3xl md:text-4xl font-black text-dawn-gold mb-4">
          {item.title}
        </h1>
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mb-8 text-sm px-3 py-1.5 rounded bg-electric/10 text-electric border border-electric/30 hover:bg-electric/20 transition-colors"
          >
            {l === 'th' ? 'เล่นเกม →' : 'Play →'}
          </a>
        )}
        <p className="text-dream-cream leading-relaxed mb-8">{item.desc}</p>
        <div className="text-dream-cream">
          <NotionBlocks blocks={item.blocks} />
        </div>
      </article>
    </div>
  )
}
