// src/app/[locale]/about/page.tsx
import type { Metadata } from 'next'
import { getSiteConfig, getAwards } from '@/lib/content'
import { AwardsSection } from '@/components/home/AwardsSection'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isTh = locale === 'th'
  const title = isTh ? 'เกี่ยวกับเรา | MeDream Studio' : 'About Us | MeDream Studio'
  const description = isTh
    ? 'MeDream Studio คือทีมสร้างสรรค์ที่รวมนักออกแบบ นักพัฒนา และนักเล่าเรื่อง สร้างประสบการณ์ดิจิทัลที่น่าจดจำ'
    : 'MeDream Studio is a creative team of designers, developers, and storytellers building memorable digital experiences in Thailand.'
  return {
    title,
    description,
    alternates: {
      canonical: `https://medream-studio.com/${locale}/about`,
      languages: { th: 'https://medream-studio.com/th/about', en: 'https://medream-studio.com/en/about' },
    },
    keywords: isTh
      ? ['MeDream Studio คือ', 'ทีมพัฒนาเกมไทย', 'Thai Game Dev Team', 'Unity Dev Team', 'Media Studio ไทย', 'ครีเอทีฟสตูดิโอ', 'Media Dream Team']
      : ['About MeDream', 'Thai Game Dev Team', 'Unity Dev Team', 'Media Studio Thailand', 'Creative Studio', 'Media Dream Team'],
    openGraph: {
      title,
      description,
      url: `https://medream-studio.com/${locale}/about`,
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'MeDream Studio' }],
    },
  }
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const l = locale as 'th' | 'en'
  const site = getSiteConfig()
  const awards = getAwards()

  return (
    <div className="pt-16">
      <section className="py-20 px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-dawn-gold mb-8">
          {l === 'th' ? 'เกี่ยวกับเรา' : 'About Us'}
        </h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-dream-cream text-lg leading-relaxed mb-6">
            {l === 'th' ? site.history_th : site.history_en}
          </p>
          <p className="text-dream-cream text-lg leading-relaxed">
            {l === 'th' ? site.intro_th : site.intro_en}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-deep-space border border-nebula rounded-xl p-6">
            <h2 className="text-dawn-gold font-bold text-xl mb-3">
              {l === 'th' ? 'วิสัยทัศน์' : 'Vision'}
            </h2>
            <p className="text-horizon leading-relaxed">
              {l === 'th' ? site.vision_th : site.vision_en}
            </p>
          </div>
          <div className="bg-deep-space border border-nebula rounded-xl p-6">
            <h2 className="text-dawn-gold font-bold text-xl mb-3">
              {l === 'th' ? 'พันธกิจ' : 'Mission'}
            </h2>
            <p className="text-horizon leading-relaxed">
              {l === 'th' ? site.mission_th : site.mission_en}
            </p>
          </div>
        </div>
      </section>
      <AwardsSection awards={awards} locale={locale} />
    </div>
  )
}
