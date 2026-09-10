// src/app/[locale]/blog/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { getBlogPost } from '@/lib/notion'
import { NotionBlocks } from '@/components/shared/NotionBlocks'

export const revalidate = 300

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const l = locale as 'th' | 'en'
  const post = await getBlogPost(slug, l)
  if (!post) notFound()

  return (
    <div className="pt-16">
      <article className="py-20 px-4 max-w-3xl mx-auto">
        <p className="text-horizon text-sm mb-2">{post.date}</p>
        <h1 className="text-3xl md:text-4xl font-black text-dawn-gold mb-8">
          {post.title}
        </h1>
        <div className="text-dream-cream">
          <NotionBlocks blocks={post.blocks} />
        </div>
      </article>
    </div>
  )
}
