# MeDream Website — IA v2, Content & Design System Overhaul

**Date:** 2026-09-11
**Status:** Approved (user sign-off in chat 2026-09-11)
**Supersedes:** `2026-05-22-medream-website-design.md` §"Brand Tokens" and §"Typography" (design system fully replaced). IA/routing/IA sections in this doc replace that spec's site map.

---

## 1. Overview

MeDream is repositioning its site around the slogan "We Dream, We Do, We Make Difference" with a new information architecture, a full copy pass (much of it already finalized), and a new CI (colors, type, shape, button system) documented in `medream-brand-identity.html` / `MEDREAM-DESIGN.md` / `medream-tokens.css`. Source docs for this spec:

- `medream-website-content-ia-v2.md` — IA rationale, section-by-section plan
- `medream-website-copy.md` — finished copy for Home (9 sections) and About (story + awards)
- `medream-ai-brief.md` — raw data for Works case studies, Way of work, FAQ, form spec
- `MEDREAM-DESIGN.md`, `medream-tokens.css`, `medream-brand-identity.html` — new CI reference

Decisions locked in during brainstorming (2026-09-11):
1. New CI **fully replaces** the current design system (colors + font) everywhere, not just new pages.
2. Whole plan is scoped now, built in phases (see §7).
3. Existing routes (`/portfolio`, `/blog`, `/contact`, `/faq`) are **kept stable** — only nav labels/headings change. No new top-level routes except `/portfolio/[slug]` for the Sumeeper detail page.

---

## 2. Design System Replacement

### 2.1 Tokens (`src/app/globals.css`)

Replace the entire `@theme` block. New tokens (light-mode values; dark-mode overrides via `@media (prefers-color-scheme: dark)` guarded with `:root:not([data-theme="light"])`, and repeated under `:root[data-theme="dark"]` — same pattern already used in `medream-tokens.css`):

| New token | Hex | Replaces |
|---|---|---|
| `--color-white` | `#FFFFFF` | new — primary light bg |
| `--color-midnight` | `#04103A` | `--color-midnight` (`#060a14`) |
| `--color-navy` | `#052D6F` | `--color-deep-space` |
| `--color-navy-card` | `#0B1D52` | new (dark-mode surface) |
| `--color-blue` | `#0C5BAC` | `--color-royal-blue` |
| `--color-sky` | `#3B89D0` | `--color-electric` |
| `--color-mist` | `#87B2DE` | `--color-horizon` |
| `--color-dawn` | `#ECCCC1` | new |
| `--color-first-light` | `#F5B98A` | `--color-dawn-gold` |
| `--color-ink` | `#12203F` | new — body text on white |
| `--color-fg-2` | `#4B5670` | new — secondary text |
| `--color-fg-3` | `#626D87` | new — caption/eyebrow |
| `--color-line` | `#E4E7EF` (dark `#23367A`) | new — borders |

Old tokens (`nebula`, `soft-gold`, `morning-mist`, `dream-cream`) are removed. Any component still referencing them must be migrated — this is the reason component work happens in Phase 0 before content pages, and any missed reference will fail `npx tsc --noEmit`/lint-time grep rather than surface as a visual bug later.

**Font:** replace `LINE Seed Sans TH` (self-hosted `@font-face`, `/public/fonts/*.woff2`) with **Prompt** (display/headings/labels/buttons, weights 500/600) + **Sarabun** (body, weights 400/500) loaded via Google Fonts `<link>` in the root layout (`src/app/[locale]/layout.tsx` or `src/app/layout.tsx` — whichever currently owns `<head>`). Both fonts support Thai. Remove the old `@font-face` blocks and the `/public/fonts/LINESeedSansTH_*` files once nothing references them.

Type scale (from `MEDREAM-DESIGN.md` §3): Display 56/64, H2 36/44, H3 22/28, Body 17/28, Small 15/24, Label 12/16 uppercase tracking .12em.

### 2.2 Shape

- `--chamfer: 12px` clip-path (`polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)`) — one corner pair, top-left to bottom-right only.
- All other elements: `border-radius: 0`. No pills, no rounded cards. This replaces every `rounded-xl` / `rounded` class currently in use (`ServiceCard.tsx`, About/Services page cards, `ContactForm` inputs, etc.) — Phase 0 does a repo-wide grep for `rounded` in `src/components` and `src/app` and removes/replaces each occurrence as those files are touched in later phases (not a blanket find-replace, since some phases rebuild the file wholesale anyway).

