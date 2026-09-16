import type { Milestone } from '@/types/content'
import { Star } from '@/components/ui/Star'

interface Props {
  milestones: Milestone[]
  locale: string
}

export function MilestonesSection({ milestones, locale }: Props) {
  const l = locale as 'th' | 'en'
  if (milestones.length === 0) return null
  return (
    <section className="bg-surface-tint pb-16 md:pb-24 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Star className="w-7 h-7 text-blue" />
          <h2 className="font-display font-semibold text-ink text-3xl md:text-[36px] leading-tight tracking-[-.01em]">
            {l === 'th' ? 'เวทีที่เราไปออกบูธ' : 'Featured At'}
          </h2>
        </div>
        <div className="flex flex-col">
          {milestones.map((m, i) => (
            <div key={i} className="flex flex-col sm:flex-row gap-1 sm:gap-4 border-t border-line py-4 first:border-t-0">
              <p className="text-fg-3 text-sm font-display font-medium sm:w-40 sm:flex-shrink-0">
                {l === 'th' ? m.date_th : m.date_en}
              </p>
              <div>
                <p className="font-display font-semibold text-ink">
                  {l === 'th' ? m.event_th : m.event_en}
                </p>
                <p className="text-fg-2 text-sm">
                  {l === 'th' ? m.location_th : m.location_en}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
