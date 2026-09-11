// src/app/[locale]/page.tsx
import type { Metadata } from 'next'
import { getSiteConfig, getHomeContent, getAwards, getMilestones } from '@/lib/content'
import { HeroSection } from '@/components/home/HeroSection'
import { WeDreamSection } from '@/components/home/WeDreamSection'
import { WeDoSection } from '@/components/home/WeDoSection'
import { WeMakeDifferenceSection } from '@/components/home/WeMakeDifferenceSection'
import { WorksSection } from '@/components/home/WorksSection'
import { TrustedBySection } from '@/components/home/TrustedBySection'
import { WayOfWorkSection } from '@/components/home/WayOfWorkSection'
import { FaqPreviewSection } from '@/components/home/FaqPreviewSection'
import { FinalCtaSection } from '@/components/home/FinalCtaSection'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isTh = locale === 'th'
  return {
    title: isTh
      ? 'MeDream Studio | รับพัฒนาเกม Game Developer & Media Dream Team'
      : 'MeDream Studio | Game Developer & Media Dream Team Thailand',
    description: isTh
      ? 'MeDream Studio (Media Dream Team) — ทีม Game Developer รับพัฒนาเกม Unity, Mobile Game, Serious Game, AR/VR และแอนิเมชัน ครบวงจร'
      : 'MeDream Studio (Media Dream Team) — Thailand game developer studio. We build Unity games, mobile games, serious games, AR/VR, and animation.',
  }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const site = getSiteConfig()
  const home = getHomeContent()
  const awards = getAwards()
  const milestones = getMilestones()

  return (
    <>
      <HeroSection site={site} home={home} />
      <WeDreamSection home={home} locale={locale} />
      <WeDoSection home={home} locale={locale} />
      <WeMakeDifferenceSection home={home} locale={locale} />
      <WorksSection home={home} locale={locale} />
      <TrustedBySection home={home} awards={awards} milestones={milestones} locale={locale} />
      <WayOfWorkSection home={home} locale={locale} />
      <FaqPreviewSection home={home} locale={locale} />
      <FinalCtaSection home={home} locale={locale} />
    </>
  )
}
