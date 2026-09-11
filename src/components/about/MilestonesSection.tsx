import type { Milestone } from '@/types/content'

interface Props {
  milestones: Milestone[]
  locale: string
}

export function MilestonesSection({ milestones, locale }: Props) {
  const l = locale as 'th' | 'en'
  if (milestones.length === 0) return null
  return (
    <section className="bg-white pb-16 md:pb-24 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-display font-semibold text-ink text-2xl md:text-[28px] mb-8 text-center">
          {l === 'th' ? 'เวทีที่เราไปออกบูธ' : 'Featured At'}
        </h2>
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
