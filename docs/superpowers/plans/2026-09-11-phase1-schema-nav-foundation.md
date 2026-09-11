# Phase 1 — Schema + Nav Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lay the schema/content foundation later phases build on (new `Milestone` type + content, `FaqItem.category` field) and rebuild site-wide navigation (`NavBar`, `MobileDrawer`, `Footer`, `LangToggle`) on the Phase 0 design system with the new 5-item nav + "เริ่มโปรเจกต์" CTA.

**Architecture:** Type/content additions in this phase are strictly additive — nothing existing is renamed or removed, so no other phase's not-yet-rebuilt page breaks (same non-breaking discipline as Phase 0's token aliasing). Nav/Footer/Drawer are small, self-contained components already isolated from page content, so their visual rebuild is safe to do now, ahead of Home/About/etc.

**Scope refinement vs. the design spec:** The spec's Phase 1 row listed `src/types/content.ts` broadly; this plan narrows that to only the additions that have zero current consumers (`Milestone`, `FaqItem.category`). The `Service` → `ServiceGroup` type replacement is **deferred to Phase 4** — splitting it here would mean carrying two competing Service shapes with no phase actually owning the migration; Phase 4 does the type change, the `services.json` rewrite, and its consumers' rewrite together as one coherent unit, mirroring how Phase 0 did tokens+fonts+primitives together and Phase 5 will do Notion queries+page together.

**Tech Stack:** Next.js 16 (App Router) + Tailwind CSS v4 + TypeScript + next-intl. No test runner configured — verification is `npx tsc --noEmit` + `pnpm lint` + manual browser checks.

**Spec:** `docs/superpowers/specs/2026-09-11-website-redesign-ia-v2-design.md` (§3.2 FaqItem, §3.4 Award/Milestone, §5 Routing & Navigation)

## Global Constraints

