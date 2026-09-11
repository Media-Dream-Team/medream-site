// src/components/home/WeDreamSection.tsx
import type { HomeContent } from '@/types/content'
import { Badge } from '@/components/ui/Badge'

interface Props {
  home: HomeContent
  locale: string
}

export function WeDreamSection({ home, locale }: Props) {
  const l = locale as 'th' | 'en'
  const { dream } = home

  return (
    <section className="bg-white py-16 md:py-24 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="font-display font-semibold text-ink text-3xl md:text-[36px] md:leading-[44px] mb-6">
          {dream.headline}
        </h2>
        <p className="text-fg-2 text-base md:text-lg leading-relaxed mb-8">
          {l === 'th' ? dream.body_th : dream.body_en}
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          {dream.dna.map(trait => (
            <Badge key={trait}>{trait}</Badge>
          ))}
        </div>
      </div>
    </section>
  )
}
