# Scroll Journey Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a scroll-driven canvas background that smoothly transitions Space → Sky → Mountains → Ground as the user scrolls from top to bottom of the page.

**Architecture:** A single `<canvas>` fixed behind the page (z-index -1) is painted every frame via `requestAnimationFrame`. Scroll progress `p` (0–1) drives all color interpolation and layer opacity — no external animation libraries. The component mounts once in the locale layout and tears down cleanly on unmount.

**Tech Stack:** React 18, TypeScript, Canvas 2D API, Next.js 16 App Router (`'use client'` leaf component)

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/components/layout/ScrollBackground.tsx` | Create | Canvas component — all drawing logic |
| `src/app/[locale]/layout.tsx` | Modify | Mount `<ScrollBackground />` inside `<body>` before NavBar |

No other files change.

---

### Task 1: Scaffold ScrollBackground with gradient fill

**Files:**
- Create: `src/components/layout/ScrollBackground.tsx`

This task produces a working canvas that fills the viewport with the correct background color based on scroll position — no stars yet, just the gradient. Verify visually: scroll down and the background should shift from near-black → blue → dark blue-green → dark brown.

- [ ] **Step 1: Create the file with utility functions and color stops**

```tsx
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
```

- [ ] **Step 2: Add mountain path generator**

Mountain paths are computed once from canvas dimensions (and recomputed on resize). Add this below the color stops:

```tsx
interface MountainLayer {
  points: [number, number][]  // polygon points [x, y]
  color: string
  farOpacityRange: [number, number]  // [fadeInStart, fadeInEnd] p values
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
    { points: farPoints,  color: '#0d1828', farOpacityRange: [0.48, 0.62] },
    { points: nearPoints, color: '#050c14', farOpacityRange: [0.54, 0.68] },
  ]
}
```

- [ ] **Step 3: Add the React component and drawing loop**

```tsx
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
      ctx!.scale(dpr, dpr)
      mountains = buildMountains(w, h)
    }

    function getScrollP() {
      const max = document.documentElement.scrollHeight - window.innerHeight
      return max > 0 ? clamp(window.scrollY / max, 0, 1) : 0
    }

    function draw() {
      const p = getScrollP()
      const w = window.innerWidth
      const h = window.innerHeight

      // 1. Background fill
      ctx!.fillStyle = gradientStop(SKY_STOPS, p)
      ctx!.fillRect(0, 0, w, h)

      // 2. Mountains
      for (const layer of mountains) {
        const opacity = smoothstep(layer.farOpacityRange[0], layer.farOpacityRange[1], p)
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
```

- [ ] **Step 4: Mount in layout**

In `src/app/[locale]/layout.tsx`, add the import and mount the component:

```tsx
// Add import (after existing imports):
import { ScrollBackground } from '@/components/layout/ScrollBackground'

// In JSX, add <ScrollBackground /> as the first child of <body>:
return (
  <html lang={locale}>
    <body>
      <NextIntlClientProvider messages={messages}>
        <ScrollBackground />
        <NavBar items={nav.items} />
        <main>{children}</main>
        <Footer site={site} navItems={nav.items} locale={locale} />
      </NextIntlClientProvider>
    </body>
  </html>
)
```

- [ ] **Step 5: Run dev server and verify gradient**

```bash
npm run dev
```

Open http://localhost:3000. Scroll from top to bottom.

Expected:
- Top: near-black (`#020408`)
- ~30% scrolled: deep navy blue
- ~50% scrolled: electric blue (`#3d6ee8`)
- ~75% scrolled: very dark blue-gray
- Bottom: dark warm brown (`#120c04`)
- Mountain silhouettes appear at ~50% scroll and darken/sharpen as you scroll further
- No flicker, no layout shift, canvas sits behind all content

- [ ] **Step 6: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/layout/ScrollBackground.tsx src/app/[locale]/layout.tsx
git commit -m "feat: add scroll-journey canvas background with gradient + mountains"
```

---

### Task 2: Stars layer with parallax and twinkle

**Files:**
- Modify: `src/components/layout/ScrollBackground.tsx`

Add 120 stars (60 on mobile) that fade out as scroll passes 0.35. Each star has a depth layer that shifts its horizontal position on scroll for a parallax feel. Stars twinkle via `sin(time)`.

- [ ] **Step 1: Add star types and generator above the component**

Insert after the `buildMountains` function:

```tsx
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
```

- [ ] **Step 2: Initialize stars in the useEffect setup block**

Inside `useEffect`, after `let mountains: MountainLayer[] = []`, add:

```tsx
const isMobile = window.innerWidth < 768
let stars: Star[] = buildStars(isMobile ? 60 : 120)
```

Also regenerate stars on resize if mobile breakpoint changes — inside the `resize()` function, after recomputing mountains:

```tsx
const nowMobile = window.innerWidth < 768
stars = buildStars(nowMobile ? 60 : 120)
```

- [ ] **Step 3: Add time tracking and star drawing inside draw()**

Add `let startTime = performance.now()` after the `let stars` line (in setup, before `resize()`).

Then inside `draw()`, after the background fill and before mountains, insert:

```tsx
// 2. Stars
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
```

Update the mountains section comment to `// 3. Mountains` to keep draw order clear.

- [ ] **Step 4: Verify stars visually**

```bash
npm run dev
```

Expected at top of page (p=0):
- Stars visible across entire hero
- Slight size variation (1 large gold, many small white/blue)
- Stars subtly twinkle (opacity shifts gently)
- On slow scroll, near stars (gold) shift position faster than far stars (white)
- Stars fully gone by ~35% scroll

- [ ] **Step 5: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/ScrollBackground.tsx
git commit -m "feat: add parallax twinkling stars to scroll-journey canvas"
```

---

### Task 3: Shooting stars

**Files:**
- Modify: `src/components/layout/ScrollBackground.tsx`

Shooting stars fire one at a time when `p < 0.3`. Each travels diagonally for 600–900ms, then waits 3–8s before the next fires.

- [ ] **Step 1: Add shooting star state type above the component**

```tsx
interface ShootingStar {
  x: number           // start x px
  y: number           // start y px
  angle: number       // radians, ~−15° to −25°
  length: number      // px
  duration: number    // ms
  startTime: number   // performance.now() when it started
  color: string
}
```

- [ ] **Step 2: Add shooting star state in useEffect**

After `let stars = buildStars(...)`, add:

```tsx
let shootingStar: ShootingStar | null = null
let nextShootAt: number = performance.now() + 2000 + Math.random() * 3000
```

- [ ] **Step 3: Add a spawnShootingStar helper**

Add this function inside `useEffect` (after `resize`, before `draw`):

```tsx
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
```

- [ ] **Step 4: Draw shooting star inside draw()**

After the stars block (before mountains), add:

```tsx
// 3. Shooting star
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
      grad.addColorStop(0, 'transparent')
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
}
```

Update mountains comment to `// 4. Mountains`.

- [ ] **Step 5: Verify visually**

```bash
npm run dev
```

Stay at top of page (don't scroll). Wait up to 10 seconds.

Expected:
- A diagonal streak appears, travels top-right to bottom-left, fades out smoothly
- Another fires 3–8s later
- Gold, white, or blue color
- No shooting stars visible once scrolled past ~30% of page

- [ ] **Step 6: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/layout/ScrollBackground.tsx
git commit -m "feat: add shooting stars to scroll-journey canvas"
```

---

### Task 4: Aurora glow + dawn-gold horizon + cloud wisps

**Files:**
- Modify: `src/components/layout/ScrollBackground.tsx`

Three atmospheric effects:
- **Aurora**: radial glow at top, visible in space zone only, pulses slowly
- **Cloud wisps**: faint ellipses, visible in sky zone (p 0.28–0.60)
- **Dawn-gold horizon**: warm glow at canvas bottom, visible in sky/mountain transition (p 0.35–0.85)

- [ ] **Step 1: Add cloud wisp generator above the component**

```tsx
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
```

- [ ] **Step 2: Initialize clouds in useEffect setup**

After `let stars = buildStars(...)`, add:

```tsx
const clouds: CloudWisp[] = buildClouds()
```

- [ ] **Step 3: Draw aurora, clouds, horizon inside draw() — insert before stars block**

Insert at the top of `draw()`, right after the background fill:

```tsx
// 2. Aurora glow (space zone)
{
  const pulse = Math.sin(elapsed * 0.4) * 0.15 + 0.85
  const alpha = clamp(0.25 - p * 0.6, 0, 0.25) * pulse
  if (alpha > 0) {
    const w = window.innerWidth
    const h = window.innerHeight
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
    const drift = (elapsed * 12) % window.innerWidth  // slow leftward drift
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
    const w = window.innerWidth
    const h = window.innerHeight
    const grad = ctx!.createRadialGradient(w / 2, h, 0, w / 2, h, h * 0.6)
    grad.addColorStop(0, `rgba(236,200,66,${alpha})`)
    grad.addColorStop(1, 'transparent')
    ctx!.fillStyle = grad
    ctx!.fillRect(0, 0, w, h)
  }
}
```

Update stars comment to `// 5. Stars`, shooting star to `// 6. Shooting star`, mountains to `// 7. Mountains`.

- [ ] **Step 4: Add ground warm glow after mountains block**

```tsx
// 8. Ground warm glow (bottom of page)
{
  const alpha = smoothstep(0.78, 0.92, p) * 0.09
  if (alpha > 0) {
    const w = window.innerWidth
    const h = window.innerHeight
    const grad = ctx!.createRadialGradient(w / 2, h, 0, w / 2, h, h * 0.5)
    grad.addColorStop(0, `rgba(236,200,66,${alpha})`)
    grad.addColorStop(1, 'transparent')
    ctx!.fillStyle = grad
    ctx!.fillRect(0, 0, w, h)
  }
}
```

- [ ] **Step 5: Verify all effects**

```bash
npm run dev
```

Scroll through the full page slowly.

| Scroll position | Expected |
|---|---|
| Top (p=0) | Deep midnight, stars visible, aurora blue glow at top |
| ~30% | Stars fading, blue electric sky appearing |
| ~35–50% | Faint cloud wisps drifting left, dawn-gold glow rising from bottom |
| ~55–70% | Mountain ridges appearing (far first, then near) |
| ~80% | Full mountain landscape, gold glow at horizon base |
| Bottom | Dark warm-brown ground tone, subtle gold warmth |

No hard cuts anywhere — all transitions should feel like a slow camera descent.

- [ ] **Step 6: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Lint**

```bash
npm run lint
```

Expected: no new errors.

- [ ] **Step 8: Commit**

```bash
git add src/components/layout/ScrollBackground.tsx
git commit -m "feat: add aurora, cloud wisps, and horizon glow to scroll-journey canvas"
```

---

### Task 5: Polish — ensure body bg matches, test mobile

**Files:**
- Modify: `src/app/globals.css` (verify, minor edit if needed)
- Modify: `src/components/layout/ScrollBackground.tsx` (mobile tweak only if needed)

- [ ] **Step 1: Verify body background**

Open `src/app/globals.css`. Confirm `body` has `background-color: #060a14` or equivalent. If not present, add:

```css
body {
  background-color: #060a14;
}
```

This ensures the body color matches the canvas top-of-page color so there's no flash before canvas paints.

- [ ] **Step 2: Check HeroSection bg**

Open `src/components/home/HeroSection.tsx`. The `<section>` has `bg-midnight` class. That's fine — the hero section sits on top of the canvas. The canvas provides the animated background visible through transparent areas only.

Remove `bg-midnight` from the hero `<section>` so the canvas shows through:

```tsx
// Before:
<section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden bg-midnight">

// After:
<section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
```

- [ ] **Step 3: Check other sections for solid backgrounds**

Check that content sections don't have full-opacity background colors that would hide the canvas. Sections should use semi-transparent backgrounds or no background if they want the canvas to show.

Open `src/app/[locale]/page.tsx` and check which sections have solid `bg-midnight` or `bg-deep-space` classes. **Leave them as-is** — the canvas is a background ambiance effect; section backgrounds sitting on top is correct and intentional. The canvas visible through hero and footer is sufficient.

- [ ] **Step 4: Verify on mobile viewport**

In Chrome DevTools, switch to a mobile viewport (375×812 iPhone SE or similar). Scroll the full page.

Expected:
- Star count is 60 (half of desktop) — less dense but still present
- Canvas correctly fills mobile viewport width
- No horizontal scroll caused by canvas
- Mountain ridges proportionally correct on narrow viewport

- [ ] **Step 5: Final TypeScript + lint check**

```bash
npx tsc --noEmit && npm run lint
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/globals.css src/components/home/HeroSection.tsx
git commit -m "feat: remove hero bg-midnight so scroll-journey canvas shows through"
```
