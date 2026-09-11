import type { Award } from '@/types/content'
import { Badge } from '@/components/ui/Badge'

interface Props {
  awards: Award[]
  locale: string
}

export function AwardsSection({ awards, locale }: Props) {
  const l = locale as 'th' | 'en'
  if (awards.length === 0) return null
  return (
    <section className="bg-white pb-16 md:pb-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-display font-semibold text-ink text-2xl md:text-[28px] mb-8 text-center">
          {l === 'th' ? 'รางวัลและทุนสนับสนุน' : 'Awards & Grants'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {awards.map((award, i) => (
            <div key={i} className="border border-line p-5 flex flex-col gap-2">
              <Badge className="self-start">{award.year}</Badge>
              <p className="font-display font-semibold text-ink">
                {l === 'th' ? award.name_th : award.name_en}
              </p>
              <p className="text-fg-2 text-sm">{award.event}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
