# Home Page Design Fidelity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the live Home page (`/[locale]`) to pixel-accurate fidelity with the "MeDream Design System" Home.dc.html handoff from Claude Design, without changing the page's existing content/IA (Trusted By section, footer links, navbar scroll behavior all stay as-is per explicit product decision).

**Architecture:** This is a restyle/rebuild of individual Home section components in place — no new routes, no changes to the content-loading pattern (`getSiteConfig()`/`getHomeContent()` in `src/app/[locale]/page.tsx` stay untouched). Sections that need scroll-driven or click-driven interactivity (hero parallax, photo-stack cycling, animated counter, animated path) become small dedicated client components; everything else stays a server component. Two new design tokens and a few new bilingual content fields are added to support the richer visuals; no existing content fields are removed.

**Tech Stack:** Next.js 16 (App Router, server components), Tailwind v4 (`@theme` in `globals.css`, no `tailwind.config.js`), next-intl (routing only — bilingual copy stays on `_th`/`_en` JSON fields, not next-intl messages), TypeScript, pnpm.

**Spec:** Design handoff read directly from the Claude Design project "Medream website development" (project id `e38addb5-6c8d-479e-8467-db2c56ed4178`), file `Home.dc.html` and its imported `site-assets/*.jsx` + `_ds/medream-design-system-*/tokens/*.css`. No local spec file exists for this handoff — the reference content (token values, per-section JSX, and the `design_handoff_medream_website/README.md` handoff notes) is quoted inline in each task below so this plan is self-contained.

## Global Constraints

- Next.js 16: any route handler/layout `params` is a `Promise` — not touched by this plan, no route files are added.
- Use `pnpm`, not `npm`, for all commands (`pnpm dev`, `pnpm lint`, `npx tsc --noEmit`).
- No test suite exists in this repo. Verification is: `npx tsc --noEmit`, `pnpm lint`, and manually exercising the page in a browser (`pnpm dev`) at both `/th` and `/en`, including a ~400px-wide viewport — per this repo's own CLAUDE.md instruction for UI changes.
- Tailwind v4 tokens live only in `src/app/globals.css`'s `@theme` block — never add a `tailwind.config.js`.
- Bilingual content is duplicated per-field with `_th`/`_en` suffixes in `content/*.json`, read directly by server components — not routed through next-intl `useTranslations`. Keep new content fields consistent with this.
- Design system shape rule: **no border-radius anywhere except the one 12px 45° chamfer** (top-left/bottom-right), reserved for primary buttons and featured/hero cards — already implemented as `CHAMFER_STYLE` in `src/components/ui/Button.tsx` and `src/components/ui/Card.tsx`. The one documented exception is the Final CTA gradient card (Task 10), which the handoff itself renders with a 28px rounded corner and a pill-shaped button — call this out with a one-line code comment, don't "fix" it to match the general rule.
- Design system color rule: text on `--color-first-light` or `--color-dawn` must always be navy, never white (1.7:1 contrast, fails outright). `--color-sky` is never used for CTA or body text (3.7:1, below AA) — only focus rings/decorative icons.
- Motion rule: 150–250ms transitions, ease-out, small upward nudge on hover (already `--lift-hover`-style in `Button.tsx`); every animated page must fully respect `prefers-reduced-motion: reduce` (Task 1 adds the sitewide kill-switch; Task 2's continuous parallax additionally checks it in JS since it isn't a discrete CSS transition).
- Product decisions already made (do not revisit): keep `TrustedBySection` on Home (restyled only); keep Footer's current links/socials as-is; keep NavBar's transparent-over-hero-to-solid-on-scroll behavior as-is. This plan does not touch `Footer.tsx` or `NavBar.tsx`.

---

## Reference copy from the design handoff

Quoted here once so later tasks don't repeat it. Source: `Home.dc.html`'s embedded `COPY` object and the `site-assets/*.jsx` components in the Claude Design project above.

**WeDream photo-stack captions (new copy, not yet in `content/home.json`):**
1. th: `สนุกและวัดผลได้จริง` / en: `Fun that measures`
2. th: `ปรับจาก template ใช้ได้ใน 1 สัปดาห์` / en: `Adapted from a template, ready in 1 week`
3. th: `เก็บ lead ได้กว่า 30 รายในงานเดียว` / en: `Collected 30+ leads in a single event`

**WayOfWork step descriptions (new copy, not yet in `content/home.json`):**
1. th: `คุยกันเพื่อรู้ความต้องการจริงๆ (1–2 ชม.)` / en: `A conversation to understand what you actually need (1–2 hrs)`
2. th: `เสนอทางที่เหมาะกับงบและปัญหาจริง (2 วัน)` / en: `We propose an approach that fits your budget and real problem (2 days)`
3. th: `ทีม UX/UI, Game Design, Artist, Dev ลงมือทำ` / en: `UX/UI, Game Design, Artist and Dev teams build it`
4. th: `ทดสอบและให้ลูกค้าตรวจ UAT ก่อนส่งมอบ` / en: `Testing and client UAT review before handoff`

