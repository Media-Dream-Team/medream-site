# Phase 4 — Services Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/services` (`src/app/[locale]/services/page.tsx`) as a landing page listing 4 service groups, and add a new `/services/[group]` dynamic route (one page per group with body/forWho/bullets/FAQ), on the Phase 0 design system — replacing the current flat 7-item service grid.

**Architecture:** `content/services.json` moves from a flat `Service[]` array to `{ groups: ServiceGroup[], craft: CraftItem[] }` (per spec §3.1). The 4 groups (`marketing-event`, `crm`, `learning`, `games`) each get body/forWho/bullets/FAQ copy drafted from the IA doc's per-group direction and confirmed bullet points. `src/components/shared/ServiceCard.tsx` (old flat-card component, single remaining consumer today) is deleted and replaced by new page-specific components under `src/components/services/`, mirroring the `src/components/about/*` / `src/components/home/*` per-page-directory pattern established in Phases 2–3. `ContactForm.tsx` and `/contact/page.tsx` — both owned by Phase 6 — get a two-line compile-compat fix only, since `getServices()`'s return shape changes and they're the only other consumer.

**Tech Stack:** Next.js 16 (App Router) + Tailwind CSS v4 + TypeScript + next-intl. No test runner configured — verification is `npx tsc --noEmit` + `pnpm lint` + manual dev-server smoke check.

**Spec:** `docs/superpowers/specs/2026-09-11-website-redesign-ia-v2-design.md` (§3.1 `ServiceGroup`/`CraftItem` schema, §4 content authoring plan, §5 routing table rows `/services` and `/services/[group]`, §6.1 `?service=` param, §7 Phase 4 row). Source copy/direction: `~/Downloads/medream-website-content-ia-v2.md` §"🎮 Services" (group descriptions, confirmed FAQ bullets, credibility rule about CRM/Learning having no real cases yet). Icon/shape rules: `~/Downloads/MEDREAM-DESIGN.md` §4 ("no emoji as icons").

## Global Constraints

- Use only the Phase 0 primitives (`Button`, `Star`, `Badge`, `Card` from `src/components/ui/`) — don't invent ad-hoc styled elements where one already fits.
- Use only new-CI tokens (`text-ink`, `text-fg-2`, `text-fg-3`, `bg-white`, `border-line`, `text-blue`, `font-display`, etc.) — never the deprecated aliases (`text-dream-cream`, `text-dawn-gold`, `bg-deep-space`, `border-nebula`, `text-horizon`, `rounded-xl`, `bg-royal-blue`, `text-electric`).
- No `border-radius` anywhere this phase touches, except the chamfer the `Card` primitive's own default styling already applies.
- No emoji used as icons (`MEDREAM-DESIGN.md` §4). This phase sidesteps the question entirely by following Home's `WeDoSection` precedent of icon-free cards (title + copy + CTA only) — don't add per-group icons.
- **Scope boundary — `ContactForm.tsx` and `/contact/page.tsx` get a minimal compile-compat fix only, not a rebuild.** `getServices()`'s return shape is changing from `Service[]` to `{ groups, craft }`, and these two files are the only consumers of it besides `/services`. Phase 6 owns `ContactForm`'s real rebuild (multi-select services, new `company`/`timeline`/`referral` fields, `?services=` plural param per spec §6.1). This phase changes exactly: `ContactForm`'s prop type from `Service[]` to `ServiceGroup[]` (field names `id`/`title_th`/`title_en` are identical between the two types, so no other line in that file changes), and `contact/page.tsx`'s `getServices()` call to `getServices().groups`. Nothing else in either file.
- **Scope boundary — don't touch `content/faq.json` or `/faq` (`src/app/[locale]/faq/page.tsx`).** Phase 6 owns the central FAQ rewrite. `ServiceGroup.faq` (this phase) is a separate, self-contained embedded array per spec §3.1 — it is not sourced from or written to `content/faq.json`.
- **Content provenance — Services body/forWho/bullets/FAQ are drafted, not fabricated.** Per spec §4 ("Draft now, from supplied raw data, mark nothing as TBD: Services 4-group body/forWho/bullets ... Services group FAQ ... already word-for-word confirmed"), this phase drafts full copy from `medream-website-content-ia-v2.md`'s §"🎮 Services" direction and confirmed bullets — nothing is left as a placeholder. Per that same source doc's explicit credibility rule ("ห้ามใส่เป็น case study ปลอมในหน้า Works เด็ดขาด"), the `crm` and `learning` groups ship `hasCases: false` and their page renders a visible "no real client case yet" disclaimer instead of implying one exists.
- **Known content-count discrepancy, documented not silently resolved:** the spec's prose says "Services group FAQ (12 items, 3 per group)", but the actual raw source (`content-ia-v2.md` §Services, "FAQ เฉพาะกลุ่ม") only confirms 11 bullets: 3 for Marketing & Event, 3 for CRM, **2 for Learning & Training**, 3 for Games & Immersive. This plan uses the real confirmed count — the `learning` group's `faq` array has 2 entries, not 3 — rather than inventing a third Learning FAQ item to match the spec's approximate summary figure.
- Don't touch `content/portfolio.json`, `content/faq.json`, `content/site.json`, `content/team.json`, `/about`, `/blog`, `/faq`, or any `src/components/about/*` or `src/components/home/*` component — none are owned by this phase.

---

## Task 1: `ServiceGroup`/`CraftItem`/`ServicesContent` types + `getServices()` rewrite + `content/services.json` content

