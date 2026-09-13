// src/components/home/FinalCtaSection.tsx
import Link from 'next/link'
import type { HomeContent } from '@/types/content'

interface Props {
  home: HomeContent
  locale: string
}

export function FinalCtaSection({ home, locale }: Props) {
  const l = locale as 'th' | 'en'
  const { finalCta } = home

  return (
    <section className="bg-surface-tint py-10 md:py-14 px-4">
      {/* 28px radius + pill CTA are deliberate exceptions to the sitewide
          no-border-radius rule, per the design handoff's Final CTA card. */}
      <div className="relative max-w-6xl mx-auto rounded-[28px] overflow-hidden bg-gradient-dawn">
        <div className="relative z-10 max-w-xl mx-auto text-center py-24 px-5">
          <h2 className="font-display font-semibold text-white text-3xl md:text-[32px] mb-4">
            {l === 'th' ? finalCta.headline_th : finalCta.headline_en}
          </h2>
          <p className="text-white/85 text-base md:text-lg leading-relaxed mb-10">
            {l === 'th' ? finalCta.subheadline_th : finalCta.subheadline_en}
          </p>
          <Link
            href={`/${locale}/contact`}
            className="inline-flex items-center gap-2 font-display font-bold text-[15px] text-navy bg-first-light rounded-full px-8 py-4 transition-transform duration-200 ease-out hover:-translate-y-0.5"
          >
            {l === 'th' ? finalCta.cta_th : finalCta.cta_en}
          </Link>
        </div>
      </div>
    </section>
  )
}
