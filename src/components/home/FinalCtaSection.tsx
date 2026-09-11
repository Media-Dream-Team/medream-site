// src/components/home/FinalCtaSection.tsx
import { getTranslations } from 'next-intl/server'
import type { HomeContent } from '@/types/content'
import { Button } from '@/components/ui/Button'

interface Props {
  home: HomeContent
  locale: string
}

export async function FinalCtaSection({ home, locale }: Props) {
  const l = locale as 'th' | 'en'
  const { finalCta } = home
  const t = await getTranslations('nav')

  return (
    <section className="relative bg-midnight py-20 md:py-28 px-4 overflow-hidden">
      <div
        className="bg-gradient-dawn pointer-events-none absolute inset-x-0 bottom-0 h-1/2 opacity-70"
        style={{ maskImage: 'linear-gradient(to bottom, transparent, black)' }}
        aria-hidden="true"
      />
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <h2 className="font-display font-semibold text-white text-3xl md:text-[36px] md:leading-[44px] mb-4">
          {l === 'th' ? finalCta.headline_th : finalCta.headline_en}
        </h2>
        <p className="text-mist text-base md:text-lg leading-relaxed mb-10">
          {l === 'th' ? finalCta.subheadline_th : finalCta.subheadline_en}
        </p>
        <Button href={`/${locale}/contact`} variant="primary" surface="dark">
          {t('contact_cta')}
        </Button>
      </div>
    </section>
  )
}