**Files:**
- Modify: `src/types/content.ts`
- Modify: `src/lib/content.ts`
- Modify: `content/services.json`

**Interfaces:**
- Produces: `ServiceFaqItem { question_th, question_en, answer_th, answer_en }`, `ServiceGroup { id: 'marketing-event'|'crm'|'learning'|'games'; title_th; title_en; forWho_th; forWho_en; body_th; body_en; bullets_th: string[]; bullets_en: string[]; hasCases: boolean; faq: ServiceFaqItem[] }`, `CraftItem { label_th, label_en }`, `ServicesContent { groups: ServiceGroup[]; craft: CraftItem[] }` — consumed by Task 2 (landing page) and Task 3 (group detail page). `getServices(): ServicesContent` — same `readJson` pattern as every other loader. The old `Service` interface is removed entirely (not kept as a compatibility shim, per CLAUDE.md).

- [ ] **Step 1: Replace `Service` with the new types in `src/types/content.ts`**

Find:
```ts
export interface Service {
  id: string
  icon: string
  title_th: string
  title_en: string
  desc_th: string
  desc_en: string
  cta_th: string
  cta_en: string
}
```
Replace with:
```ts
export interface ServiceFaqItem {
  question_th: string
  question_en: string
  answer_th: string
  answer_en: string
}

export interface ServiceGroup {
  id: 'marketing-event' | 'crm' | 'learning' | 'games'
  title_th: string
  title_en: string
  forWho_th: string
  forWho_en: string
  body_th: string
  body_en: string
  bullets_th: string[]
  bullets_en: string[]
  hasCases: boolean
  faq: ServiceFaqItem[]
}

export interface CraftItem {
  label_th: string
  label_en: string
}

export interface ServicesContent {
  groups: ServiceGroup[]
  craft: CraftItem[]
}
```

- [ ] **Step 2: Update `src/lib/content.ts`**

Update the type import at the top of the file (replace `Service` with `ServicesContent`):
```ts
import type {
  NavConfig, SiteConfig, ServicesContent, PortfolioItem,
  TeamMember, TeamMemberDetail, FaqItem, Award, Milestone, CareerOpening, HomeContent, AboutContent
} from '@/types/content'
```

Find:
```ts
export function getServices(): Service[] {
  return readJson<Service[]>('services.json')
}
```
Replace with:
```ts
export function getServices(): ServicesContent {
  return readJson<ServicesContent>('services.json')
}
```

- [ ] **Step 3: Rewrite `content/services.json`**

