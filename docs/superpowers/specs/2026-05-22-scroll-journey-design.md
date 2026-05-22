# Scroll Journey Background — Design Spec

**Date:** 2026-05-22  
**Feature:** Continuous scroll-driven background: Space → Sky → Mountains → Ground

---

## Overview

A single fixed `<canvas>` element sits behind the entire page. As the user scrolls from top (Hero) to bottom (Footer), the background smoothly transitions through four visual zones. No hard cuts — everything interpolates continuously via a 0–1 scroll progress value driven by `requestAnimationFrame`.

---

## Zone Map

| Scroll % | Zone | Page Sections |
|---|---|---|
| 0 – 30% | Space | Hero, Who We Are |
| 25 – 55% | Space → Sky blend | Services, Portfolio |
| 50 – 80% | Sky → Mountains blend | Awards, WayOfWork, FAQ |
| 80 – 100% | Mountains → Ground | Contact, Footer |

Overlap ranges are intentional — effects fade in/out across them for seamless blending.

---

## Architecture

### Canvas Layer

- One `<canvas id="scroll-bg">` rendered as a **fixed, full-viewport** layer (`position: fixed; inset: 0; z-index: -1`).
- Painted every frame via `requestAnimationFrame`. Scroll progress `p = scrollY / (documentHeight - viewportHeight)` clamped 0–1.
- No external canvas/animation libraries. Pure Canvas 2D API.

### React Integration

- New client component: `src/components/layout/ScrollBackground.tsx`
- Mounted once in `src/app/[locale]/layout.tsx`, below `<body>` open tag, before `<NavBar>`.
- Uses `useEffect` + `useRef` for canvas setup and RAF loop. Cleans up on unmount.

### Existing tsparticles

- `HeroSection` tsparticles stays as-is (stars layer inside the hero `<section>`).
- ScrollBackground canvas provides the background color gradient only — tsparticles render on top inside the hero.
- When scroll leaves hero zone (p > 0.3), tsparticles opacity is **not** changed by ScrollBackground — they live inside a `overflow:hidden` section and naturally scroll off screen.

---

## Visual Layers (painted order, back to front)

### 1. Background gradient fill

Interpolate between color stops using scroll progress `p`:

| p | Sky color |
|---|---|
| 0.00 | `#020408` |
| 0.15 | `#060a14` |
| 0.30 | `#0d1a3e` |
| 0.45 | `#1740b0` |
| 0.55 | `#3d6ee8` |
| 0.65 | `#1a2a3a` |
| 0.75 | `#0d1520` |
| 0.88 | `#1a1208` |
| 1.00 | `#120c04` |

Linear interpolation between nearest two stops. Fill full canvas each frame.

### 2. Stars

- 120 stars generated once at init. Each has: `x, y` (0–1 normalized), `size` (0.5–2.5px), `color` (`#fbf4e0` / `#ecc842` / `#8fa8e8`), `twinkle phase`.
- Opacity: `starOpacity = clamp(1 - p / 0.35, 0, 1)` — fully visible at p=0, gone by p=0.35.
- Twinkle: each star flickers via `sin(time * speed + phase) * 0.3 + 0.7` multiplied into opacity.
- Parallax: 3 depth layers (far/mid/near) shift horizontally with `scrollY * depthFactor` (0.02 / 0.06 / 0.12).

### 3. Shooting stars

- Fire randomly when `p < 0.3` (space zone active).
- One shooting star at a time. New one fires 3–8s after previous finishes.
- Travels diagonally (−15° to −25°), 80–160px long gradient streak (`transparent → #ecc842 → transparent`), 600–900ms duration.
- Fades in/out with ease-in-out.

### 4. Aurora glow

- Radial gradient at top of canvas. Color: `rgba(61,110,232, α)` where `α = clamp(0.25 - p * 0.6, 0, 0.25)`.
- Pulses: `α *= (sin(time * 0.4) * 0.15 + 0.85)`.
- Disappears by p=0.4.

### 5. Cloud wisps

- 6 elliptical blobs, pre-generated with random `x, y, rx, ry`.
- Opacity: `cloudOpacity = smoothstep(0.28, 0.38, p) * smoothstep(0.60, 0.50, p)` — fades in ~p=0.3, fades out ~p=0.55.
- Color: `rgba(251,244,224, 0.06)` — very faint.
- Drift slowly left via `time * 0.02` offset.

### 6. Dawn-gold horizon glow

- Horizontal radial gradient at bottom of canvas.
- Opacity: `horizonOpacity = smoothstep(0.35, 0.55, p) * smoothstep(1.0, 0.85, p)` — peaks around p=0.6–0.8, fades at ground.
- Color: `rgba(236,200,66, 0.12)`.

### 7. Mountain silhouettes

Two layers (far + near) drawn as SVG-style polygon paths on canvas.

**Far ridge** (appears first, lighter):
- 3–4 gentle peaks spanning full width, max height ~25% of canvas.
- Fill: `#0d1828`, opacity: `smoothstep(0.48, 0.62, p) * 0.7`.

**Near ridge** (darker, sharper):
- 3 peaks, taller (~35% of canvas), slightly different shape.
- Fill: `#050c14`, opacity: `smoothstep(0.54, 0.68, p)`.

Mountains are static paths computed once at init (fixed pixel coords based on canvas size). Recomputed on canvas resize.

### 8. Ground terrain

- Flat fill from bottom edge up to near-ridge base. Color: `#0a0c08`.
- Opacity: `smoothstep(0.72, 0.88, p)`.
- Crater bumps: 3–4 ellipses along terrain surface, fill `#080a06`, opacity same as terrain.

---

## Utility Functions

```ts
// Linear interpolation between two hex colors
lerpColor(a: string, b: string, t: number): string

// Smooth interpolation (cubic ease)
smoothstep(edge0: number, edge1: number, x: number): number

// Clamp
clamp(v: number, min: number, max: number): number

// Multi-stop color interpolation
gradientStop(stops: [number, string][], p: number): string
```

---

## Performance

- Single canvas, single RAF loop. No per-frame DOM writes.
- Star positions computed once; only opacity/twinkle recalculated per frame.
- Mountain paths computed once at init and on `resize`.
- `devicePixelRatio` applied for retina sharpness.
- Mobile: reduce star count to 60 when `window.innerWidth < 768`.
- RAF loop paused via `document.visibilitychange` when tab hidden.

---

## File Changes

| File | Change |
|---|---|
| `src/components/layout/ScrollBackground.tsx` | New — canvas component |
| `src/app/[locale]/layout.tsx` | Add `<ScrollBackground />` before `<NavBar>` |
| `src/app/globals.css` | Ensure `body` background stays `#060a14` (already set) |

No changes to HeroSection, tsparticles config, or content files.

---

## Out of Scope

- No CSS-only fallback (canvas required; `<noscript>` gets static midnight bg).
- No parallax on mouse-move (scroll-only).
- No sound or haptics.
- No per-section color theme overrides via props.
