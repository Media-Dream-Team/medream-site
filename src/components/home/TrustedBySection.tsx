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

  const groups = [
    {
      key: 'clients',
      caption: l === 'th' ? trustedBy.clientsCaption_th : trustedBy.clientsCaption_en,
      labels: trustedBy.extraClients.map(c => (l === 'th' ? c.label_th : c.label_en)),
    },
    {
      key: 'awards',
      caption: l === 'th' ? trustedBy.awardsCaption_th : trustedBy.awardsCaption_en,
      labels: awards.map(a => (l === 'th' ? a.name_th : a.name_en)),
    },
    {
      key: 'events',
      caption: l === 'th' ? trustedBy.eventsCaption_th : trustedBy.eventsCaption_en,
      labels: milestones.map(m => (l === 'th' ? m.event_th : m.event_en)),
    },
  ].filter(group => group.labels.length > 0)

  return (
    <section className="bg-white border-y border-line py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <p className="text-fg-3 text-center mb-8 font-display font-medium text-xs uppercase tracking-[.12em]">
          {l === 'th' ? trustedBy.headline_th : trustedBy.headline_en}
        </p>
        <div className="space-y-6">
          {groups.map(group => (
            <div key={group.key}>
              <p className="text-fg-3 text-center mb-3 font-display font-medium text-xs uppercase tracking-[.12em]">
                {group.caption}
              </p>
              <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
                {group.labels.map((label, i) => (
                  <span key={i} className="text-fg-3 text-sm font-display font-medium">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