Replace the entire file with:
```json
{
  "groups": [
    {
      "id": "marketing-event",
      "title_th": "Marketing & Event",
      "title_en": "Marketing & Event",
      "forWho_th": "แบรนด์และเอเจนซี่ที่ออกบูธ อีเวนต์ หรือแคมเปญที่อยากให้คนมีส่วนร่วมจริง ไม่ใช่แค่ดูป้าย",
      "forWho_en": "Brands and agencies running booths, events, or campaigns who want people to actually participate — not just look at a banner.",
      "body_th": "เกม Event สำหรับบูธที่เล่นจบได้ในไม่กี่นาที ออกแบบมาให้คนแปลกหน้าเล่นได้ทันทีไม่ต้องสอน พร้อมแบบสอบถามแบบ interactive และสื่อโฆษณาเชิงโต้ตอบที่ชวนคนมีส่วนร่วม แล้วเก็บข้อมูลผู้เล่นพร้อมวิเคราะห์ผลให้ในรูปแบบ dashboard",
      "body_en": "Booth games attendees can finish in a few minutes — designed so a total stranger can jump in with zero instructions. Comes with interactive surveys and ad experiences that pull people in, plus player data collection with dashboard analytics.",
      "bullets_th": [
        "เกม Event สั้น เล่นง่าย เล่นจบแจกของหน้างานได้เลย",
        "แบบสอบถาม Interactive สำหรับเก็บข้อมูลและสร้าง engagement",
        "สื่อโฆษณาเชิงโต้ตอบ",
        "เก็บข้อมูลผู้เล่นและวิเคราะห์ผลใน dashboard"
      ],
      "bullets_en": [
        "Short, easy-to-play event games attendees can finish and get a prize on the spot",
        "Interactive surveys for data collection and engagement",
        "Interactive ad media",
        "Player data collection with dashboard analytics"
      ],
      "hasCases": true,
      "faq": [
        {
          "question_th": "เกม Event ที่ทำเล่นยากไหม ต้องมีคนคอยสอนหรือเปล่า?",
          "question_en": "Are the event games hard to play — do attendees need someone to explain the rules?",
          "answer_th": "ไม่ต้องสอนเลย เกมที่ทำเป็นเกมเดี่ยวสั้นๆ เล่นง่าย (เช่น flappy bird, เกมเก็บผลไม้) ออกแบบมาให้คนแปลกหน้าเล่นได้ทันที เล่นจบแจกของหน้างานได้เลย",
          "answer_en": "No instruction needed. We build short, simple single-player games (think flappy-bird-style or fruit-catching games) designed so a complete stranger can pick up and play immediately — finish, and get a prize on the spot."
        },
        {
          "question_th": "ถ้าบูธไม่มีไวไฟหรือเน็ตหลุดๆ จะเล่นได้ไหม?",
          "question_en": "Will the game still work if the booth has no Wi-Fi or a spotty connection?",
          "answer_th": "ได้ปกติ ระบบออกแบบมาให้รองรับสภาพเน็ตหลุดๆ ของหน้างานอยู่แล้ว",
          "answer_en": "Yes — the system is built to handle the unreliable connections typical of event venues."
        },
        {
          "question_th": "หลังงานจบ จะได้ข้อมูลผู้เล่นกลับไปด้วยไหม?",
          "question_en": "After the event, do we get player data back?",
          "answer_th": "ได้ เราเก็บข้อมูลผู้เล่นและวิเคราะห์ผลให้ ดูตัวอย่างจริงได้ในเคส AI Interactive Booth ที่หน้า Works",
          "answer_en": "Yes — we collect player data and provide analysis. See a real example in the AI Interactive Booth case study on the Works page."
        }
      ]
    },
    {
      "id": "crm",
      "title_th": "Brand Engagement & CRM",
      "title_en": "Brand Engagement & CRM",
      "forWho_th": "แบรนด์ที่มีระบบสมาชิก คูปอง หรือสะสมแต้มอยู่แล้ว และอยากใช้เกมเป็นเครื่องมือสร้าง engagement ให้ลูกค้ากลับมาซ้ำ",
      "forWho_en": "Brands that already run a membership, coupon, or points program and want a game to drive repeat engagement.",
      "body_th": "เกม CRM และเกมเลี้ยงสัตว์แบบ template สำเร็จรูปที่ปรับเป็นแบรนด์ของคุณได้ ลูกค้าส่ง asset มาปรับ ใช้เวลาประมาณ 1 สัปดาห์ ทำเร็ว ราคาจับต้องได้ ต่อ API เชื่อมกับระบบ CRM/คูปอง/แต้มเดิมของลูกค้าได้ (ตัวเกมเองไม่มีระบบสะสมแต้มในตัว) — บริการนี้ยังไม่มีลูกค้าจริงใช้งาน ปัจจุบันมี template/demo พร้อมให้ดูตัวอย่าง",
      "body_en": "Ready-made CRM and pet-raising game templates you can re-skin as your own brand — send us your assets and we adapt the template in about a week. Fast turnaround, accessible pricing. We can connect the game to your existing CRM/coupon/points system via API (the game itself doesn't run its own points system). No client has used this service yet — we currently have templates/demos we can show you.",
      "bullets_th": [
        "เกม CRM / เกมเลี้ยงสัตว์แบบ template ปรับแบรนด์ได้ใน ~1 สัปดาห์",
        "ต่อ API เชื่อมระบบ CRM/คูปอง/แต้มเดิมของลูกค้า",
        "ราคาจับต้องได้ เพราะเริ่มจาก template ไม่ใช่งานสร้างใหม่ทั้งหมด"
      ],
      "bullets_en": [
        "CRM / pet-raising game templates rebrandable in ~1 week",
        "API integration with your existing CRM/coupon/points system",
        "Accessible pricing since it starts from a template, not a build-from-scratch"
      ],
      "hasCases": false,
      "faq": [
        {
          "question_th": "เกม CRM นี้มีระบบสะสมแต้มในตัวเลยไหม?",
          "question_en": "Does the CRM game have its own built-in points system?",
          "answer_th": "ไม่มี ตัวเกมเองไม่ได้มีระบบสะสมแต้มในตัว แต่ต่อ API เชื่อมกับระบบ CRM/คูปอง/แต้มเดิมของลูกค้าได้",
          "answer_en": "No — the game itself doesn't include a points system, but it can connect via API to your existing CRM, coupon, or points system."
        },
        {
          "question_th": "ใช้เวลานานแค่ไหนกว่าจะได้เกม CRM แบบแบรนด์ตัวเอง?",
          "question_en": "How long does it take to get a CRM game branded for us?",
          "answer_th": "ประมาณ 1 สัปดาห์ เพราะเริ่มจาก template สำเร็จรูป ลูกค้าส่ง asset มาให้เราปรับเป็นแบรนด์ของคุณ",
          "answer_en": "About a week — we start from a ready-made template, and you send us your brand assets for us to adapt."
        },
        {
          "question_th": "มีเคสลูกค้าจริงที่ใช้บริการนี้แล้วหรือยัง?",
          "question_en": "Has a real client used this service yet?",
          "answer_th": "ยังไม่มีลูกค้าจริงใช้บริการนี้ในตอนนี้ มีแต่ template/demo ที่พร้อมให้ชมเป็นตัวอย่าง",
          "answer_en": "Not yet — no client has used this service so far. We currently have templates/demos available to show as examples."
        }
      ]
    },
    {
      "id": "learning",
      "title_th": "Learning & Training",
      "title_en": "Learning & Training",
      "forWho_th": "องค์กร สถาบันการศึกษา หรือทีม HR ที่ต้องการสื่อการเรียนรู้หรือการฝึกอบรมที่ทำให้คนอยากเรียนต่อ ไม่ใช่แค่นั่งดูสไลด์",
      "forWho_en": "Organizations, schools, or HR teams that want learning or training material people actually want to engage with — not just sit through slides.",
      "body_th": "สื่อการเรียนการสอน simulation และ gamified training ที่ทีมพร้อมออกแบบให้ แม้ยังไม่เคยมีลูกค้าจริงในกลุ่มนี้ ทีมมีความสามารถและพร้อมออกแบบสื่อการเรียนรู้แบบเกมได้เต็มรูปแบบ",
      "body_en": "Educational media, simulations, and gamified training the team is ready to design. While no client has used this service yet, the team has the capability and is ready to build full gamified learning experiences.",
      "bullets_th": [
        "สื่อการเรียนการสอนแบบ interactive",
        "Simulation สำหรับการฝึกอบรม",
        "Gamified training ที่ทำให้คนอยากเรียนต่อ"
      ],
      "bullets_en": [
        "Interactive teaching media",
        "Training simulations",
        "Gamified training that keeps people engaged"
      ],
      "hasCases": false,
      "faq": [
        {
          "question_th": "เคยทำสื่อการเรียนรู้แบบเกมให้ลูกค้าจริงมาก่อนไหม?",
          "question_en": "Has the team built gamified learning material for a real client before?",
          "answer_th": "ยังไม่เคยมีลูกค้าจริงในกลุ่มนี้ แต่ทีมพร้อมออกแบบสื่อการเรียนรู้แบบเกม (gamified) ได้ เขียนไว้ในฐานะความสามารถของทีม ไม่ใช่ผลงานที่ผ่านมา",
          "answer_en": "Not yet with a real client — but the team is ready to design gamified learning media. This is listed as a team capability, not a past project."
        },
        {
          "question_th": "หน้า Works มีตัวอย่างผลงานกลุ่มนี้ให้ดูไหม?",
          "question_en": "Does the Works page have an example from this group?",
          "answer_th": "ไม่มีเคสสำหรับหน้า Works ในกลุ่มนี้เช่นกัน เพราะยังไม่มีลูกค้าจริงที่ใช้บริการนี้",
          "answer_en": "No — there's no case study for this group on the Works page either, since no real client has used this service yet."
        }
      ]
    },
    {
      "id": "games",
      "title_th": "Games & Immersive",
      "title_en": "Games & Immersive",
      "forWho_th": "ธุรกิจหรือทีมที่ต้องการพัฒนาเกม PC/Mobile แบบ custom เต็มรูปแบบ หรือประสบการณ์ AR/VR สำหรับเปิดตัวสินค้าและแคมเปญ",
      "forWho_en": "Businesses and teams who need a fully custom PC/Mobile game, or an AR/VR experience for a product launch or campaign.",
      "body_th": "พัฒนาเกม PC และ Mobile แบบ custom ตั้งแต่ต้นจนจบ พร้อมประสบการณ์ AR และ VR สำหรับแบรนด์ เกม custom ใช้เวลาเฉลี่ย 3–6 เดือนขึ้นกับ scope ทีมโฟกัสที่การพัฒนาเกมให้เสร็จสมบูรณ์ ส่วนเรื่อง publisher หรือช่องทางจัดจำหน่ายลูกค้าต้องหาเอง",
      "body_en": "Full custom PC and Mobile game development from start to finish, plus AR and VR experiences for brands. Custom games typically take 3–6 months depending on scope. The team focuses on getting the game built and finished — publishing and distribution channels are the client's responsibility.",
      "bullets_th": [
        "พัฒนาเกม PC/Mobile แบบ custom เฉลี่ย 3–6 เดือน",
        "ประสบการณ์ AR สำหรับเปิดตัวสินค้า",
        "ประสบการณ์ VR สำหรับแบรนด์และการศึกษา"
      ],
      "bullets_en": [
        "Custom PC/Mobile game development, averaging 3–6 months",
        "AR experiences for product launches",
        "VR experiences for brands and education"
      ],
      "hasCases": true,
      "faq": [
        {
          "question_th": "เกม PC/Mobile แบบ custom ใช้เวลานานแค่ไหน?",
          "question_en": "How long does a custom PC/Mobile game take?",
          "answer_th": "เฉลี่ย 3–6 เดือน ขึ้นกับ scope ของโปรเจกต์",
          "answer_en": "3–6 months on average, depending on the project's scope."
        },
        {
          "question_th": "ช่วยหา publisher หรือช่องทางขายเกมให้ด้วยไหม?",
          "question_en": "Do you help find a publisher or sales channel for the game?",
          "answer_th": "เรื่อง publisher และช่องทางจัดจำหน่าย ลูกค้าต้องหาเอง ทีมโฟกัสที่การพัฒนาเกมให้เสร็จสมบูรณ์",
          "answer_en": "Publishing and distribution channels are the client's responsibility — our team focuses on getting the game built and finished."
        },
        {
          "question_th": "มีผลงานจริงในกลุ่มนี้ให้ดูไหม?",
          "question_en": "Do you have real work in this group we can look at?",
          "answer_th": "มี ดูเคส AR Product Launch ในหน้า Works ที่เป็นผลงานเปิดตัวสินค้าจริง และ Sumeeper ซึ่งเป็น IP เกมของทีมเอง",
          "answer_en": "Yes — see the AR Product Launch case study on the Works page for a real product-launch project, and Sumeeper, our own in-house game IP."
        }
      ]
    }
  ],
  "craft": [
    { "label_th": "2D Animation", "label_en": "2D Animation" },
    { "label_th": "3D Animation", "label_en": "3D Animation" },
    { "label_th": "Game Design", "label_en": "Game Design" },
    { "label_th": "UX/UI", "label_en": "UX/UI" }
  ]
}
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: FAILS — `src/components/shared/ServiceCard.tsx`, `src/app/[locale]/services/page.tsx`, `src/components/shared/ContactForm.tsx`, and `src/app/[locale]/contact/page.tsx` all still reference the now-deleted `Service` type / old `getServices()` shape. This is expected; Tasks 2 and 4 fix these. Confirm the errors are only in those 4 files.

- [ ] **Step 5: Commit**

```bash
git add src/types/content.ts src/lib/content.ts content/services.json
git commit -m "Rewrite services schema to 4 grouped service offerings

