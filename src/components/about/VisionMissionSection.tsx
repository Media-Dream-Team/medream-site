import type { SiteConfig } from '@/types/content'
import { Card } from '@/components/ui/Card'

interface Props {
  site: SiteConfig
  locale: string
}

export function VisionMissionSection({ site, locale }: Props) {
  const l = locale as 'th' | 'en'
  return (
    <section className="bg-white pb-16 md:pb-24 px-4">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-display font-semibold text-ink text-xl mb-3">
            {l === 'th' ? 'วิสัยทัศน์' : 'Vision'}
          </h2>
          <p className="text-fg-2 leading-relaxed">
            {l === 'th' ? site.vision_th : site.vision_en}
          </p>
        </Card>
        <Card>
          <h2 className="font-display font-semibold text-ink text-xl mb-3">
            {l === 'th' ? 'พันธกิจ' : 'Mission'}
          </h2>
          <p className="text-fg-2 leading-relaxed">
            {l === 'th' ? site.mission_th : site.mission_en}
          </p>
        </Card>
      </div>
    </section>
  )
}
