'use client'
import { useEffect, useRef } from 'react'

// ─── Utilities ────────────────────────────────────────────────────────────────

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function lerpColor(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a)
  const [br, bg, bb] = hexToRgb(b)
  const r = Math.round(ar + (br - ar) * t)
  const g = Math.round(ag + (bg - ag) * t)
  const b2 = Math.round(ab + (bb - ab) * t)
  return `rgb(${r},${g},${b2})`
}

// Multi-stop gradient — stops sorted by p ascending
function gradientStop(stops: [number, string][], p: number): string {
  if (p <= stops[0][0]) return stops[0][1]
  if (p >= stops[stops.length - 1][0]) return stops[stops.length - 1][1]
  for (let i = 0; i < stops.length - 1; i++) {
    const [p0, c0] = stops[i]
    const [p1, c1] = stops[i + 1]
    if (p >= p0 && p <= p1) {
      return lerpColor(c0, c1, (p - p0) / (p1 - p0))
    }
  }
  return stops[stops.length - 1][1]
}

// ─── Color stops ──────────────────────────────────────────────────────────────

const SKY_STOPS: [number, string][] = [
  [0.00, '#020408'],
  [0.15, '#060a14'],
  [0.30, '#0d1a3e'],
  [0.45, '#1740b0'],
  [0.55, '#3d6ee8'],
  [0.65, '#1a2a3a'],
  [0.75, '#0d1520'],
  [0.88, '#1a1208'],
  [1.00, '#120c04'],
]

// ─── Mountain layers ──────────────────────────────────────────────────────────

interface MountainLayer {
  points: [number, number][]  // polygon points [x, y]
  color: string
  opacityRange: [number, number]  // [fadeInStart, fadeInEnd] p values
}

function buildMountains(w: number, h: number): MountainLayer[] {
  // Far ridge — gentle, wide peaks, upper 25% of canvas height
  const farY = h * 0.75
  const farPoints: [number, number][] = [
    [0, h], [-w * 0.05, farY + h * 0.08],
    [w * 0.15, farY - h * 0.06], [w * 0.35, farY + h * 0.04],
    [w * 0.5,  farY - h * 0.10], [w * 0.7,  farY + h * 0.02],
    [w * 0.85, farY - h * 0.07], [w * 1.05, farY + h * 0.06],
    [w, h],
  ]

  // Near ridge — taller, sharper peaks, base at 80% canvas height
  const nearY = h * 0.80
  const nearPoints: [number, number][] = [
    [0, h], [-w * 0.05, nearY + h * 0.05],
    [w * 0.1,  nearY + h * 0.02], [w * 0.28, nearY - h * 0.14],
    [w * 0.45, nearY + h * 0.03], [w * 0.62, nearY - h * 0.18],
    [w * 0.78, nearY + h * 0.01], [w * 0.9,  nearY - h * 0.10],
    [w * 1.05, nearY + h * 0.04], [w, h],
  ]

  return [
    { points: farPoints,  color: '#0d1828', opacityRange: [0.48, 0.62] },
    { points: nearPoints, color: '#050c14', opacityRange: [0.54, 0.68] },
  ]
}

// ─── Star layer ───────────────────────────────────────────────────────────────

interface Star {
  xNorm: number        // 0–1 normalized x position
  yNorm: number        // 0–1 normalized y position
  size: number         // px
  color: string
  depth: number        // 0=far, 1=near — drives parallax shift
  twinkleSpeed: number
  twinklePhase: number
}

const STAR_COLORS = ['#fbf4e0', '#fbf4e0', '#fbf4e0', '#ecc842', '#8fa8e8']

function buildStars(count: number): Star[] {
  const stars: Star[] = []
  for (let i = 0; i < count; i++) {
    stars.push({
      xNorm:        Math.random(),
      yNorm:        Math.random(),
      size:         0.5 + Math.random() * 2,
      color:        STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      depth:        Math.random(),              // continuous 0–1
      twinkleSpeed: 0.3 + Math.random() * 0.8,
      twinklePhase: Math.random() * Math.PI * 2,
    })
  }
  return stars
}

// ─── Shooting star ────────────────────────────────────────────────────────────

interface ShootingStar {
  x: number           // start x px
  y: number           // start y px
  angle: number       // radians, ~−15° to −25°
  length: number      // px
  duration: number    // ms
  startTime: number   // performance.now() when it started
  color: string
}

