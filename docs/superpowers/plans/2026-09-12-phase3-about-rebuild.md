# Phase 3 — About Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fully rebuild `/about` (`src/app/[locale]/about/page.tsx` + new `src/components/about/*`) on the Phase 0 design system and Phase 2's content-modeling pattern, using the finalized story/awards/milestones copy from `medream-website-copy.md` and the IA structure from `medream-website-content-ia-v2.md` §"🌙 About".

**Architecture:** Mirrors Phase 2's approach — one new page-specific content source (`content/about.json` + `AboutContent` type) holds copy that has no existing schema home (the 3-part origin story, the DNA trait list), while data already modeled in earlier phases (`site.json`'s `vision_th/en`, `content/awards.json`, `content/milestones.json`, `content/team.json`) is reused as-is or lightly corrected. `src/components/home/AwardsSection.tsx` — an orphaned component that only `/about` has consumed since Phase 2 removed Home's own awards section — is rebuilt on the new CI and relocated into `src/components/about/`, since it belongs there now.

**Tech Stack:** Next.js 16 (App Router) + Tailwind CSS v4 + TypeScript + next-intl. No test runner configured — verification is `npx tsc --noEmit` + `pnpm lint` + manual/automated content checks.

**Spec:** `docs/superpowers/specs/2026-09-11-website-redesign-ia-v2-design.md` (§3.4 Award/Milestone, §3.5 site config, §5 routing table row `/about` → Phase 3). Source copy: `~/Downloads/medream-website-copy.md` §"หน้า About — เรื่องราวของเรา" and §"หน้า About — รางวัลและเวทีที่เราไปร่วม" (both marked ✅ ready). IA structure: `~/Downloads/medream-website-content-ia-v2.md` §"🌙 About". Vision copy: `~/Downloads/medream-ai-brief.md` §6 ("Vision (ฟายนอล)").

## Global Constraints

- Use only the Phase 0 primitives (`Button`, `Star`, `Badge`, `Card` from `src/components/ui/`) — don't invent ad-hoc styled elements where one already fits.
- Use only new-CI tokens (`text-ink`, `text-fg-2`, `text-fg-3`, `bg-white`, `border-line`, `text-blue`, etc.) — never the deprecated aliases (`text-dream-cream`, `text-dawn-gold`, `bg-deep-space`, `border-nebula`, `text-horizon`, `rounded-xl`). Every file this phase touches must be fully migrated, no mixed old/new classes.
- No `border-radius` anywhere this phase touches, except the chamfer the `Card` primitive's own `featured` prop already applies — don't hand-add rounded corners.
- No emoji used as icons (MEDREAM-DESIGN.md §4) — the Team section's anonymized avatar is a plain inline SVG line icon (2px stroke), not an emoji.
- **Scope boundary — do not touch `/team` (`src/app/[locale]/team/page.tsx`) or `/team/[slug]` (`src/app/[locale]/team/[slug]/page.tsx`).** The design spec's routing table (§5) explicitly lists `/team/[slug]` as "No change" and never mentions the bare `/team` list route at all across any phase — both are left exactly as they are. This phase adds a *new*, separate team showcase directly on the About page (per the IA doc's own structure, which folds "ทีม" into About rather than giving it a nav-linked page of its own) using the same `getTeamMembers()` data, but does not modify, delete, or redirect the existing routes.
- **Scope boundary — only update `site.json`'s `vision_th/en`, not `mission_th/en`.** `medream-ai-brief.md` §6 gives one explicitly-labeled "final" Vision paragraph; no equivalent finalized Mission copy exists anywhere in the source docs (confirmed by an exhaustive search for "mission"/"พันธกิจ" across all four source files — the only other hit is a checklist row marking "Vision/Mission" done as one combined item, with no separate Mission text ever given). Per the project's no-invented-content rule, `mission_th/en` keeps its current (pre-existing, if generic) value; only `vision_th/en` — which has a real, sourced, explicitly-final replacement — is corrected.
- **Scope boundary — Awards and Milestones render as two separate sections, not one merged/interleaved timeline.** This matches `medream-website-copy.md`'s own structure (it lists "รางวัลและทุนสนับสนุน" and "เวทีที่เราไปออกบูธ" as two distinct lists under one heading, not one chronological feed) and respects the spec's own caveat on `Milestone.date_th/en` (§3.4: "kept as display string, not parsed, since Thai Buddhist-era dates mixed with Gregorian in source") — there is no reliable way to interleave award years with milestone display-string dates by actual chronology, so this phase doesn't attempt it. Each list renders in its JSON array's existing order (milestones' order is already chronological, per Phase 1's final-review sort fix).
- Don't touch `content/services.json`, `content/faq.json`, `content/portfolio.json`, `content/site.json`'s `pipeline`/`mission_th/en` fields, `content/team.json`'s shape, or any `src/components/shared/*` component — none are owned by this phase.

