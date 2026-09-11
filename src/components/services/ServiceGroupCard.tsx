// src/components/services/ServiceGroupCard.tsx
import Link from 'next/link'
import type { ServiceGroup } from '@/types/content'
import { Card } from '@/components/ui/Card'

interface Props {
  group: ServiceGroup
  locale: string
}

export function ServiceGroupCard({ group, locale }: Props) {
  const l = locale as 'th' | 'en'
  return (
    <Link href={`/${locale}/services/${group.id}`} className="block group">
      <Card className="flex flex-col gap-3 h-full group-hover:border-blue transition-colors">
        <h3 className="font-display font-semibold text-ink text-xl">
          {l === 'th' ? group.title_th : group.title_en}
        </h3>
        <p className="text-fg-3 text-xs uppercase tracking-[.08em]">
          {l === 'th' ? group.forWho_th : group.forWho_en}
        </p>
        <p className="text-fg-2 text-sm leading-relaxed flex-1">
          {l === 'th' ? group.body_th : group.body_en}
        </p>
        <span className="font-display font-semibold text-sm text-blue mt-auto">
          {l === 'th' ? 'ดูรายละเอียด →' : 'See details →'}
        </span>
      </Card>
    </Link>
  )
}
