import type { SiteConfig } from '@/types/content'
import { Card } from '@/components/ui/Card'
import { Star } from '@/components/ui/Star'

interface Props {
  site: SiteConfig
  locale: string
}

export function VisionMissionSection({ site, locale }: Props) {
  const l = locale as 'th' | 'en'
  return (
    <section className="bg-surface-tint pb-16 md:pb-24 px-4">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card featured>
          <div className="flex items-center gap-2.5 mb-3">
            <Star className="w-5 h-5 text-blue" />
            <h2 className="font-display font-semibold text-ink text-xl">
              {l === 'th' ? 'วิสัยทัศน์' : 'Vision'}
            </h2>
          </div>
          <p className="text-fg-2 leading-relaxed">
            {l === 'th' ? site.vision_th : site.vision_en}
          </p>
        </Card>
        <Card featured>
          <div className="flex items-center gap-2.5 mb-3">
            <Star className="w-5 h-5 text-blue" />
            <h2 className="font-display font-semibold text-ink text-xl">
              {l === 'th' ? 'พันธกิจ' : 'Mission'}
            </h2>
          </div>
          <p className="text-fg-2 leading-relaxed">
            {l === 'th' ? site.mission_th : site.mission_en}
          </p>
        </Card>
      </div>
    </section>
  )
}