---

## Task 1: `AboutContent` type + `content/about.json` + `getAboutContent()`

**Files:**
- Modify: `src/types/content.ts`
- Modify: `src/lib/content.ts`
- Create: `content/about.json`

**Interfaces:**
- Produces: `AboutStorySection { heading_th, heading_en, body_th, body_en }`, `AboutContent { story: AboutStorySection[]; dna: string[] }` — consumed by Task 3 (`StorySection`) and Task 5 (`DnaSection`). `getAboutContent(): AboutContent` — reads `content/about.json`, same `readJson` pattern as every other loader.

- [ ] **Step 1: Add the types to `src/types/content.ts`**

Add at the end of the file:

```ts
export interface AboutStorySection {
  heading_th: string
  heading_en: string
  body_th: string
  body_en: string
}

export interface AboutContent {
  story: AboutStorySection[]
  dna: string[]
}
```

- [ ] **Step 2: Add `getAboutContent()` to `src/lib/content.ts`**

Update the type import at the top of the file to add `AboutContent`:

```ts
import type {
  NavConfig, SiteConfig, Service, PortfolioItem,
  TeamMember, TeamMemberDetail, FaqItem, Award, Milestone, CareerOpening, HomeContent, AboutContent
} from '@/types/content'
```

Add the loader function directly after `getHomeContent()`:

```ts
export function getAboutContent(): AboutContent {
  return readJson<AboutContent>('about.json')
}
```

- [ ] **Step 3: Create `content/about.json`**

The English text below is a faithful direct translation of the Thai (already-approved) copy — following the same established pattern used throughout this project's content files, where an English rendering is authored alongside Thai source copy rather than left blank.

