// src/components/home/WeMakeDifferenceSection.tsx
import type { HomeContent } from '@/types/content'
import { Star } from '@/components/ui/Star'

interface Props {
  home: HomeContent
  locale: string
}

export function WeMakeDifferenceSection({ home, locale }: Props) {
  const l = locale as 'th' | 'en'
  const { difference } = home

  return (
    <section className="bg-white py-16 md:py-24 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-10 items-center">
        <div>
          <h2 className="font-display font-semibold text-ink text-3xl md:text-[36px] md:leading-[44px] mb-6">
            {difference.headline}
          </h2>
          <p className="text-fg-2 text-base md:text-lg leading-relaxed">
            {l === 'th' ? difference.body_th : difference.body_en}
          </p>
        </div>
        <div className="bg-navy text-white p-8 flex flex-col items-center text-center gap-3">
          <div className="flex items-center gap-1 font-display font-semibold text-5xl">
            {difference.microProofNumber}
            <Star className="w-6 h-6 text-first-light" />
          </div>
          <p className="text-mist text-sm leading-relaxed">
            {l === 'th' ? difference.microProof_th : difference.microProof_en}
          </p>
        </div>
      </div>
    </section>
  )
}
