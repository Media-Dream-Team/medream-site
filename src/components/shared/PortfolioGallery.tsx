'use client'

import { useEffect, useState } from 'react'

const THUMB_CHAMFER_STYLE: React.CSSProperties = {
  clipPath: 'polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)',
}

const LIGHTBOX_CHAMFER_STYLE: React.CSSProperties = {
  clipPath: 'polygon(16px 0,100% 0,100% calc(100% - 16px),calc(100% - 16px) 100%,0 100%,0 16px)',
}

const NAV_CHAMFER_STYLE: React.CSSProperties = {
  clipPath: 'polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)',
}

interface Props {
  images: string[]
}

export function PortfolioGallery({ images }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  useEffect(() => {
    if (openIndex === null) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenIndex(null)
      if (e.key === 'ArrowRight') setOpenIndex(i => (i === null ? i : (i + 1) % images.length))
      if (e.key === 'ArrowLeft') setOpenIndex(i => (i === null ? i : (i - 1 + images.length) % images.length))
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [openIndex, images.length])

  if (images.length === 0) return null

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-6">
        {images.map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => setOpenIndex(i)}
            style={THUMB_CHAMFER_STYLE}
            className="relative aspect-square bg-navy-card overflow-hidden border border-line hover:border-blue transition-colors"
          >
            {/* Notion-hosted image URLs are signed and expire hourly, so next/image's
                cached optimizer would eventually serve a broken image — use a plain img. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-midnight/95 flex items-center justify-center p-4 sm:p-8"
          onClick={() => setOpenIndex(null)}
        >
          <button
            type="button"
            onClick={() => setOpenIndex(null)}
            aria-label="Close"
            className="absolute top-4 right-4 z-10 text-white/70 hover:text-white transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  setOpenIndex(i => (i === null ? i : (i - 1 + images.length) % images.length))
                }}
                aria-label="Previous image"
                style={NAV_CHAMFER_STYLE}
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 bg-first-light text-navy hover:bg-dawn transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  setOpenIndex(i => (i === null ? i : (i + 1) % images.length))
                }}
                aria-label="Next image"
                style={NAV_CHAMFER_STYLE}
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 bg-first-light text-navy hover:bg-dawn transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[openIndex]}
            alt=""
            style={LIGHTBOX_CHAMFER_STYLE}
            className="max-w-full max-h-full object-contain"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