### 2.3 Component primitives (new, added in Phase 0)

New shared components under `src/components/ui/` (new directory):
- `Button.tsx` — variants `primary` (chamfer + star icon), `secondary` (outline + arrow), `text` (underline-grow link). Each variant is context-aware for on-white vs. on-navy backgrounds via a `surface="light"|"dark"` prop (maps to the `b-blue`/`b-fl` and `b-out-navy`/`b-out-white` pairs in the reference HTML).
- `Star.tsx` — the 4-point star SVG (`M8 0l1.8 6.2L16 8l-6.2 1.8L8 16l-1.8-6.2L0 8l6.2-1.8z`), props for `filled|outline` and size.
- `Badge.tsx` — Dawn bg, Navy text, uppercase label.
- `Card.tsx` — plain bordered card + `featured` variant with the chamfer clip applied.
- `LevelBadge.tsx` — "Lv.N" chip using stars to show progress (used in Way-of-work / service Level cards).

These replace the ad-hoc `bg-royal-blue hover:bg-electric ... rounded` button classes currently inlined in `ServiceCard.tsx`, `ContactForm.tsx`, etc. Existing components are migrated to use them as each is touched in its page's phase — Phase 0 only builds the primitives and a small style-guide check (visually verified in Phase 0's own verification step, not a full page).

### 2.4 ScrollBackground removal (discovered during Phase 0 planning, 2026-09-11)

`src/components/layout/ScrollBackground.tsx` is a full-page canvas (scroll-driven night-sky→dawn gradient, twinkling stars, shooting stars, parallax mountains) rendered in `[locale]/layout.tsx` behind every page — not documented in the original brainstorming pass. Its mechanic conflicts with the new CI (`MEDREAM-DESIGN.md` §6/§7: no continuous star animation, gradient restricted to hero + CTA sections only, no full-page background gradient). **Decision (user, 2026-09-11): remove it site-wide in Phase 0.** Home's own hero treatment (Phase 2) may introduce a much lighter, CI-compliant effect if warranted, but that's Phase 2's call, not inherited from this component. Phase 0 deletes the component file and its usage in the layout; no replacement is built in Phase 0.

### 2.5 Dark mode

No behavior change needed beyond the token swap — the site already uses `prefers-color-scheme` + optional `[data-theme]`. Section-level "on navy" treatment (hero, footer, CTA sections in light mode) uses a `.on-navy` utility class exactly as defined in `medream-tokens.css`.

---

## 3. Content Schema Changes (`src/types/content.ts`, `src/lib/content.ts`)

### 3.1 `Service` — flat list → grouped

```ts
export interface ServiceGroup {
  id: 'marketing-event' | 'crm' | 'learning' | 'games'
  title_th: string
  title_en: string
  forWho_th: string       // ใครเหมาะ
  forWho_en: string
  body_th: string         // คำอธิบายกลุ่ม
  body_en: string
  bullets_th: string[]    // ความสามารถ/จุดขายย่อย (จาก content-ia-v2.md ส่วน Services)
  bullets_en: string[]
  hasCases: boolean       // false for 'crm' and 'learning' — Works must not fabricate case studies for these
  faq: { question_th: string; question_en: string; answer_th: string; answer_en: string }[]
}

export interface CraftItem {
  label_th: string
  label_en: string
}
```

`content/services.json` becomes `{ groups: ServiceGroup[], craft: CraftItem[] }` (craft = "2D Animation · 3D Animation · Game Design · UX/UI", rendered as a cross-cutting bar, not a 5th group). The old flat `Service[]` shape (`id/icon/title/desc/cta`) is removed — every consumer (`ServiceCard`, `ContactForm`'s service `<select>`, `ServicesSection` on Home) is updated in the phase that touches it (Phase 4 for Services pages, Phase 6 for the form, Phase 2 for Home's service preview cards — Home only needs `{id, title, body}` so it can read the new shape directly, no separate type needed).

Existing `Service` interface is renamed conceptually but I will keep `getServices()` as a compatibility-breaking rewrite (not a shim) — per CLAUDE.md guidance against back-compat hacks, and because every call site is touched within this same project.

