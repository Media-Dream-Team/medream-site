'use client'

import type { Service } from '@/types/content'

interface Props {
  service: Service
  locale: string
}

export function ServiceCard({ service, locale }: Props) {
  const l = locale as 'th' | 'en'

  return (
    <div className="bg-deep-space border border-nebula rounded-xl p-6 flex flex-col gap-3 hover:border-electric transition-colors">
      <span className="text-4xl">{service.icon}</span>
      <h3 className="text-dream-cream font-bold text-lg">
        {l === 'th' ? service.title_th : service.title_en}
      </h3>
      <p className="text-horizon text-sm leading-relaxed flex-1">
        {l === 'th' ? service.desc_th : service.desc_en}
      </p>
      <a
        href={`#contact-form?service=${service.id}`}
        onClick={(e) => {
          e.preventDefault()
          const el = document.getElementById('contact-form')
          if (el) {
            const url = new URL(window.location.href)
            url.searchParams.set('service', service.id)
            window.history.replaceState({}, '', url.toString())
            el.scrollIntoView({ behavior: 'smooth' })
          }
        }}
        className="mt-auto inline-block px-4 py-2 bg-royal-blue hover:bg-electric text-white text-sm font-bold rounded transition-colors text-center"
      >
        {l === 'th' ? service.cta_th : service.cta_en}
      </a>
    </div>
  )
}
