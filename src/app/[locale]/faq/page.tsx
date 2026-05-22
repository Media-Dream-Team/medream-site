// src/app/[locale]/faq/page.tsx
import type { Metadata } from 'next'
import { getFaqItems } from '@/lib/content'
import { FaqItem } from '@/components/shared/FaqItem'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return { title: locale === 'th' ? 'คำถามที่พบบ่อย' : 'FAQ' }
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const l = locale as 'th' | 'en'
  const items = getFaqItems()

  return (
    <div className="pt-16">
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-dawn-gold mb-12">
            {l === 'th' ? 'คำถามที่พบบ่อย' : 'FAQ'}
          </h1>
          <div>
            {items.map((item, i) => (
              <FaqItem key={i} item={item} locale={locale} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
