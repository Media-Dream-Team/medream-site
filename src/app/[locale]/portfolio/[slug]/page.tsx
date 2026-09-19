// src/app/[locale]/portfolio/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { getPortfolioItem } from '@/lib/notion'
import { NotionBlocks } from '@/components/shared/NotionBlocks'
import { PortfolioGallery } from '@/components/shared/PortfolioGallery'

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
        </div>
      </section>
      <article className="bg-surface-tint border-t border-line py-16 md:py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-fg-2 leading-relaxed mb-8">{item.desc}</p>
          <NotionBlocks blocks={item.blocks} />
          <PortfolioGallery images={item.gallery} />
        </div>
      </article>
    </>
  )
}
