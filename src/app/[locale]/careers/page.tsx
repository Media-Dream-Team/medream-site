// src/app/[locale]/careers/page.tsx
import type { Metadata } from 'next'
import { getCareerOpenings } from '@/lib/content'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isTh = locale === 'th'
  const title = isTh ? 'ร่วมงานกับเรา | MeDream Studio' : 'Careers | MeDream Studio'
  const description = isTh
    ? 'MeDream Studio กำลังมองหานักพัฒนาเกม นักออกแบบ และผู้มีความสร้างสรรค์มาร่วมทีม'
    : 'Join MeDream Studio — we are looking for game developers, designers, and creative talent.'
  return {
    title,
    description,
    alternates: {
      canonical: `https://medream-studio.com/${locale}/careers`,
      languages: { th: 'https://medream-studio.com/th/careers', en: 'https://medream-studio.com/en/careers' },
    },
    openGraph: {
      title,
      description,
      url: `https://medream-studio.com/${locale}/careers`,
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'MeDream Studio' }],
    },
  }
}

export default async function CareersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const l = locale as 'th' | 'en'
  const openings = getCareerOpenings().filter(o => o.open)

  const typeLabel: Record<string, { th: string; en: string }> = {
    'full-time': { th: 'งานประจำ', en: 'Full-time' },
    freelance:   { th: 'ฟรีแลนซ์', en: 'Freelance' },
    intern:      { th: 'ฝึกงาน',   en: 'Internship' },
  }

  return (
    <div className="pt-16">
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-dawn-gold mb-12">
            {l === 'th' ? 'ร่วมงานกับเรา' : 'Work With Us'}
          </h1>
          {openings.length === 0 ? (
            <p className="text-horizon text-lg">
              {l === 'th' ? 'ขณะนี้ยังไม่มีตำแหน่งที่เปิดรับ' : 'No open positions at this time'}
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {openings.map(opening => (
                <div key={opening.id} className="bg-deep-space border border-nebula rounded-xl p-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h2 className="text-dream-cream font-bold text-xl">
                        {l === 'th' ? opening.title_th : opening.title_en}
                      </h2>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-royal-blue/30 text-electric text-xs rounded">
                        {typeLabel[opening.type]?.[l] ?? opening.type}
                      </span>
                    </div>
                  </div>
                  <p className="text-horizon text-sm mt-3 leading-relaxed">
                    {l === 'th' ? opening.desc_th : opening.desc_en}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