Replaces the flat Service[] shape with { groups: ServiceGroup[], craft:
CraftItem[] } per the redesign spec. Group body/forWho/bullets/FAQ
copy is drafted from medream-website-content-ia-v2.md's Services
direction and confirmed FAQ bullets — crm and learning ship
hasCases: false since neither has a real client case yet, per that
doc's own credibility rule against fabricated case studies.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 2: `/services` landing page — `ServiceGroupCard`, `CraftBar`, rebuilt `page.tsx`, delete old `ServiceCard`

**Files:**
- Create: `src/components/services/ServiceGroupCard.tsx`
- Create: `src/components/services/CraftBar.tsx`
- Modify: `src/app/[locale]/services/page.tsx`
- Delete: `src/components/shared/ServiceCard.tsx`

**Interfaces:**
- Consumes: `ServiceGroup`, `CraftItem` (Task 1), `getServices()` (Task 1), `Card` primitive.
- Produces: `ServiceGroupCard({ group, locale }: { group: ServiceGroup; locale: string })`, `CraftBar({ craft, locale }: { craft: CraftItem[]; locale: string })`.

- [ ] **Step 1: Delete the old card, create `ServiceGroupCard.tsx`**

```bash
git rm src/components/shared/ServiceCard.tsx
```

Create `src/components/services/ServiceGroupCard.tsx`:
```tsx
// src/components/services/ServiceGroupCard.tsx
import Link from 'next/link'
import type { ServiceGroup } from '@/types/content'
import { Card } from '@/components/ui/Card'

interface Props {
  group: ServiceGroup
  locale: string
}

export function ServiceGroupCard({ group, locale }: Props) {
  const l = locale as 'th' | 'en'
  return (
    <Link href={`/${locale}/services/${group.id}`} className="block group">
      <Card className="flex flex-col gap-3 h-full group-hover:border-blue transition-colors">
        <h3 className="font-display font-semibold text-ink text-xl">
          {l === 'th' ? group.title_th : group.title_en}
        </h3>
        <p className="text-fg-3 text-xs uppercase tracking-[.08em]">
          {l === 'th' ? group.forWho_th : group.forWho_en}
        </p>
        <p className="text-fg-2 text-sm leading-relaxed flex-1">
          {l === 'th' ? group.body_th : group.body_en}
        </p>
        <span className="font-display font-semibold text-sm text-blue mt-auto">
          {l === 'th' ? 'ดูรายละเอียด →' : 'See details →'}
        </span>
      </Card>
    </Link>
  )
}
```

