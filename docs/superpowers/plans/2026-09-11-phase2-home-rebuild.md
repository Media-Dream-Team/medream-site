# Phase 2 — Home Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fully rebuild the Home page (`src/app/[locale]/page.tsx` + all `src/components/home/*`) on the Phase 0 design system and Phase 1 nav foundation, using the finalized 9-section copy from `medream-website-copy.md`, and remove the tsparticles hero in favor of a CI-compliant static treatment.

**Architecture:** Home becomes 9 section components, each reading real content instead of hardcoded strings. One new content file (`content/home.json` + `HomeContent` type) holds every piece of Home-specific copy that doesn't already have a schema home (hero sub-headline, "We Dream" body, service-preview cards, works teasers, trusted-by extras, way-of-work short steps, FAQ preview, final CTA copy) — kept separate from `services.json`, `faq.json`, `portfolio.json`, and `site.json.pipeline` specifically because those files are each owned by a *later* phase (4, 6, 6, 5) that will do its own full rewrite; duplicating a small amount of already-approved copy into `home.json` now avoids Phase 2 either blocking on those phases or half-migrating a schema it doesn't own. `site.json`'s existing `tagline_th/en` field is reused (updated in place) for the Hero headline since it already fans out correctly to Footer and root metadata. `content/awards.json` and `content/milestones.json` (both populated in Phase 1) are reused as-is for the new "Trusted by" section — no new award/event data invented.

**Tech Stack:** Next.js 16 (App Router) + Tailwind CSS v4 + TypeScript + next-intl. No test runner configured — verification is `npx tsc --noEmit` + `pnpm lint` + manual browser checks.

**Spec:** `docs/superpowers/specs/2026-09-11-website-redesign-ia-v2-design.md` (§2 Design System, §5 Routing table row `/` → Phase 2, §7 phase table). Source copy: `~/Downloads/medream-website-copy.md` §"หน้า Home" (9 sections, all marked ✅ ready). Source raw data: `~/Downloads/medream-ai-brief.md` §7 (Works case studies), §9 (confirmed FAQ answers). Design rules: `~/Downloads/MEDREAM-DESIGN.md` (color ratio, gradient rule, motion rule, contrast table), `~/Downloads/medream-tokens.css` (semantic token reference).

## Global Constraints