// ─── Cloud wisp layer ─────────────────────────────────────────────────────────

interface CloudWisp {
  xNorm: number   // 0–1
  yNorm: number   // 0.25–0.55 range
  rx: number      // x radius px
  ry: number      // y radius px
}

function buildClouds(): CloudWisp[] {
  return Array.from({ length: 6 }, () => ({
    xNorm: Math.random(),
    yNorm: 0.25 + Math.random() * 0.30,
    rx:    40 + Math.random() * 50,
    ry:    8  + Math.random() * 10,
  }))
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ScrollBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    let mountains: MountainLayer[] = []
    const isMobile = window.innerWidth < 768
    let stars: Star[] = buildStars(isMobile ? 60 : 120)
    const clouds: CloudWisp[] = buildClouds()
    let startTime = performance.now()
    let rafId = 0

    let shootingStar: ShootingStar | null = null
    let nextShootAt: number = performance.now() + 2000 + Math.random() * 3000

    function resize() {
      const w = window.innerWidth
      const h = window.innerHeight
      canvas!.width  = w * dpr
      canvas!.height = h * dpr
      canvas!.style.width  = `${w}px`
      canvas!.style.height = `${h}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      mountains = buildMountains(w, h)
      const nowMobile = window.innerWidth < 768
      stars = buildStars(nowMobile ? 60 : 120)
    }

    function spawnShootingStar() {
      const w = window.innerWidth
      const h = window.innerHeight
      const angle = -(15 + Math.random() * 10) * (Math.PI / 180)
      const colors = ['#ecc842', '#fbf4e0', '#8fa8e8']
      shootingStar = {
        x:         w * (0.1 + Math.random() * 0.7),
        y:         h * (0.05 + Math.random() * 0.35),
        angle,
        length:    80 + Math.random() * 80,
        duration:  600 + Math.random() * 300,
        startTime: performance.now(),
        color:     colors[Math.floor(Math.random() * colors.length)],
      }
    }

    function getScrollP() {
      const max = document.documentElement.scrollHeight - window.innerHeight
      return max > 0 ? clamp(window.scrollY / max, 0, 1) : 0
    }

    function draw() {
      const p = getScrollP()
      const dprLocal = window.devicePixelRatio || 1
      const w = canvas!.width / dprLocal
      const h = canvas!.height / dprLocal

      // 1. Background fill
      ctx!.fillStyle = gradientStop(SKY_STOPS, p)
      ctx!.fillRect(0, 0, w, h)

      // 2. Aurora glow (space zone)
      {
        const elapsed = (performance.now() - startTime) / 1000
        const pulse = Math.sin(elapsed * 0.4) * 0.15 + 0.85
        const alpha = clamp(0.25 - p * 0.6, 0, 0.25) * pulse
        if (alpha > 0) {
          const grad = ctx!.createRadialGradient(w / 2, 0, 0, w / 2, 0, h * 0.7)
          grad.addColorStop(0, `rgba(61,110,232,${alpha})`)
          grad.addColorStop(1, 'transparent')
          ctx!.fillStyle = grad
          ctx!.fillRect(0, 0, w, h)
        }
      }

      // 3. Cloud wisps (sky zone p 0.28–0.60)
      {
        const cloudAlpha = smoothstep(0.28, 0.38, p) * smoothstep(0.60, 0.50, p) * 0.06
        if (cloudAlpha > 0) {
          const drift = (((performance.now() - startTime) / 1000) * 12) % window.innerWidth
          for (const c of clouds) {
            const cx = ((c.xNorm * window.innerWidth - drift) + window.innerWidth) % window.innerWidth
            const cy = c.yNorm * window.innerHeight
            ctx!.save()
            ctx!.globalAlpha = cloudAlpha
            ctx!.fillStyle = '#fbf4e0'
            ctx!.beginPath()
            ctx!.ellipse(cx, cy, c.rx, c.ry, 0, 0, Math.PI * 2)
            ctx!.fill()
            ctx!.restore()
          }
        }
      }

      // 4. Dawn-gold horizon glow (sky → mountain transition)
      {
        const alpha = smoothstep(0.35, 0.55, p) * smoothstep(0.88, 0.75, p) * 0.12
        if (alpha > 0) {
          const grad = ctx!.createRadialGradient(w / 2, h, 0, w / 2, h, h * 0.6)
          grad.addColorStop(0, `rgba(236,200,66,${alpha})`)
          grad.addColorStop(1, 'transparent')
          ctx!.fillStyle = grad
          ctx!.fillRect(0, 0, w, h)
        }
      }

      // 5. Stars
      const elapsed = (performance.now() - startTime) / 1000  // seconds
      const starOpacity = clamp(1 - p / 0.35, 0, 1)

      if (starOpacity > 0) {
        for (const star of stars) {
          const twinkle = Math.sin(elapsed * star.twinkleSpeed + star.twinklePhase) * 0.25 + 0.75
          const alpha = starOpacity * twinkle

          // Parallax: depth 0 = no shift, depth 1 = max shift
          const parallaxShift = star.depth * window.scrollY * 0.08
          const x = (star.xNorm * window.innerWidth + parallaxShift) % window.innerWidth
          const y = star.yNorm * window.innerHeight

          ctx!.save()
          ctx!.globalAlpha = alpha
          ctx!.fillStyle = star.color
          if (star.size > 1.5) {
            // Glow for larger stars
            const grad = ctx!.createRadialGradient(x, y, 0, x, y, star.size * 2)
            grad.addColorStop(0, star.color)
            grad.addColorStop(1, 'transparent')
            ctx!.fillStyle = grad
            ctx!.fillRect(x - star.size * 2, y - star.size * 2, star.size * 4, star.size * 4)
          }
          ctx!.beginPath()
          ctx!.arc(x, y, star.size / 2, 0, Math.PI * 2)
          ctx!.fill()
          ctx!.restore()
        }
      }

      // 6. Shooting star
      if (p < 0.30) {
        const now = performance.now()

        if (!shootingStar && now >= nextShootAt) {
          spawnShootingStar()
        }

        if (shootingStar) {
          const t = clamp((now - shootingStar.startTime) / shootingStar.duration, 0, 1)
          // ease-in-out opacity: peaks at 0.5, zero at ends
          const alpha = Math.sin(t * Math.PI) * starOpacity

          if (t >= 1) {
            shootingStar = null
            nextShootAt = now + 3000 + Math.random() * 5000
          } else {
            const { x, y, angle, length, color } = shootingStar
            // Head position advances along the angle
            const headX = x + Math.cos(angle) * length * t
            const headY = y + Math.sin(angle) * length * t
            const tailX = headX - Math.cos(angle) * length
            const tailY = headY - Math.sin(angle) * length

            const grad = ctx!.createLinearGradient(tailX, tailY, headX, headY)
            grad.addColorStop(0, color + '00')
            grad.addColorStop(1, color)

            ctx!.save()
            ctx!.globalAlpha = alpha
            ctx!.strokeStyle = grad
            ctx!.lineWidth = 1.5
            ctx!.beginPath()
            ctx!.moveTo(tailX, tailY)
            ctx!.lineTo(headX, headY)
            ctx!.stroke()
            ctx!.restore()
          }
        }
      } else {
        // Clear any in-flight star when space zone exits
        shootingStar = null
      }

      // 7. Mountains
      for (const layer of mountains) {
        const opacity = smoothstep(layer.opacityRange[0], layer.opacityRange[1], p)
        if (opacity <= 0) continue
        ctx!.save()
        ctx!.globalAlpha = opacity
        ctx!.fillStyle = layer.color
        ctx!.beginPath()
        ctx!.moveTo(layer.points[0][0], layer.points[0][1])
        for (let i = 1; i < layer.points.length; i++) {
          ctx!.lineTo(layer.points[i][0], layer.points[i][1])
        }
        ctx!.closePath()
        ctx!.fill()
        ctx!.restore()
      }

      // 8. Ground warm glow (bottom of page)
      {
        const alpha = smoothstep(0.78, 0.92, p) * 0.09
        if (alpha > 0) {
          const grad = ctx!.createRadialGradient(w / 2, h, 0, w / 2, h, h * 0.5)
          grad.addColorStop(0, `rgba(236,200,66,${alpha})`)
          grad.addColorStop(1, 'transparent')
          ctx!.fillStyle = grad
          ctx!.fillRect(0, 0, w, h)
        }
      }

      rafId = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)

    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId)
      } else {
        rafId = requestAnimationFrame(draw)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    rafId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  )
}
