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
    <>
      <section className="bg-midnight pt-24 pb-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-mist text-sm mb-3">{post.date}</p>
          <h1 className="font-display font-semibold text-white text-3xl md:text-4xl leading-tight">
            {post.title}
          </h1>
        </div>
      </section>
      <article className="bg-surface-tint border-t border-line py-16 md:py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <NotionBlocks blocks={post.blocks} />
        </div>
      </article>
    </>
  )
}
