// src/app/[locale]/services/page.tsx
import type { Metadata } from 'next'
import { getServices } from '@/lib/content'
import { ServiceGroupCard } from '@/components/services/ServiceGroupCard'
import { CraftBar } from '@/components/services/CraftBar'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isTh = locale === 'th'
  const title = isTh ? 'บริการ | MeDream Studio' : 'Services | MeDream Studio'
  const description = isTh
    ? 'บริการของ MeDream Studio จัดตามโจทย์ธุรกิจ 4 กลุ่ม: Marketing & Event, Brand Engagement & CRM, Learning & Training, Games & Immersive'
    : 'MeDream Studio services organized around your business need, in 4 groups: Marketing & Event, Brand Engagement & CRM, Learning & Training, Games & Immersive.'
  return {
    title,
    description,
    alternates: {
      canonical: `https://medream-studio.com/${locale}/services`,
      languages: { th: 'https://medream-studio.com/th/services', en: 'https://medream-studio.com/en/services' },
    },
    keywords: isTh
      ? ['บริการ MeDream', 'เกม Event', 'เกม CRM', 'สื่อการเรียนรู้แบบเกม', 'พัฒนาเกม PC Mobile', 'AR VR ไทย', 'Thai Game Studio']
      : ['MeDream Services', 'Event Games', 'CRM Games', 'Gamified Learning', 'PC Mobile Game Development', 'AR VR Thailand', 'Thai Game Studio'],
    openGraph: {
      title,
      description,
      url: `https://medream-studio.com/${locale}/services`,
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'MeDream Studio' }],
    },
  }
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const l = locale as 'th' | 'en'
  const { groups, craft } = getServices()

  return (
    <div className="pt-16">
      <section className="bg-white py-16 md:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-display font-semibold text-ink text-4xl md:text-5xl mb-4">
              {l === 'th' ? 'บริการของเรา' : 'Our Services'}
            </h1>
            <p className="text-fg-2 text-base md:text-lg max-w-2xl mx-auto">
              {l === 'th'
                ? 'จัดตามโจทย์ธุรกิจของคุณ ส่วน AR, VR และแอนิเมชันเป็น "วิธี" ที่เราเสนอให้ ไม่ใช่สิ่งที่คุณต้องรู้ก่อนมาหาเรา'
                : 'Organized around your business need — AR, VR, and animation are the "how" we bring to the table, not something you need to know before reaching out.'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groups.map(group => (
              <ServiceGroupCard key={group.id} group={group} locale={locale} />
            ))}
          </div>
          <CraftBar craft={craft} locale={locale} />
        </div>
      </section>
    </div>
  )
}