- Use only the Phase 0 primitives (`Button`, `Star`, `Badge`, `Card`, `LevelBadge` from `src/components/ui/`) — don't invent ad-hoc styled elements where one already fits.
- Use only new-CI tokens (`text-white`, `text-ink`, `text-fg-2`, `text-fg-3`, `text-mist`, `text-first-light`, `bg-white`, `bg-navy`, `bg-navy-card`, `bg-midnight`, `border-line`, etc.) — never the deprecated aliases (`text-dream-cream`, `text-dawn-gold`, `bg-deep-space`, `bg-royal-blue`, `bg-electric`, `border-nebula`, `text-horizon`). Every file this phase touches must be fully migrated, no mixed old/new classes.
- No `border-radius` anywhere this phase touches — the chamfer clip-path (already baked into `Button`/`Card`'s `featured` prop) is the only cut corner, and only where those primitives already apply it. Don't add new chamfers by hand.
- Color ratio (MEDREAM-DESIGN.md §2): ~60% white sections, ~30% navy/midnight sections, ~10% warm accent (`first-light`/`dawn`) used only on buttons, badges, stars, and small glows — never as a full-section background. This directly shapes the section-by-section surface choice below; don't default every section to navy.
- The `--gradient-dawn` multi-stop gradient is reserved for Hero and the final CTA section only (MEDREAM-DESIGN.md §2: "ใช้เฉพาะ hero หน้าแรก, CTA ท้ายหน้า... ห้ามใช้กับปุ่ม ตัวอักษร ไอคอน การ์ด"), and never as the literal background behind body text — both sections use it only as a bottom-anchored decorative glow over a `bg-midnight` base, keeping headline/body text on solid midnight/navy (verified 18.4:1 contrast) rather than on the pale end of the gradient.
- No auto-scrolling / continuously-looping animation anywhere (MEDREAM-DESIGN.md §9 explicit ban: "animation วนตลอด") — this overrides the older, pre-design-system brainstorming note that suggested an auto-scrolling "Trusted by" marquee. Trusted-by renders as a static wrapped row instead.
- No emoji used as icons (MEDREAM-DESIGN.md §4 "ไม่ใช้ emoji แทนไอคอน") — don't carry the `icon: "🎮"` emoji pattern from `services.json`/`site.json.pipeline` into any new Home content. New content added in this phase (`home.json`) has no icon fields.
- Warm color (`first-light`, `dawn`) text is always on a navy/midnight background, and text on `first-light`/`dawn` backgrounds is always `text-navy` — never white-on-warm (hard contrast rule, MEDREAM-DESIGN.md §2 and §9).
- Don't touch `content/services.json`, `content/faq.json`, `content/portfolio.json`, `content/site.json`'s `pipeline` field, or the shared `src/components/shared/ServiceCard.tsx` / `PortfolioCard.tsx` / `FaqItem.tsx` components — each belongs to a later phase (4, 6, 5, 6 respectively) per the design spec's phase table, and each still has other live consumers (`/services`, `/faq`, `/portfolio`, `/team/[slug]`) that must keep working unchanged until their own phase lands.
- Per the finalized copy (`medream-website-copy.md` §9), Home's closing CTA section is a headline + one button — **not** an embedded contact form. `ContactFormSection`/`<ContactForm>` is removed from Home; the standalone `/contact` page (which renders `<ContactForm>` independently) is untouched and keeps working.
- Locale-invariant brand phrases ("We Dream", "We Do", "We Make Difference") are stored as single (non-`_th`/`_en`) strings in `home.json`, matching the existing precedent of `SocialLink.platform` — they're deliberately shown in English in both locales per `medream-ai-brief.md` §1's tagline "We Dream, We Do, We Make Difference".

---

## Task 1: `HomeContent` type + `content/home.json` + `getHomeContent()`

**Files:**
- Modify: `src/types/content.ts`
- Modify: `src/lib/content.ts`
- Create: `content/home.json`

**Interfaces:**
- Produces: `HomeContent` interface and its nested types (`WorkTeaser`, `HomeServicePreview`, `HomeFaqPreviewItem`, `HomeWayOfWorkStep`, `HomeTrustedByItem`) — consumed by every Home section component in Tasks 4–12. `getHomeContent(): HomeContent` — reads `content/home.json`, same `readJson` pattern as every other loader.

- [ ] **Step 1: Add the types to `src/types/content.ts`**

Add at the end of the file:

```ts
export interface WorkTeaser {
  id: string
  title_th: string
  title_en: string
  desc_th: string
  desc_en: string
  image: string
}

export interface HomeServicePreview {
  id: 'marketing-event' | 'crm' | 'learning' | 'games'
  title_th: string
  title_en: string
  body_th: string
  body_en: string
  cta_th: string
  cta_en: string
}

export interface HomeFaqPreviewItem {
  question_th: string
  question_en: string
  answer_th: string
  answer_en: string
}

export interface HomeWayOfWorkStep {
  level: number
  label_th: string
  label_en: string
}

export interface HomeTrustedByItem {
  label_th: string
  label_en: string
}

export interface HomeContent {
  hero: {
    subheadline_th: string
    subheadline_en: string
  }
  dream: {
    headline: string
    body_th: string
    body_en: string
    dna: string[]
  }
  services: {
    headline: string
    subheadline_th: string
    subheadline_en: string
    cards: HomeServicePreview[]
  }
  difference: {
    headline: string
    body_th: string
    body_en: string
    microProofNumber: string
    microProof_th: string
    microProof_en: string
  }
  works: {
    headline_th: string
    headline_en: string
    teasers: WorkTeaser[]
    cta_th: string
    cta_en: string
  }
  trustedBy: {
    headline_th: string
    headline_en: string
    extraClients: HomeTrustedByItem[]
  }
  wayOfWork: {
    headline_th: string
    headline_en: string
    steps: HomeWayOfWorkStep[]
    cta_th: string
    cta_en: string
  }
  faqPreview: {
    items: HomeFaqPreviewItem[]
    cta_th: string
    cta_en: string
  }
  finalCta: {
    headline_th: string
    headline_en: string
    subheadline_th: string
    subheadline_en: string
  }
}
```

- [ ] **Step 2: Add `getHomeContent()` to `src/lib/content.ts`**

Update the type import at the top of the file to add `HomeContent`:

```ts
import type {
  NavConfig, SiteConfig, Service, PortfolioItem,
  TeamMember, TeamMemberDetail, FaqItem, Award, Milestone, CareerOpening, HomeContent
} from '@/types/content'
```

Add the loader function directly after `getSiteConfig()`:

```ts
export function getHomeContent(): HomeContent {
  return readJson<HomeContent>('home.json')
}
```

- [ ] **Step 3: Create `content/home.json`**

```json
{
  "hero": {
    "subheadline_th": "เราคือสตูดิโอที่ผสานความคิดสร้างสรรค์เข้ากับเทคโนโลยี สร้างเกมและสื่ออินเทอร์แอคทีฟที่ไม่ได้มีไว้แค่ความสนุก แต่เอาไปใช้กับการตลาดและวัดผลได้จริง",
    "subheadline_en": "We're a studio that blends creativity with technology, building games and interactive media that aren't just for fun — brands can put them to work in marketing and measure the real results."
  },
  "dream": {
    "headline": "We Dream",
    "body_th": "เราคือทีมครีเอทีฟ นักเล่นเกม และนักเล่าเรื่อง รวมตัวกันเป็นสตูดิโอเกมและมีเดียอินเทอร์แอคทีฟจากไทย ทำตั้งแต่เกม Event ออกบูธ ไปจนถึง AR เปิดตัวสินค้า เพราะเราเชื่อว่าความสนุกช่วยให้แบรนด์เข้าใกล้ลูกค้าได้มากกว่าที่คิด",
    "body_en": "We're a team of creatives, gamers, and storytellers who came together to build a Thai game and interactive media studio. We make everything from booth event games to AR product launches, because we believe fun brings brands closer to their customers than they'd expect.",
    "dna": ["Creative", "Gamer", "Storyteller"]
  },
  "services": {
    "headline": "We Do",
    "subheadline_th": "เลือกจากโจทย์ที่อยากแก้ ไม่ต้องรู้จักเทคโนโลยีมาก่อนก็ได้",
    "subheadline_en": "Start from the problem you want to solve — no need to know the technology up front",
    "cards": [
      {
        "id": "marketing-event",
        "title_th": "Marketing & Event",
        "title_en": "Marketing & Event",
        "body_th": "เกม Event เอาไว้ออกบูธ เล่นง่าย เก็บข้อมูลคนเล่นและสรุปผลให้ด้วย",
        "body_en": "Event games for booths — easy to play, with player data collection and reporting built in",
        "cta_th": "ดูรายละเอียด",
        "cta_en": "See details"
      },
      {
        "id": "crm",
        "title_th": "Brand Engagement & CRM",
        "title_en": "Brand Engagement & CRM",
        "body_th": "เกมสะสมแต้ม เกมผูกใจลูกค้า ปรับจาก template พร้อมใช้ได้ใน 1 สัปดาห์",
        "body_en": "Loyalty and engagement games that keep customers connected to your brand, adapted from a ready template in as little as 1 week",
        "cta_th": "ดูรายละเอียด",
        "cta_en": "See details"
      },
      {
        "id": "learning",
        "title_th": "Learning & Training",
        "title_en": "Learning & Training",
        "body_th": "สื่อการเรียนรู้แบบเกม เปลี่ยนเรื่องเข้าใจยากให้กลายเป็นเรื่องสนุก",
        "body_en": "Game-based learning media that turns hard-to-grasp topics into something fun",
        "cta_th": "ดูรายละเอียด",
        "cta_en": "See details"
      },
      {
        "id": "games",
        "title_th": "Games & Immersive",
        "title_en": "Games & Immersive",
        "body_th": "เกม PC / Mobile, AR, VR แบบ custom เต็มรูปแบบ ตั้งแต่ไอเดียยันเปิดตัว",
        "body_en": "Fully custom PC/Mobile games, AR, and VR — from idea all the way to launch",
        "cta_th": "ดูรายละเอียด",
        "cta_en": "See details"
      }
    ]
  },
  "difference": {
    "headline": "We Make Difference",
    "body_th": "ใครๆ ก็ทำเกมสนุกได้ แต่สนุกแล้วต้องวัดผลได้ด้วย นั่นคือสิ่งที่เราให้ความสำคัญเป็นพิเศษ ทุกงานที่เราออกแบบ ไม่ว่าจะเป็นเกม Event หรือสื่ออินเทอร์แอคทีฟ เราคิดเรื่องการเก็บข้อมูลและสรุปผลไว้ตั้งแต่แรก เพื่อให้คุณรู้ชัดๆ ว่าสิ่งที่ทำไปนั้นได้ผลจริงแค่ไหน ไม่ใช่แค่ความประทับใจที่จับต้องไม่ได้",
    "body_en": "Anyone can make a fun game. But fun that can be measured — that's what we care about most. In every project we design, whether it's an event game or interactive media, we build in data collection and reporting from day one, so you know exactly how well it worked — not just an impression you can't put a number on.",
    "microProofNumber": "30",
    "microProof_th": "จอ Interactive AI ที่ช่วยเก็บ potential lead ได้กว่า 30 รายในงานเดียว",
    "microProof_en": "An Interactive AI kiosk that helped collect over 30 potential leads in a single event"
  },
  "works": {
    "headline_th": "ผลงานที่ผ่านมา",
    "headline_en": "Our Work",
    "teasers": [
      {
        "id": "ar-product-launch",
        "title_th": "AR เปิดตัวสินค้าเครื่องสำอาง",
        "title_en": "AR Cosmetics Product Launch",
        "desc_th": "กล่องล็อคเวลาที่เปลี่ยนจากนาฬิกานับถอยหลัง เป็นขวด 3D ทันทีที่ถึงวันเปิดตัว",
        "desc_en": "A time-locked box that switches from a countdown clock to a 3D product reveal the moment launch day arrives",
        "image": "/images/portfolio/placeholder.png"
      },
      {
        "id": "ai-interactive-booth",
        "title_th": "จอ Interactive AI จับคู่ธุรกิจ",
        "title_en": "AI Interactive Business-Matching Kiosk",
        "desc_th": "เก็บ potential lead ได้กว่า 30 รายในงานเดียว",
        "desc_en": "Collected over 30 potential leads in a single event",
        "image": "/images/portfolio/placeholder.png"
      },
      {
        "id": "tat-loy-krathong",
        "title_th": "แคมเปญลอยกระทงกับ ททท.",
        "title_en": "TAT Loy Krathong Campaign",
        "desc_th": "คลิปโปรโมท 3D และการ์ดอวยพร 2D ผ่านมาสคอตน้องอุ่นใจ",
        "desc_en": "A 3D promo clip and 2D animated greeting cards starring TAT's mascot, Nong Un Jai",
        "image": "/images/portfolio/placeholder.png"
      },
      {
        "id": "sumeeper",
        "title_th": "Sumeeper",
        "title_en": "Sumeeper",
        "desc_th": "เกมของเราเอง ที่ได้รางวัล Best Game Technical และทุนสนับสนุนจาก depa",
        "desc_en": "Our own game — winner of the Best Game Technical award and a depa startup grant",
        "image": "/images/portfolio/sumeeper.png"
      }
    ],
    "cta_th": "ดูผลงานทั้งหมด",
    "cta_en": "See All Work"
  },
  "trustedBy": {
    "headline_th": "ได้รับความไว้วางใจจาก",
    "headline_en": "Trusted By",
    "extraClients": [
      {
        "label_th": "การท่องเที่ยวแห่งประเทศไทย (ททท.)",
        "label_en": "Tourism Authority of Thailand (TAT)"
      }
    ]
  },
  "wayOfWork": {
    "headline_th": "เริ่มงานกับเรายังไง",
    "headline_en": "How It Works",
    "steps": [
      { "level": 1, "label_th": "รับโจทย์", "label_en": "Discovery" },
      { "level": 2, "label_th": "ออกแบบ Solution", "label_en": "Solution Design" },
      { "level": 3, "label_th": "พัฒนา", "label_en": "Development" },
      { "level": 4, "label_th": "Test & Launch", "label_en": "Test & Launch" }
    ],
    "cta_th": "ดู Way of work แบบเต็ม",
    "cta_en": "See Full Way of Work"
  },
  "faqPreview": {
    "items": [
      {
        "question_th": "งบประมาณเริ่มต้นเท่าไหร่?",
        "question_en": "What's the starting budget?",
        "answer_th": "เริ่มต้นหลักหมื่น (ต่ำกว่า 5 หมื่นบาท) สำหรับงานเล็กอย่างเกม CRM แบบ template",
        "answer_en": "Starting in the tens of thousands of baht (under 50,000 THB) for small projects like a template-based CRM game"
      },
      {
        "question_th": "ใช้เวลานานแค่ไหน?",
        "question_en": "How long does it take?",
        "answer_th": "เร็วสุดประมาณ 1–2 สัปดาห์สำหรับงาน Event ทั่วไป",
        "answer_en": "As fast as 1–2 weeks for a typical event game"
      },
      {
        "question_th": "ไม่รู้ว่าอยากได้อะไร ต้องทำยังไง?",
        "question_en": "Not sure what you need? What should you do?",
        "answer_th": "ไม่ต้องรู้มาก่อนก็ได้ ทีมช่วยแนะนำโซลูชันที่เหมาะกับโจทย์จริง",
        "answer_en": "You don't need to know beforehand — our team helps recommend a solution that fits your actual problem"
      },
      {
        "question_th": "มีบริการเก็บข้อมูล/Dashboard ไหม?",
        "question_en": "Do you offer data collection or a dashboard?",
        "answer_th": "มี เป็นจุดต่างหลักของเรา",
        "answer_en": "Yes — it's one of our main differentiators"
      }
    ],
    "cta_th": "ดู FAQ ทั้งหมด",
    "cta_en": "See All FAQs"
  },
  "finalCta": {
    "headline_th": "พร้อมทำให้ความฝันของคุณ \"มี\" อยู่จริงหรือยัง?",
    "headline_en": "Ready to make your dream real?",
    "subheadline_th": "เล่าโจทย์ให้เราฟังได้เลย ต่อให้ยังไม่แน่ใจงบหรือรูปแบบก็เริ่มคุยกันก่อนได้",
    "subheadline_en": "Tell us what you're trying to do — even if you're not sure about budget or format yet, let's start the conversation"
  }
}
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/types/content.ts src/lib/content.ts content/home.json
git commit -m "Add HomeContent type/loader and content/home.json

Holds Home-specific copy that doesn't belong in services.json,
faq.json, portfolio.json, or site.json.pipeline — each of those is
owned by a later phase (4/6/5/6) that will do its own full rewrite,
so a small amount of already-approved Home copy lives here instead
of blocking on or half-migrating a schema this phase doesn't own.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 2: Update `site.json` tagline + Hero CTA message copy

**Files:**
- Modify: `content/site.json`
- Modify: `messages/th.json`
- Modify: `messages/en.json`

**Interfaces:**
- Produces: `site.tagline_th/en` updated to the finalized Hero headline — consumed by Task 4 (Hero), and already consumed by `Footer.tsx` (Phase 1) and `[locale]/layout.tsx`'s `generateMetadata` (both pick up the new copy automatically, no code change needed there). `messages.hero.cta_portfolio`/`cta_contact` updated to the finalized button copy — consumed by Task 4.

- [ ] **Step 1: Update `tagline_th`/`tagline_en` in `content/site.json`**

Find:
```json
  "tagline_th": "เราทำให้ความฝันกลายเป็นประสบการณ์จริง",
  "tagline_en": "We turn dreams into real experiences",
```
Replace with:
```json
  "tagline_th": "MeDream ที่ซึ่งความฝันของทุกคนกลายเป็นความจริง",
  "tagline_en": "MeDream — where everyone's dreams become reality",
```

- [ ] **Step 2: Update `hero.cta_portfolio`/`hero.cta_contact` in `messages/th.json`**

Find:
```json
  "hero": {
    "cta_portfolio": "ดูผลงาน",
    "cta_contact": "ติดต่อเรา"
  },
```
Replace with:
```json
  "hero": {
    "cta_portfolio": "ดูผลงานของเรา",
    "cta_contact": "เริ่มโปรเจกต์"
  },
```

- [ ] **Step 3: Update `hero.cta_portfolio`/`hero.cta_contact` in `messages/en.json`**

Find:
```json
  "hero": {
    "cta_portfolio": "See Our Work",
    "cta_contact": "Contact Us"
  },
```
Replace with:
```json
  "hero": {
    "cta_portfolio": "See Our Work",
    "cta_contact": "Start a Project"
  },
```

- [ ] **Step 4: Type-check and lint**

Run: `npx tsc --noEmit` — expected: no errors (JSON content, doesn't affect types).
Run: `pnpm lint` — expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add content/site.json messages/th.json messages/en.json
git commit -m "Update tagline and Hero CTA copy to finalized Home copy

tagline_th/en also flows into Footer and root metadata description —
both pick up the corrected copy automatically.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 3: Remove tsparticles, add `.bg-gradient-dawn` utility

**Files:**
- Modify: `src/app/globals.css`
- Modify: `package.json` (remove `@tsparticles/engine`, `@tsparticles/react`, `@tsparticles/slim`)

**Interfaces:**
- Produces: `.bg-gradient-dawn` CSS utility class — consumed by Task 4 (Hero) and Task 12 (Final CTA), the only two places `--gradient-dawn` is allowed per the design rule.

**Context:** `HeroSection.tsx` (rewritten in Task 4) is the only consumer of `@tsparticles/*` anywhere in `src/` (confirmed via `grep -ril "particles" src/`). Once Task 4 rewrites it, these three packages become fully unused.

- [ ] **Step 1: Add the gradient utility to `src/app/globals.css`**

Add directly after the `@theme` block's closing `}` (before the `* { box-sizing: border-box; }` rule) — the exact stops from `medream-tokens.css`'s `--gradient-dawn`, copied verbatim:

```css
/* Gradient-dawn — reserved for Hero and the final CTA section only
   (MEDREAM-DESIGN.md §2). Never behind body text or on buttons/cards. */
.bg-gradient-dawn {
  background: linear-gradient(180deg, #04103A 0%, #052D6F 22%, #0C5BAC 46%, #3B89D0 60%, #87B2DE 72%, #ECCCC1 100%);
}
```

- [ ] **Step 2: Remove tsparticles from `package.json`**

Remove these three lines from `dependencies`:
```json
    "@tsparticles/engine": "^4.0.5",
    "@tsparticles/react": "^4.0.5",
    "@tsparticles/slim": "^4.0.5",
```

Run: `pnpm install` (updates `pnpm-lock.yaml` to match).

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit` — expected: this will currently FAIL because `HeroSection.tsx` still imports `@tsparticles/react`/`@tsparticles/slim`/`@tsparticles/engine`. That's expected at this point — Task 4 rewrites `HeroSection.tsx` in the same PR-sized unit of work. Do not commit this task's `package.json`/`pnpm-lock.yaml` change on its own; fold it into Task 4's commit instead (the two are one atomic change: you can't remove the dependency without simultaneously rewriting its only consumer). Skip standalone commit here — proceed directly to Task 4 and commit both together.

---

## Task 4: Rebuild `HeroSection.tsx`

**Files:**
- Modify: `src/components/home/HeroSection.tsx`

**Interfaces:**
- Consumes: `SiteConfig.tagline_th/en` (Task 2), `HomeContent.hero.subheadline_th/en` (Task 1), `messages.hero.cta_portfolio/cta_contact` (Task 2), `Button` primitive, `.bg-gradient-dawn` utility (Task 3).
- Produces: `HeroSection({ site, home }: { site: SiteConfig; home: HomeContent })` — prop shape changes (adds `home`), so `page.tsx` (Task 13) must be updated in the same unit; no other file imports `HeroSection` today (confirmed via grep).

- [ ] **Step 1: Replace `src/components/home/HeroSection.tsx`**

`HeroSection` becomes an `async` server component (it needs `await getLocale()`), so it uses `getTranslations`/`getLocale` from `next-intl/server` — the server-side counterparts of the `useTranslations`/`useLocale` client hooks the old version used:

```tsx
// src/components/home/HeroSection.tsx
import { getLocale, getTranslations } from 'next-intl/server'
import type { SiteConfig, HomeContent } from '@/types/content'
import { Button } from '@/components/ui/Button'

interface Props {
  site: SiteConfig
  home: HomeContent
}

export async function HeroSection({ site, home }: Props) {
  const locale = await getLocale()
  const l = locale as 'th' | 'en'
  const t = await getTranslations('hero')

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-midnight px-4">
      {/* Bottom-anchored gradient-dawn glow — decorative only, content sits above it on solid midnight */}
      <div
        className="bg-gradient-dawn pointer-events-none absolute inset-x-0 bottom-0 h-2/5 opacity-70"
        style={{ maskImage: 'linear-gradient(to bottom, transparent, black)' }}
        aria-hidden="true"
      />

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

- [ ] **Step 2: Type-check and lint**

Run: `npx tsc --noEmit` — expected: no errors (this also confirms Task 3's `package.json` removal is now safe, since nothing imports `@tsparticles/*` anymore).
Run: `pnpm lint` — expected: no new errors.

- [ ] **Step 3: Commit (includes Task 3's dependency removal)**

```bash
git add src/components/home/HeroSection.tsx src/app/globals.css package.json pnpm-lock.yaml
git commit -m "Rebuild Hero without tsparticles, add gradient-dawn glow

Removes @tsparticles/engine, @tsparticles/react, @tsparticles/slim —
HeroSection.tsx was their only consumer. New hero is a static midnight
section with a bottom-anchored gradient-dawn glow (decorative only,
text stays on solid midnight for contrast) and the two Button
primitives for CTAs, per finalized Home copy.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 5: Rebuild `WhoWeAreSection.tsx` → `WeDreamSection.tsx`

**Files:**
- Delete: `src/components/home/WhoWeAreSection.tsx`
- Create: `src/components/home/WeDreamSection.tsx`

**Interfaces:**
- Consumes: `HomeContent.dream` (Task 1).
- Produces: `WeDreamSection({ home, locale }: { home: HomeContent; locale: string })`.

**Context:** The old `WhoWeAreSection` read `site.intro_th/en`/`site.vision_th/en`, which are also used (unchanged) by the not-yet-rebuilt `/about` page — this task does not touch `site.json`'s `intro`/`vision` fields, it just stops using them on Home. The "We Dream" section's own copy lives in `home.json` instead (Task 1).

- [ ] **Step 1: Delete the old file, create the new one**

```bash
git rm src/components/home/WhoWeAreSection.tsx
```

Create `src/components/home/WeDreamSection.tsx`:

```tsx
// src/components/home/WeDreamSection.tsx
import type { HomeContent } from '@/types/content'
import { Badge } from '@/components/ui/Badge'

interface Props {
  home: HomeContent
  locale: string
}

export function WeDreamSection({ home, locale }: Props) {
  const l = locale as 'th' | 'en'
  const { dream } = home

  return (
    <section className="bg-white py-16 md:py-24 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="font-display font-semibold text-ink text-3xl md:text-[36px] md:leading-[44px] mb-6">
          {dream.headline}
        </h2>
        <p className="text-fg-2 text-base md:text-lg leading-relaxed mb-8">
          {l === 'th' ? dream.body_th : dream.body_en}
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          {dream.dna.map(trait => (
            <Badge key={trait}>{trait}</Badge>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit` — expected: this will FAIL right now because `page.tsx` still imports the deleted `WhoWeAreSection`. That's expected — `page.tsx` is reassembled in Task 13, which is the last content task before final verification. This is intentional (each section is easiest to review as its own diff); the build stays broken between Task 4 and Task 13, which is fine for an in-progress branch not being deployed mid-phase.

- [ ] **Step 3: Commit**

```bash
git add -A src/components/home/WhoWeAreSection.tsx src/components/home/WeDreamSection.tsx
git commit -m "Replace WhoWeAreSection with WeDreamSection on new CI

Renamed to match the new IA's section name and copy source
(home.json's dream block) instead of site.json's intro/vision,
which stay untouched for the not-yet-rebuilt About page.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 6: Rebuild `ServicesSection.tsx` → `WeDoSection.tsx`

**Files:**
- Delete: `src/components/home/ServicesSection.tsx`
- Create: `src/components/home/WeDoSection.tsx`

**Interfaces:**
- Consumes: `HomeContent.services` (Task 1), `Card`, `Button` primitives.
- Produces: `WeDoSection({ home, locale }: { home: HomeContent; locale: string })`.

**Context:** Does not touch `content/services.json`, `Service` type, or `ServiceCard.tsx` — those stay exactly as-is for the not-yet-rebuilt `/services` page (Phase 4) and `ContactForm`'s service `<select>`. Each of the 4 cards here links to `/services` (the existing, still-flat page) rather than a `/services/[group]` anchor, since that dynamic route doesn't exist until Phase 4 — Phase 4 is expected to update these links once it exists.

- [ ] **Step 1: Delete the old file, create the new one**

```bash
git rm src/components/home/ServicesSection.tsx
```

Create `src/components/home/WeDoSection.tsx`:

```tsx
// src/components/home/WeDoSection.tsx
import type { HomeContent } from '@/types/content'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface Props {
  home: HomeContent
  locale: string
}

export function WeDoSection({ home, locale }: Props) {
  const l = locale as 'th' | 'en'
  const { services } = home

  return (
    <section className="bg-white py-16 md:py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display font-semibold text-ink text-3xl md:text-[36px] md:leading-[44px] mb-3">
            {services.headline}
          </h2>
          <p className="text-fg-2 text-base md:text-lg">
            {l === 'th' ? services.subheadline_th : services.subheadline_en}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {services.cards.map(card => (
            <Card key={card.id} className="flex flex-col gap-3 hover:border-blue transition-colors">
              <h3 className="font-display font-semibold text-ink text-lg">
                {l === 'th' ? card.title_th : card.title_en}
              </h3>
              <p className="text-fg-2 text-sm leading-relaxed flex-1">
                {l === 'th' ? card.body_th : card.body_en}
              </p>
              <Button href={`/${locale}/services`} variant="text" surface="light" className="self-start">
                {l === 'th' ? card.cta_th : card.cta_en}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit` — expected: still failing (page.tsx not yet reassembled), same as Task 5. Confirm the *new* error surface doesn't mention `WeDoSection.tsx` or `ServicesSection.tsx` itself (only `page.tsx`'s stale import).

- [ ] **Step 3: Commit**

```bash
git add -A src/components/home/ServicesSection.tsx src/components/home/WeDoSection.tsx
git commit -m "Replace ServicesSection with WeDoSection on new CI

New 4-card group preview (Marketing & Event / CRM / Learning / Games)
from home.json, using Card + Button primitives. Links to /services
(unchanged flat page) rather than /services/[group], which doesn't
exist until Phase 4. content/services.json and ServiceCard.tsx are
untouched — still used by /services and ContactForm.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 7: New `WeMakeDifferenceSection.tsx`

**Files:**
- Create: `src/components/home/WeMakeDifferenceSection.tsx`

**Interfaces:**
- Consumes: `HomeContent.difference` (Task 1), `Star` primitive.
- Produces: `WeMakeDifferenceSection({ home, locale }: { home: HomeContent; locale: string })`.

**Context:** MEDREAM-DESIGN.md §5 explicitly sanctions using the star glyph in place of "+" in a result number (e.g. "30✦ leads") — this section's stat callout uses exactly that pattern instead of inventing a fake dashboard mockup.

- [ ] **Step 1: Create the file**

```tsx
// src/components/home/WeMakeDifferenceSection.tsx
import type { HomeContent } from '@/types/content'
import { Star } from '@/components/ui/Star'

interface Props {
  home: HomeContent
  locale: string
}

export function WeMakeDifferenceSection({ home, locale }: Props) {
  const l = locale as 'th' | 'en'
  const { difference } = home

  return (
    <section className="bg-white py-16 md:py-24 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-10 items-center">
        <div>
          <h2 className="font-display font-semibold text-ink text-3xl md:text-[36px] md:leading-[44px] mb-6">
            {difference.headline}
          </h2>
          <p className="text-fg-2 text-base md:text-lg leading-relaxed">
            {l === 'th' ? difference.body_th : difference.body_en}
          </p>
        </div>
        <div className="bg-navy text-white p-8 flex flex-col items-center text-center gap-3">
          <div className="flex items-center gap-1 font-display font-semibold text-5xl">
            {difference.microProofNumber}
            <Star className="w-6 h-6 text-first-light" />
          </div>
          <p className="text-mist text-sm leading-relaxed">
            {l === 'th' ? difference.microProof_th : difference.microProof_en}
          </p>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit` — expected: no *new* errors introduced by this file (page.tsx's stale imports are the only remaining error source, unchanged from Task 6).

- [ ] **Step 3: Commit**

```bash
git add src/components/home/WeMakeDifferenceSection.tsx
git commit -m "Add WeMakeDifferenceSection

New Home section (no prior equivalent) — headline/body plus a
30✦-style stat callout using the Star primitive in place of '+',
per MEDREAM-DESIGN.md's sanctioned pattern for result numbers.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 8: Rebuild `PortfolioHighlightSection.tsx` → `WorksSection.tsx`

**Files:**
- Delete: `src/components/home/PortfolioHighlightSection.tsx`
- Create: `src/components/home/WorksSection.tsx`

**Interfaces:**
- Consumes: `HomeContent.works` (Task 1), `Button` primitive, `next/image`.
- Produces: `WorksSection({ home, locale }: { home: HomeContent; locale: string })`.

**Context:** Uses `home.json`'s fixed 4-teaser copy instead of `getFeaturedPortfolio()`/`content/portfolio.json` — the full Works case-study copy is explicitly not finalized yet (`medream-ai-brief.md` §11 open items list "เขียน copy หน้า Works" as pending), so this task doesn't invent full case-study copy for `portfolio.json`; it only uses the short teaser copy that *is* finalized for Home specifically. `content/portfolio.json` and `PortfolioCard.tsx` stay untouched (Phase 5 migrates Works to Notion). Both client-teaser images reuse the existing `/images/portfolio/placeholder.png` (no real photos delivered yet); the Sumeeper teaser reuses the existing `/images/portfolio/sumeeper.png`.

- [ ] **Step 1: Delete the old file, create the new one**

```bash
git rm src/components/home/PortfolioHighlightSection.tsx
```

Create `src/components/home/WorksSection.tsx`:

```tsx
// src/components/home/WorksSection.tsx
import Image from 'next/image'
import type { HomeContent } from '@/types/content'
import { Button } from '@/components/ui/Button'

interface Props {
  home: HomeContent
  locale: string
}

export function WorksSection({ home, locale }: Props) {
  const l = locale as 'th' | 'en'
  const { works } = home

  return (
    <section className="bg-white py-16 md:py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display font-semibold text-ink text-3xl md:text-[36px] md:leading-[44px] mb-12 text-center">
          {l === 'th' ? works.headline_th : works.headline_en}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {works.teasers.map(teaser => (
            <div key={teaser.id} className="border border-line bg-white overflow-hidden">
              <div className="relative h-48 bg-navy-card">
                <Image
                  src={teaser.image}
                  alt={l === 'th' ? teaser.title_th : teaser.title_en}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="font-display font-semibold text-ink text-lg mb-1">
                  {l === 'th' ? teaser.title_th : teaser.title_en}
                </h3>
                <p className="text-fg-2 text-sm leading-relaxed">
                  {l === 'th' ? teaser.desc_th : teaser.desc_en}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Button href={`/${locale}/portfolio`} variant="secondary" surface="light">
            {l === 'th' ? works.cta_th : works.cta_en}
          </Button>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit` — expected: no new errors beyond the still-pending `page.tsx` reassembly.

- [ ] **Step 3: Commit**

```bash
git add -A src/components/home/PortfolioHighlightSection.tsx src/components/home/WorksSection.tsx
git commit -m "Replace PortfolioHighlightSection with WorksSection on new CI

Uses home.json's 4 finalized teaser blurbs (AR launch, AI booth, TAT
campaign, Sumeeper) rather than content/portfolio.json — full Works
case-study copy isn't written yet (tracked separately), so this only
uses the short copy that IS finalized for Home. portfolio.json and
PortfolioCard.tsx are untouched (Phase 5 migrates Works to Notion).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 9: New `TrustedBySection.tsx`

**Files:**
- Create: `src/components/home/TrustedBySection.tsx`

**Interfaces:**
- Consumes: `HomeContent.trustedBy` (Task 1), `getAwards()`, `getMilestones()` (both from Phase 1, `src/lib/content.ts`).
- Produces: `TrustedBySection({ home, awards, milestones, locale }: { home: HomeContent; awards: Award[]; milestones: Milestone[]; locale: string })`.

**Context:** Renders as a static wrapped row of text labels, not an image-logo strip or an auto-scrolling marquee — no real logo files exist for any of these (checked: only `awards/placeholder.png` and `portfolio` placeholders exist in `public/images/`), and MEDREAM-DESIGN.md §9 explicitly bans continuously-looping animation, which rules out the auto-scroll treatment an earlier brainstorming note suggested. Reuses Phase 1's already-populated `awards.json` (2 items) and `milestones.json` (5 items) rather than inventing new client/event data — the only new fact here is the TAT client name, which `medream-ai-brief.md` explicitly confirms is clearable for use.

- [ ] **Step 1: Create the file**

```tsx
// src/components/home/TrustedBySection.tsx
import type { HomeContent, Award, Milestone } from '@/types/content'

interface Props {
  home: HomeContent
  awards: Award[]
  milestones: Milestone[]
  locale: string
}

export function TrustedBySection({ home, awards, milestones, locale }: Props) {
  const l = locale as 'th' | 'en'
  const { trustedBy } = home

  const labels = [
    ...trustedBy.extraClients.map(c => (l === 'th' ? c.label_th : c.label_en)),
    ...awards.map(a => (l === 'th' ? a.name_th : a.name_en)),
    ...milestones.map(m => (l === 'th' ? m.event_th : m.event_en)),
  ]

  return (
    <section className="bg-white border-y border-line py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <p className="label text-fg-3 text-center mb-6 font-display font-medium text-xs uppercase tracking-[.12em]">
          {l === 'th' ? trustedBy.headline_th : trustedBy.headline_en}
        </p>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
          {labels.map((label, i) => (
            <span key={i} className="text-fg-3 text-sm font-display font-medium">
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit` — expected: no new errors beyond the still-pending `page.tsx` reassembly.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/TrustedBySection.tsx
git commit -m "Add TrustedBySection

New Home section combining home.json's TAT client entry with the
Phase 1 awards.json (2) and milestones.json (5) data as a static
wrapped text row — no real logo assets exist yet, and an auto-scroll
marquee would violate MEDREAM-DESIGN.md's ban on looping animation.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 10: Rebuild `WayOfWorkSection.tsx`

**Files:**
- Modify: `src/components/home/WayOfWorkSection.tsx`

**Interfaces:**
- Consumes: `HomeContent.wayOfWork` (Task 1), `LevelBadge`, `Button` primitives. **Stops** consuming `SiteConfig.pipeline`/`PipelineStep` (that stays untouched — Phase 6 owns its full rewrite with `duration_th/en`/`body_th/en`).
- Produces: `WayOfWorkSection({ home, locale }: { home: HomeContent; locale: string })` — prop shape changes from `{ steps, locale }` to `{ home, locale }`.

**Context:** The old component rendered `site.pipeline` (5 generic dev-process steps — "รับ Requirements", "Game Design", etc. — a completely different, stale concept unrelated to the new "Way of work" IA). The new finalized short copy is 4 real steps (`home.json`'s `wayOfWork.steps`, Task 1); the full version with durations lives on `/contact` in Phase 6.

- [ ] **Step 1: Replace `WayOfWorkSection.tsx`**

```tsx
// src/components/home/WayOfWorkSection.tsx
import type { HomeContent } from '@/types/content'
import { LevelBadge } from '@/components/ui/LevelBadge'
import { Button } from '@/components/ui/Button'

interface Props {
  home: HomeContent
  locale: string
}

export function WayOfWorkSection({ home, locale }: Props) {
  const l = locale as 'th' | 'en'
  const { wayOfWork } = home

  return (
    <section className="bg-white py-16 md:py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display font-semibold text-ink text-3xl md:text-[36px] md:leading-[44px] mb-12 text-center">
          {l === 'th' ? wayOfWork.headline_th : wayOfWork.headline_en}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {wayOfWork.steps.map(step => (
            <div key={step.level} className="border border-line p-5 text-center">
              <LevelBadge
                level={step.level}
                total={wayOfWork.steps.length}
                label=""
                className="justify-center mb-3"
              />
              <p className="font-display font-semibold text-ink">
                {l === 'th' ? step.label_th : step.label_en}
              </p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Button href={`/${locale}/contact`} variant="text" surface="light">
            {l === 'th' ? wayOfWork.cta_th : wayOfWork.cta_en}
          </Button>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit` — expected: no new errors beyond the still-pending `page.tsx` reassembly.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/WayOfWorkSection.tsx
git commit -m "Rebuild WayOfWorkSection with real 4-step copy on new CI

Was rendering site.json's stale 5-step generic dev pipeline (a
different, unrelated concept from the new IA). Now uses home.json's
finalized short Way-of-work copy (Lv.1-4) via LevelBadge. site.json's
pipeline field is untouched — Phase 6 owns its full rewrite.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 11: Rebuild `FaqPreviewSection.tsx`

**Files:**
- Modify: `src/components/home/FaqPreviewSection.tsx`
- Create: `src/components/home/HomeFaqAccordionItem.tsx`

**Interfaces:**
- Consumes: `HomeContent.faqPreview` (Task 1), `Button` primitive.
- Produces: `FaqPreviewSection({ home, locale }: { home: HomeContent; locale: string })` — prop shape changes from `{ items, locale }` to `{ home, locale }`. `HomeFaqAccordionItem({ item, locale }: { item: HomeFaqPreviewItem; locale: string })` — new local client component, `'use client'`.

**Context:** Does not reuse the shared `src/components/shared/FaqItem.tsx` (still old-CI, still used unchanged by `/faq`, owned by Phase 6) or `getFeaturedFaq()`/`content/faq.json` (also Phase 6's — its 5 current entries are generic placeholder Q&As unrelated to the new positioning, and rewriting that file now would preempt Phase 6's planned full rewrite with `category` values). `home.json`'s 4 finalized FAQ entries (Task 1, sourced from `medream-ai-brief.md` §9's confirmed answers) are Home-only and independent of `/faq`'s content until Phase 6 reconciles the two.

- [ ] **Step 1: Create `HomeFaqAccordionItem.tsx`**

```tsx
// src/components/home/HomeFaqAccordionItem.tsx
'use client'

import { useState } from 'react'
import type { HomeFaqPreviewItem } from '@/types/content'

interface Props {
  item: HomeFaqPreviewItem
  locale: string
}

export function HomeFaqAccordionItem({ item, locale }: Props) {
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

- [ ] **Step 2: Replace `FaqPreviewSection.tsx`**

```tsx
// src/components/home/FaqPreviewSection.tsx
import type { HomeContent } from '@/types/content'
import { Button } from '@/components/ui/Button'
import { HomeFaqAccordionItem } from './HomeFaqAccordionItem'

interface Props {
  home: HomeContent
  locale: string
}

export function FaqPreviewSection({ home, locale }: Props) {
  const l = locale as 'th' | 'en'
  const { faqPreview } = home

  return (
    <section className="bg-white py-16 md:py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-display font-semibold text-ink text-3xl md:text-[36px] md:leading-[44px] mb-10 text-center">
          {l === 'th' ? 'คำถามที่พบบ่อย' : 'FAQ'}
        </h2>
        <div>
          {faqPreview.items.map((item, i) => (
            <HomeFaqAccordionItem key={i} item={item} locale={locale} />
          ))}
        </div>
        <div className="text-center mt-8">
          <Button href={`/${locale}/faq`} variant="secondary" surface="light">
            {l === 'th' ? faqPreview.cta_th : faqPreview.cta_en}
          </Button>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit` — expected: no new errors beyond the still-pending `page.tsx` reassembly.

- [ ] **Step 4: Commit**

```bash
git add src/components/home/FaqPreviewSection.tsx src/components/home/HomeFaqAccordionItem.tsx
git commit -m "Rebuild FaqPreviewSection with finalized copy on new CI

Uses home.json's 4 confirmed Q&As (from medream-ai-brief.md §9)
via a new local accordion item, rather than the shared FaqItem.tsx
(still old-CI, owned by Phase 6) or content/faq.json's 5 generic
placeholder entries (also Phase 6's full-rewrite target).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 12: Rebuild `ContactFormSection.tsx` → `FinalCtaSection.tsx`

**Files:**
- Delete: `src/components/home/ContactFormSection.tsx`
- Create: `src/components/home/FinalCtaSection.tsx`

**Interfaces:**
- Consumes: `HomeContent.finalCta` (Task 1), `messages.nav.contact_cta` (Phase 1), `Button` primitive, `.bg-gradient-dawn` utility (Task 3).
- Produces: `FinalCtaSection({ home, locale }: { home: HomeContent; locale: string })` — drops the `services: Service[]` prop the old component took, since no form is embedded anymore.

**Context:** Per the finalized copy (`medream-website-copy.md` §9), this is a headline + one button, not an embedded form — the full expanded form lives on `/contact` (Phase 6 rebuilds that page further; today it already renders `<ContactForm>` standalone, untouched by this task and still fully functional).

- [ ] **Step 1: Delete the old file, create the new one**

```bash
git rm src/components/home/ContactFormSection.tsx
```

Create `src/components/home/FinalCtaSection.tsx`:

```tsx
// src/components/home/FinalCtaSection.tsx
import { getTranslations } from 'next-intl/server'
import type { HomeContent } from '@/types/content'
import { Button } from '@/components/ui/Button'

interface Props {
  home: HomeContent
  locale: string
}

export async function FinalCtaSection({ home, locale }: Props) {
  const l = locale as 'th' | 'en'
  const { finalCta } = home
  const t = await getTranslations('nav')

  return (
    <section className="relative bg-midnight py-20 md:py-28 px-4 overflow-hidden">
      <div
        className="bg-gradient-dawn pointer-events-none absolute inset-x-0 bottom-0 h-1/2 opacity-70"
        style={{ maskImage: 'linear-gradient(to bottom, transparent, black)' }}
        aria-hidden="true"
      />
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <h2 className="font-display font-semibold text-white text-3xl md:text-[36px] md:leading-[44px] mb-4">
          {l === 'th' ? finalCta.headline_th : finalCta.headline_en}
        </h2>
        <p className="text-mist text-base md:text-lg leading-relaxed mb-10">
          {l === 'th' ? finalCta.subheadline_th : finalCta.subheadline_en}
        </p>
        <Button href={`/${locale}/contact`} variant="primary" surface="dark">
          {t('contact_cta')}
        </Button>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit` — expected: no new errors beyond the still-pending `page.tsx` reassembly (this is the last section task, so the only remaining error should now be in `page.tsx` itself).

- [ ] **Step 3: Commit**

```bash
git add -A src/components/home/ContactFormSection.tsx src/components/home/FinalCtaSection.tsx
git commit -m "Replace ContactFormSection with FinalCtaSection (no embedded form)

Finalized copy for this section is a headline + one button, not an
embedded form (medream-website-copy.md §9). The standalone /contact
page still renders <ContactForm> independently and is untouched.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 13: Reassemble `page.tsx`, remove dead loaders

**Files:**
- Modify: `src/app/[locale]/page.tsx`
- Modify: `src/lib/content.ts`

**Interfaces:**
- Consumes: all 9 section components from Tasks 4–12, `getHomeContent()` (Task 1), `getSiteConfig()`, `getAwards()`, `getMilestones()` (all pre-existing).
- Produces: removes `getFeaturedFaq()` and `getFeaturedPortfolio()` from `src/lib/content.ts` — both were Home-only (confirmed via grep: no other file calls either), and Home no longer needs them once this task lands.

- [ ] **Step 1: Replace `src/app/[locale]/page.tsx`**

```tsx
// src/app/[locale]/page.tsx
import type { Metadata } from 'next'
import { getSiteConfig, getHomeContent, getAwards, getMilestones } from '@/lib/content'
import { HeroSection } from '@/components/home/HeroSection'
import { WeDreamSection } from '@/components/home/WeDreamSection'
import { WeDoSection } from '@/components/home/WeDoSection'
import { WeMakeDifferenceSection } from '@/components/home/WeMakeDifferenceSection'
import { WorksSection } from '@/components/home/WorksSection'
import { TrustedBySection } from '@/components/home/TrustedBySection'
import { WayOfWorkSection } from '@/components/home/WayOfWorkSection'
import { FaqPreviewSection } from '@/components/home/FaqPreviewSection'
import { FinalCtaSection } from '@/components/home/FinalCtaSection'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isTh = locale === 'th'
  return {
    title: isTh
      ? 'MeDream Studio | รับพัฒนาเกม Game Developer & Media Dream Team'
      : 'MeDream Studio | Game Developer & Media Dream Team Thailand',
    description: isTh
      ? 'MeDream Studio (Media Dream Team) — ทีม Game Developer รับพัฒนาเกม Unity, Mobile Game, Serious Game, AR/VR และแอนิเมชัน ครบวงจร'
      : 'MeDream Studio (Media Dream Team) — Thailand game developer studio. We build Unity games, mobile games, serious games, AR/VR, and animation.',
  }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const site = getSiteConfig()
  const home = getHomeContent()
  const awards = getAwards()
  const milestones = getMilestones()

  return (
    <>
      <HeroSection site={site} home={home} />
      <WeDreamSection home={home} locale={locale} />
      <WeDoSection home={home} locale={locale} />
      <WeMakeDifferenceSection home={home} locale={locale} />
      <WorksSection home={home} locale={locale} />
      <TrustedBySection home={home} awards={awards} milestones={milestones} locale={locale} />
      <WayOfWorkSection home={home} locale={locale} />
      <FaqPreviewSection home={home} locale={locale} />
      <FinalCtaSection home={home} locale={locale} />
    </>
  )
}
```

- [ ] **Step 2: Remove the two dead loaders from `src/lib/content.ts`**

Delete:
```ts
export function getFeaturedPortfolio(): PortfolioItem[] {
  return getPortfolioItems().filter(p => p.featured)
}
```
and:
```ts
export function getFeaturedFaq(): FaqItem[] {
  return getFaqItems().filter(f => f.featured).slice(0, 8)
}
```

(`getPortfolioItems()` and `getFaqItems()` themselves stay — still used by `/portfolio` and `/faq` respectively.)

- [ ] **Step 3: Type-check and lint**

Run: `npx tsc --noEmit` — expected: no errors. This is the first point since Task 4 where the whole build type-checks cleanly again.
Run: `pnpm lint` — expected: only the pre-existing `ContactForm.tsx` hooks warning, nothing new.

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/page.tsx src/lib/content.ts
git commit -m "Reassemble Home page with all 9 rebuilt sections

Removes getFeaturedFaq() and getFeaturedPortfolio() — both were
Home-only helpers with no other consumer, now dead since Home reads
home.json directly for FAQ preview and works teasers.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 14: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Final type-check and lint**

Run: `npx tsc --noEmit` — expected: no errors.
Run: `pnpm lint` — expected: only the pre-existing `ContactForm.tsx` error, nothing new.

- [ ] **Step 2: Confirm tsparticles is fully gone**

Run: `grep -ril "tsparticles" src/ package.json` — expected: no matches at all (not even in `package.json`).

- [ ] **Step 3: Full Home smoke pass**

Run `pnpm dev`, visit `/th` and `/en` (2 checks, Home only — other pages are out of scope for this phase and are expected to still look old-CI/unchanged). For each locale, scroll top to bottom and confirm:
- Hero: midnight background, visible gradient-dawn glow at the bottom edge only (not behind the headline text), correct new tagline headline + subheadline, two buttons ("ดูผลงานของเรา"/"See Our Work" outline, "เริ่มโปรเจกต์"/"Start a Project" solid with star), both link correctly (`/portfolio`, `/contact`).
- We Dream: white background, "We Dream" headline (same in both locales), body copy matches `home.json`, 3 badges (Creative/Gamer/Storyteller).
- We Do: white background, 4 cards (Marketing & Event / CRM / Learning / Games) each with a "ดูรายละเอียด →"/"See details →" text link to `/services`.
- We Make Difference: white background, headline/body, "30✦" stat callout on a navy panel.
- Works (ผลงานที่ผ่านมา): white background, 4 teaser cards with images (3 using the placeholder image, Sumeeper using its real image) and correct titles/descriptions, "ดูผลงานทั้งหมด"/"See All Work" button linking to `/portfolio`.
- Trusted by: static (non-scrolling) wrapped row of text labels — TAT + 2 awards + 5 milestone event names, no images.
- Way of work: 4 level cards (Lv.1–4) with correct labels, "ดู Way of work แบบเต็ม"/"See Full Way of Work" link to `/contact`.
- FAQ: 4 accordion items with the new confirmed Q&As, expand/collapse works, "ดู FAQ ทั้งหมด"/"See All FAQs" button linking to `/faq`.
- Final CTA: midnight background with gradient-dawn glow (same treatment as Hero), headline/subheadline, single "เริ่มโปรเจกต์"/"Start a Project" button linking to `/contact`.
- No console errors in either locale.
- No `rounded`/pill shapes anywhere on the page except the chamfered primary buttons (Hero's, Final CTA's).
- No deprecated-token classes visible in a DOM inspection (spot-check a couple of elements — should be `text-ink`/`bg-white`/`bg-navy`/`text-mist`, never `text-dream-cream`/`bg-deep-space`).

Stop the dev server after.

- [ ] **Step 4: Confirm `/contact`, `/services`, `/portfolio`, `/faq`, `/team/[slug]` still work**

Still on `pnpm dev` (or restart it), spot-check `/th/contact`, `/th/services`, `/th/portfolio`, `/th/faq` load without errors and their forms/grids/accordions still function — these pages are untouched by this phase and should look exactly as they did after Phase 1 (old CI, unchanged), confirming nothing in Home's rebuild broke their shared components (`ServiceCard`, `PortfolioCard`, `FaqItem`, `ContactForm`).

---

## Self-Review Notes

- **Spec coverage:** Home's 9 sections (`medream-website-copy.md`) → Tasks 4–12, one task per section (Hero, We Dream, We Do, We Make Difference, Works, Trusted by, Way of work, FAQ, Final CTA). Design-system rules (chamfer/no-radius, color ratio, gradient restricted to hero+CTA, no looping animation, no emoji icons, warm-on-navy-only contrast) → encoded per-component and called out explicitly in Global Constraints. tsparticles removal → Task 3+4. `page.tsx` reassembly → Task 13.
- **Placeholder scan:** every JSON/JSX code block is complete, no `TBD`/`TODO`. Image placeholders (`/images/portfolio/placeholder.png`) are real, already-existing files, not broken paths.
- **Type consistency:** every section component's prop signature declared in its own task's "Produces" line matches exactly how `page.tsx` (Task 13) calls it — `HeroSection({ site, home })`, `WeDreamSection({ home, locale })`, `WeDoSection({ home, locale })`, `WeMakeDifferenceSection({ home, locale })`, `WorksSection({ home, locale })`, `TrustedBySection({ home, awards, milestones, locale })`, `WayOfWorkSection({ home, locale })`, `FaqPreviewSection({ home, locale })`, `FinalCtaSection({ home, locale })`. `HomeContent`'s nested field names (Task 1) are used identically in every consuming task — cross-checked `dream.headline`/`dream.body_th/en`/`dream.dna`, `services.cards[].id/title/body/cta`, `difference.microProofNumber/microProof_th/en`, `works.teasers[].id/title/desc/image`, `trustedBy.extraClients[].label_th/en`, `wayOfWork.steps[].level/label_th/en`, `faqPreview.items[].question/answer_th/en`, `finalCta.headline/subheadline_th/en` against Task 1's interface — all match.
- **Known follow-ups, explicitly not silently dropped:** `content/faq.json` and `content/portfolio.json` still hold their old, unrelated content after this phase — Home no longer reads them, but `/faq` and `/portfolio` still do, and will look stale/inconsistent with Home's new copy until Phase 6 (FAQ) and Phase 5 (Works) land. `site.json.pipeline` still holds its old 5-generic-step content (only `/contact`'s future full Way-of-work section reads it, and that doesn't exist as a page section yet). This is intentional phase sequencing, not an oversight.