### 3.2 `FaqItem` — add category

```ts
export interface FaqItem {
  question_th: string
  question_en: string
  answer_th: string
  answer_en: string
  featured: boolean
  category: 'general' | 'marketing-event' | 'crm' | 'learning' | 'games'
}
```

`content/faq.json` holds **all** FAQ content (central 7 + the 4×3 group-specific ones = ~19 entries). Consumers filter by `category`:
- `/faq` (full page): all items, optionally grouped by category with a tab/filter (per content-ia-v2.md "เริ่มโปรเจกต์" filter requirement — same UI is reused on `/contact`).
- `/services/[group]` pages: `items.filter(f => f.category === group)`.
- `/contact` ("เริ่มโปรเจกต์"): all items, default view or filtered by tab.
- Home FAQ preview: `items.filter(f => f.featured)`.

### 3.3 `PortfolioItem` — filters + detail page

```ts
export interface PortfolioItem {
  id: string
  title_th: string
  title_en: string
  type: 'own-ip' | 'client'
  filterTags: ('event' | 'ar' | 'animation')[]   // renamed from `tags` for clarity; drives Works filter pills
  featured: boolean
  image: string
  year: number
  desc_th: string       // becomes the full case-study body: โจทย์ → สิ่งที่ทำ → ผลลัพธ์ → เทคโนโลยี
  desc_en: string
  url?: string
  hasDetailPage?: boolean   // true only for Sumeeper — links to /portfolio/[slug]
  slug?: string              // required when hasDetailPage is true
}
```

Works filter set: ทั้งหมด / งานลูกค้า (`type === 'client'`) / IP ของเรา (`type === 'own-ip'`) / Event / AR / Animation (`filterTags`). No CRM/Learning filter (per content-ia-v2.md — no real cases exist yet for those groups).

New route `src/app/[locale]/portfolio/[slug]/page.tsx` for Sumeeper only, modeled on the existing hidden `team/[slug]` pattern (`getPortfolioDetail(slug)` reading `content/portfolio/<slug>.json` for the extended fields: trailer, Steam/itch.io links, dev-log link, full feature list). This is a new content loader function, not a new top-level type — kept minimal since only one item uses it today.

### 3.4 `Award` — populate real data

`content/awards.json` (currently `[]`) gets the 2 real entries from `medream-website-copy.md` §"รางวัลและเวทีที่เราไปร่วม" (Best Game Technical — depa 2026; Digital Startup Grant — depa 2569). The "เวทีที่เราไปออกบูธ" table (5 rows) is a separate concern — extends `Award` with an `eventDates?: string` or is modeled as a second array `content/milestones.json`. **Decision:** add a second type/file rather than overload `Award`:

```ts
export interface Milestone {
  date_th: string   // "15 มกราคม 2569" — kept as display string, not parsed, since Thai Buddhist-era dates mixed with Gregorian in source
  date_en: string
  event_th: string
  event_en: string
  location_th: string
  location_en: string
}
```
`content/milestones.json` — 5 entries from the table in `medream-website-copy.md`.

### 3.5 Site config — no schema change

`content/site.json` already has `vision_th/en` (final) and `pipeline: PipelineStep[]` (currently 5 generic steps) — Phase 6 rewrites `pipeline` to the 4 real Way-of-work steps with descriptions; `PipelineStep` gains `duration_th/en` and `body_th/en` fields (currently just `label_th/en` + `icon`):

```ts
export interface PipelineStep {
  label_th: string       // "Lv.1 รับโจทย์"
  label_en: string
  duration_th: string    // "1–2 ชม."
  duration_en: string
  body_th: string
  body_en: string
  icon: string
}
```

---

## 4. Content Authoring Plan

Per the source docs' own division of labor (the "ผมช่วยได้ไหม" column in `medream-website-content-ia-v2.md` §3 explicitly assigns drafting to Claude for these items from supplied raw data — this is not invented content):

**Draft now, from supplied raw data (mark nothing as TBD):**
- Services 4-group `body`/`forWho`/`bullets` — from IA doc's per-group direction + confirmed bullet points
- Services group FAQ (12 items, 3 per group) — already word-for-word confirmed in `content-ia-v2.md`
- Works: 4 case studies (AR Product Launch, AI Interactive Booth, ททท. Loy Krathong, Sumeeper) — from raw data §7 of `medream-ai-brief.md`
- Way of work full copy (4 steps + durations) — from raw data §8
- FAQ central items 1–6 — confirmed answers in §9

