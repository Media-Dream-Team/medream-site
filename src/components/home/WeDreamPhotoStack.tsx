'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Star } from '@/components/ui/Star'

const IMAGES = ['/images/portfolio/sumeeper.png', '/images/portfolio/placeholder.png', '/images/portfolio/placeholder.png']

const POSITIONS = [
  { transform: 'rotate(-3deg) translate(0px,0px) scale(1)', zIndex: 3 },
  { transform: 'rotate(4deg) translate(20px,14px) scale(.96)', zIndex: 2 },
  { transform: 'rotate(-8deg) translate(38px,26px) scale(.92)', zIndex: 1 },
]

const CHAMFER_STYLE: React.CSSProperties = {
  clipPath: 'polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)',
}

interface Props {
  captions: { caption_th: string; caption_en: string }[]
  locale: string
}

export function WeDreamPhotoStack({ captions, locale }: Props) {
  const l = locale as 'th' | 'en'
  const [order, setOrder] = useState([0, 1, 2])
  const cycle = () => setOrder(prev => [...prev.slice(1), prev[0]])

  return (
    <div className="relative">
      <div onClick={cycle} className="relative z-[1] cursor-pointer">
        {order.map((imgIdx, depth) => {
          const pos = POSITIONS[depth]
          const caption = captions[imgIdx]
          return (
            <div
              key={imgIdx}
              className="border border-line bg-white p-[10px]"
              style={{
                position: depth === 0 ? 'relative' : 'absolute',
                inset: depth === 0 ? undefined : 0,
                transform: pos.transform,
                zIndex: pos.zIndex,
                transition: 'transform 450ms cubic-bezier(0,0,.2,1)',
              }}
            >
              <div className="flex gap-1.5 px-1 pb-[10px]">
                <span className="w-2 h-2 bg-line" />
                <span className="w-2 h-2 bg-line" />
                <span className="w-2 h-2 bg-line" />
              </div>
              <div className="relative w-full h-[280px]">
                <Image src={IMAGES[imgIdx]} alt="" fill className="object-cover" />
              </div>
              {depth === 0 && caption && (
                <div
                  className="absolute -bottom-[18px] -left-[18px] z-[2] bg-first-light text-navy font-display font-bold text-[13px] px-3.5 py-2 flex items-center gap-1.5 whitespace-nowrap"
                  style={CHAMFER_STYLE}
                >
                  <Star className="w-3.5 h-3.5" />
                  {l === 'th' ? caption.caption_th : caption.caption_en}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <button
        onClick={cycle}
        className="absolute -bottom-4 -right-4 z-[4] w-11 h-11 bg-navy text-white flex items-center justify-center transition-transform duration-200 ease-out hover:-translate-y-0.5"
        style={CHAMFER_STYLE}
        aria-label={l === 'th' ? 'ดูภาพถัดไป' : 'Next photo'}
      >
        <svg viewBox="0 0 16 16" className="w-[18px] h-[18px]" fill="currentColor" aria-hidden="true">
          <path d="M2 7h9.2L7.6 3.4 9 2l6 6-6 6-1.4-1.4L11.2 9H2z" />
        </svg>
      </button>
    </div>
  )
}
