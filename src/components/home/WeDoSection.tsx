// src/components/home/WeDoSection.tsx
import Image from 'next/image'
import type { HomeContent } from '@/types/content'
import { Star } from '@/components/ui/Star'
import { Button } from '@/components/ui/Button'

interface Props {
  home: HomeContent
  locale: string
}

const CHAMFER_STYLE: React.CSSProperties = {
  clipPath: 'polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)',
}

export function WeDoSection({ home, locale }: Props) {
  const l = locale as 'th' | 'en'
  const { services } = home

  return (
    <section className="bg-surface-tint border-t border-line py-16 md:py-24 lg:py-32 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Star className="w-7 h-7 text-blue" />
          <h2 className="font-display font-semibold text-ink text-3xl md:text-[36px] md:leading-[44px] tracking-[-.01em]">
            {services.headline}
          </h2>
        </div>
        <p className="text-fg-2 text-base md:text-lg leading-relaxed max-w-[62ch] mb-12">
          {l === 'th' ? services.subheadline_th : services.subheadline_en}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
          {services.cards.map((card, i) => (
            <div key={card.id} className="border border-line bg-white flex flex-col overflow-hidden" style={CHAMFER_STYLE}>
              <div className="relative w-full h-60">
                <Image src="/images/portfolio/placeholder.png" alt="" fill className="object-cover" />
              </div>
              <div className="p-8 flex flex-col gap-3.5 flex-1">
                <span className="font-display font-bold text-[13px] text-mist bg-navy w-[30px] h-[30px] flex items-center justify-center">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display font-semibold text-ink text-2xl leading-tight">
                  {l === 'th' ? card.title_th : card.title_en}
                </h3>
                <p className="text-fg-2 text-base leading-relaxed flex-1">
                  {l === 'th' ? card.body_th : card.body_en}
                </p>
                <Button href={`/${locale}/services/${card.id}`} variant="secondary" surface="light" className="self-start mt-1">
                  {l === 'th' ? card.cta_th : card.cta_en}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
