'use client'
import { useEffect, useRef, useState } from 'react'

interface Props {
  target: number
  className?: string
}

export function AnimatedCounter({ target, className = '' }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let raf = 0
    let started = false

    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting || started) return
          started = true
          const start = performance.now()
          const dur = 1200
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / dur)
            setCount(Math.round(target * (1 - Math.pow(1 - p, 3))))
            if (p < 1) raf = requestAnimationFrame(tick)
          }
          raf = requestAnimationFrame(tick)
          io.disconnect()
        })
      },
      { threshold: 0.3 }
    )
    io.observe(el)

    // The cleanup MUST be returned directly from the effect, not from inside
    // the IntersectionObserver callback's `entries.forEach(...)` — forEach
    // discards whatever its callback returns, so a `return` nested in there
    // never runs and the rAF loop would keep ticking after unmount.
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [target])

  return (
    <span ref={ref} className={className}>
      {count}
    </span>
  )
}
