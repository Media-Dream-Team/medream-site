// src/components/home/HeroSection.tsx
import { getLocale, getTranslations } from 'next-intl/server'
import type { SiteConfig, HomeContent } from '@/types/content'
import { Button } from '@/components/ui/Button'
import { HeroParallaxBg } from './HeroParallaxBg'

interface Props {
  site: SiteConfig
  home: HomeContent
}

export async function HeroSection({ site, home }: Props) {
  const locale = await getLocale()
  const l = locale as 'th' | 'en'
  const t = await getTranslations('hero')

  return (
    <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden bg-midnight px-4">
      <HeroParallaxBg />

      <div className="relative z-10 max-w-3xl mx-auto text-center py-24">
        <h1 className="font-display font-semibold text-white text-4xl md:text-5xl xl:text-[56px] xl:leading-[64px] mb-6">
          {l === 'th' ? site.tagline_th : site.tagline_en}
        </h1>
        <p className="text-mist text-base md:text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
          {l === 'th' ? home.hero.subheadline_th : home.hero.subheadline_en}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button href={`/${locale}/portfolio`} variant="secondary" surface="dark">
            {t('cta_portfolio')}
          </Button>
          <Button href={`/${locale}/contact`} variant="primary" surface="dark">
            {t('cta_contact')}
          </Button>
        </div>
      </div>
    </section>
  )
}
