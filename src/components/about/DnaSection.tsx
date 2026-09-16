import type { AboutContent } from '@/types/content'
import { Star } from '@/components/ui/Star'

interface Props {
  about: AboutContent
  locale: string
}

const CHAMFER_STYLE: React.CSSProperties = {
  clipPath: 'polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)',
}

export function DnaSection({ about, locale }: Props) {
  const l = locale as 'th' | 'en'
  return (
    <section className="bg-surface-tint pb-16 md:pb-24 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-3 mb-8">
          <Star className="w-7 h-7 text-blue" />
          <h2 className="font-display font-semibold text-ink text-3xl md:text-[36px] leading-tight tracking-[-.01em]">
            {l === 'th' ? about.dna.headline_th : about.dna.headline_en}
          </h2>
        </div>
        <div className="flex gap-4 flex-wrap justify-center">
          {about.dna.traits.map((trait, i) => (
            <span
              key={trait}
              className={`font-display font-bold text-lg md:text-xl text-white px-7 py-3.5 ${
                i % 2 ? 'bg-blue rotate-[1.5deg]' : 'bg-navy -rotate-[1.5deg]'
              }`}
              style={i === 1 ? CHAMFER_STYLE : undefined}
            >
              {trait}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
