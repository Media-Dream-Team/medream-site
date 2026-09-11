// src/components/services/CraftBar.tsx
import type { CraftItem } from '@/types/content'

interface Props {
  craft: CraftItem[]
  locale: string
}

export function CraftBar({ craft, locale }: Props) {
  const l = locale as 'th' | 'en'
  return (
    <div className="border-t border-line pt-8 mt-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center">
      <span className="text-fg-3 text-sm">
        {l === 'th' ? 'ทุกกลุ่มบริการใช้ Craft เดียวกัน:' : 'Every group draws on the same craft:'}
      </span>
      {craft.map((item, i) => (
        <span key={i} className="font-display font-medium text-ink text-sm">
          {l === 'th' ? item.label_th : item.label_en}
          {i < craft.length - 1 && <span className="text-fg-3 ml-3">·</span>}
        </span>
      ))}
    </div>
  )
}
