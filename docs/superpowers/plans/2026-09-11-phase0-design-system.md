# Phase 0 — Design System Replacement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the site's design tokens (colors + fonts), remove the incompatible full-page `ScrollBackground` animation, and build the new CI's shared component primitives (`Star`, `Button`, `Badge`, `Card`, `LevelBadge`) — the foundation every later phase (Home, About, Services, Works, Start-a-Project) builds on.

**Architecture:** All changes are additive or swap-in-place at the token layer, so pages not yet rebuilt in later phases keep rendering with their current classes (old token *names* are preserved as deprecated aliases at their original hex values — zero visual change for anything not touched this phase, except the two explicitly-scoped site-wide changes: font family and the `--color-midnight` value). New primitives live in a new `src/components/ui/` directory and aren't wired into any page yet — later phases consume them.

**Tech Stack:** Next.js 16 (App Router) + Tailwind CSS v4 (`@theme` token-driven, no `tailwind.config.js`) + TypeScript. No test runner is configured in this repo (confirmed in `CLAUDE.md`) — verification is `npx tsc --noEmit` + `pnpm lint` + manual browser checks, not automated tests.

**Spec:** `docs/superpowers/specs/2026-09-11-website-redesign-ia-v2-design.md` (§2 Design System Replacement, §7 Phase 0 row)

## Global Constraints

- New CI hex values (from spec §2.1) are exact — do not approximate: `white #FFFFFF`, `midnight #04103A`, `navy #052D6F`, `navy-card #0B1D52`, `blue #0C5BAC`, `sky #3B89D0`, `mist #87B2DE`, `dawn #ECCCC1`, `first-light #F5B98A`, `ink #12203F`, `fg-2 #4B5670`, `fg-3 #626D87`, `line #E4E7EF`.
- Deprecated old-CI tokens (`deep-space`, `nebula`, `royal-blue`, `electric`, `horizon`, `dawn-gold`, `soft-gold`, `morning-mist`, `dream-cream`) must keep their **original, unchanged hex values** — this phase must not visually alter any page that isn't explicitly touched.
- Fonts: **Prompt** (display/headings/labels/buttons, weights 500/600) + **Sarabun** (body, weights 400/500), loaded via Google Fonts `<link>`, not self-hosted `@font-face`.
- Shape: chamfer clip-path is `polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)` — one corner pair only (top-left→bottom-right), applied via inline `style`, not a guessed Tailwind arbitrary-property class (clip-path is not a built-in Tailwind utility and arbitrary-property escaping for a multi-value polygon is error-prone).
- No pill shapes, no `border-radius` anywhere in new primitives.
- Text on `first-light` or `dawn` backgrounds must always be `navy` — never white (documented contrast failure in the CI: 1.7:1).
- **Out of scope for this phase, by design:** OS-level `prefers-color-scheme` dark-mode adaptiveness for the new primitives. No dark-mode toggle exists anywhere in this app today and nothing in the IA docs requires one yet. Primitives instead take an explicit `surface: 'light' | 'dark'` prop so the *author* picks light-surface vs. navy-surface styling per placement (mirrors how every example in `MEDREAM-DESIGN.md` is documented — "บนพื้นขาว: ... บนพื้นน้ำเงิน: ..."). This is a deliberate scope cut, not an oversight — revisit only if a real dark-mode toggle is ever requested.

---

## Task 1: Replace design tokens in `globals.css`

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces: CSS custom properties consumed by every Tailwind utility class in every later task/phase — `--color-white`, `--color-midnight`, `--color-navy`, `--color-navy-card`, `--color-blue`, `--color-sky`, `--color-mist`, `--color-dawn`, `--color-first-light`, `--color-ink`, `--color-fg-2`, `--color-fg-3`, `--color-line` (new CI), plus deprecated aliases `--color-deep-space`, `--color-nebula`, `--color-royal-blue`, `--color-electric`, `--color-horizon`, `--color-dawn-gold`, `--color-soft-gold`, `--color-morning-mist`, `--color-dream-cream` (old CI, unchanged values). Font tokens `--font-display`, `--font-body`, `--font-sans` (aliased to `--font-body`).