**Must render as explicit "TBD" (not drafted, not guessed):**
- FAQ central item 7 (post-UAT revision policy) — flagged unresolved in source doc §9. Render with a visibly different placeholder state (not a blank answer) so it's obvious in a screenshot/QA pass that it needs input, e.g. a "รอข้อมูลจากทีม" badge instead of prose.
- Award/logo image assets not yet supplied — use existing placeholder image convention already in the repo (check `content/*.example.json` for the pattern used) rather than inventing new ones.
- Linktree page — out of scope entirely (see §8).

---

## 5. Routing & Navigation

| Route | Change |
|---|---|
| `/` | Full rebuild, 9 sections (Phase 2) |
| `/about` | Full rebuild (Phase 3) |
| `/services` | Becomes a landing that lists the 4 groups (cards linking to each), replaces current flat grid (Phase 4) |
| `/services/[group]` | **New dynamic route** (`marketing-event`, `crm`, `learning`, `games`) — one page per group with body/forWho/bullets/FAQ (Phase 4) |
| `/portfolio` | Relabeled "Works" in nav + `<h1>`; filter UI rebuilt (Phase 5) |
| `/portfolio/[slug]` | New — Sumeeper only (Phase 5) |
| `/blog`, `/blog/[slug]` | Nav label → "Insights". No other change; Notion schema Dev-Log/Guide categorization deferred (see §8) |
| `/contact` | Rebuilt into "เริ่มโปรเจกต์" — Way of work (full) + central FAQ (filterable) + expanded form (Phase 6) |
| `/faq` | Kept as standalone full FAQ listing, now with category tabs, sourced from the same `faq.json` (Phase 6, built alongside `/contact` since they share the FAQ-list component) |
| `/careers` | No content change (still empty array) — footer link only, already correctly excluded from main nav |
| `/team/[slug]` | No change |

`content/nav.json` (Phase 1):
```json
{ "items": [
  { "key": "home", "href": "/", ... },
  { "key": "services", "href": "/services", ... },
  { "key": "works", "href": "/portfolio", "label_th": "ผลงาน", "label_en": "Works" },
  { "key": "about", "href": "/about", ... },
  { "key": "insights", "href": "/blog", "label_th": "Insights", "label_en": "Insights" }
]}
```
CTA button "เริ่มโปรเจกต์" → `/contact`, rendered in `NavBar.tsx` separately from the mapped nav items (not a `NavItem`, since it needs the primary-button treatment, not a text link) — add a `ctaHref`/`ctaLabel_th/en` to a new `nav.json` top-level field, or hardcode locale strings via next-intl `messages/*.json` (`nav.cta`). **Decision:** use next-intl messages (`nav.cta_th`/handled via `useTranslations`), consistent with how other UI chrome strings are handled per CLAUDE.md's content-vs-messages split — the CTA label is UI chrome, not page content.

`src/components/layout/Footer.tsx` restructured to: ร่วมงานกับเรา (`/careers`) · FAQ (`/faq`) · social icons (from `site.json` `socials`) · Linktree link placeholder (external, see §8).

---

## 6. Forms & Google Sheets

### 6.1 New form fields (`src/components/shared/ContactForm.tsx`)

| Field | Type | Required | Notes |
|---|---|---|---|
| name | text | ✓ | unchanged |
| company | text | | **new** |
| email | email | ✓ | unchanged |
| phone | tel | | unchanged |
| services | multi-select (checkboxes or multi `<select>`) | ✓ | **changed** from single-select; values = 4 group ids |
| budget | select | | unchanged options |
| timeline | select | | **new** — ภายใน 1 เดือน / 1–3 เดือน / 3 เดือนขึ้นไป / ยังไม่กำหนด |
| message | textarea | | unchanged |
| referral | text or select | | **new** — รู้จักเราจากไหน |