**Asset already fetched into the repo this session:** `public/images/hero/hero-sky.png` (2048×1152, from `site-assets/hero-sky.png` in the design project). Other sections reuse existing assets already in `public/images/portfolio/` (`placeholder.png`, `sumeeper.png`) — the design's own image slots for these sections are explicitly unfilled placeholders per its handoff README, so no new imagery is required.

---

### Task 1: Design tokens — add `--color-surface-tint`, fix deprecated body color, add reduced-motion kill-switch

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces: Tailwind utility class `bg-surface-tint` (from `--color-surface-tint`), used by Tasks 3, 4, 5, 6, 7 (TrustedBy), 9, and 10.

The design handoff's mid-page Home sections (We Dream, We Do, We Make Difference, Works, FAQ preview, and the Final CTA's outer band) all sit on a pale blue-grey field, `#E8ECF5` — not white. This hex isn't in `tokens/colors.css` as a named variable (the reference JSX hardcodes it inline), so give it a proper token here instead of repeating the raw hex across 6 files.

Separately, `body`'s `color` still points at the deprecated `--color-dream-cream`, and there's currently no sitewide `prefers-reduced-motion` kill-switch even though this plan is about to add several scroll/click-driven animations — the design's own `tokens/motion.css` mandates one (`@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}`).

- [ ] **Step 1: Add the token, fix the body color, add the reduced-motion rule**

In `src/app/globals.css`, add `--color-surface-tint` to the `@theme` block right after `--color-line`:

```css
  --color-line: #E4E7EF;
  --color-surface-tint: #E8ECF5; /* pale field under Home's mid-page sections — see design_handoff_medream_website/README.md; not in tokens/colors.css, homepage-scoped */
```

Change the `body` rule's `color` from the deprecated token to the new-CI equivalent for text-on-dark (`body`'s background is `--color-midnight`):

```css
body {
  background-color: var(--color-midnight);
  color: var(--color-white);
  font-family: var(--font-sans);
}
```

Append the reduced-motion rule at the end of the file:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
}
```

- [ ] **Step 2: Verify the file still parses as valid CSS**

Run: `npx tsc --noEmit` (this repo has no CSS linter; `tsc` alone won't catch CSS errors, so also start the dev server briefly)
Run: `pnpm dev` and load `http://localhost:3000/th` — confirm the page still renders (no broken `@theme` syntax) and the body background is still midnight. Stop the dev server after checking.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "Add surface-tint token, fix deprecated body color, add reduced-motion kill-switch"
```

---

### Task 2: Content & type updates — WeDream photo captions and WayOfWork step descriptions

**Files:**
- Modify: `content/home.json`
- Modify: `src/types/content.ts`

**Interfaces:**
- Produces: `HomeContent['dream']['photoCaptions']: { caption_th: string; caption_en: string }[]` (length 3) — consumed by Task 4 (`WeDreamPhotoStack.tsx`).
- Produces: `HomeWayOfWorkStep.desc_th: string` and `HomeWayOfWorkStep.desc_en: string` — consumed by Task 8 (`WayOfWorkSection.tsx`).

- [ ] **Step 1: Add `dream.photoCaptions` to `content/home.json`**

In `content/home.json`, inside the `"dream"` object, add a `photoCaptions` array right after `"dna"`:

```json
  "dream": {
    "headline": "We Dream",
    "body_th": "เราคือทีมครีเอทีฟ นักเล่นเกม และนักเล่าเรื่อง รวมตัวกันเป็นสตูดิโอเกมและมีเดียอินเทอร์แอคทีฟจากไทย ทำตั้งแต่เกม Event ออกบูธ ไปจนถึง AR เปิดตัวสินค้า เพราะเราเชื่อว่าความสนุกช่วยให้แบรนด์เข้าใกล้ลูกค้าได้มากกว่าที่คิด",
    "body_en": "We're a team of creatives, gamers, and storytellers who came together to build a Thai game and interactive media studio. We make everything from booth event games to AR product launches, because we believe fun brings brands closer to their customers than they'd expect.",
    "dna": ["Creative", "Gamer", "Storyteller"],
    "photoCaptions": [
      { "caption_th": "สนุกและวัดผลได้จริง", "caption_en": "Fun that measures" },
      { "caption_th": "ปรับจาก template ใช้ได้ใน 1 สัปดาห์", "caption_en": "Adapted from a template, ready in 1 week" },
      { "caption_th": "เก็บ lead ได้กว่า 30 รายในงานเดียว", "caption_en": "Collected 30+ leads in a single event" }
    ]
  },