- [ ] **Step 1: Replace the file contents**

Replace the entire contents of `src/app/globals.css` with:

```css
@import "tailwindcss";

@theme {
  /* Brand colors — MeDream CI v2 ("เหนือเมฆ ยามแสงแรก")
     See docs/superpowers/specs/2026-09-11-website-redesign-ia-v2-design.md §2.1 */
  --color-white: #FFFFFF;
  --color-midnight: #04103A;
  --color-navy: #052D6F;
  --color-navy-card: #0B1D52;
  --color-blue: #0C5BAC;
  --color-sky: #3B89D0;
  --color-mist: #87B2DE;
  --color-dawn: #ECCCC1;
  --color-first-light: #F5B98A;
  --color-ink: #12203F;
  --color-fg-2: #4B5670;
  --color-fg-3: #626D87;
  --color-line: #E4E7EF;

  /* Deprecated — old CI, values UNCHANGED from before this phase, kept only
     so pages not yet migrated to the new tokens don't lose their utility
     classes. Each of these is removed once every consumer has migrated to
     the new tokens above (tracked per-phase in the design spec §7; final
     cleanup happens in Phase 7). Do not use these in new code. */
  --color-deep-space: #0d1a3e;
  --color-nebula: #1a2b5e;
  --color-royal-blue: #1740b0;
  --color-electric: #3d6ee8;
  --color-horizon: #8fa8e8;
  --color-dawn-gold: #ecc842;
  --color-soft-gold: #f5d878;
  --color-morning-mist: #f0e8cc;
  --color-dream-cream: #fbf4e0;

  /* Typography */
  --font-display: "Prompt", "Noto Sans Thai", system-ui, sans-serif;
  --font-body: "Sarabun", "Noto Sans Thai", system-ui, sans-serif;
  --font-sans: var(--font-body);

  /* Breakpoints (matches spec: md=768, lg=1024, xl=1280) */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: var(--color-midnight);
  color: var(--color-dream-cream);
  font-family: var(--font-sans);
}
```

This removes all five `@font-face` blocks (Prompt/Sarabun load via `<link>` in Task 2, not self-hosted) and switches `body`'s background/color from hardcoded hex to the CSS variables, so they track the token values above.

- [ ] **Step 2: Verify the dev server starts with no CSS errors**

Run: `pnpm dev` (leave running), then in another terminal: `curl -sf http://localhost:3000/th -o /dev/null && echo OK`
Expected: `OK` — confirms Tailwind compiled the new `@theme` block without errors. Stop the dev server after (`Ctrl+C` or kill the background process) — later tasks restart it.

- [ ] **Step 3: Type-check and lint**

