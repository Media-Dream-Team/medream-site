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
    let rafId = 0

    function resize() {
      const w = window.innerWidth
      const h = window.innerHeight
      canvas!.width  = w * dpr
      canvas!.height = h * dpr
      canvas!.style.width  = `${w}px`
      canvas!.style.height = `${h}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      mountains = buildMountains(w, h)
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

      // 2. Mountains
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
