// src/components/layout/NavBar.tsx
'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import type { NavItem } from '@/types/content'
import { LangToggle } from '@/components/shared/LangToggle'
import { MobileDrawer } from './MobileDrawer'

interface Props {
  items: NavItem[]
}

export function NavBar({ items }: Props) {
  const locale = useLocale()
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${
          scrolled ? 'bg-midnight/95 backdrop-blur shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <Image
              src="/images/logo/logo-white.png"
              alt="MeDream Studio"
              width={40}
              height={40}
              className="object-contain"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {items.map(item => (
              <Link
                key={item.key}
                href={`/${locale}${item.href}`}
                className="text-dream-cream hover:text-dawn-gold text-sm font-bold transition-colors"
              >
                {locale === 'th' ? item.label_th : item.label_en}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <LangToggle />
            {/* Hamburger — mobile only */}
            <button
              className="lg:hidden text-dream-cream hover:text-dawn-gold p-1"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <MobileDrawer
        items={items}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  )
}
