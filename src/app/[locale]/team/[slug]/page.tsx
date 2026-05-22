// src/app/[locale]/team/[slug]/page.tsx
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getTeamMemberDetail } from '@/lib/content'
import { PortfolioCard } from '@/components/shared/PortfolioCard'
import type { PortfolioItem } from '@/types/content'

export default async function MemberPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const l = locale as 'th' | 'en'
  const member = getTeamMemberDetail(slug)
  if (!member) notFound()

  // Map member works to PortfolioItem shape for reuse
  const portfolioItems: PortfolioItem[] = member.works.map((w, i) => ({
    id: `${slug}-${i}`,
    title_th: w.title,
    title_en: w.title,
    type: 'own-ip',
    featured: false,
    image: w.image,
    tags: [],
    year: w.year,
    desc_th: w.desc_th,
    desc_en: w.desc_en,
  }))

  return (
    <div className="pt-16">
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
            <div className="relative w-32 h-32 rounded-full overflow-hidden flex-shrink-0">
              <Image src={member.photo} alt={member.name} fill className="object-cover" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-dawn-gold mb-1">{member.name}</h1>
              <p className="text-electric font-bold mb-4">
                {l === 'th' ? member.role_th : member.role_en}
              </p>
              <p className="text-horizon leading-relaxed">
                {l === 'th' ? member.bio_th : member.bio_en}
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {member.skills.map(skill => (
                  <span key={skill} className="px-3 py-1 bg-nebula text-dream-cream text-sm rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-black text-dawn-gold mb-6">
            {l === 'th' ? 'ผลงาน' : 'Works'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {portfolioItems.map(item => (
              <PortfolioCard key={item.id} item={item} locale={locale} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
