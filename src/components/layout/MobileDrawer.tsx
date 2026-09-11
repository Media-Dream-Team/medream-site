// src/components/layout/MobileDrawer.tsx
'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import type { NavItem } from '@/types/content'
import { Button } from '@/components/ui/Button'
import { LangToggle } from '@/components/shared/LangToggle'

interface Props {
  items: NavItem[]
  open: boolean
  onClose: () => void
}

export function MobileDrawer({ items, open, onClose }: Props) {
  const locale = useLocale()
  const t = useTranslations('nav')

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-midnight/80 z-40 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Drawer */}
      <nav
        className="fixed top-0 right-0 h-full w-72 bg-navy-card z-50 flex flex-col p-6 shadow-2xl lg:hidden"
        aria-label={t('open_menu')}
      >
        <button
          onClick={onClose}
          className="self-end text-white hover:text-first-light mb-8 text-2xl"
          aria-label={t('close_menu')}
        >
          ✕
        </button>
        <ul className="flex flex-col gap-4 flex-1">
          {items.map(item => (
            <li key={item.key}>
              <Link
                href={`/${locale}${item.href}`}
                onClick={onClose}
                className="text-white hover:text-first-light text-lg font-display font-semibold block py-2 border-b border-white/10"
              >
                {locale === 'th' ? item.label_th : item.label_en}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-4 mt-6">
          <Button href={`/${locale}/contact`} variant="primary" surface="dark" onClick={onClose}>
            {t('contact_cta')}
          </Button>
          <LangToggle />
        </div>
      </nav>
    </>
  )
}