- New primitives from Phase 0 (`Button`, `Star`, `Badge`, `Card`, `LevelBadge` in `src/components/ui/`) are the only new-CI building blocks available — don't invent ad-hoc styled elements where a primitive already fits.
- New CI tokens from Phase 0: use `text-white`, `text-mist`, `text-first-light`, `bg-navy-card`, `bg-midnight` etc. — not the deprecated aliases (`text-dream-cream`, `text-dawn-gold`, `bg-deep-space`, `border-nebula`) — in any file this phase touches. Deprecated aliases are fine to leave alone in files this phase does *not* touch.
- No `border-radius` / rounded corners anywhere touched this phase (per Phase 0's shape rule) — `LangToggle`'s current `rounded` class must go.
- `content/nav.json` keeps its existing `NavItem` shape (`key`, `href`, `label_th`, `label_en`) — the CTA button is *not* a `NavItem` (it needs button styling, not a text-link style), it's driven by the existing `nav.contact_cta` key in `messages/th.json`/`messages/en.json` (already present, just update its value).
- `Button` (from Phase 0) is link-only today (`href` required, no `onClick`). This phase adds an optional `onClick?: () => void` passthrough to it — a small, now-justified extension (the mobile drawer's CTA must also close the drawer on click), not scope creep.

---

## Task 1: `Milestone` type + `FaqItem.category` field

**Files:**
- Modify: `src/types/content.ts`
- Modify: `src/lib/content.ts`

**Interfaces:**
- Produces: `Milestone` interface (`date_th`, `date_en`, `event_th`, `event_en`, `location_th`, `location_en`, all `string`) — consumed by Task 4 (content) and Phase 3 (About page). `FaqItem.category?: 'general' | 'marketing-event' | 'crm' | 'learning' | 'games'` — optional because the current `content/faq.json` (5 items) doesn't have it yet; Phase 6 rewrites that content with real category values and can tighten this to required then. `getMilestones(): Milestone[]` — reads `content/milestones.json`, same pattern as every other `getX()` in this file.

- [ ] **Step 1: Add `Milestone` and extend `FaqItem` in `src/types/content.ts`**

Find the existing `FaqItem` interface:
```ts
export interface FaqItem {
  question_th: string
  question_en: string
  answer_th: string
  answer_en: string
  featured: boolean
}
```

Replace it with:
```ts
export interface FaqItem {
  question_th: string
  question_en: string
  answer_th: string
  answer_en: string
  featured: boolean
  category?: 'general' | 'marketing-event' | 'crm' | 'learning' | 'games'
}
```

Add a new `Milestone` interface directly after the `Award` interface:
```ts
export interface Milestone {
  date_th: string
  date_en: string
  event_th: string
  event_en: string
  location_th: string
  location_en: string
}
```

- [ ] **Step 2: Add `getMilestones()` to `src/lib/content.ts`**

Add the `Milestone` import:
```ts
import type {
  NavConfig, SiteConfig, Service, PortfolioItem,
  TeamMember, TeamMemberDetail, FaqItem, Award, Milestone, CareerOpening
} from '@/types/content'
```

Add the loader function directly after `getAwards()`:
```ts
export function getMilestones(): Milestone[] {
  return readJson<Milestone[]>('milestones.json')
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors. `getMilestones()` type-checks fine on its own (it's a plain function); nothing calls it yet, and `readJson` doesn't validate the file exists at type-check time — only at runtime, and Task 4 creates that file before anything ever calls this function.

- [ ] **Step 4: Commit**

```bash
git add src/types/content.ts src/lib/content.ts
git commit -m "Add Milestone type and FaqItem.category field

Both additive — Milestone has no existing data/consumer yet (Task 4
adds the content, Phase 3 About consumes it); category is optional
since current faq.json entries don't have it until Phase 6.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 2: Rewrite `content/nav.json`, update CTA copy

**Files:**
- Modify: `content/nav.json`
- Modify: `messages/th.json`
- Modify: `messages/en.json`

**Interfaces:**
- Produces: 5 `NavItem`s (`home`, `services`, `works`, `about`, `insights`) consumed by `NavBar`/`MobileDrawer`/`Footer` (Tasks 5–7). `nav.contact_cta` message key (already exists in both message files) updated to the new copy — consumed by Tasks 5–6.

- [ ] **Step 1: Replace `content/nav.json`**

```json
{
  "items": [
    { "key": "home",     "href": "/",          "label_th": "หน้าหลัก",     "label_en": "Home" },
    { "key": "services", "href": "/services",  "label_th": "บริการ",       "label_en": "Services" },
    { "key": "works",    "href": "/portfolio", "label_th": "ผลงาน",        "label_en": "Works" },
    { "key": "about",    "href": "/about",     "label_th": "เกี่ยวกับเรา", "label_en": "About" },
    { "key": "insights", "href": "/blog",      "label_th": "Insights",     "label_en": "Insights" }
  ]
}
```

- [ ] **Step 2: Update `nav.contact_cta` in both message files**

In `messages/th.json`, change:
```json
"contact_cta": "ติดต่อเรา"
```
to:
```json
"contact_cta": "เริ่มโปรเจกต์"
```

In `messages/en.json`, change:
```json
"contact_cta": "Contact Us"
```
to:
```json
"contact_cta": "Start a Project"
```

- [ ] **Step 3: Type-check and lint**

Run: `npx tsc --noEmit` — expected: no errors.
Run: `pnpm lint` — expected: no new errors (the pre-existing `ContactForm.tsx` hooks error is unrelated and stays).

- [ ] **Step 4: Commit**

```bash
git add content/nav.json messages/th.json messages/en.json
git commit -m "Rewrite nav to 5 items, update CTA copy to เริ่มโปรเจกต์

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 3: Populate `content/awards.json`, fix its stale example file

**Files:**
- Modify: `content/awards.json`
- Modify: `content/awards.example.json`
- Create: `public/images/awards/placeholder.png` (copy of the existing portfolio placeholder — no real award badge art exists yet)

**Interfaces:**
- Produces: 2 real `Award` entries, consumed today by the existing (not-yet-rebuilt) `src/components/home/AwardsSection.tsx` — it already calls `getAwards()` and renders `name_th/en`, `event`, `year`; this task doesn't touch that component, just gives it real data instead of an empty array.

- [ ] **Step 1: Replace `content/awards.json`**

```json
[
  {
    "name_th": "Best Game Technical",
    "name_en": "Best Game Technical",
    "year": 2026,
    "event": "Thai Digital Content Go Global — depa Accelerator Program",
    "image": "/images/awards/placeholder.png"
  },
  {
    "name_th": "Digital Startup Grant",
    "name_en": "Digital Startup Grant",
    "year": 2026,
    "event": "สำนักงานส่งเสริมเศรษฐกิจดิจิทัล (depa)",
    "image": "/images/awards/placeholder.png"
  }
]
```

- [ ] **Step 2: Fix `content/awards.example.json` to match the real `Award` type**

It currently uses a shape (`title_th`/`organization_th`/`desc_th`) that doesn't match the `Award` interface (`name_th`/`event`) at all — a pre-existing drift, not something this task caused, but worth fixing while touching this file so future content authors aren't misled. Replace its contents with:

```json
[
  {
    "name_th": "ตัวอย่างชื่อรางวัล",
    "name_en": "Example Award Name",
    "year": 2024,
    "event": "ชื่อผู้จัดงานหรือเวที",
    "image": "/images/awards/placeholder.png"
  }
]
```

- [ ] **Step 3: Create the placeholder image**

```bash
mkdir -p public/images/awards
cp public/images/portfolio/placeholder.png public/images/awards/placeholder.png
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit` — expected: no errors (JSON content changes don't affect TypeScript).

- [ ] **Step 5: Commit**

```bash
git add content/awards.json content/awards.example.json public/images/awards/
git commit -m "Populate real award data, fix stale awards.example.json shape

awards.example.json used title_th/organization_th/desc_th, which
doesn't match the actual Award interface (name_th/event) at all —
fixed while touching this file.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 4: `content/milestones.json`

**Files:**
- Create: `content/milestones.json`

**Interfaces:**
- Produces: 5 `Milestone` entries (matches the `Milestone` type from Task 1) — no consumer yet in this phase; Phase 3 (About) builds the timeline UI that reads `getMilestones()`.

- [ ] **Step 1: Create the file**

```json
[
  {
    "date_th": "15 มกราคม 2569",
    "date_en": "15 January 2026",
    "event_th": "Thai Digital Content Go Global — depa Accelerator Program",
    "event_en": "Thai Digital Content Go Global — depa Accelerator Program",
    "location_th": "True Digital Park",
    "location_en": "True Digital Park"
  },
  {
    "date_th": "10 กรกฎาคม 2568",
    "date_en": "10 July 2025",
    "event_th": "Game Festival",
    "event_en": "Game Festival",
    "location_th": "Fashion Island",
    "location_en": "Fashion Island"
  },
  {
    "date_th": "23–24 สิงหาคม 2568",
    "date_en": "23–24 August 2025",
    "event_th": "Thailand International Game Showcase 2025 (กระทรวงวัฒนธรรม)",
    "event_en": "Thailand International Game Showcase 2025 (Ministry of Culture)",
    "location_th": "สยามพารากอน",
    "location_en": "Siam Paragon"
  },
  {
    "date_th": "24 พฤษภาคม 2569",
    "date_en": "24 May 2026",
    "event_th": "Craft & Play",
    "event_en": "Craft & Play",
    "location_th": "Central Westgate ชั้น 4",
    "location_en": "Central Westgate, 4th Floor"
  },
  {
    "date_th": "9–12 กรกฎาคม 2569",
    "date_en": "9–12 July 2026",
    "event_th": "Thai Game Fest (TGF) 2026",
    "event_en": "Thai Game Fest (TGF) 2026",
    "location_th": "Nex Hall, สยามพารากอน",
    "location_en": "Nex Hall, Siam Paragon"
  }
]
```

- [ ] **Step 2: Verify it parses and loads**

Run: `node -e "const m = require('./content/milestones.json'); console.log(m.length, 'entries')"`
Expected: `5 entries`

- [ ] **Step 3: Commit**

```bash
git add content/milestones.json
git commit -m "Add milestones content (5 events/booths, from confirmed copy)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 5: Extend `Button` with `onClick`, reskin `LangToggle`

**Files:**
- Modify: `src/components/ui/Button.tsx`
- Modify: `src/components/shared/LangToggle.tsx`

**Interfaces:**
- Produces: `Button` gains `onClick?: () => void` (passed through to the underlying `Link`) — needed by Task 6's mobile drawer CTA, which must close the drawer on click. `LangToggle` keeps its existing exported shape (`LangToggle()`, no props) — only its internal classes change.

- [ ] **Step 1: Add `onClick` to `Button`**

In `src/components/ui/Button.tsx`, add to `ButtonProps`:
```ts
interface ButtonProps {
  href: string
  variant?: Variant
  surface?: Surface
  onClick?: () => void
  children: React.ReactNode
  className?: string
}
```

Update the function signature and pass `onClick` through on all three `<Link>` returns:
```ts
export function Button({ href, variant = 'primary', surface = 'light', onClick, children, className = '' }: ButtonProps) {
```
Add `onClick={onClick}` as a prop on each of the three `<Link ...>` elements (primary, secondary, text variants) — same place `href` already sits.

- [ ] **Step 2: Reskin `LangToggle.tsx`**

Replace its contents with:
```tsx
// src/components/shared/LangToggle.tsx
'use client'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { useTransition } from 'react'

export function LangToggle() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  function toggle() {
    const nextLocale = locale === 'th' ? 'en' : 'th'
    const segments = pathname.split('/')
    segments[1] = nextLocale
    startTransition(() => {
      router.push(segments.join('/'))
    })
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className="px-3 py-1 border border-mist text-white text-sm font-display font-semibold hover:border-first-light hover:text-first-light transition-colors"
      aria-label="Toggle language"
    >
      {locale === 'th' ? 'EN' : 'TH'}
    </button>
  )
}
```

(Only the `className` changed: dropped `rounded`, swapped `border-horizon`/`text-dream-cream`/`hover:border-dawn-gold`/`hover:text-dawn-gold`/`font-bold` for the new-CI equivalents `border-mist`/`text-white`/`hover:border-first-light`/`hover:text-first-light`/`font-display font-semibold`.)

- [ ] **Step 3: Type-check and lint**

Run: `npx tsc --noEmit` — expected: no errors.
Run: `pnpm lint` — expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/Button.tsx src/components/shared/LangToggle.tsx
git commit -m "Add Button onClick support, reskin LangToggle to new CI

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 6: Rebuild `NavBar` and `MobileDrawer`

**Files:**
- Modify: `src/components/layout/NavBar.tsx`
- Modify: `src/components/layout/MobileDrawer.tsx`

**Interfaces:**
- Consumes: `Button` (Task 5, with `onClick`), `content/nav.json`'s 5 items (Task 2), `messages.nav.contact_cta` (Task 2).
- Produces: no signature change to either component (`NavBar({ items })`, `MobileDrawer({ items, open, onClose })` stay the same) — internal rendering and classes change only.

- [ ] **Step 1: Update `NavBar.tsx`**

Add the `useTranslations` import and the `Button` import:
```ts
import { useLocale, useTranslations } from 'next-intl'
```
```ts
import { Button } from '@/components/ui/Button'
```

Add inside the component body, alongside the existing `useLocale()` call:
```ts
const t = useTranslations('nav')
```

Replace the desktop `<nav>` block's link classes — find:
```tsx
className="text-dream-cream hover:text-dawn-gold text-sm font-bold transition-colors"
```
replace with:
```tsx
className="text-white hover:text-first-light text-sm font-display font-semibold transition-colors"
```

Replace the "Right side" div to add the CTA button before `LangToggle`. **Note:** `Button`'s own base classes always include `inline-flex` (it's not conditional), so toggling visibility by passing `hidden` into its `className` would fight that base class for the same `display` property with no reliable winner — wrap it in a separate element instead, and control visibility on the wrapper:
```tsx
<div className="flex items-center gap-3">
  <div className="hidden lg:block">
    <Button href={`/${locale}/contact`} variant="primary" surface="dark">
      {t('contact_cta')}
    </Button>
  </div>
  <LangToggle />
  {/* Hamburger — mobile only */}
  <button
    className="lg:hidden text-white hover:text-first-light p-1"
    onClick={() => setDrawerOpen(true)}
    aria-label="Open menu"
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  </button>
</div>
```

(Only the hamburger button's classes changed from `text-dream-cream hover:text-dawn-gold` to `text-white hover:text-first-light`, plus the new `<Button>` was inserted before `<LangToggle />`.)

- [ ] **Step 2: Update `MobileDrawer.tsx`**

Add the `Button` import:
```ts
import { Button } from '@/components/ui/Button'
```

Replace the whole `<nav>` block:
```tsx
<nav
  className="fixed top-0 right-0 h-full w-72 bg-navy-card z-50 flex flex-col p-6 shadow-2xl lg:hidden"
  aria-label={t('open_menu')}
>
  <button
    onClick={onClose}
    className="self-end text-white hover:text-first-light mb-8 text-2xl"
    aria-label={t('close_menu')}
  >
    ✕
  </button>
  <ul className="flex flex-col gap-4 flex-1">
    {items.map(item => (
      <li key={item.key}>
        <Link
          href={`/${locale}${item.href}`}
          onClick={onClose}
          className="text-white hover:text-first-light text-lg font-display font-semibold block py-2 border-b border-white/10"
        >
          {locale === 'th' ? item.label_th : item.label_en}
        </Link>
      </li>
    ))}
  </ul>
  <div className="flex flex-col gap-4 mt-6">
    <Button href={`/${locale}/contact`} variant="primary" surface="dark" onClick={onClose}>
      {t('contact_cta')}
    </Button>
    <LangToggle />
  </div>
</nav>
```

Also update the backdrop div's class (still uses the `midnight` token, just confirm the opacity utility still reads correctly):
```tsx
<div
  className="fixed inset-0 bg-midnight/80 z-40 lg:hidden"
  onClick={onClose}
  aria-hidden="true"
/>
```
(No change needed here — `bg-midnight` already carries the new hex from Phase 0.)

- [ ] **Step 3: Type-check and lint**

Run: `npx tsc --noEmit` — expected: no errors.
Run: `pnpm lint` — expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/NavBar.tsx src/components/layout/MobileDrawer.tsx
git commit -m "Rebuild NavBar and MobileDrawer on new CI with เริ่มโปรเจกต์ CTA

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 7: Restructure `Footer`

**Files:**
- Modify: `src/components/layout/Footer.tsx`
- Modify: `src/app/[locale]/layout.tsx` (call-site prop change)

**Interfaces:**
- Produces: `Footer({ site, locale })` — **drops the `navItems` prop** (the new IA's footer is ร่วมงานกับเรา · FAQ · social only, not a full nav-item repeat; see spec's Navigation section). Linktree is intentionally omitted — it's out of scope per the design spec's backlog (§8), not linked to a nonexistent page.

- [ ] **Step 1: Replace `Footer.tsx`**

```tsx
// src/components/layout/Footer.tsx
import Link from 'next/link'
import Image from 'next/image'
import type { SiteConfig } from '@/types/content'

interface Props {
  site: SiteConfig
  locale: string
}

export function Footer({ site, locale }: Props) {
  const l = locale as 'th' | 'en'

  return (
    <footer className="bg-midnight border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div>
            <Image
              src="/images/logo/logo-white.png"
              alt="MeDream Studio"
              width={48}
              height={48}
              className="mb-3 object-contain"
            />
            <p className="text-mist text-sm leading-relaxed max-w-xs">
              {l === 'th' ? site.tagline_th : site.tagline_en}
            </p>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-4">
            <Link
              href={`/${locale}/careers`}
              className="text-white hover:text-first-light text-sm font-display font-semibold transition-colors"
            >
              {l === 'th' ? 'ร่วมงานกับเรา' : 'Careers'}
            </Link>
            <Link
              href={`/${locale}/faq`}
              className="text-white hover:text-first-light text-sm font-display font-semibold transition-colors"
            >
              FAQ
            </Link>
            {site.socials.map(s => (
              <a
                key={s.platform}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-first-light text-sm font-display font-semibold transition-colors"
              >
                {s.platform}
              </a>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-mist text-xs">
            {l === 'th' ? site.copyright_th : site.copyright_en}
          </p>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Update the call site in `src/app/[locale]/layout.tsx`**

Find:
```tsx
<Footer site={site} navItems={nav.items} locale={locale} />
```
Replace with:
```tsx
<Footer site={site} locale={locale} />
```

- [ ] **Step 3: Type-check and lint**

Run: `npx tsc --noEmit` — expected: no errors (confirms nothing else still passes `navItems` to `Footer`).
Run: `pnpm lint` — expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Footer.tsx "src/app/[locale]/layout.tsx"
git commit -m "Restructure Footer to ร่วมงานกับเรา/FAQ/social per new IA

Drops the full nav-item repeat — the new IA's footer is a simpler
utility row, not a nav mirror. Linktree intentionally omitted
(out of scope per design spec backlog, no page exists yet to link to).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 8: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Final type-check and lint**

Run: `npx tsc --noEmit` — expected: no errors.
Run: `pnpm lint` — expected: only the pre-existing `ContactForm.tsx` error, nothing new.

- [ ] **Step 2: Full-site smoke pass**

Run `pnpm dev`, visit each of `/`, `/about`, `/services`, `/portfolio`, `/faq`, `/contact`, `/careers`, `/blog` in both `th` and `en` (16 checks). For each, confirm:
- Nav bar shows 5 items in the new order (หน้าหลัก/บริการ/ผลงาน/เกี่ยวกับเรา/Insights or the EN equivalents) plus the "เริ่มโปรเจกต์"/"Start a Project" button, styled with the chamfer + star (Phase 0's primary Button).
- Footer shows only ร่วมงานกับเรา/FAQ/social links + logo/tagline/copyright — no 7-item nav repeat.
- On mobile width (resize the browser or use devtools device mode), the hamburger opens the drawer, the drawer shows the 5 nav items, the CTA button, and the language toggle; clicking the CTA closes the drawer (the button has `onClick={onClose}` wired).
- No console errors.

Stop the dev server after.

- [ ] **Step 3: Confirm no regressions on Home's Awards section**

Still on `pnpm dev` (or restart it), visit `/th` and scroll to the Awards section — it should now show the 2 real awards ("Best Game Technical", "Digital Startup Grant") instead of being empty/hidden (recall `AwardsSection` returns `null` when `awards.length === 0`, so this is the first time it renders anything).

---

## Self-Review Notes

- **Spec coverage:** §3.2 (FaqItem.category) → Task 1. §3.4 Milestone → Tasks 1 & 4. §5 nav.json → Task 2. §5 CTA via messages → Task 2. §5 Footer restructure → Task 7. Award population (§4 "draftable now" list references awards data via the copy doc) → Task 3.
- **Placeholder scan:** no TBD/TODO; every code block is complete. The one legitimate "not yet real" item (award badge images) is handled with an explicit, working placeholder image copy, not a broken path.
- **Type consistency:** `Milestone` fields match exactly between the Task 1 type and the Task 4 JSON content (`date_th/en`, `event_th/en`, `location_th/en`). `Button`'s new `onClick` prop (Task 5) is used identically in Task 6's `NavBar` (not used — desktop CTA doesn't need to close anything) and `MobileDrawer` (used, tied to `onClose`). `Footer`'s prop signature change (Task 7) is matched by its one call site in the same task — grepped, only one usage exists (`[locale]/layout.tsx`).
