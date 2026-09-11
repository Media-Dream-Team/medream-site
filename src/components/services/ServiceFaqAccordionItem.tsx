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
  const panelId = `faq-answer-${item.question_en.slice(0, 20).replace(/\s+/g, '-')}`

  return (
    <div className="border-b border-line">
      <button
        type="button"
        className="w-full text-left py-4 flex justify-between items-center gap-4 text-ink font-display font-semibold hover:text-blue transition-colors"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span>{l === 'th' ? item.question_th : item.question_en}</span>
        <span className="text-blue flex-shrink-0 text-xl" aria-hidden="true">
          {open ? '−' : '+'}
        </span>
      </button>
      <p id={panelId} hidden={!open} className="pb-4 text-fg-2 leading-relaxed text-sm">
        {l === 'th' ? item.answer_th : item.answer_en}
      </p>
    </div>
  )
}
