import Image from 'next/image'
import type { HomeContent } from '@/types/content'
import { Button } from '@/components/ui/Button'

interface Props {
  home: HomeContent
  locale: string
}

export function WorksSection({ home, locale }: Props) {
  const l = locale as 'th' | 'en'
  const { works } = home

  return (
    <section className="bg-surface-tint border-t border-line py-16 md:py-24 lg:py-32 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display font-semibold text-ink text-3xl md:text-[36px] md:leading-[44px] mb-12 text-center">
          {l === 'th' ? works.headline_th : works.headline_en}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {works.teasers.map(teaser => (
            <div key={teaser.id} className="border border-line bg-white overflow-hidden">
              <div className="relative h-48 bg-navy-card">
                <Image
                  src={teaser.image}
                  alt={l === 'th' ? teaser.title_th : teaser.title_en}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="font-display font-semibold text-ink text-lg mb-1">
                  {l === 'th' ? teaser.title_th : teaser.title_en}
                </h3>
                <p className="text-fg-2 text-sm leading-relaxed">
                  {l === 'th' ? teaser.desc_th : teaser.desc_en}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Button href={`/${locale}/portfolio`} variant="secondary" surface="light">
            {l === 'th' ? works.cta_th : works.cta_en}
          </Button>
        </div>
      </div>
    </section>
  )
}
