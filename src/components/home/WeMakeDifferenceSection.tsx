// src/components/home/WeMakeDifferenceSection.tsx
import type { HomeContent } from '@/types/content'
import { Star } from '@/components/ui/Star'
import { WeMakeDifferenceVisual } from './WeMakeDifferenceVisual'

interface Props {
  home: HomeContent
  locale: string
}

export function WeMakeDifferenceSection({ home, locale }: Props) {
  const l = locale as 'th' | 'en'
  const { difference } = home

  return (
    <section className="bg-surface-tint border-t border-line py-16 md:py-24 lg:py-32 px-4 overflow-hidden">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-12 md:gap-16 items-center">
        <WeMakeDifferenceVisual />
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-7 h-7 text-blue" />
            <h2 className="font-display font-semibold text-ink text-3xl md:text-[36px] md:leading-[44px] tracking-[-.01em]">
              {difference.headline}
            </h2>
          </div>
          <p className="text-fg-2 text-base md:text-lg leading-relaxed mb-8">
            {l === 'th' ? difference.body_th : difference.body_en}
          </p>
        </div>
      </div>
    </section>
  )
}
