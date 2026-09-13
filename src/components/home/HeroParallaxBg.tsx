'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'

export function HeroParallaxBg() {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    let raf: number | null = null
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        setOffset(window.scrollY * 0.35)
        raf = null
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ maskImage: 'linear-gradient(to bottom, transparent 4%, black 75%)' }}
      aria-hidden="true"
    >
      <Image
        src="/images/hero/hero-sky.png"
        alt=""
        fill
        priority
        className="object-cover opacity-85"
        style={{ transform: `translateY(${offset}px) scale(1.15)` }}
      />
    </div>
  )
}
