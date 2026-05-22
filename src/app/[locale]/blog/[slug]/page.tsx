// src/app/[locale]/blog/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { getBlogPost } from '@/lib/content'

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const l = locale as 'th' | 'en'
  const post = getBlogPost(slug)
  if (!post) notFound()

  return (
    <div className="pt-16">
      <article className="py-20 px-4 max-w-3xl mx-auto">
        <p className="text-horizon text-sm mb-2">{post.date}</p>
        <h1 className="text-3xl md:text-4xl font-black text-dawn-gold mb-8">
          {l === 'th' ? post.title_th : post.title_en}
        </h1>
        <div
          className="text-dream-cream leading-relaxed prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{
            __html: l === 'th' ? post.body_th : post.body_en,
          }}
        />
      </article>
    </div>
  )
}