```

- [ ] **Step 2: Add `desc_th`/`desc_en` to each `wayOfWork.steps` entry in `content/home.json`**

Replace the `"wayOfWork"` object's `"steps"` array with:

```json
    "steps": [
      { "level": 1, "label_th": "รับโจทย์", "label_en": "Discovery", "desc_th": "คุยกันเพื่อรู้ความต้องการจริงๆ (1–2 ชม.)", "desc_en": "A conversation to understand what you actually need (1–2 hrs)" },
      { "level": 2, "label_th": "ออกแบบ Solution", "label_en": "Solution Design", "desc_th": "เสนอทางที่เหมาะกับงบและปัญหาจริง (2 วัน)", "desc_en": "We propose an approach that fits your budget and real problem (2 days)" },
      { "level": 3, "label_th": "พัฒนา", "label_en": "Development", "desc_th": "ทีม UX/UI, Game Design, Artist, Dev ลงมือทำ", "desc_en": "UX/UI, Game Design, Artist and Dev teams build it" },
      { "level": 4, "label_th": "Test & Launch", "label_en": "Test & Launch", "desc_th": "ทดสอบและให้ลูกค้าตรวจ UAT ก่อนส่งมอบ", "desc_en": "Testing and client UAT review before handoff" }
    ],
```

- [ ] **Step 3: Update `src/types/content.ts` to match**

Add a `HomeDreamPhotoCaption` interface near `HomeTrustedByItem` (around line 186), and extend `HomeContent['dream']` and `HomeWayOfWorkStep`:

```ts
export interface HomeDreamPhotoCaption {
  caption_th: string
  caption_en: string
}
```

Change `HomeWayOfWorkStep` (currently at line 180) to:

```ts
export interface HomeWayOfWorkStep {
  level: number
  label_th: string
  label_en: string
  desc_th: string
  desc_en: string
}
```

Change `HomeContent['dream']` (inside the `HomeContent` interface) to:

```ts
  dream: {
    headline: string
    body_th: string
    body_en: string
    dna: string[]
    photoCaptions: HomeDreamPhotoCaption[]
  }
```

- [ ] **Step 4: Verify types compile**

Run: `npx tsc --noEmit`
Expected: PASS (no consumers reference the new fields yet, so this only checks the JSON/type edits are internally consistent — nothing currently reads `home.json`'s new fields at runtime, so a type error here would only come from a shape mismatch between the two files you just edited).

- [ ] **Step 5: Commit**

```bash
git add content/home.json src/types/content.ts
git commit -m "Add WeDream photo captions and WayOfWork step descriptions to home content"
```

---

### Task 3: Hero — parallax sky background

**Files:**
- Create: `src/components/home/HeroParallaxBg.tsx`
- Modify: `src/components/home/HeroSection.tsx`

**Interfaces:**
- Produces: `HeroParallaxBg` — a client component with no props, rendering only the absolutely-positioned background image layer (siblings position their own content on top via the parent's `relative`).
- Consumes (unchanged): `SiteConfig`, `HomeContent` from `@/types/content`; `Button` from `@/components/ui/Button`.

The design's `HeroParallax.jsx` (from `site-assets/HeroParallax.jsx` in the Claude Design project) renders a full-bleed `hero-sky.png` background that drifts down slowly as the page scrolls (`translateY(scrollY * 0.35)`), scaled up 15% and masked so it fades to solid `--color-midnight` toward the bottom — the current `HeroSection.tsx` instead uses a CSS gradient glow with no photo. Now that `public/images/hero/hero-sky.png` exists in the repo, replace the glow with the real parallax photo. The scroll listener needs a client component; keep `HeroSection.tsx` itself a server component (it already calls `getLocale()`/`getTranslations()`) and mount the new client piece as a background layer inside it.

- [ ] **Step 1: Create the client parallax background component**

Create `src/components/home/HeroParallaxBg.tsx`:

```tsx
'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'

export function HeroParallaxBg() {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    let raf: number | null = null
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        setOffset(window.scrollY * 0.35)
        raf = null
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ maskImage: 'linear-gradient(to bottom, transparent 4%, black 75%)' }}
      aria-hidden="true"
    >
      <Image
        src="/images/hero/hero-sky.png"
        alt=""
        fill
        priority
        className="object-cover opacity-85"
        style={{ transform: `translateY(${offset}px) scale(1.15)` }}
      />
    </div>
  )
}
```

- [ ] **Step 2: Wire it into `HeroSection.tsx`, dropping the old gradient-dawn glow**

Replace the whole `<section>` return in `src/components/home/HeroSection.tsx` with:

```tsx
// src/components/home/HeroSection.tsx
import { getLocale, getTranslations } from 'next-intl/server'
import type { SiteConfig, HomeContent } from '@/types/content'
import { Button } from '@/components/ui/Button'
import { HeroParallaxBg } from './HeroParallaxBg'