- [ ] **Step 2: Create `CraftBar.tsx`**

```tsx
// src/components/services/CraftBar.tsx
import type { CraftItem } from '@/types/content'

interface Props {
  craft: CraftItem[]
  locale: string
}

export function CraftBar({ craft, locale }: Props) {
  const l = locale as 'th' | 'en'
  return (
    <div className="border-t border-line pt-8 mt-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center">
      <span className="text-fg-3 text-sm">
        {l === 'th' ? 'ทุกกลุ่มบริการใช้ Craft เดียวกัน:' : 'Every group draws on the same craft:'}
      </span>
      {craft.map((item, i) => (
        <span key={i} className="font-display font-medium text-ink text-sm">
          {l === 'th' ? item.label_th : item.label_en}
          {i < craft.length - 1 && <span className="text-fg-3 ml-3">·</span>}
        </span>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Rewrite `src/app/[locale]/services/page.tsx`**

```tsx
// src/app/[locale]/services/page.tsx
import type { Metadata } from 'next'
import { getServices } from '@/lib/content'
import { ServiceGroupCard } from '@/components/services/ServiceGroupCard'
import { CraftBar } from '@/components/services/CraftBar'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isTh = locale === 'th'
  const title = isTh ? 'บริการ | MeDream Studio' : 'Services | MeDream Studio'
  const description = isTh
    ? 'บริการของ MeDream Studio จัดตามโจทย์ธุรกิจ 4 กลุ่ม: Marketing & Event, Brand Engagement & CRM, Learning & Training, Games & Immersive'
    : 'MeDream Studio services organized around your business need, in 4 groups: Marketing & Event, Brand Engagement & CRM, Learning & Training, Games & Immersive.'
  return {
    title,
    description,
    alternates: {
      canonical: `https://medream-studio.com/${locale}/services`,
      languages: { th: 'https://medream-studio.com/th/services', en: 'https://medream-studio.com/en/services' },
    },
    keywords: isTh
      ? ['บริการ MeDream', 'เกม Event', 'เกม CRM', 'สื่อการเรียนรู้แบบเกม', 'พัฒนาเกม PC Mobile', 'AR VR ไทย', 'Thai Game Studio']
      : ['MeDream Services', 'Event Games', 'CRM Games', 'Gamified Learning', 'PC Mobile Game Development', 'AR VR Thailand', 'Thai Game Studio'],
    openGraph: {
      title,
      description,
      url: `https://medream-studio.com/${locale}/services`,
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'MeDream Studio' }],
    },
  }
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const l = locale as 'th' | 'en'
  const { groups, craft } = getServices()

  return (
    <div className="pt-16">
      <section className="bg-white py-16 md:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-display font-semibold text-ink text-4xl md:text-5xl mb-4">
              {l === 'th' ? 'บริการของเรา' : 'Our Services'}
            </h1>
            <p className="text-fg-2 text-base md:text-lg max-w-2xl mx-auto">
              {l === 'th'
                ? 'จัดตามโจทย์ธุรกิจของคุณ ส่วน AR, VR และแอนิเมชันเป็น "วิธี" ที่เราเสนอให้ ไม่ใช่สิ่งที่คุณต้องรู้ก่อนมาหาเรา'
                : 'Organized around your business need — AR, VR, and animation are the "how" we bring to the table, not something you need to know before reaching out.'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groups.map(group => (
              <ServiceGroupCard key={group.id} group={group} locale={locale} />
            ))}
          </div>
          <CraftBar craft={craft} locale={locale} />
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no NEW errors from these files (the pre-existing `ContactForm.tsx`/`contact/page.tsx` errors from Task 1 remain until Task 4).

- [ ] **Step 5: Commit**

```bash
git add -A src/components/shared/ServiceCard.tsx src/components/services/ServiceGroupCard.tsx src/components/services/CraftBar.tsx "src/app/[locale]/services/page.tsx"
git commit -m "Rebuild /services as a 4-group landing page

Replaces the old flat 7-card grid and ServiceCard (whose CTA
scrolled to a #contact-form anchor Phase 2 removed) with 4 group
cards linking to the new /services/[group] detail routes, plus a
cross-cutting craft bar. New components live under
src/components/services/, matching the about/ and home/ per-page
directory pattern.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 3: `/services/[group]` dynamic route — FAQ accordion, FAQ schema, group detail page

**Files:**
- Create: `src/components/services/ServiceFaqAccordionItem.tsx`
- Create: `src/components/services/ServiceGroupFaqSection.tsx`
- Create: `src/app/[locale]/services/[group]/page.tsx`

**Interfaces:**
- Consumes: `ServiceGroup`, `ServiceFaqItem` (Task 1), `getServices()` (Task 1), `Button` primitive.
- Produces: `ServiceFaqAccordionItem({ item, locale }: { item: ServiceFaqItem; locale: string })`, `ServiceGroupFaqSection({ group, locale }: { group: ServiceGroup; locale: string })`.

- [ ] **Step 1: Create `ServiceFaqAccordionItem.tsx`**

```tsx
// src/components/services/ServiceFaqAccordionItem.tsx
'use client'

import { useState } from 'react'
import type { ServiceFaqItem } from '@/types/content'

interface Props {
  item: ServiceFaqItem
  locale: string
}

export function ServiceFaqAccordionItem({ item, locale }: Props) {
  const [open, setOpen] = useState(false)
  const l = locale as 'th' | 'en'

  return (
    <div className="border-b border-line">
      <button
        className="w-full text-left py-4 flex justify-between items-center gap-4 text-ink font-display font-semibold hover:text-blue transition-colors"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span>{l === 'th' ? item.question_th : item.question_en}</span>
        <span className="text-blue flex-shrink-0 text-xl" aria-hidden="true">
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <p className="pb-4 text-fg-2 leading-relaxed text-sm">
          {l === 'th' ? item.answer_th : item.answer_en}
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create `ServiceGroupFaqSection.tsx`**

Implements the IA doc's explicit requirement ("ใช้ FAQ schema markup เพื่อขึ้น Google featured snippet") via a `FAQPage` JSON-LD block.

```tsx
// src/components/services/ServiceGroupFaqSection.tsx
import type { ServiceGroup } from '@/types/content'
import { ServiceFaqAccordionItem } from './ServiceFaqAccordionItem'

interface Props {
  group: ServiceGroup
  locale: string
}

export function ServiceGroupFaqSection({ group, locale }: Props) {
  const l = locale as 'th' | 'en'
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: group.faq.map(f => ({
      '@type': 'Question',
      name: l === 'th' ? f.question_th : f.question_en,
      acceptedAnswer: {
        '@type': 'Answer',
        text: l === 'th' ? f.answer_th : f.answer_en,
      },
    })),
  }

  return (
    <section className="bg-white pb-16 md:pb-24 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="max-w-3xl mx-auto">
        <h2 className="font-display font-semibold text-ink text-2xl md:text-[28px] mb-8 text-center">
          {l === 'th' ? 'คำถามที่พบบ่อย' : 'Frequently Asked Questions'}
        </h2>
        <div>
          {group.faq.map((item, i) => (
            <ServiceFaqAccordionItem key={i} item={item} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Create `src/app/[locale]/services/[group]/page.tsx`**

```tsx
// src/app/[locale]/services/[group]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getServices } from '@/lib/content'
import { Button } from '@/components/ui/Button'
import { ServiceGroupFaqSection } from '@/components/services/ServiceGroupFaqSection'

const GROUP_IDS = ['marketing-event', 'crm', 'learning', 'games'] as const

export function generateStaticParams() {
  return GROUP_IDS.map(group => ({ group }))
}

function findGroup(group: string) {
  const { groups } = getServices()
  return groups.find(g => g.id === group)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; group: string }>
}): Promise<Metadata> {
  const { locale, group: groupId } = await params
  const group = findGroup(groupId)
  if (!group) return {}
  const isTh = locale === 'th'
  const title = isTh ? `${group.title_th} | MeDream Studio` : `${group.title_en} | MeDream Studio`
  const description = isTh ? group.body_th : group.body_en
  return {
    title,
    description,
    alternates: {
      canonical: `https://medream-studio.com/${locale}/services/${groupId}`,
      languages: {
        th: `https://medream-studio.com/th/services/${groupId}`,
        en: `https://medream-studio.com/en/services/${groupId}`,
      },
    },
    keywords: isTh ? group.bullets_th : group.bullets_en,
    openGraph: {
      title,
      description,
      url: `https://medream-studio.com/${locale}/services/${groupId}`,
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'MeDream Studio' }],
    },
  }
}