```json
{
  "story": [
    {
      "heading_th": "ที่มา",
      "heading_en": "Where It Started",
      "body_th": "ปี 2024 กลุ่มเพื่อนที่เรียนจบคณะทำเกมด้วยกัน ชวนกันลาออกจากงานประจำ มารวมตัวทำเกมในฝัน\n\nเริ่มจากสิ่งเล็กๆ ที่ทำให้เสร็จได้จริงก่อน หยิบเกม Minesweeper ที่ชอบเล่นมาผสมกับระบบต่อสู้ Auto-battle จนกลายเป็น Sumeeper",
      "body_en": "In 2024, a group of friends who studied game development together decided to leave their day jobs and come together to build the game they'd always dreamed of.\n\nThey started small, with something they could actually finish — taking Minesweeper, a game they loved, and combining it with an auto-battle combat system. That became Sumeeper."
    },
    {
      "heading_th": "จากเกมเล็กๆ สู่ทีมที่ได้รับการยอมรับ",
      "heading_en": "From a Small Game to a Recognized Team",
      "body_th": "จากเกมที่แค่อยากทำให้เสร็จ Sumeeper พาทีมไปไกลกว่าที่คิดไว้เยอะ ทั้งรางวัล Best Game Technical จาก Thai Digital Content Go Global Accelerator Program โดย depa ทุนสนับสนุน Digital Startup Grant และโอกาสได้ออกบูธในงานเกมระดับประเทศหลายเวที\n\nปัจจุบัน MeDream คือทีมที่มีประสบการณ์ด้านการทำเกมครบวงจร ไม่ว่าจะเป็น Game Design, 2D/3D Artist, UX/UI, Developer, QA, Technical Art\n\nพวกเราหวังเป็นอย่างยิ่งว่า จะได้ผลิตผลงานที่มีคุณภาพ และส่งมอบคุณค่าของสิ่งที่เราทำให้กับทุกคน",
      "body_en": "What started as a game they just wanted to finish took the team much further than expected — winning the Best Game Technical award from the Thai Digital Content Go Global Accelerator Program by depa, a Digital Startup Grant, and the chance to exhibit at several national game events.\n\nToday, MeDream is a team with end-to-end game development experience — Game Design, 2D/3D Art, UX/UI, Development, QA, and Technical Art.\n\nWe hope to keep producing quality work and delivering real value to everyone we work with."
    },
    {
      "heading_th": "จุดเริ่มต้นของการทำเกมเพื่อการตลาด",
      "heading_en": "How We Got Into Marketing Games",
      "body_th": "พอเริ่มออกงานและเจอลูกค้าจริง ก็ยิ่งเห็นชัดว่าเกมไม่ได้มีไว้แค่เล่นสนุกคนเดียว มันชวนคนเข้ามามีส่วนร่วมได้ดีกว่าสื่อแบบเดิมๆ เยอะ บวกกับผู้ก่อตั้งมีพื้นฐานสาย Project Management และการตลาด e-commerce มาก่อน เลยมองเห็นโอกาสที่จะเอาความสนุกของเกมมาช่วยธุรกิจอื่นสร้าง engagement และวัดผลได้จริง\n\nนี่คือที่มาของชื่อ MeDream — คำว่า \"Me (มี)\" ในภาษาไทย ผสานกับคำว่า \"Dream (ความฝัน)\" ซึ่งสะท้อนความตั้งใจที่อยากทำให้ความฝันที่มี เกิดขึ้นได้จริง",
      "body_en": "As the team started exhibiting and meeting real clients, it became clear that games aren't just for playing alone — they draw people in far better than traditional media. Combined with the founder's background in project management and e-commerce marketing, the team saw an opportunity to use the fun of games to help other businesses build engagement and measure real results.\n\nThis is where the name MeDream comes from — the Thai word \"Me (มี, meaning 'to have')\" combined with \"Dream,\" reflecting the intention to make the dreams we have become real."
    }
  ],
  "dna": ["Creative", "Gamer", "Storyteller"]
}
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/types/content.ts src/lib/content.ts content/about.json
git commit -m "Add AboutContent type/loader and content/about.json

Holds About-specific copy with no existing schema home (the 3-part
origin story, the DNA trait list) — mirrors Phase 2's home.json
pattern. English body text is a direct translation of the approved
Thai copy from medream-website-copy.md, same convention used
throughout this project's content files.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 2: Correct `site.json`'s `vision_th`/`vision_en`

**Files:**
- Modify: `content/site.json`

**Interfaces:**
- Produces: `site.vision_th/en` updated to the finalized text — consumed by Task 4 (`VisionMissionSection`). `mission_th/en` is deliberately left untouched (see Global Constraints).

- [ ] **Step 1: Update `vision_th`/`vision_en` in `content/site.json`**

Find:
```json
  "vision_th": "เป็นสตูดิโอสร้างสรรค์ชั้นนำที่ทำให้แบรนด์มีชีวิต",
  "vision_en": "To be a leading creative studio that brings brands to life",
```
Replace with:
```json
  "vision_th": "MeDream คือสตูดิโอที่ผสานความคิดสร้างสรรค์เข้ากับเทคโนโลยี เราสร้างเกมและสื่ออินเทอร์แอคทีฟไม่ใช่เพื่อความสนุก แต่สามารถนำไปใช้กับการตลาดและวัดผลได้ ซึ่งเปลี่ยนจินตนาการ ให้กลายเป็นประสบการณ์ที่จับต้องได้จริง",
  "vision_en": "MeDream is a studio that blends creativity with technology. We build games and interactive media not just for fun, but so they can be put to work in marketing and measured — turning imagination into a tangible, real experience.",
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit` — expected: no errors (JSON content, doesn't affect types).

- [ ] **Step 3: Commit**

```bash
git add content/site.json
git commit -m "Correct site.json vision to the finalized copy

The previous vision_th/en was stale placeholder text from the
original build; medream-ai-brief.md §6 gives an explicitly-labeled
'final' Vision paragraph that was never actually applied to the
content file until now. mission_th/en is untouched — no equivalent
finalized Mission copy exists in any source doc.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 3: New `src/components/about/StorySection.tsx`

**Files:**
- Create: `src/components/about/StorySection.tsx`

**Interfaces:**
- Consumes: `AboutContent.story` (Task 1).
- Produces: `StorySection({ story, locale }: { story: AboutStorySection[]; locale: string })`.

- [ ] **Step 1: Create the file**

