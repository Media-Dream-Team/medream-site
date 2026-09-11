import type { HomeContent, Award, Milestone } from '@/types/content'

interface Props {
  home: HomeContent
  awards: Award[]
  milestones: Milestone[]
  locale: string
}

export function TrustedBySection({ home, awards, milestones, locale }: Props) {
  const l = locale as 'th' | 'en'
  const { trustedBy } = home

  const labels = [
    ...trustedBy.extraClients.map(c => (l === 'th' ? c.label_th : c.label_en)),
    ...awards.map(a => (l === 'th' ? a.name_th : a.name_en)),
    ...milestones.map(m => (l === 'th' ? m.event_th : m.event_en)),
  ]

  return (
    <section className="bg-white border-y border-line py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <p className="label text-fg-3 text-center mb-6 font-display font-medium text-xs uppercase tracking-[.12em]">
          {l === 'th' ? trustedBy.headline_th : trustedBy.headline_en}
        </p>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
          {labels.map((label, i) => (
            <span key={i} className="text-fg-3 text-sm font-display font-medium">
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
