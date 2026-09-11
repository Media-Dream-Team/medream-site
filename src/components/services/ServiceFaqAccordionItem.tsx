// src/components/services/ServiceFaqAccordionItem.tsx
'use client'

import { useState } from 'react'
import type { ServiceFaqItem } from '@/types/content'

interface Props {
  item: ServiceFaqItem
  locale: string
}

export function ServiceFaqAccordionItem({ item, locale }: Props) {
  const [open, setOpen] = useState(false)
  const l = locale as 'th' | 'en'

  return (
    <div className="border-b border-line">
      <button
        className="w-full text-left py-4 flex justify-between items-center gap-4 text-ink font-display font-semibold hover:text-blue transition-colors"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span>{l === 'th' ? item.question_th : item.question_en}</span>
        <span className="text-blue flex-shrink-0 text-xl" aria-hidden="true">
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <p className="pb-4 text-fg-2 leading-relaxed text-sm">
          {l === 'th' ? item.answer_th : item.answer_en}
        </p>
      )}
    </div>
  )
}