`?service=` query-param pre-fill (used by `ServiceCard`'s CTA) becomes `?services=marketing-event` and pre-checks that one box instead of setting a single value.

### 6.2 API route (`src/app/api/contact/route.ts`) + `src/lib/google-sheets.ts`

`appendContactRow` signature grows to include `company`, `services` (joined `', '`-separated string — Sheets has no native array type), `timeline`, `referral`. Range expands from `Sheet1!A:H` to `Sheet1!A:K` (11 columns: timestamp, name, company, email, phone, services, budget, timeline, message, referral, locale). **This changes the physical sheet layout** — existing header row in the Google Sheet needs manual update by whoever owns that sheet; flagging this as a deploy-time manual step, not something the code migrates automatically (there's no header-write in `appendContactRow` today, so nothing breaks silently, but historical rows won't have the new columns retroactively filled).

`messages/th.json` / `messages/en.json` `contact_form` keys extended for the 3 new fields + the timeline option labels.

---

## 7. Phases

| # | Phase | Key files | Depends on |
|---|---|---|---|
| 0 | Design system | `globals.css`, `src/components/ui/*` (new), `[locale]/layout.tsx` (font links + ScrollBackground removal), delete `ScrollBackground.tsx` + old `/public/fonts/*` | — |
| 1 | Schema + nav foundation | `src/types/content.ts`, `src/lib/content.ts`, `content/nav.json`, `content/awards.json`, `content/milestones.json`, Footer component | 0 |
| 2 | Home rebuild | `src/app/[locale]/page.tsx` + all `src/components/home/*` | 0, 1 |
| 3 | About rebuild | `src/app/[locale]/about/page.tsx`, new `src/components/about/*` | 0, 1 |
| 4 | Services (4 groups) | `content/services.json` (rewrite), `src/app/[locale]/services/page.tsx`, new `services/[group]/page.tsx` | 0, 1, 3.2 (FaqItem) |
| 5 | Works | `content/portfolio.json` (rewrite), `portfolio/page.tsx`, `PortfolioGrid`, new `portfolio/[slug]/page.tsx` | 0, 1 |
| 6 | เริ่มโปรเจกต์ + FAQ | `content/faq.json` (full rewrite), `content/site.json` (`pipeline`), `contact/page.tsx`, `ContactForm.tsx`, `faq/page.tsx`, `google-sheets.ts`, `api/contact/route.ts`, `messages/*.json` | 0, 1, 4 (shares FAQ data/component) |
| 7 | Polish | `generateMetadata` on every touched page, `sitemap.ts` (add the single `/portfolio/sumeeper` entry explicitly to `staticRoutes` — it's one known slug, not a wildcard pattern like `/team/*`), `next-sitemap.config.js` if needed | all |

Each phase is independently shippable/reviewable (own PR-sized unit). Phase 0 is a hard prerequisite for all others since every later phase's components use the new tokens/primitives.

---

## 8. Out of Scope / Backlog (explicitly not part of this spec)

- Linktree page (`/links`) — insufficient detail supplied (ordering given, no page design). Revisit once MeDream provides more direction.
- Notion blog schema changes (Dev Log / Guide category property) — no content exists yet to categorize; do when the first Insights article is written.
- GA4 view/CTA tracking on blog pages — already tracked separately per `[[project_ga4-analytics-pending]]` memory; unrelated to this IA work.
- Careers page content — `content/careers.json` stays `[]`; no design brief given for this pass.
- FAQ central item 7 answer — blocked on MeDream providing UAT revision policy.

---

## 9. Verification

Per phase: `npx tsc --noEmit` (schema/type correctness across all consumers), `pnpm lint`, manual browser check per CLAUDE.md's UI-change guidance (`pnpm dev`, walk the golden path in both `th` and `en`, both color-scheme states). No test suite exists in this repo (confirmed in CLAUDE.md) — verification is type-check + lint + manual pass, not automated tests.

Cross-phase regression risk to watch: Phase 0's token/class removal can silently break pages not yet rebuilt (e.g. `/careers`, `/team/[slug]` still reference old classes like `bg-deep-space`, `text-dawn-gold`, `rounded-xl` after Phase 0 removes those tokens). **Mitigation:** Phase 0 keeps the old token *names* as deprecated aliases pointing at the closest new value (e.g. `--color-dawn-gold: var(--color-first-light)`) until every consumer is migrated in its own phase, then a final cleanup step in Phase 7 removes the aliases and greps for zero remaining references.
