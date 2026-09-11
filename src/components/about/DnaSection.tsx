import type { AboutContent } from '@/types/content'
import { Card } from '@/components/ui/Card'
import { Star } from '@/components/ui/Star'

interface Props {
  about: AboutContent
}

export function DnaSection({ about }: Props) {
  return (
    <section className="bg-white pb-16 md:pb-24 px-4">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {about.dna.map(trait => (
          <Card key={trait} featured className="text-center flex flex-col items-center gap-3">
            <Star className="w-6 h-6 text-blue" />
            <p className="font-display font-semibold text-ink text-lg">{trait}</p>
          </Card>
        ))}
      </div>
    </section>
  )
}
