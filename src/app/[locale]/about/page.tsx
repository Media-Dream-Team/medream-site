// src/app/[locale]/about/page.tsx
import type { Metadata } from 'next'
import { getSiteConfig, getAboutContent, getAwards, getMilestones } from '@/lib/content'
import { StorySection } from '@/components/about/StorySection'
import { VisionMissionSection } from '@/components/about/VisionMissionSection'
import { DnaSection } from '@/components/about/DnaSection'
import { AwardsSection } from '@/components/about/AwardsSection'
import { MilestonesSection } from '@/components/about/MilestonesSection'

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
  const about = getAboutContent()
  const awards = getAwards()
  const milestones = getMilestones()

  return (
    <div className="pt-16">
      <section className="bg-white pt-16 pb-4 px-4 text-center">
        <h1 className="font-display font-semibold text-ink text-4xl md:text-5xl">
          {l === 'th' ? 'เกี่ยวกับเรา' : 'About Us'}
        </h1>
      </section>
      <StorySection story={about.story} locale={locale} />
      <VisionMissionSection site={site} locale={locale} />
      <DnaSection about={about} locale={locale} />
      <AwardsSection awards={awards} locale={locale} />
      <MilestonesSection milestones={milestones} locale={locale} />
    </div>
  )
}