```tsx
// src/components/about/StorySection.tsx
import type { AboutStorySection } from '@/types/content'

interface Props {
  story: AboutStorySection[]
  locale: string
}

export function StorySection({ story, locale }: Props) {
  const l = locale as 'th' | 'en'
  return (
    <section className="bg-white py-16 md:py-24 px-4">
      <div className="max-w-3xl mx-auto flex flex-col gap-12">
        {story.map((section, i) => (
          <div key={i}>
            <h2 className="font-display font-semibold text-ink text-2xl md:text-[28px] mb-4">
              {l === 'th' ? section.heading_th : section.heading_en}
            </h2>
            <p className="text-fg-2 text-base leading-relaxed whitespace-pre-line">
              {l === 'th' ? section.body_th : section.body_en}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit` — expected: no errors at all (this file is new and not yet imported by `page.tsx`, so it introduces nothing, broken or otherwise).

- [ ] **Step 3: Commit**

```bash
git add src/components/about/StorySection.tsx
git commit -m "Add About StorySection

Renders the 3-part origin story from content/about.json.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 4: New `src/components/about/VisionMissionSection.tsx`

**Files:**
- Create: `src/components/about/VisionMissionSection.tsx`

**Interfaces:**
- Consumes: `SiteConfig.vision_th/en` (Task 2), `SiteConfig.mission_th/en` (unchanged), `Card` primitive.
- Produces: `VisionMissionSection({ site, locale }: { site: SiteConfig; locale: string })`.

- [ ] **Step 1: Create the file**

```tsx
// src/components/about/VisionMissionSection.tsx
import type { SiteConfig } from '@/types/content'
import { Card } from '@/components/ui/Card'

interface Props {
  site: SiteConfig
  locale: string
}

