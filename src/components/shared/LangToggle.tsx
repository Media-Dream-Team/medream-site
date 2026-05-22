// src/components/shared/LangToggle.tsx
'use client'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { useTransition } from 'react'

export function LangToggle() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  function toggle() {
    const nextLocale = locale === 'th' ? 'en' : 'th'
    // Replace locale prefix in pathname
    const segments = pathname.split('/')
    segments[1] = nextLocale
    startTransition(() => {
      router.push(segments.join('/'))
    })
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className="px-3 py-1 rounded border border-horizon text-dream-cream text-sm font-bold hover:border-dawn-gold hover:text-dawn-gold transition-colors"
      aria-label="Toggle language"
    >
      {locale === 'th' ? 'EN' : 'TH'}
    </button>
  )
}
