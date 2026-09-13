// src/components/home/WeDreamSection.tsx
import type { HomeContent } from '@/types/content'
import { Star } from '@/components/ui/Star'
import { WeDreamPhotoStack } from './WeDreamPhotoStack'

interface Props {
  home: HomeContent
  locale: string
}

const CHAMFER_STYLE: React.CSSProperties = {
  clipPath: 'polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)',
}

export function WeDreamSection({ home, locale }: Props) {
  const l = locale as 'th' | 'en'
  const { dream } = home

  return (
    <section className="bg-surface-tint border-t border-line py-16 md:py-24 lg:py-32 px-4 overflow-hidden">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-12 md:gap-16 items-center">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-7 h-7 text-blue" />
            <h2 className="font-display font-semibold text-ink text-3xl md:text-[36px] md:leading-[44px] tracking-[-.01em]">
              {dream.headline}
            </h2>
          </div>
          <p className="font-display font-medium text-ink text-lg md:text-[22px] md:leading-[1.55] max-w-[46ch] mb-7">
            {l === 'th' ? dream.body_th : dream.body_en}
          </p>
          <div className="flex flex-wrap gap-3.5">
            {dream.dna.map((trait, i) => (
              <span
                key={trait}
                className={`font-display font-bold text-lg text-white px-5 py-2.5 ${i % 2 ? 'bg-blue' : 'bg-navy'}`}
                style={{
                  transform: `rotate(${i % 2 ? 1.5 : -1.5}deg)`,
                  ...(i === 0 ? CHAMFER_STYLE : {}),
                }}
              >
                {trait}
              </span>
            ))}
          </div>
        </div>
        <WeDreamPhotoStack captions={dream.photoCaptions} locale={locale} />
      </div>
    </section>
  )
}
