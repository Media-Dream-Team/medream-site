import Link from 'next/link'
import type { SiteConfig } from '@/types/content'

interface Props {
  site: SiteConfig
  locale: string
}

export function WhoWeAreSection({ site, locale }: Props) {
  const l = locale as 'th' | 'en'
  return (
    <section className="py-20 px-4 max-w-4xl mx-auto text-center">
      <h2 className="text-3xl md:text-4xl font-black text-dawn-gold mb-6">
        {l === 'th' ? 'เราคือใคร' : 'Who We Are'}
      </h2>
      <p className="text-dream-cream text-lg leading-relaxed mb-4">
        {l === 'th' ? site.intro_th : site.intro_en}
      </p>
      {(site.vision_th || site.vision_en) && (
        <p className="text-horizon text-base leading-relaxed mb-8">
          {l === 'th' ? site.vision_th : site.vision_en}
        </p>
      )}
      <Link
        href={`/${locale}/team`}
        className="inline-block px-6 py-2 border border-electric text-electric hover:bg-electric hover:text-white font-bold rounded transition-colors"
      >
        {l === 'th' ? 'ดูทีมงาน' : 'Meet the Team'}
      </Link>
    </section>
  )
}