export default async function ServiceGroupPage({
  params,
}: {
  params: Promise<{ locale: string; group: string }>
}) {
  const { locale, group: groupId } = await params
  const l = locale as 'th' | 'en'
  const group = findGroup(groupId)
  if (!group) notFound()

  const bullets = l === 'th' ? group.bullets_th : group.bullets_en

  return (
    <div className="pt-16">
      <section className="bg-white pt-16 pb-4 px-4 text-center">
        <Button href={`/${locale}/services`} variant="text" surface="light" className="mb-6 inline-flex">
          {l === 'th' ? '← กลับไปหน้าบริการ' : '← Back to Services'}
        </Button>
        <h1 className="font-display font-semibold text-ink text-4xl md:text-5xl mb-3">
          {l === 'th' ? group.title_th : group.title_en}
        </h1>
        <p className="text-fg-3 text-sm uppercase tracking-[.08em]">
          {l === 'th' ? group.forWho_th : group.forWho_en}
        </p>
      </section>
      <section className="bg-white py-10 px-4">
        <div className="max-w-3xl mx-auto flex flex-col gap-8">
          <p className="text-fg-2 text-base leading-relaxed">
            {l === 'th' ? group.body_th : group.body_en}
          </p>
          <ul className="flex flex-col gap-3">
            {bullets.map((bullet, i) => (
              <li key={i} className="flex gap-3 text-ink">
                <span className="text-blue flex-shrink-0" aria-hidden="true">—</span>
                <span className="text-sm leading-relaxed">{bullet}</span>
              </li>
            ))}
          </ul>
          {!group.hasCases && (
            <p className="text-fg-3 text-sm border-t border-line pt-6">
              {l === 'th'
                ? 'กลุ่มนี้ยังไม่มีเคสลูกค้าจริงในหน้า Works — เราไม่ใส่ผลงานปลอมเพื่อความน่าเชื่อถือ'
                : "This group doesn't have a real client case on the Works page yet — we don't fabricate case studies."}
            </p>
          )}
          <div className="text-center pt-4">
            <Button href={`/${locale}/contact?service=${group.id}`} variant="primary" surface="light">
              {l === 'th' ? 'สนใจบริการนี้' : 'Interested in This Service'}
            </Button>
          </div>
        </div>
      </section>
      <ServiceGroupFaqSection group={group} locale={locale} />
    </div>
  )
}
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no NEW errors from these files (pre-existing `ContactForm.tsx`/`contact/page.tsx` errors remain until Task 4).