interface Props {
  site: SiteConfig
  home: HomeContent
}

export async function HeroSection({ site, home }: Props) {
  const locale = await getLocale()
  const l = locale as 'th' | 'en'
  const t = await getTranslations('hero')

  return (
    <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden bg-midnight px-4">
      <HeroParallaxBg />

      <div className="relative z-10 max-w-3xl mx-auto text-center py-24">
        <h1 className="font-display font-semibold text-white text-4xl md:text-5xl xl:text-[56px] xl:leading-[64px] mb-6">
          {l === 'th' ? site.tagline_th : site.tagline_en}
        </h1>
        <p className="text-mist text-base md:text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
          {l === 'th' ? home.hero.subheadline_th : home.hero.subheadline_en}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button href={`/${locale}/portfolio`} variant="secondary" surface="dark">
            {t('cta_portfolio')}
          </Button>
          <Button href={`/${locale}/contact`} variant="primary" surface="dark">
            {t('cta_contact')}
          </Button>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Verify in the browser**

Run: `pnpm dev`, open `http://localhost:3000/th`.
Expected: hero shows the dawn-sky photo behind the headline, fading to midnight toward the bottom of the section; scrolling down slowly drifts the photo. Toggle "Reduce motion" in OS accessibility settings (or devtools' rendering emulation) and confirm the photo stops drifting.
Run: `npx tsc --noEmit` — expect PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/home/HeroSection.tsx src/components/home/HeroParallaxBg.tsx
git commit -m "Give Hero the dawn-sky parallax background from the design handoff"
```

---

### Task 4: WeDream — two-column layout with Star headline, DNA tags, and a photo stack

**Files:**
- Create: `src/components/home/WeDreamPhotoStack.tsx`
- Modify: `src/components/home/WeDreamSection.tsx`

**Interfaces:**
- Produces: `WeDreamPhotoStack` — client component, props `{ captions: { caption_th: string; caption_en: string }[]; locale: string }`.
- Consumes: `HomeContent['dream']` (now including `photoCaptions`, from Task 2); `Star` from `@/components/ui/Star`.

The design (`site-assets/WeDreamSection.jsx`) is a two-column layout: left is a Star+headline row, a pull-quote-style body paragraph (set in the display font, not body font), and a row of large rotated "DNA" tags (alternating navy/blue fill, first one chamfered) — not the generic `Badge` pill currently used. Right is a `PhotoStack`: three overlapping, slightly rotated placeholder images the visitor can cycle through by click, the front one carrying a caption chip with a star icon, plus a small circular "next" button.

- [ ] **Step 1: Create the photo-stack client component**

Create `src/components/home/WeDreamPhotoStack.tsx`:

```tsx
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
      <div onClick={cycle} className="relative z-[1] cursor-pointer" role="button" aria-label={l === 'th' ? 'สลับดูภาพถัดไป' : 'Show next photo'}>
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
```

- [ ] **Step 2: Rewrite `WeDreamSection.tsx`**

Replace `src/components/home/WeDreamSection.tsx` with:

```tsx
// src/components/home/WeDreamSection.tsx
import type { HomeContent } from '@/types/content'
import { Star } from '@/components/ui/Star'
import { WeDreamPhotoStack } from './WeDreamPhotoStack'

interface Props {
  home: HomeContent
  locale: string
}

const CHAMFER_STYLE: React.CSSProperties = {
  clipPath: 'polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)',
}

export function WeDreamSection({ home, locale }: Props) {
  const l = locale as 'th' | 'en'
  const { dream } = home

  return (
    <section className="bg-surface-tint border-t border-line py-16 md:py-24 lg:py-32 px-4 overflow-hidden">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-12 md:gap-16 items-center">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-7 h-7 text-blue" />
            <span className="font-display font-semibold text-ink text-3xl md:text-[36px] md:leading-[44px] tracking-[-.01em]">
              {dream.headline}
            </span>
          </div>
          <p className="font-display font-medium text-ink text-lg md:text-[22px] md:leading-[1.55] max-w-[46ch] mb-7">
            {l === 'th' ? dream.body_th : dream.body_en}
          </p>
          <div className="flex flex-wrap gap-3.5">
            {dream.dna.map((trait, i) => (
              <span
                key={trait}
                className={`font-display font-bold text-lg text-white px-5 py-2.5 ${i % 2 ? 'bg-blue' : 'bg-navy'}`}
                style={{
                  transform: `rotate(${i % 2 ? 1.5 : -1.5}deg)`,
                  ...(i === 0 ? CHAMFER_STYLE : {}),
                }}
              >
                {trait}
              </span>
            ))}
          </div>
        </div>
        <WeDreamPhotoStack captions={dream.photoCaptions} locale={locale} />
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Verify in the browser**

Run: `pnpm dev`, open `http://localhost:3000/th`, scroll to "We Dream".
Expected: two-column layout, rotated navy/blue DNA tags with the first chamfered, and a clickable stacked-photo widget on the right that cycles through 3 images with a caption chip on the front image. Click the widget and the corner button; confirm it cycles. Check `/en` for the English caption/body text.
Run: `npx tsc --noEmit` — expect PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/home/WeDreamSection.tsx src/components/home/WeDreamPhotoStack.tsx
git commit -m "Rebuild WeDreamSection with two-column layout and clickable photo stack"
```

---

### Task 5: We Do — 2-column mockup cards with numbered badges

**Files:**
- Modify: `src/components/home/WeDoSection.tsx`

**Interfaces:**
- Consumes (unchanged): `HomeContent['services']`; `Button` from `@/components/ui/Button`; adds `Star` from `@/components/ui/Star`.

The design (`site-assets/WeDoSection.jsx`) uses a 2-column grid (current code uses up to 4 columns on wide screens), each card topped with a 240px mockup image, a small navy numbered badge (`01`, `02`, ...), a 26px title, and a `secondary`-variant CTA (current uses `text` variant). The first card is chamfered. Add the Star+"We Do" header row to match WeDream's treatment.

Note: this card needs a full-bleed image flush against its top edge, but `src/components/ui/Card.tsx` always applies its own `p-5` padding baked into its className string — passing `p-0` in this component's own `className` prop does **not** reliably override it, because Tailwind resolves same-specificity utility conflicts (`p-5` vs `p-0`) by each utility's fixed position in its generated stylesheet, not by the order classes appear in a `className` string. So this card is built directly (border + optional chamfer) instead of via the shared `Card` component, the same way Task 4 and Task 6 already build their own bordered/chamfered boxes.

- [ ] **Step 1: Rewrite `WeDoSection.tsx`**

```tsx
// src/components/home/WeDoSection.tsx
import Image from 'next/image'
import type { HomeContent } from '@/types/content'
import { Star } from '@/components/ui/Star'
import { Button } from '@/components/ui/Button'

interface Props {
  home: HomeContent
  locale: string
}

const CHAMFER_STYLE: React.CSSProperties = {
  clipPath: 'polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)',
}

export function WeDoSection({ home, locale }: Props) {
  const l = locale as 'th' | 'en'
  const { services } = home

  return (
    <section className="bg-surface-tint border-t border-line py-16 md:py-24 lg:py-32 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Star className="w-7 h-7 text-blue" />
          <span className="font-display font-semibold text-ink text-3xl md:text-[36px] md:leading-[44px] tracking-[-.01em]">
            {services.headline}
          </span>
        </div>
        <p className="text-fg-2 text-base md:text-lg leading-relaxed max-w-[62ch] mb-12">
          {l === 'th' ? services.subheadline_th : services.subheadline_en}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
          {services.cards.map((card, i) => (
            <div
              key={card.id}
              className="border border-line bg-white flex flex-col overflow-hidden"
              style={i === 0 ? CHAMFER_STYLE : undefined}
            >
              <div className="relative w-full h-60">
                <Image src="/images/portfolio/placeholder.png" alt="" fill className="object-cover" />
              </div>
              <div className="p-8 flex flex-col gap-3.5 flex-1">
                <span className="font-display font-bold text-[13px] text-mist bg-navy w-[30px] h-[30px] flex items-center justify-center">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display font-semibold text-ink text-2xl leading-tight">
                  {l === 'th' ? card.title_th : card.title_en}
                </h3>
                <p className="text-fg-2 text-base leading-relaxed flex-1">
                  {l === 'th' ? card.body_th : card.body_en}
                </p>
                <Button href={`/${locale}/services/${card.id}`} variant="secondary" surface="light" className="self-start mt-1">
                  {l === 'th' ? card.cta_th : card.cta_en}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify in the browser**

Run: `pnpm dev`, open `http://localhost:3000/th`, scroll to "We Do".
Expected: 2-column card grid (not 4), each with a placeholder image on top, a small numbered navy badge, and a bordered secondary "ดูรายละเอียด →" button; the first card has a cut corner (chamfer) the others don't.
Run: `npx tsc --noEmit` — expect PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/WeDoSection.tsx
git commit -m "Rebuild WeDoSection as 2-column mockup cards with numbered badges"
```

---

### Task 6: We Make Difference — mirrored layout with image proof card and animated counter

**Files:**
- Create: `src/components/home/AnimatedCounter.tsx`
- Create: `src/components/home/WeMakeDifferenceVisual.tsx`
- Modify: `src/components/home/WeMakeDifferenceSection.tsx`

**Interfaces:**
- Produces: `AnimatedCounter` — client component, props `{ target: number; className?: string }`, renders just the counting number as a `<span>`.
- Produces: `WeMakeDifferenceVisual` — client component, no props, renders the chamfered placeholder image card with a scroll-triggered fade/slide-in reveal.
- Consumes: `HomeContent['difference']`; `Star` from `@/components/ui/Star`.

The design (`site-assets/WeMakeDifferenceSection.jsx`) mirrors the current layout: an image "proof" card on the **left** (currently there's no image at all), and on the **right** a Star+headline row, body copy, then the number counts up from 0 to the target value once scrolled into view, followed by a star and the proof caption inline — replacing the current static navy number box.

- [ ] **Step 1: Create `AnimatedCounter.tsx`**

```tsx
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
```

- [ ] **Step 2: Create `WeMakeDifferenceVisual.tsx`**

```tsx
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
```

- [ ] **Step 3: Rewrite `WeMakeDifferenceSection.tsx`**

```tsx
// src/components/home/WeMakeDifferenceSection.tsx
import type { HomeContent } from '@/types/content'
import { Star } from '@/components/ui/Star'
import { AnimatedCounter } from './AnimatedCounter'
import { WeMakeDifferenceVisual } from './WeMakeDifferenceVisual'

interface Props {
  home: HomeContent
  locale: string
}

export function WeMakeDifferenceSection({ home, locale }: Props) {
  const l = locale as 'th' | 'en'
  const { difference } = home
  const target = parseInt(difference.microProofNumber, 10) || 0

  return (
    <section className="bg-surface-tint border-t border-line py-16 md:py-24 lg:py-32 px-4 overflow-hidden">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-12 md:gap-16 items-center">
        <WeMakeDifferenceVisual />
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-7 h-7 text-blue" />
            <span className="font-display font-semibold text-ink text-3xl md:text-[36px] md:leading-[44px] tracking-[-.01em]">
              {difference.headline}
            </span>
          </div>
          <p className="text-fg-2 text-base md:text-lg leading-relaxed mb-8">
            {l === 'th' ? difference.body_th : difference.body_en}
          </p>
          <div className="inline-flex items-baseline gap-2 font-display">
            <AnimatedCounter target={target} className="text-[44px] font-bold text-navy leading-none" />
            <Star className="w-5 h-5 text-first-light" />
            <span className="text-fg-2 text-sm">
              {l === 'th' ? difference.microProof_th : difference.microProof_en}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Verify in the browser**

Run: `pnpm dev`, open `http://localhost:3000/th`, scroll to "We Make Difference".
Expected: placeholder image card on the left with a cut corner; on the right, the number animates from 0 up to 30 the first time it scrolls into view (check by refreshing and scrolling slowly), then stays at 30.
Run: `npx tsc --noEmit` — expect PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/home/WeMakeDifferenceSection.tsx src/components/home/WeMakeDifferenceVisual.tsx src/components/home/AnimatedCounter.tsx
git commit -m "Rebuild WeMakeDifferenceSection with image proof card and animated counter"
```

---

### Task 7: Works and Trusted By — background/spacing fidelity

**Files:**
- Modify: `src/components/home/WorksSection.tsx`
- Modify: `src/components/home/TrustedBySection.tsx`

**Interfaces:** unchanged — style-only edits.

Both sections are already structurally close to the design; they just need the `surface-tint` background and the wider section rhythm (`64px` → scaling up to `128px` at desktop, matching every other mid-page section in this plan) so the whole page reads as one consistent band instead of a white section sandwiched between tinted ones.

- [ ] **Step 1: Update `WorksSection.tsx`**

In `src/components/home/WorksSection.tsx`, change the `<section>` className from:

```tsx
<section className="bg-white py-16 md:py-24 px-4">
```

to:

```tsx
<section className="bg-surface-tint border-t border-line py-16 md:py-24 lg:py-32 px-4">
```

- [ ] **Step 2: Update `TrustedBySection.tsx`**

In `src/components/home/TrustedBySection.tsx`, change the `<section>` className from:

```tsx
<section className="bg-white border-y border-line py-12 px-4">
```

to:

```tsx
<section className="bg-surface-tint border-y border-line py-12 px-4">
```

- [ ] **Step 3: Verify in the browser**

Run: `pnpm dev`, open `http://localhost:3000/th`, scroll from "We Make Difference" through "Works" to "Trusted By".
Expected: one continuous pale blue-grey field across all three sections, with thin hairline borders between them — no white section breaking up the band.
Run: `npx tsc --noEmit` — expect PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/home/WorksSection.tsx src/components/home/TrustedBySection.tsx
git commit -m "Match Works and Trusted By sections to the surface-tint band and section rhythm"
```

---

### Task 8: Way Of Work — midnight starfield with an animated glowing-star path

**Files:**
- Modify: `src/components/home/WayOfWorkSection.tsx`

**Interfaces:**
- Consumes: `HomeContent['wayOfWork']` (now with `desc_th`/`desc_en` per step, from Task 2); `Star` from `@/components/ui/Star`; `Button` from `@/components/ui/Button`. Drops its previous use of `LevelBadge` and `Card` — the design does not use a "Lv.N + star rating" treatment here, it uses a single glowing star per step positioned along a path.

This is the single biggest visual gap: the current section sits on a **white** background with a plain 4-card grid of `LevelBadge`s. The design (`site-assets/WayOfWorkSection.jsx`) puts it on **midnight**, with a starfield of tiny dots behind everything, a headline with a Star icon, and — on desktop — the four steps connected by an animated SVG path that draws itself in when scrolled into view, each step a glowing star badge with a label + short description floating below it. On narrow screens it becomes a simple vertical stepper with a connecting line. This needs `IntersectionObserver`, so the whole component becomes a client component (it has no server-only calls today, so this is a safe conversion).

- [ ] **Step 1: Rewrite `WayOfWorkSection.tsx`**

```tsx
// src/components/home/WayOfWorkSection.tsx
'use client'
import { useEffect, useRef, useState } from 'react'
import type { HomeContent } from '@/types/content'
import { Star } from '@/components/ui/Star'
import { Button } from '@/components/ui/Button'

interface Props {
  home: HomeContent
  locale: string
}

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
    y: i % 2 === 0 ? 140 : 30,
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
          <span className="font-display font-semibold text-white text-3xl md:text-[36px] md:leading-[44px] tracking-[-.01em]">
            {l === 'th' ? wayOfWork.headline_th : wayOfWork.headline_en}
          </span>
        </div>

        <div className="wow-path-desktop relative h-[280px] mb-8">
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
              <div className="flex flex-col items-center w-10">
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
```

- [ ] **Step 2: Verify in the browser**

Run: `pnpm dev`, open `http://localhost:3000/th`, scroll to "เริ่มงานกับเรายังไง" ("How It Works").
Expected: midnight section with a subtle dot starfield; on desktop, 4 glowing stars connected by a white line that draws itself in as the section enters view, each with a label + short description below it. Resize the browser under ~700px width (or check the ~400px mobile view) and confirm it switches to a vertical stepper with a connecting line between stars instead.
Run: `npx tsc --noEmit` — expect PASS. Run `pnpm lint` — expect no new errors (this file dropped its `LevelBadge`/`Card` imports; confirm no unused-import warnings remain elsewhere).

- [ ] **Step 3: Commit**

```bash
git add src/components/home/WayOfWorkSection.tsx
git commit -m "Rebuild WayOfWorkSection as a midnight starfield with an animated star path"
```

---

### Task 9: FAQ preview — background fidelity

**Files:**
- Modify: `src/components/home/FaqPreviewSection.tsx`

**Interfaces:** unchanged — style-only edit.

- [ ] **Step 1: Update the section background and rhythm**

In `src/components/home/FaqPreviewSection.tsx`, change:

```tsx
<section className="bg-white py-16 md:py-24 px-4">
```

to:

```tsx
<section className="bg-surface-tint border-t border-line py-16 md:py-24 lg:py-32 px-4">
```

- [ ] **Step 2: Verify in the browser**

Run: `pnpm dev`, open `http://localhost:3000/th`, scroll to the FAQ preview section.
Expected: same tinted background and border as the other mid-page sections; accordion and CTA button behavior unchanged.
Run: `npx tsc --noEmit` — expect PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/FaqPreviewSection.tsx
git commit -m "Match FaqPreviewSection background to the surface-tint band"
```

---

### Task 10: Final CTA — gradient card band

**Files:**
- Modify: `src/components/home/FinalCtaSection.tsx`

**Interfaces:**
- Consumes (unchanged): `HomeContent['finalCta']`; drops `getTranslations('nav')` + `Button` — the design's Final CTA is a bespoke pill-shaped link, not the shared chamfered `Button`, so this component no longer needs next-intl's server translation call and can become a plain (non-async) function component again once `Button` is removed. Reads the CTA label from `finalCta` itself instead of `nav.contact_cta` to stay consistent with every other CTA on this page, which already reads its label from `content/home.json`.

The design (`site-assets/FinalCtaSection.jsx`) is visually distinct from every other section on the page: instead of a full-bleed midnight band with a faint bottom glow, it's a pale (`surface-tint`) outer band containing one centered, **rounded** card (28px corners — not the system's 12px chamfer) fully filled with `--gradient-dawn`, holding centered white headline/subhead text and a **pill-shaped** (not chamfered) first-light CTA button. Both the 28px radius and the pill button are deliberate one-off exceptions in the handoff to the sitewide "no border-radius except the chamfer" rule — call that out in code rather than silently normalizing it to match the rest of the system.

`content/home.json`'s `finalCta` doesn't yet have a CTA label field (the current component borrows `nav.contact_cta` via next-intl) — add one so this section's copy fully lives in `content/home.json` like its siblings.

- [ ] **Step 1: Add `cta_th`/`cta_en` to `finalCta` in `content/home.json`**

Change the `"finalCta"` object to:

```json
  "finalCta": {
    "headline_th": "พร้อมทำให้ความฝันของคุณ \"มี\" อยู่จริงหรือยัง?",
    "headline_en": "Ready to make your dream real?",
    "subheadline_th": "เล่าโจทย์ให้เราฟังได้เลย ต่อให้ยังไม่แน่ใจงบหรือรูปแบบก็เริ่มคุยกันก่อนได้",
    "subheadline_en": "Tell us what you're trying to do — even if you're not sure about budget or format yet, let's start the conversation",
    "cta_th": "คุยกับเรา",
    "cta_en": "Get in Touch"
  }
```

- [ ] **Step 2: Add the field to `src/types/content.ts`**

Find `HomeContent['finalCta']` and add the two fields:

```ts
  finalCta: {
    headline_th: string
    headline_en: string
    subheadline_th: string
    subheadline_en: string
    cta_th: string
    cta_en: string
  }
```

- [ ] **Step 3: Rewrite `FinalCtaSection.tsx`**

```tsx
// src/components/home/FinalCtaSection.tsx
import Link from 'next/link'
import type { HomeContent } from '@/types/content'

interface Props {
  home: HomeContent
  locale: string
}

export function FinalCtaSection({ home, locale }: Props) {
  const l = locale as 'th' | 'en'
  const { finalCta } = home

  return (
    <section className="bg-surface-tint py-10 md:py-14 px-4">
      {/* 28px radius + pill CTA are deliberate exceptions to the sitewide
          no-border-radius rule, per the design handoff's Final CTA card. */}
      <div className="relative max-w-6xl mx-auto rounded-[28px] overflow-hidden bg-gradient-dawn">
        <div className="relative z-10 max-w-xl mx-auto text-center py-24 px-5">
          <h2 className="font-display font-semibold text-white text-3xl md:text-[32px] mb-4">
            {l === 'th' ? finalCta.headline_th : finalCta.headline_en}
          </h2>
          <p className="text-white/85 text-base md:text-lg leading-relaxed mb-10">
            {l === 'th' ? finalCta.subheadline_th : finalCta.subheadline_en}
          </p>
          <Link
            href={`/${locale}/contact`}
            className="inline-flex items-center gap-2 font-display font-bold text-[15px] text-navy bg-first-light rounded-full px-8 py-4 transition-transform duration-200 ease-out hover:-translate-y-0.5"
          >
            {l === 'th' ? finalCta.cta_th : finalCta.cta_en}
          </Link>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Verify in the browser**

Run: `pnpm dev`, open `http://localhost:3000/th`, scroll to the final section.
Expected: pale outer band, with a large rounded gradient card (dark navy → warm peach) holding centered white text and a pill-shaped peach button; hovering the button lifts it slightly.
Run: `npx tsc --noEmit` — expect PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/home/FinalCtaSection.tsx content/home.json src/types/content.ts
git commit -m "Rebuild FinalCtaSection as a rounded gradient-dawn card with a pill CTA"
```

---

### Task 11: Full-page verification

**Files:** none (verification only).

- [ ] **Step 1: Type-check and lint the whole project**

Run: `npx tsc --noEmit`
Expected: PASS, no errors.

Run: `pnpm lint`
Expected: PASS, no new warnings/errors introduced by this plan's files.

- [ ] **Step 2: Full visual pass, both locales, two viewport widths**

Run: `pnpm dev`, then in a browser:
- Load `http://localhost:3000/th` at a normal desktop width. Scroll the entire page top to bottom: Hero (parallax sky) → We Dream (photo stack, DNA tags) → We Do (2-col mockup cards) → We Make Difference (image + counting number) → Works → Trusted By → Way Of Work (midnight starfield + animated path) → FAQ preview → Final CTA (gradient card).
- Switch to `/en` via the nav's language toggle and re-scroll the same page, confirming every section's English copy renders (including the new `photoCaptions`, step `desc_*`, and `finalCta.cta_*` fields).
- Resize the browser to ~400px width (or use devtools' device toolbar) and re-check the same flow — in particular Way Of Work's mobile vertical stepper and the We Dream/We Make Difference two-column layouts collapsing to one column.
- Emulate `prefers-reduced-motion: reduce` (Chrome DevTools → Rendering tab → "Emulate CSS media feature prefers-reduced-motion") and confirm: the hero photo no longer drifts on scroll, and other transitions (hover lifts, path draw, reveal fades) show their end state without animating.

- [ ] **Step 3: Stop the dev server**

No further action needed — this task is verification-only, nothing to commit.
