// src/app/[locale]/blog/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { getBlogPosts } from '@/lib/notion'
import { OrbitHeroDecoration } from '@/components/shared/OrbitHeroDecoration'

export const revalidate = 300

const CHAMFER_STYLE: React.CSSProperties = {
  clipPath: 'polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)',
}

const ARROW_PATH = 'M2 7h9.2L7.6 3.4 9 2l6 6-6 6-1.4-1.4L11.2 9H2z'

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
              <Link
                href={`/${locale}/blog/${featured.slug}`}
                className="group grid grid-cols-1 md:grid-cols-[1.2fr_1fr] border border-line bg-white overflow-hidden"
                style={CHAMFER_STYLE}
              >
                <div className="relative aspect-[16/10] bg-navy-card">
                  <Image
                    src={featured.cover || '/images/portfolio/placeholder.png'}
                    alt={featured.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-8 md:p-10 flex flex-col justify-center gap-3">
                  <p className="font-display font-semibold text-fg-3 text-xs">{featured.date}</p>
                  <h2 className="font-display font-semibold text-ink text-2xl md:text-[28px] leading-tight">
                    {featured.title}
                  </h2>
                  <p className="text-fg-2 leading-relaxed">{featured.excerpt}</p>
                  <span className="inline-flex items-center gap-2 font-display font-bold text-sm text-blue mt-1 group-hover:text-navy transition-colors">
                    {t('read_more')}
                    <svg viewBox="0 0 16 16" className="w-[0.85em] h-[0.85em]" fill="currentColor" aria-hidden="true">
                      <path d={ARROW_PATH} />
                    </svg>
                  </span>
                </div>
              </Link>
            </div>
          </section>

          {rest.length > 0 && (
            <section className="bg-surface-tint py-14 px-4">
              <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {rest.map(post => (
                  <Link
                    key={post.slug}
                    href={`/${locale}/blog/${post.slug}`}
                    className="border border-line bg-white overflow-hidden hover:border-blue transition-colors block"
                    style={CHAMFER_STYLE}
                  >
                    <div className="relative aspect-[16/10] bg-navy-card">
                      <Image
                        src={post.cover || '/images/portfolio/placeholder.png'}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-5">
                      <p className="font-display font-semibold text-fg-3 text-xs mb-2">{post.date}</p>
                      <h3 className="font-display font-semibold text-ink text-lg mb-1">{post.title}</h3>
                      <p className="text-fg-2 text-sm leading-relaxed">{post.excerpt}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </>
  )
}