Run: `npx tsc --noEmit`
Expected: no new errors (this task doesn't touch any `.ts`/`.tsx` file, so this should be identical to the pre-task baseline).

Run: `pnpm lint`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "Replace design tokens with MeDream CI v2 palette + fonts

Swap the @theme color tokens to the new brand palette (Navy/Blue/Sky/
Mist/Dawn/First-Light) and fonts (Prompt+Sarabun replacing LINE Seed
Sans TH self-hosted). Old token names are kept as deprecated aliases
at their original hex values so pages not yet rebuilt don't break.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 2: Load new fonts, remove `ScrollBackground`

**Files:**
- Modify: `src/app/[locale]/layout.tsx`
- Delete: `src/components/layout/ScrollBackground.tsx`
- Delete: `public/fonts/LINESeedSansTH_W_Th.woff2`, `public/fonts/LINESeedSansTH_W_Rg.woff2`, `public/fonts/LINESeedSansTH_W_Bd.woff2`, `public/fonts/LINESeedSansTH_W_XBd.woff2`, `public/fonts/LINESeedSansTH_W_He.woff2`

**Interfaces:**
- Consumes: nothing new from Task 1.
- Produces: Prompt/Sarabun available globally via `<link>` (no import needed elsewhere). No more `<ScrollBackground />` rendered in the tree — confirms to spec §2.4 (decision: remove site-wide, Home may reintroduce a lighter CI-compliant effect in its own Phase 2 work, not inherited from this component).

- [ ] **Step 1: Add Google Fonts links and remove ScrollBackground from the layout**

In `src/app/[locale]/layout.tsx`, remove this import:
```tsx
import { ScrollBackground } from '@/components/layout/ScrollBackground'
```

Add font preconnect/stylesheet links inside the existing `<head>` block, alongside the existing `<script type="application/ld+json">`:

```tsx
<head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Prompt:wght@500;600&family=Sarabun:wght@400;500&display=swap"
  />
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
  />
</head>
```

Remove `<ScrollBackground />` from the `<body>`:

```tsx
<body>
  <NextIntlClientProvider messages={messages}>
    <NavBar items={nav.items} />
    <main>{children}</main>
    <Footer site={site} navItems={nav.items} locale={locale} />
  </NextIntlClientProvider>
</body>
```

- [ ] **Step 2: Delete the component and old font files**

```bash
rm src/components/layout/ScrollBackground.tsx
rm public/fonts/LINESeedSansTH_W_Th.woff2 public/fonts/LINESeedSansTH_W_Rg.woff2 public/fonts/LINESeedSansTH_W_Bd.woff2 public/fonts/LINESeedSansTH_W_XBd.woff2 public/fonts/LINESeedSansTH_W_He.woff2
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors. If you see an error about `ScrollBackground` being imported somewhere else, grep for it (`grep -rn "ScrollBackground" src/`) and remove that reference too — there should be none besides the layout, but confirm.

- [ ] **Step 4: Manual visual check**

Run: `pnpm dev`, open `http://localhost:3000/th` in a browser.
Expected:
- No animated night-sky/mountains/stars canvas behind the page (it's gone everywhere, not just here).
- Body text renders in Sarabun (visibly different letterforms from the old LINE Seed Sans TH — check Thai numerals/loop shapes look different if unsure).
- Page still loads without console errors (check devtools console).

Also spot-check `http://localhost:3000/th/about` and `http://localhost:3000/th/contact` the same way — confirm no console errors and no leftover animated background. Stop the dev server after.

- [ ] **Step 5: Commit**

```bash
git add -A src/app/\[locale\]/layout.tsx src/components/layout/ScrollBackground.tsx public/fonts/
git commit -m "Remove ScrollBackground, load Prompt+Sarabun via Google Fonts

ScrollBackground's continuous star-twinkle/parallax-mountain canvas
conflicts with the new CI's motion rules (no continuous animation,
gradient restricted to hero/CTA sections). Removed site-wide per
2026-09-11 decision; Home's own hero (Phase 2) may introduce a
lighter, CI-compliant effect if warranted, but doesn't inherit this.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 3: `Star` and `Badge` primitives

**Files:**
- Create: `src/components/ui/Star.tsx`
- Create: `src/components/ui/Badge.tsx`

**Interfaces:**
- Consumes: `--color-*` tokens from Task 1 via Tailwind utility classes (`text-first-light`, `text-mist`, `bg-dawn`, `text-navy`) and `--font-display` via `font-display`.
- Produces: `Star({ variant?: 'filled' | 'outline', className? })` — renders a 16×16 viewBox 4-point star SVG using `currentColor`, so callers control color via a `text-*` className. `Badge({ children, className? })` — renders a Dawn/Navy uppercase label chip.

- [ ] **Step 1: Write `Star.tsx`**

```tsx
// src/components/ui/Star.tsx
interface StarProps {
  variant?: 'filled' | 'outline'
  className?: string
}

const STAR_PATH = 'M8 0l1.8 6.2L16 8l-6.2 1.8L8 16l-1.8-6.2L0 8l6.2-1.8z'

export function Star({ variant = 'filled', className = '' }: StarProps) {
  if (variant === 'outline') {
    return (
      <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
        <path d={STAR_PATH} fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" fill="currentColor">
      <path d={STAR_PATH} />
    </svg>
  )
}
```

- [ ] **Step 2: Write `Badge.tsx`**

```tsx
// src/components/ui/Badge.tsx
interface BadgeProps {
  children: React.ReactNode
  className?: string
}

export function Badge({ children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-block bg-dawn text-navy font-display font-medium text-xs uppercase tracking-[.1em] px-[10px] py-1 ${className}`}
    >
      {children}
    </span>
  )
}
```

- [ ] **Step 3: Type-check and lint**

Run: `npx tsc --noEmit` — expected: no errors.
Run: `pnpm lint` — expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/Star.tsx src/components/ui/Badge.tsx
git commit -m "Add Star and Badge UI primitives

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 4: `Button` primitive

**Files:**
- Create: `src/components/ui/Button.tsx`

**Interfaces:**
- Consumes: `Star` from Task 3 (`import { Star } from './Star'`); `--color-*` tokens from Task 1.
- Produces: `Button({ href, variant?: 'primary' | 'secondary' | 'text', surface?: 'light' | 'dark', children, className? })` — always renders a Next.js `Link`. `variant='primary'` is chamfered with a leading star; `variant='secondary'` is an outline with a trailing arrow; `variant='text'` is an underlined link with a trailing arrow. `surface` picks the on-white vs. on-navy color pairing per `MEDREAM-DESIGN.md` §5 "Components → ปุ่ม". This is link-only (no `onClick`/`type='submit'` support) — Phase 6's form submit button is out of scope here; extend then if needed, don't build it now.

- [ ] **Step 1: Write `Button.tsx`**

```tsx
// src/components/ui/Button.tsx
import Link from 'next/link'
import { Star } from './Star'

type Variant = 'primary' | 'secondary' | 'text'
type Surface = 'light' | 'dark'

interface ButtonProps {
  href: string
  variant?: Variant
  surface?: Surface
  children: React.ReactNode
  className?: string
}

const CHAMFER_STYLE: React.CSSProperties = {
  clipPath: 'polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)',
}

const ARROW_PATH = 'M2 7h9.2L7.6 3.4 9 2l6 6-6 6-1.4-1.4L11.2 9H2z'

const baseClass =
  'inline-flex items-center gap-2 font-display font-semibold text-[15px] leading-none transition-transform duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-sky focus-visible:outline-offset-[3px]'

export function Button({ href, variant = 'primary', surface = 'light', children, className = '' }: ButtonProps) {
  if (variant === 'primary') {
    const surfaceClass =
      surface === 'light' ? 'bg-blue text-white hover:bg-navy' : 'bg-first-light text-navy hover:bg-dawn'
    return (
      <Link href={href} style={CHAMFER_STYLE} className={`${baseClass} px-[22px] py-[13px] ${surfaceClass} ${className}`}>
        <Star className="w-[0.9em] h-[0.9em]" />
        {children}
      </Link>
    )
  }

  if (variant === 'secondary') {
    const surfaceClass =
      surface === 'light'
        ? 'text-navy border-navy hover:bg-navy hover:text-white'
        : 'text-white border-white/75 hover:bg-white hover:text-navy'
    return (
      <Link
        href={href}
        className={`${baseClass} px-[22px] py-[13px] bg-transparent border-[1.5px] ${surfaceClass} ${className}`}
      >
        {children}
        <svg viewBox="0 0 16 16" className="w-[0.9em] h-[0.9em]" fill="currentColor" aria-hidden="true">
          <path d={ARROW_PATH} />
        </svg>
      </Link>
    )
  }

  // variant === 'text'
  const surfaceClass = surface === 'light' ? 'text-navy' : 'text-white'
  return (
    <Link href={href} className={`group relative ${baseClass} py-2 hover:translate-y-0 ${surfaceClass} ${className}`}>
      {children}
      <svg viewBox="0 0 16 16" className="w-[0.9em] h-[0.9em]" fill="currentColor" aria-hidden="true">
        <path d={ARROW_PATH} />
      </svg>
      <span className="absolute left-0 bottom-0.5 h-0.5 w-full origin-left scale-x-[.35] bg-current transition-transform duration-[250ms] ease-out group-hover:scale-x-100" />
    </Link>
  )
}
```

Note the `text` variant overrides `hover:-translate-y-0.5` (from `baseClass`) back to `hover:translate-y-0` — per `MEDREAM-DESIGN.md`, only the lift effect applies to primary/secondary; the text-link variant's hover is the underline growing, not a lift (matches `.b-txt:hover{transform:none}` in the reference CSS).

- [ ] **Step 2: Type-check and lint**

Run: `npx tsc --noEmit` — expected: no errors.
Run: `pnpm lint` — expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Button.tsx
git commit -m "Add Button UI primitive (primary/secondary/text variants)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 5: `Card` and `LevelBadge` primitives

**Files:**
- Create: `src/components/ui/Card.tsx`
- Create: `src/components/ui/LevelBadge.tsx`

**Interfaces:**
- Consumes: `Star` from Task 3; `--color-*` tokens from Task 1.
- Produces: `Card({ children, featured?: boolean, surface?: 'light' | 'dark', className? })` — bordered box, chamfered only when `featured`. `LevelBadge({ level: number, total: number, label: string, className? })` — "Lv.N" + filled/outline star row showing progress out of `total`, used for Way-of-work steps (Phase 6) and any "Lv." styled card (Phase 4/2).

- [ ] **Step 1: Write `Card.tsx`**

```tsx
// src/components/ui/Card.tsx
interface CardProps {
  children: React.ReactNode
  featured?: boolean
  surface?: 'light' | 'dark'
  className?: string
}

const CHAMFER_STYLE: React.CSSProperties = {
  clipPath: 'polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)',
}

export function Card({ children, featured = false, surface = 'light', className = '' }: CardProps) {
  const surfaceClass = surface === 'light' ? 'bg-white border-line text-ink' : 'bg-navy-card border-[#23367A] text-white'
  return (
    <div className={`border p-5 ${surfaceClass} ${className}`} style={featured ? CHAMFER_STYLE : undefined}>
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Write `LevelBadge.tsx`**

```tsx
// src/components/ui/LevelBadge.tsx
import { Star } from './Star'

interface LevelBadgeProps {
  level: number
  total: number
  label: string
  className?: string
}

export function LevelBadge({ level, total, label, className = '' }: LevelBadgeProps) {
  return (
    <div className={`inline-flex items-center gap-1.5 font-display font-semibold text-sm text-navy ${className}`}>
      <span>Lv.{level}</span>
      {Array.from({ length: total }, (_, i) => (
        <Star
          key={i}
          variant={i < level ? 'filled' : 'outline'}
          className={i < level ? 'w-4 h-4 text-first-light' : 'w-4 h-4 text-mist'}
        />
      ))}
      <span>{label}</span>
    </div>
  )
}
```

- [ ] **Step 3: Type-check and lint**

Run: `npx tsc --noEmit` — expected: no errors.
Run: `pnpm lint` — expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/Card.tsx src/components/ui/LevelBadge.tsx
git commit -m "Add Card and LevelBadge UI primitives

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 6: Visual verification of all primitives, then full-site smoke pass

**Files:**
- Temporarily modify (revert before finishing): `src/app/[locale]/page.tsx`

No commit at the end of this task — it's verification-only, and the temporary code is reverted in Step 3 before Task 6 completes. If Step 1's edit is somehow left in place, Step 3 catches it (a non-empty `git diff` after the revert means something wasn't cleaned up).

**Interfaces:**
- Consumes: `Button`, `Star`, `Badge`, `Card`, `LevelBadge` from Tasks 3–5.
- Produces: nothing — this task only confirms the primitives built in Tasks 3–5 render correctly before later phases start consuming them for real.

- [ ] **Step 1: Temporarily mount every primitive/variant on the Home page**

At the very top of the returned JSX in `src/app/[locale]/page.tsx` (before `<HeroSection ... />`), temporarily insert:

```tsx
<div className="fixed inset-0 z-50 overflow-auto bg-white p-8 flex flex-col gap-6">
  <div className="flex gap-3 flex-wrap items-center bg-white p-4">
    <Button href="#" variant="primary" surface="light">เริ่มโปรเจกต์</Button>
    <Button href="#" variant="secondary" surface="light">ดูผลงานของเรา</Button>
    <Button href="#" variant="text" surface="light">ดูรายละเอียด</Button>
  </div>
  <div className="flex gap-3 flex-wrap items-center bg-navy p-4">
    <Button href="#" variant="primary" surface="dark">เริ่มโปรเจกต์</Button>
    <Button href="#" variant="secondary" surface="dark">ดูผลงานของเรา</Button>
    <Button href="#" variant="text" surface="dark">ดูรายละเอียด</Button>
  </div>
  <div className="flex gap-3 items-center">
    <Badge>Lv.2 · ออกแบบ Solution</Badge>
    <LevelBadge level={2} total={4} label="ออกแบบ Solution" />
  </div>
  <Card featured className="max-w-sm">
    <p className="font-display font-semibold">การ์ดแบบ featured (มุมตัด)</p>
  </Card>
  <Card className="max-w-sm">
    <p className="font-display font-semibold">การ์ดแบบปกติ (มุมตรง)</p>
  </Card>
</div>
```

Add the imports at the top of the file:
```tsx
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { LevelBadge } from '@/components/ui/LevelBadge'
```

- [ ] **Step 2: Run and visually check**

Run: `pnpm dev`, open `http://localhost:3000/th`.
Check against `medream-brand-identity.html` (open that file directly in a browser tab for side-by-side reference) and `MEDREAM-DESIGN.md` §5:
- Primary button: chamfered top-left/bottom-right corner, star before the text, Blue bg/white text on the white strip, First Light bg/Navy text on the navy strip. Hovering lifts it slightly.
- Secondary button: outline only, arrow after the text, Navy outline on white strip / white outline on navy strip. Hovering fills the background.
- Text button: no border, arrow after text, underline that's short by default and grows to full width on hover, no lift on hover.
- Badge: Dawn background, Navy uppercase text.
- LevelBadge: "Lv.2" then 4 stars (first 2 filled First Light, last 2 outline Mist), then the label text.
- Featured card: has the same chamfer as the primary button; the plain card has square corners.
- No console errors in devtools.

Fix anything that doesn't match before proceeding (go back to the relevant Task 3–5 file).

- [ ] **Step 3: Revert the temporary code**

```bash
git checkout -- "src/app/[locale]/page.tsx"
git status
```
Expected: `git status` shows no changes to `src/app/[locale]/page.tsx` (working tree clean for that file) — confirms the temporary preview block left no trace.

- [ ] **Step 4: Full-site smoke pass**

With `pnpm dev` still running, visit each of these in both `th` and `en` (16 checks total) and confirm no blank/white-on-white text, no console errors, and the new Sarabun/Prompt fonts are visibly in effect:
`/`, `/about`, `/services`, `/portfolio`, `/faq`, `/contact`, `/careers`, `/blog`

Stop the dev server.

- [ ] **Step 5: Final type-check and lint**

Run: `npx tsc --noEmit` — expected: no errors (should match the state after Task 5's commit, since Step 3 reverted the only file this task touched).
Run: `pnpm lint` — expected: no errors.

---

## Self-Review Notes

- **Spec coverage:** §2.1 tokens → Task 1. §2.1 font → Tasks 1–2. §2.2 shape (chamfer, no radius) → Tasks 4–5 (inline style, documented rationale in Global Constraints). §2.3 primitives (Button/Star/Badge/Card/LevelBadge) → Tasks 3–5. §2.4 ScrollBackground removal → Task 2. §2.5 Dark mode → explicitly scoped out this phase (see Global Constraints), to be revisited only if a toggle is ever requested — not silently dropped.
- **Placeholder scan:** no TBD/TODO in any step; every code block is complete, runnable code.
- **Type consistency:** `Star`'s `variant` prop (`'filled' | 'outline'`) is used identically in `Button` (not used — Button always renders filled) and `LevelBadge` (both variants used). `Card`'s `surface` prop matches `Button`'s `surface` prop type (`'light' | 'dark'`) for consistency across primitives.
