// src/app/[locale]/services/[group]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getServices } from '@/lib/content'
import { Button } from '@/components/ui/Button'
import { ServiceGroupFaqSection } from '@/components/services/ServiceGroupFaqSection'

const GROUP_IDS = ['marketing-event', 'crm', 'learning', 'games'] as const

export function generateStaticParams() {
  return GROUP_IDS.map(group => ({ group }))
}

function findGroup(group: string) {
  const { groups } = getServices()
  return groups.find(g => g.id === group)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; group: string }>
}): Promise<Metadata> {
  const { locale, group: groupId } = await params
  const group = findGroup(groupId)
  if (!group) return {}
  const isTh = locale === 'th'
  const title = isTh ? `${group.title_th} | MeDream Studio` : `${group.title_en} | MeDream Studio`
  const description = isTh ? group.body_th : group.body_en
  return {
    title,
    description,
    alternates: {
      canonical: `https://medream-studio.com/${locale}/services/${groupId}`,
      languages: {
        th: `https://medream-studio.com/th/services/${groupId}`,
        en: `https://medream-studio.com/en/services/${groupId}`,
      },
    },
    keywords: isTh ? group.bullets_th : group.bullets_en,
    openGraph: {
      title,
      description,
      url: `https://medream-studio.com/${locale}/services/${groupId}`,
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'MeDream Studio' }],
    },
  }
}

export default async function ServiceGroupPage({
  params,
}: {
  params: Promise<{ locale: string; group: string }>
}) {
  const { locale, group: groupId } = await params
  const l = locale as 'th' | 'en'
  const group = findGroup(groupId)
  if (!group) notFound()

  const bullets = l === 'th' ? group.bullets_th : group.bullets_en

  return (
    <div className="pt-16">
      <section className="bg-white pt-16 pb-4 px-4 text-center">
        <Button href={`/${locale}/services`} variant="text" surface="light" className="mb-6">
          {l === 'th' ? 'กลับไปหน้าบริการ' : 'Back to Services'}
        </Button>
        <h1 className="font-display font-semibold text-ink text-4xl md:text-5xl mb-3">
          {l === 'th' ? group.title_th : group.title_en}
        </h1>
        <p className="text-fg-3 text-sm uppercase tracking-[.08em]">
          {l === 'th' ? group.forWho_th : group.forWho_en}
        </p>
      </section>
      <section className="bg-white py-10 px-4">
        <div className="max-w-3xl mx-auto flex flex-col gap-8">
          <p className="text-fg-2 text-base leading-relaxed">
            {l === 'th' ? group.body_th : group.body_en}
          </p>
          <ul className="flex flex-col gap-3">
            {bullets.map((bullet, i) => (
              <li key={i} className="flex gap-3 text-ink">
                <span className="text-blue flex-shrink-0" aria-hidden="true">—</span>
                <span className="text-sm leading-relaxed">{bullet}</span>
              </li>
            ))}
          </ul>
          {!group.hasCases && (
            <p className="text-fg-3 text-sm border-t border-line pt-6">
              {l === 'th'
                ? 'กลุ่มนี้ยังไม่มีเคสลูกค้าจริงในหน้า Works — เราไม่ใส่ผลงานปลอมเพื่อความน่าเชื่อถือ'
                : "This group doesn't have a real client case on the Works page yet — we don't fabricate case studies."}
            </p>
          )}
          <div className="text-center pt-4">
            <Button href={`/${locale}/contact?service=${group.id}`} variant="primary" surface="light">
              {l === 'th' ? 'สนใจบริการนี้' : 'Interested in This Service'}
            </Button>
          </div>
        </div>
      </section>
      <ServiceGroupFaqSection group={group} locale={locale} />
    </div>
  )
}
