// src/components/home/WeDoSection.tsx
import type { HomeContent } from '@/types/content'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface Props {
  home: HomeContent
  locale: string
}

export function WeDoSection({ home, locale }: Props) {
  const l = locale as 'th' | 'en'
  const { services } = home

  return (
    <section className="bg-white py-16 md:py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display font-semibold text-ink text-3xl md:text-[36px] md:leading-[44px] mb-3">
            {services.headline}
          </h2>
          <p className="text-fg-2 text-base md:text-lg">
            {l === 'th' ? services.subheadline_th : services.subheadline_en}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {services.cards.map(card => (
            <Card key={card.id} className="flex flex-col gap-3 hover:border-blue transition-colors">
              <h3 className="font-display font-semibold text-ink text-lg">
                {l === 'th' ? card.title_th : card.title_en}
              </h3>
              <p className="text-fg-2 text-sm leading-relaxed flex-1">
                {l === 'th' ? card.body_th : card.body_en}
              </p>
              <Button href={`/${locale}/services/${card.id}`} variant="text" surface="light" className="self-start">
                {l === 'th' ? card.cta_th : card.cta_en}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
