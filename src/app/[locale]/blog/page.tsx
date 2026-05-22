// src/app/[locale]/blog/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getBlogPosts } from '@/lib/content'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return { title: locale === 'th' ? 'บทความ' : 'Blog' }
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const l = locale as 'th' | 'en'
  const posts = getBlogPosts()

  return (
    <div className="pt-16">
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-dawn-gold mb-12">
            {l === 'th' ? 'บทความ' : 'Blog'}
          </h1>
          {posts.length === 0 ? (
            <p className="text-horizon text-lg">
              {l === 'th' ? 'ยังไม่มีบทความ' : 'No posts yet'}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map(post => (
                <Link
                  key={post.slug}
                  href={`/${locale}/blog/${post.slug}`}
                  className="bg-deep-space border border-nebula rounded-xl overflow-hidden hover:border-electric transition-colors group block"
                >
                  <div className="relative h-48">
                    <Image
                      src={post.image || '/images/portfolio/placeholder.png'}
                      alt={l === 'th' ? post.title_th : post.title_en}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-horizon text-xs mb-2">{post.date}</p>
                    <h2 className="text-dream-cream font-bold group-hover:text-dawn-gold transition-colors">
                      {l === 'th' ? post.title_th : post.title_en}
                    </h2>
                    <p className="text-horizon text-sm mt-2 leading-relaxed">
                      {l === 'th' ? post.excerpt_th : post.excerpt_en}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