export function VisionMissionSection({ site, locale }: Props) {
  const l = locale as 'th' | 'en'
  return (
    <section className="bg-white pb-16 md:pb-24 px-4">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-display font-semibold text-ink text-xl mb-3">
            {l === 'th' ? 'วิสัยทัศน์' : 'Vision'}
          </h2>
          <p className="text-fg-2 leading-relaxed">
            {l === 'th' ? site.vision_th : site.vision_en}
          </p>
        </Card>
        <Card>
          <h2 className="font-display font-semibold text-ink text-xl mb-3">
            {l === 'th' ? 'พันธกิจ' : 'Mission'}
          </h2>
          <p className="text-fg-2 leading-relaxed">
            {l === 'th' ? site.mission_th : site.mission_en}
          </p>
        </Card>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit` — expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/about/VisionMissionSection.tsx
git commit -m "Add About VisionMissionSection

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 5: New `src/components/about/DnaSection.tsx`

**Files:**
- Create: `src/components/about/DnaSection.tsx`

**Interfaces:**
- Consumes: `AboutContent.dna` (Task 1), `Card`, `Star` primitives.
- Produces: `DnaSection({ about }: { about: AboutContent })` — no `locale` needed since `dna` entries are locale-invariant (same words in both languages, matching Home's identical `dream.dna` precedent).

- [ ] **Step 1: Create the file**

```tsx
// src/components/about/DnaSection.tsx
import type { AboutContent } from '@/types/content'
import { Card } from '@/components/ui/Card'
import { Star } from '@/components/ui/Star'

interface Props {
  about: AboutContent
}

export function DnaSection({ about }: Props) {
  return (
    <section className="bg-white pb-16 md:pb-24 px-4">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {about.dna.map(trait => (
          <Card key={trait} featured className="text-center flex flex-col items-center gap-3">
            <Star className="w-6 h-6 text-blue" />
            <p className="font-display font-semibold text-ink text-lg">{trait}</p>
          </Card>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit` — expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/about/DnaSection.tsx
git commit -m "Add About DnaSection

Three 'class cards' (Creative / Gamer / Storyteller) per the IA doc's
game-flavored framing, using the Card featured chamfer + Star primitive.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 6: New `src/components/about/TeamSection.tsx`

**Files:**
- Create: `src/components/about/TeamSection.tsx`

**Interfaces:**
- Consumes: `getTeamMembers()` (pre-existing, `src/lib/content.ts`), `TeamMember` type (pre-existing), `Button` primitive.
- Produces: `TeamSection({ members, locale }: { members: TeamMember[]; locale: string })`.

**Context:** Per the IA doc ("ทีม: ไม่โชว์หน้า → ใช้ avatar/ไอคอน + บทบาท + ผลงานที่รับผิดชอบ"), this section deliberately does **not** render `member.photo` — it uses a generic anonymized line-icon avatar instead. "ผลงานที่รับผิดชอบ" (the work each person is responsible for) is already fully modeled on the existing, untouched `/team/[slug]` detail pages (`TeamMemberDetail.works`) — this section links out to that existing page rather than duplicating that data inline, reusing 100% pre-existing infrastructure with zero schema changes.

- [ ] **Step 1: Create the file**

```tsx
// src/components/about/TeamSection.tsx
import type { TeamMember } from '@/types/content'
import { Button } from '@/components/ui/Button'

interface Props {
  members: TeamMember[]
  locale: string
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  )
}

export function TeamSection({ members, locale }: Props) {
  const l = locale as 'th' | 'en'
  return (
    <section className="bg-white pb-16 md:pb-24 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display font-semibold text-ink text-2xl md:text-[28px] mb-10 text-center">
          {l === 'th' ? 'ทีมงาน' : 'Our Team'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {members.map(member => (
            <div key={member.slug} className="border border-line p-6 text-center flex flex-col items-center gap-2">
              <div className="text-blue">
                <PersonIcon />
              </div>
              <p className="font-display font-semibold text-ink">{member.name}</p>
              <p className="text-fg-2 text-sm">
                {l === 'th' ? member.role_th : member.role_en}
              </p>
              <Button href={`/${locale}/team/${member.slug}`} variant="text" surface="light">
                {l === 'th' ? 'ดูผลงาน' : 'View Portfolio'}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit` — expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/about/TeamSection.tsx
git commit -m "Add About TeamSection

Anonymized icon+role showcase per the IA's 'ไม่โชว์หน้า' direction
(no real photos) — links each card to the existing, unchanged
/team/[slug] detail page for their actual work, rather than
duplicating that data here.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 7: Rebuild `src/components/home/AwardsSection.tsx` → `src/components/about/AwardsSection.tsx`

**Files:**
- Delete: `src/components/home/AwardsSection.tsx`
- Create: `src/components/about/AwardsSection.tsx`

**Interfaces:**
- Consumes: `getAwards()` (pre-existing), `Award` type (pre-existing), `Badge` primitive.
- Produces: `AwardsSection({ awards, locale }: { awards: Award[]; locale: string })` — same prop shape as the component it replaces, just relocated and restyled.

**Context:** `src/components/home/AwardsSection.tsx` is confirmed (via repo-wide grep) to have exactly one consumer today: `src/app/[locale]/about/page.tsx` — Home stopped using it in Phase 2. It lives in the wrong directory and is still on the old CI (`bg-deep-space`, `rounded-xl`, `text-dawn-gold`). This task moves and rebuilds it; Task 9 updates the one call site.

- [ ] **Step 1: Delete the old file, create the new one**

```bash
git rm src/components/home/AwardsSection.tsx
```

Create `src/components/about/AwardsSection.tsx`:

```tsx
// src/components/about/AwardsSection.tsx
import type { Award } from '@/types/content'
import { Badge } from '@/components/ui/Badge'

interface Props {
  awards: Award[]
  locale: string
}

export function AwardsSection({ awards, locale }: Props) {
  const l = locale as 'th' | 'en'
  if (awards.length === 0) return null
  return (
    <section className="bg-white pb-16 md:pb-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-display font-semibold text-ink text-2xl md:text-[28px] mb-8 text-center">
          {l === 'th' ? 'รางวัลและทุนสนับสนุน' : 'Awards & Grants'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {awards.map((award, i) => (
            <div key={i} className="border border-line p-5 flex flex-col gap-2">
              <Badge className="self-start">{award.year}</Badge>
              <p className="font-display font-semibold text-ink">
                {l === 'th' ? award.name_th : award.name_en}
              </p>
              <p className="text-fg-2 text-sm">{award.event}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit` — expected: this WILL fail now, because `about/page.tsx` still imports the deleted `@/components/home/AwardsSection`. This is expected — Task 9 (the final reassembly) fixes it. Confirm the only new error is that stale import.

- [ ] **Step 3: Commit**

```bash
git add -A src/components/home/AwardsSection.tsx src/components/about/AwardsSection.tsx
git commit -m "Relocate and rebuild AwardsSection into src/components/about/

Home stopped using this component in Phase 2 — About was its only
remaining consumer, and it was still on the old CI. Same prop shape,
new tokens, new home under src/components/about/.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 8: New `src/components/about/MilestonesSection.tsx`

**Files:**
- Create: `src/components/about/MilestonesSection.tsx`

**Interfaces:**
- Consumes: `getMilestones()` (pre-existing, Phase 1), `Milestone` type (pre-existing).
- Produces: `MilestonesSection({ milestones, locale }: { milestones: Milestone[]; locale: string })`.

- [ ] **Step 1: Create the file**

```tsx
// src/components/about/MilestonesSection.tsx
import type { Milestone } from '@/types/content'

interface Props {
  milestones: Milestone[]
  locale: string
}

export function MilestonesSection({ milestones, locale }: Props) {
  const l = locale as 'th' | 'en'
  if (milestones.length === 0) return null
  return (
    <section className="bg-white pb-16 md:pb-24 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-display font-semibold text-ink text-2xl md:text-[28px] mb-8 text-center">
          {l === 'th' ? 'เวทีที่เราไปออกบูธ' : 'Featured At'}
        </h2>
        <div className="flex flex-col">
          {milestones.map((m, i) => (
            <div key={i} className="flex flex-col sm:flex-row gap-1 sm:gap-4 border-t border-line py-4 first:border-t-0">
              <p className="text-fg-3 text-sm font-display font-medium sm:w-40 sm:flex-shrink-0">
                {l === 'th' ? m.date_th : m.date_en}
              </p>
              <div>
                <p className="font-display font-semibold text-ink">
                  {l === 'th' ? m.event_th : m.event_en}
                </p>
                <p className="text-fg-2 text-sm">
                  {l === 'th' ? m.location_th : m.location_en}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit` — expected: no NEW errors beyond the pre-existing `page.tsx` breakage from Task 7.

- [ ] **Step 3: Commit**

```bash
git add src/components/about/MilestonesSection.tsx
git commit -m "Add About MilestonesSection

Renders the 5 event/booth appearances from content/milestones.json
(Phase 1) as a simple date/event/location list, in the JSON's
existing (already chronological) order — not date-parsed or merged
with Awards, per this phase's documented scope boundary.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 9: Reassemble `src/app/[locale]/about/page.tsx`

**Files:**
- Modify: `src/app/[locale]/about/page.tsx`

**Interfaces:**
- Consumes: all 6 new/rebuilt components from Tasks 3–8, `getSiteConfig()`, `getAboutContent()`, `getAwards()`, `getMilestones()`, `getTeamMembers()` (all pre-existing after Task 1).
- Produces: no change to `generateMetadata` (out of scope for this phase — kept exactly as it is today).

- [ ] **Step 1: Replace `src/app/[locale]/about/page.tsx`**

```tsx
// src/app/[locale]/about/page.tsx
import type { Metadata } from 'next'
import { getSiteConfig, getAboutContent, getAwards, getMilestones, getTeamMembers } from '@/lib/content'
import { StorySection } from '@/components/about/StorySection'
import { VisionMissionSection } from '@/components/about/VisionMissionSection'
import { DnaSection } from '@/components/about/DnaSection'
import { TeamSection } from '@/components/about/TeamSection'
import { AwardsSection } from '@/components/about/AwardsSection'
import { MilestonesSection } from '@/components/about/MilestonesSection'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isTh = locale === 'th'
  const title = isTh ? 'เกี่ยวกับเรา | MeDream Studio' : 'About Us | MeDream Studio'
  const description = isTh
    ? 'MeDream Studio คือทีมสร้างสรรค์ที่รวมนักออกแบบ นักพัฒนา และนักเล่าเรื่อง สร้างประสบการณ์ดิจิทัลที่น่าจดจำ'
    : 'MeDream Studio is a creative team of designers, developers, and storytellers building memorable digital experiences in Thailand.'
  return {
    title,
    description,
    alternates: {
      canonical: `https://medream-studio.com/${locale}/about`,
      languages: { th: 'https://medream-studio.com/th/about', en: 'https://medream-studio.com/en/about' },
    },
    keywords: isTh
      ? ['MeDream Studio คือ', 'ทีมพัฒนาเกมไทย', 'Thai Game Dev Team', 'Unity Dev Team', 'Media Studio ไทย', 'ครีเอทีฟสตูดิโอ', 'Media Dream Team']
      : ['About MeDream', 'Thai Game Dev Team', 'Unity Dev Team', 'Media Studio Thailand', 'Creative Studio', 'Media Dream Team'],
    openGraph: {
      title,
      description,
      url: `https://medream-studio.com/${locale}/about`,
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'MeDream Studio' }],
    },
  }
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const l = locale as 'th' | 'en'
  const site = getSiteConfig()
  const about = getAboutContent()
  const awards = getAwards()
  const milestones = getMilestones()
  const members = getTeamMembers()

  return (
    <div className="pt-16">
      <section className="bg-white pt-16 pb-4 px-4 text-center">
        <h1 className="font-display font-semibold text-ink text-4xl md:text-5xl">
          {l === 'th' ? 'เกี่ยวกับเรา' : 'About Us'}
        </h1>
      </section>
      <StorySection story={about.story} locale={locale} />
      <VisionMissionSection site={site} locale={locale} />
      <DnaSection about={about} />
      <TeamSection members={members} locale={locale} />
      <AwardsSection awards={awards} locale={locale} />
      <MilestonesSection milestones={milestones} locale={locale} />
    </div>
  )
}
```

- [ ] **Step 2: Type-check and lint**

Run: `npx tsc --noEmit` — expected: no errors. This is the first point since Task 7 where the whole build type-checks cleanly again.
Run: `pnpm lint` — expected: only the pre-existing `ContactForm.tsx` hooks error, nothing new.

- [ ] **Step 3: Commit**

```bash
git add "src/app/[locale]/about/page.tsx"
git commit -m "Reassemble About page with all 6 rebuilt sections

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 10: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Final type-check and lint**

Run: `npx tsc --noEmit` — expected: no errors.
Run: `pnpm lint` — expected: only the pre-existing `ContactForm.tsx` error, nothing new.

- [ ] **Step 2: Confirm the relocated AwardsSection has no leftover references**

Run: `grep -rn "components/home/AwardsSection" src/` — expected: no matches at all.

- [ ] **Step 3: Full About smoke pass**

Start the dev server, visit `/th/about` and `/en/about`. For each locale, scroll top to bottom and confirm:
- H1 "เกี่ยวกับเรา"/"About Us" renders below the fixed nav (not overlapped).
- Story: 3 headed sections render with the correct Thai/English body text from `content/about.json`, line breaks preserved.
- Vision/Mission: two cards, Vision showing the new finalized copy, Mission showing its existing (unchanged) copy.
- DNA: 3 chamfered cards — Creative, Gamer, Storyteller — each with a star icon.
- Team: shows the current `content/team.json` entries with a generic person icon (no real photo), name, role, and a "ดูผลงาน"/"View Portfolio" link that correctly opens `/{locale}/team/{slug}`.
- Awards: 2 awards render with year badge, name, and event.
- Milestones: 5 events render in date order with location.
- No console errors, no deprecated-CI classes, no rounded corners except the DNA cards' chamfer.
- No regression on `/team`, `/team/[slug]`, `/careers`, or any other untouched page.

Stop the dev server after.

---

## Self-Review Notes

- **Spec coverage:** IA doc's About bullets (เรื่องราว, Vision/Mission, DNA, ทีม, รางวัล & งานที่เข้าร่วม) → Tasks 3, 4, 5, 6, 7+8 respectively. Vision correction → Task 2. AwardsSection relocation (an unplanned but necessary cleanup discovered while researching this phase, since it was the sole surviving consumer of a Home-directory component) → Task 7.
- **Placeholder scan:** every JSON/JSX code block is complete, no `TBD`/`TODO`. `content/team.json` currently has only one placeholder-looking entry — this phase does not fabricate additional team members; `TeamSection` renders whatever real data exists, today or later, without guessing headcount.
- **Type consistency:** `AboutContent`'s fields (Task 1) match exactly how Tasks 3 and 5 consume them (`story[].heading_th/en/body_th/en`, `dna: string[]`) and how Task 9's `page.tsx` passes them through. All 6 section components' prop signatures (Tasks 3–8) match exactly how Task 9 calls them.
- **Known follow-ups, explicitly not silently dropped:** `mission_th/en` stays generic pending real Mission copy from the user. `/team` and `/team/[slug]` remain on the old CI and outside this phase's routing changes, exactly as the design spec's own routing table specifies for `/team/[slug]` and as this phase infers by extension for the unmentioned `/team` list route.
