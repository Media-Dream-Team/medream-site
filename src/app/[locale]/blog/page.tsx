// src/app/[locale]/blog/page.tsx
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import type { BlogCategoryId } from '@/types/content'
import { getBlogPosts } from '@/lib/notion'
import { OrbitHeroDecoration } from '@/components/shared/OrbitHeroDecoration'
import { BlogFeaturedCard } from './BlogFeaturedCard'
import { BlogGrid } from './BlogGrid'

export const revalidate = 300

const BLOG_CATEGORY_IDS: BlogCategoryId[] = ['knowledge', 'devlog']

const CATEGORY_STYLE: Record<BlogCategoryId, string> = {
  knowledge: 'bg-blue text-white border-blue',
  devlog: 'bg-sky text-navy border-sky',
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isTh = locale === 'th'
  const title = isTh ? 'บทความ | MeDream Studio' : 'Blog | MeDream Studio'
  const description = isTh
    ? 'บทความและความรู้เกี่ยวกับการพัฒนาเกม แอนิเมชัน AR/VR และอุตสาหกรรมดิจิทัลจาก MeDream Studio'
    : 'Articles and insights on game development, animation, AR/VR and the digital industry from MeDream Studio.'
  return {
    title,
    description,
    keywords: isTh
      ? ['บทความเกม', 'ความรู้พัฒนาเกม', 'MeDream บทความ', 'AR VR บทความ']
      : ['Game Dev Articles', 'MeDream Blog', 'AR VR Insights', 'Interactive Media Blog'],
    alternates: {
      canonical: `https://medream-studio.com/${locale}/blog`,
      languages: { th: 'https://medream-studio.com/th/blog', en: 'https://medream-studio.com/en/blog' },
    },
    openGraph: {
      title,
      description,
      url: `https://medream-studio.com/${locale}/blog`,
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'MeDream Studio' }],
    },
  }
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const l = locale as 'th' | 'en'
  const t = await getTranslations('blog')
  const posts = await getBlogPosts(l)
  const [featured, ...rest] = posts
  const categories = BLOG_CATEGORY_IDS.map(id => ({ id, label: t(`category_${id}`) }))
  const featuredCategory = featured?.category ? categories.find(c => c.id === featured.category) : undefined

  return (
    <>
      <section className="relative bg-midnight pt-24 pb-16 px-4 text-center overflow-hidden">
        <OrbitHeroDecoration />
        <div className="relative max-w-2xl mx-auto">
          <h1 className="font-display font-semibold text-white text-4xl md:text-5xl mb-4">
            {l === 'th' ? 'บทความ' : 'Blog'}
          </h1>
          <p className="text-mist text-base md:text-lg leading-relaxed">
            {l === 'th'
              ? 'ความรู้และมุมมองเรื่องเกม แอนิเมชัน และสื่ออินเทอร์แอคทีฟจาก MeDream Studio'
              : 'Insights on games, animation, and interactive media from MeDream Studio.'}
          </p>
        </div>
      </section>

      {!featured ? (
        <section className="bg-surface-tint border-t border-line py-20 px-4 text-center">
          <p className="text-fg-2 text-lg">{l === 'th' ? 'ยังไม่มีบทความ' : 'No posts yet'}</p>
        </section>
      ) : (
        <>
          <section className="bg-surface-tint border-t border-line pt-14 px-4">
            <div className="max-w-5xl mx-auto">
              <BlogFeaturedCard
                post={featured}
                href={`/${locale}/blog/${featured.slug}`}
                readMoreLabel={t('read_more')}
                categoryBadge={
                  featuredCategory ? { label: featuredCategory.label, className: CATEGORY_STYLE[featuredCategory.id] } : null
                }
              />
            </div>
          </section>

          {rest.length > 0 && (
            <section className="bg-surface-tint py-14 px-4">
              <div className="max-w-5xl mx-auto">
                <BlogGrid
                  posts={rest}
                  locale={locale}
                  categories={categories}
                  allLabel={t('all_categories')}
                  readMoreLabel={t('read_more')}
                />
              </div>
            </section>
          )}
        </>
      )}
    </>
  )
}