- [ ] **Step 5: Commit**

```bash
git add src/components/services/ServiceFaqAccordionItem.tsx src/components/services/ServiceGroupFaqSection.tsx "src/app/[locale]/services/[group]/page.tsx"
git commit -m "Add /services/[group] dynamic route

One page per service group (marketing-event, crm, learning, games)
with forWho/body/bullets/FAQ, a credibility disclaimer for groups
with hasCases: false, and a CTA pre-filling /contact?service=<id>.
FAQ renders with FAQPage JSON-LD schema per the IA doc's featured-
snippet requirement. generateStaticParams pre-renders all 4 groups.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 4: Compile-compat fix for `ContactForm.tsx` and `/contact/page.tsx`

**Files:**
- Modify: `src/components/shared/ContactForm.tsx`
- Modify: `src/app/[locale]/contact/page.tsx`

**Interfaces:**
- Consumes: `ServiceGroup` (Task 1) in place of the removed `Service` type. No other prop, field, or behavior changes — see Global Constraints scope boundary. `ContactForm`'s `?service=` single-value pre-fill (already-existing behavior) keeps working unchanged, and now receives group ids (`marketing-event`/`crm`/`learning`/`games`) from Task 3's CTA links instead of the old flat service ids.

- [ ] **Step 1: Update `ContactForm.tsx`'s type import and prop type**

Find:
```tsx
import type { Service } from '@/types/content'

interface Props {
  services: Service[]
}
```
Replace with:
```tsx
import type { ServiceGroup } from '@/types/content'

interface Props {
  services: ServiceGroup[]
}
```

- [ ] **Step 2: Update `contact/page.tsx`'s `getServices()` call**

Find:
```tsx
  const services = getServices()
```
Replace with:
```tsx
  const services = getServices().groups
```

- [ ] **Step 3: Type-check and lint**

Run: `npx tsc --noEmit` — expected: no errors anywhere in the project.
Run: `pnpm lint` — expected: only the pre-existing `ContactForm.tsx` hooks warning (if any existed before this phase), nothing new.

- [ ] **Step 4: Commit**

```bash
git add src/components/shared/ContactForm.tsx "src/app/[locale]/contact/page.tsx"
git commit -m "Update ContactForm/contact page for the new ServiceGroup shape

