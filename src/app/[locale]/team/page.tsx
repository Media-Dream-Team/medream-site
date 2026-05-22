// src/app/[locale]/team/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getTeamMembers } from '@/lib/content'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return { title: locale === 'th' ? 'ทีมงาน' : 'Team' }
}

export default async function TeamPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const l = locale as 'th' | 'en'
  const members = getTeamMembers()

  return (
    <div className="pt-16">
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-dawn-gold mb-12">
            {l === 'th' ? 'ทีมงาน' : 'Our Team'}
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {members.map(member => (
              <div key={member.slug} className="bg-deep-space border border-nebula rounded-xl p-6 text-center">
                <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                  <Image src={member.photo} alt={member.name} fill className="object-cover" />
                </div>
                <h3 className="text-dream-cream font-bold text-lg">{member.name}</h3>
                <p className="text-horizon text-sm mb-4">
                  {l === 'th' ? member.role_th : member.role_en}
                </p>
                <Link
                  href={`/${locale}/team/${member.slug}`}
                  className="inline-block px-4 py-1.5 border border-electric text-electric hover:bg-electric hover:text-white text-sm font-bold rounded transition-colors"
                >
                  {l === 'th' ? 'ดูผลงาน' : 'View Portfolio'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
