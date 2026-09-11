// src/components/services/ServiceGroupFaqSection.tsx
import type { ServiceGroup } from '@/types/content'
import { ServiceFaqAccordionItem } from './ServiceFaqAccordionItem'

interface Props {
  group: ServiceGroup
  locale: string
}

export function ServiceGroupFaqSection({ group, locale }: Props) {
  const l = locale as 'th' | 'en'
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: group.faq.map(f => ({
      '@type': 'Question',
      name: l === 'th' ? f.question_th : f.question_en,
      acceptedAnswer: {
        '@type': 'Answer',
        text: l === 'th' ? f.answer_th : f.answer_en,
      },
    })),
  }

  return (
    <section className="bg-white pb-16 md:pb-24 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="max-w-3xl mx-auto">
        <h2 className="font-display font-semibold text-ink text-2xl md:text-[28px] mb-8 text-center">
          {l === 'th' ? 'คำถามที่พบบ่อย' : 'Frequently Asked Questions'}
        </h2>
        <div>
          {group.faq.map((item, i) => (
            <ServiceFaqAccordionItem key={i} item={item} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  )
}
