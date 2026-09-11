import type { TeamMember } from '@/types/content'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface Props {
  members: TeamMember[]
  locale: string
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  )
}

export function TeamSection({ members, locale }: Props) {
  const l = locale as 'th' | 'en'
  if (members.length === 0) return null
  return (
    <section className="bg-white pb-16 md:pb-24 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display font-semibold text-ink text-2xl md:text-[28px] mb-10 text-center">
          {l === 'th' ? 'ทีมงาน' : 'Our Team'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {members.map(member => (
            <Card key={member.slug} className="text-center flex flex-col items-center gap-2">
              <div className="text-blue">
                <PersonIcon />
              </div>
              <p className="font-display font-semibold text-ink">{member.name}</p>
              <p className="text-fg-2 text-sm">
                {l === 'th' ? member.role_th : member.role_en}
              </p>
              <Button href={`/${locale}/team/${member.slug}`} variant="text" surface="light">
                {l === 'th' ? 'ดูผลงาน' : 'View Portfolio'}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
