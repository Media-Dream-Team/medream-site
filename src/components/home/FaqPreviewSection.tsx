import Link from 'next/link'
import type { FaqItem as FaqItemType } from '@/types/content'
import { FaqItem } from '@/components/shared/FaqItem'

interface Props {
  items: FaqItemType[]
  locale: string
}

export function FaqPreviewSection({ items, locale }: Props) {
  const l = locale as 'th' | 'en'
  return (
    <section className="py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black text-dawn-gold mb-10 text-center">
          {l === 'th' ? 'คำถามที่พบบ่อย' : 'FAQ'}
        </h2>
        <div>
          {items.map((item, i) => (
            <FaqItem key={i} item={item} locale={locale} />
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            href={`/${locale}/faq`}
            className="inline-block px-6 py-2 border border-electric text-electric hover:bg-electric hover:text-white font-bold rounded transition-colors"
          >
            {l === 'th' ? 'ดูคำถามทั้งหมด' : 'See All FAQs'}
          </Link>
        </div>
      </div>
    </section>
  )
}
