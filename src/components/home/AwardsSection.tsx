import type { Award } from '@/types/content'

interface Props {
  awards: Award[]
  locale: string
}

export function AwardsSection({ awards, locale }: Props) {
  const l = locale as 'th' | 'en'
  if (awards.length === 0) return null
  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black text-dawn-gold mb-10 text-center">
          {l === 'th' ? 'รางวัลที่ได้รับ' : 'Awards & Recognition'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {awards.map((award, i) => (
            <div
              key={i}
              className="bg-deep-space border border-nebula rounded-xl p-4 text-center"
            >
              <p className="text-dawn-gold font-bold text-sm">
                {l === 'th' ? award.name_th : award.name_en}
              </p>
              <p className="text-horizon text-xs mt-1">{award.event}</p>
              <p className="text-horizon text-xs">{award.year}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
