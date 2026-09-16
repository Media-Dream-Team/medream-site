// src/components/shared/OrbitHeroDecoration.tsx
import { Star } from '@/components/ui/Star'

const ORBITS = [
  { r: 70, size: 9, dur: 34, delay: -4, type: 'star' as const },
  { r: 120, size: 4, dur: 50, delay: -18, type: 'dot' as const },
  { r: 170, size: 11, dur: 44, delay: -9, type: 'star' as const },
  { r: 170, size: 4, dur: 58, delay: -40, type: 'dot' as const, reverse: true },
  { r: 230, size: 5, dur: 62, delay: -30, type: 'dot' as const },
  { r: 280, size: 10, dur: 70, delay: -52, type: 'star' as const, reverse: true },
  { r: 330, size: 4, dur: 80, delay: -14, type: 'dot' as const },
]

// Decorative orbiting stars/dots behind a dark hero — pure CSS animation, no client JS needed.
export function OrbitHeroDecoration() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {ORBITS.map((o, i) => (
        <div
          key={i}
          className="absolute left-1/2 bottom-0 -translate-x-1/2 -translate-y-1/2"
          style={{ width: o.r * 2, height: o.r * 2 }}
        >
          <div
            className="absolute inset-0"
            style={{
              animation: `orbit-spin ${o.dur}s linear infinite`,
              animationDelay: `${o.delay}s`,
              animationDirection: o.reverse ? 'reverse' : 'normal',
            }}
          >
            {o.type === 'star' ? (
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-50"
                style={{ width: o.size, height: o.size }}
              >
                <Star className="w-full h-full" />
              </div>
            ) : (
              <span
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-35 block"
                style={{ width: o.size, height: o.size }}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
