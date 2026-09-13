'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

const CHAMFER_STYLE: React.CSSProperties = {
  clipPath: 'polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)',
}

export function WeMakeDifferenceVisual() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      entries => entries.forEach(entry => { if (entry.isIntersecting) setVisible(true) }),
      { threshold: 0.3 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="border border-line bg-white overflow-hidden"
      style={{
        ...CHAMFER_STYLE,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 600ms cubic-bezier(0,0,.2,1), transform 600ms cubic-bezier(0,0,.2,1)',
      }}
    >
      <div className="relative w-full h-[340px]">
        <Image src="/images/portfolio/placeholder.png" alt="" fill className="object-cover" />
      </div>
    </div>
  )
}
