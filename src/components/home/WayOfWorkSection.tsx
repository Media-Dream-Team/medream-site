'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { HomeContent } from '@/types/content'
import { Star } from '@/components/ui/Star'
import { Button } from '@/components/ui/Button'

interface Props {
  home: HomeContent
  locale: string
}

const STEP_ICONS = [
  '/images/icons/wow-step-1-talk.png',
  '/images/icons/wow-step-2-edit.png',
  '/images/icons/wow-step-3-dev.png',
  '/images/icons/wow-step-4-rocket.png',
]

const STARFIELD_BG =
  'radial-gradient(1.5px 1.5px at 10% 20%,rgba(255,255,255,.9),transparent),radial-gradient(1px 1px at 25% 65%,rgba(255,255,255,.6),transparent),radial-gradient(1.5px 1.5px at 40% 15%,rgba(255,255,255,.7),transparent),radial-gradient(1px 1px at 55% 80%,rgba(255,255,255,.5),transparent),radial-gradient(2px 2px at 70% 35%,rgba(255,255,255,.9),transparent),radial-gradient(1px 1px at 85% 60%,rgba(255,255,255,.6),transparent),radial-gradient(1.5px 1.5px at 95% 25%,rgba(255,255,255,.7),transparent),radial-gradient(1px 1px at 15% 90%,rgba(255,255,255,.5),transparent),radial-gradient(1px 1px at 60% 55%,rgba(255,255,255,.6),transparent),radial-gradient(1.5px 1.5px at 30% 40%,rgba(255,255,255,.6),transparent)'

function GlowBadge({ size }: { size: number }) {
  // Star (src/components/ui/Star.tsx) only accepts `variant`/`className`, no `style` prop —
  // size it via this wrapper div's inline style instead of a dynamic Tailwind class (a
  // template-literal class like `w-[${size}px]` can't be statically extracted by Tailwind's
  // build-time scanner), and let the svg fill it with the static `w-full h-full` classes.
  return (
    <div
      className="wow-step-badge relative flex items-center justify-center flex-shrink-0 transition-[filter,transform] duration-300 ease-out"
      style={{ width: size, height: size, filter: 'drop-shadow(0 0 6px rgba(255,255,255,.7)) drop-shadow(0 0 14px rgba(120,170,255,.5))' }}
    >
      <Star className="text-white w-full h-full" />
    </div>
  )
}

export function WayOfWorkSection({ home, locale }: Props) {
  const l = locale as 'th' | 'en'
  const { wayOfWork } = home
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

  const steps = wayOfWork.steps
  const total = steps.length
  const points = steps.map((_, i) => ({
    x: total > 1 ? 100 + i * (800 / (total - 1)) : 500,
    y: i % 2 === 0 ? 270 : 160,
  }))
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')

  return (
    <section ref={ref} className="relative bg-midnight pt-16 md:pt-24 lg:pt-32 pb-12 md:pb-16 lg:pb-24 px-4 overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0" style={{ backgroundImage: STARFIELD_BG, backgroundRepeat: 'repeat', backgroundSize: '100% 100%' }} />
      <style>{`
        @media (max-width:700px){.wow-path-desktop{display:none}.wow-path-mobile{display:flex}}
        .wow-step:hover .wow-step-badge{transform:scale(1.15);filter:drop-shadow(0 0 10px rgba(255,255,255,1)) drop-shadow(0 0 26px rgba(140,190,255,.9))}
        .wow-mstep:hover .wow-step-badge{transform:scale(1.12);filter:drop-shadow(0 0 10px rgba(255,255,255,1)) drop-shadow(0 0 26px rgba(140,190,255,.9))}
      `}</style>
      <div className="relative max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-16 justify-center">
          <Star className="w-7 h-7 text-white" />
          <h2 className="font-display font-semibold text-white text-3xl md:text-[36px] md:leading-[44px] tracking-[-.01em]">
            {l === 'th' ? wayOfWork.headline_th : wayOfWork.headline_en}
          </h2>
        </div>

        <div className="wow-path-desktop relative h-[420px] mb-8">
          <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className="absolute left-0 top-0 w-full h-[200px] overflow-visible" aria-hidden="true">
            <path d={pathD} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="1.5" />
            <path
              d={pathD}
              fill="none"
              stroke="#fff"
              strokeWidth="1.5"
              pathLength={1}
              style={{
                strokeDasharray: 1,
                strokeDashoffset: visible ? 0 : 1,
                transition: 'stroke-dashoffset 1600ms cubic-bezier(0,0,.2,1) 200ms',
                filter: 'drop-shadow(0 0 4px rgba(255,255,255,.8))',
              }}
            />
          </svg>
          {points.map((p, i) => (
            <div
              key={steps[i].level}
              className="wow-step absolute"
              style={{
                left: `${p.x / 10}%`,
                top: p.y,
                transform: 'translate(-50%,-50%)',
                opacity: visible ? 1 : 0,
                transition: `opacity 500ms cubic-bezier(0,0,.2,1) ${300 + i * 220}ms`,
              }}
            >
              {STEP_ICONS[i] && (
                <Image
                  src={STEP_ICONS[i]}
                  alt=""
                  width={120}
                  height={120}
                  className="absolute object-contain"
                  style={{ bottom: 'calc(100% + 14px)', left: '50%', transform: 'translateX(-50%)' }}
                />
              )}
              <GlowBadge size={40} />
              <div className="absolute top-14 left-1/2 -translate-x-1/2 text-center" style={{ width: 'clamp(130px, 22vw, 190px)' }}>
                <div className="font-display font-semibold text-[15px] text-white mb-1.5">
                  {l === 'th' ? steps[i].label_th : steps[i].label_en}
                </div>
                <div className="text-[13px] leading-relaxed text-white/65">
                  {l === 'th' ? steps[i].desc_th : steps[i].desc_en}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="wow-path-mobile hidden flex-col gap-0 mb-10">
          {steps.map((step, i) => (
            <div
              key={step.level}
              className="wow-mstep flex gap-5"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(16px)',
                transition: `opacity 500ms cubic-bezier(0,0,.2,1) ${300 + i * 180}ms, transform 500ms cubic-bezier(0,0,.2,1) ${300 + i * 180}ms`,
              }}
            >
              <div className="flex flex-col items-center w-16">
                {STEP_ICONS[i] && (
                  <Image src={STEP_ICONS[i]} alt="" width={64} height={64} className="object-contain mb-3.5" />
                )}
                <GlowBadge size={32} />
                {i < total - 1 && <div className="w-[1.5px] flex-1 min-h-8 bg-white/25 my-2" />}
              </div>
              <div className="pb-8">
                <div className="font-display font-semibold text-[15px] text-white mb-1.5 pt-1">
                  {l === 'th' ? step.label_th : step.label_en}
                </div>
                <div className="text-[13px] leading-relaxed text-white/65">
                  {l === 'th' ? step.desc_th : step.desc_en}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button href={`/${locale}/contact`} variant="text" surface="dark">
            {l === 'th' ? wayOfWork.cta_th : wayOfWork.cta_en}
          </Button>
        </div>
      </div>
    </section>
  )
}
