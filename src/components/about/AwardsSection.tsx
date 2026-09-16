import type { Award } from '@/types/content'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Star } from '@/components/ui/Star'

interface Props {
  awards: Award[]
  locale: string
}

export function AwardsSection({ awards, locale }: Props) {
  const l = locale as 'th' | 'en'
  if (awards.length === 0) return null
  return (
    <section className="bg-surface-tint pb-16 md:pb-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Star className="w-7 h-7 text-blue" />
          <h2 className="font-display font-semibold text-ink text-3xl md:text-[36px] leading-tight tracking-[-.01em]">
            {l === 'th' ? 'รางวัลและทุนสนับสนุน' : 'Awards & Grants'}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {awards.map((award, i) => (
            <Card key={i} featured className="flex flex-col gap-2">
              <Badge className="self-start">{award.year}</Badge>
              <p className="font-display font-semibold text-ink">
                {l === 'th' ? award.name_th : award.name_en}
              </p>
              <p className="text-fg-2 text-sm">{award.event}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
