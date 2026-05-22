'use client'

import { useState } from 'react'
import type { FaqItem as FaqItemType } from '@/types/content'

interface Props {
  item: FaqItemType
  locale: string
}

export function FaqItem({ item, locale }: Props) {
  const [open, setOpen] = useState(false)
  const l = locale as 'th' | 'en'

  return (
    <div className="border-b border-nebula">
      <button
        className="w-full text-left py-4 flex justify-between items-center gap-4 text-dream-cream font-bold hover:text-dawn-gold transition-colors"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span>{l === 'th' ? item.question_th : item.question_en}</span>
        <span className="text-electric flex-shrink-0 text-xl">
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <p className="pb-4 text-horizon leading-relaxed text-sm">
          {l === 'th' ? item.answer_th : item.answer_en}
        </p>
      )}
    </div>
  )
}