Minimal compile-compat fix only — getServices() now returns
{ groups, craft } instead of a flat array. ContactForm's dropdown
now lists the 4 service groups instead of the old 7 flat services;
its single-select behavior and ?service= pre-fill are unchanged.
Phase 6 owns ContactForm's real rebuild (multi-select, new fields).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 5: Sitemap — add the 4 new routes

**Files:**
- Modify: `src/app/sitemap.ts`

**Interfaces:** none (data-only change).

- [ ] **Step 1: Add the 4 group routes to `staticRoutes`**

Find:
```ts
const staticRoutes = ['', '/services', '/portfolio', '/about', '/faq', '/contact', '/blog', '/careers', '/team']
```
Replace with:
```ts
const staticRoutes = [
  '', '/services', '/services/marketing-event', '/services/crm', '/services/learning', '/services/games',
  '/portfolio', '/about', '/faq', '/contact', '/blog', '/careers', '/team',
]
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit` — expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/sitemap.ts
git commit -m "Add /services/[group] routes to sitemap.ts

next-sitemap's postbuild crawl auto-discovers these from the built
site, but the Next.js built-in sitemap.ts (src/app/sitemap.ts) only
lists routes explicitly, per CLAUDE.md's sitemap guidance.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 6: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Final type-check and lint**

Run: `npx tsc --noEmit` — expected: no errors.
Run: `pnpm lint` — expected: no new errors.

- [ ] **Step 2: Confirm no leftover references to removed types/components**

Run: `grep -rn "types/content'.*Service\b\|shared/ServiceCard\|contact-form" src/` — expected: no matches (the `Service` type name should only appear as part of `ServiceGroup`/`ServiceFaqItem`/`ServicesContent`, never standalone).

- [ ] **Step 3: Full Services smoke pass**

Start the dev server (`pnpm dev`), then for each locale (`/th`, `/en`):
- Visit `/services`. Confirm: H1 + subheadline render, 4 group cards render in order (Marketing & Event, Brand Engagement & CRM, Learning & Training, Games & Immersive), each card shows title/forWho/body-excerpt/"See details" link, craft bar renders below with 4 items separated by `·`, no emoji, no rounded corners except the `Card` chamfer.
- Click each of the 4 cards, confirm it navigates to `/services/<group-id>`.
- On each group page, confirm: back link to `/services` works, H1 + forWho render, body paragraph renders, bullets list renders, the `crm` and `learning` pages show the "no real client case yet" disclaimer (and `marketing-event`/`games` do not), the FAQ accordion opens/closes on click, and the CTA button links to `/{locale}/contact?service=<group-id>`.
- Click a group page's CTA button, confirm it lands on `/contact` with that group pre-selected in the service `<select>`, and the dropdown itself now lists exactly the 4 group names (not the old 7 flat services).
- Visit `/services/not-a-real-group` directly — confirm it renders the Next.js 404 page (verifies `notFound()`).
- View page source on one group page and confirm a `<script type="application/ld+json">` block with `"@type":"FAQPage"` is present.
- Resize to mobile width (~400px) and confirm the group grid stacks to 1 column and nothing overflows horizontally.
- No console errors. No regression on `/`, `/about`, `/portfolio`, `/blog`, `/faq`, `/team`, `/careers`.

Stop the dev server after.

---

## Self-Review Notes

- **Spec coverage:** §3.1 `ServiceGroup`/`CraftItem` schema → Task 1. §5 routing table `/services` (landing, 4 group cards) → Task 2. §5 routing table `/services/[group]` (new dynamic route, body/forWho/bullets/FAQ) → Task 3. §6.1 `?service=` pre-fill continuing to work with the new group ids → Tasks 3 (CTA) + 4 (compat fix). IA doc's FAQ-schema-for-snippets requirement → Task 3's `ServiceGroupFaqSection`. IA doc's credibility rule (no fabricated CRM/Learning case studies) → Task 1's `hasCases: false` + Task 3's disclaimer render. Sitemap update requirement (CLAUDE.md) → Task 5.
- **Placeholder scan:** every JSON/TSX code block is complete, no `TBD`/`TODO`. The `learning` group's FAQ intentionally has 2 entries instead of 3 — documented in Global Constraints as a real source-content count, not a gap.
- **Type consistency:** `ServiceGroup`/`ServiceFaqItem`/`CraftItem`/`ServicesContent` (Task 1) field names match exactly how Task 2 (`ServiceGroupCard`, `CraftBar`, landing page), Task 3 (`ServiceFaqAccordionItem`, `ServiceGroupFaqSection`, group detail page), and Task 4 (`ContactForm`) consume them. `getServices()`'s new return shape (`{ groups, craft }`) is destructured/accessed identically everywhere it's called (Tasks 2, 3, 4).
- **Cross-phase coupling, explicitly handled:** `getServices()`'s shape change breaks `ContactForm.tsx`/`contact/page.tsx` compilation — Task 4 fixes this with the smallest possible diff (2 lines total) rather than either leaving the build broken until Phase 6 or scope-creeping into a full ContactForm rebuild that belongs to Phase 6.
- **Known follow-up for Phase 6 (`ContactForm`/`/contact`/`/faq` rebuild):** per spec §6.1, `?service=` (singular) should become `?services=` (plural, multi-select) once ContactForm supports multiple service selections — Task 3's CTA links use the current singular `?service=` param, matching ContactForm's still-single-select behavior post-Task-4. Phase 6 must update both the param name and Task 3's CTA links together when it rebuilds the form.
