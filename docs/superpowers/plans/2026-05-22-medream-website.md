# MeDream Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build MeDream Studio's public marketing website — Thai/English, 10-section homepage, 9 public pages + hidden team portfolios, contact form → Google Sheets.

**Architecture:** Next.js 15 App Router with `[locale]` route segment for Thai/English i18n via next-intl. All content stored as JSON files in `/content/` — edit JSON, push to git, Vercel auto-redeploys. Contact form submissions append to Google Sheets via a service account API route.

**Tech Stack:** Next.js 15, Tailwind CSS v4, next-intl v3, tsparticles (slim), googleapis, LINE Seed Sans TH (self-hosted WOFF2), Vercel

---

## File Map

```
/Users/bank/Documents/works/medream-site/
├── next.config.ts
├── middleware.ts  (next-intl locale routing)
├── .env.local
├── .env.example
├── messages/
│   ├── th.json
│   └── en.json
├── content/
│   ├── nav.json
│   ├── site.json
│   ├── services.json
│   ├── portfolio.json
│   ├── team.json
│   ├── team/example-member.json
│   ├── faq.json
│   ├── blog.json
│   ├── awards.json
│   └── careers.json
├── public/
│   ├── fonts/          (LINE Seed Sans TH — already copied)
│   └── images/
│       ├── logo/       (logo-color.png, logo-black.png, logo-white.png)
│       ├── portfolio/  (placeholder.png)
│       └── team/       (placeholder.png)
└── src/
    ├── app/
    │   ├── [locale]/
    │   │   ├── layout.tsx
    │   │   ├── page.tsx               (homepage)
    │   │   ├── about/page.tsx
    │   │   ├── services/page.tsx
    │   │   ├── portfolio/page.tsx
    │   │   ├── team/page.tsx
    │   │   ├── team/[slug]/page.tsx
    │   │   ├── blog/page.tsx
    │   │   ├── blog/[slug]/page.tsx
    │   │   ├── faq/page.tsx
    │   │   ├── careers/page.tsx
    │   │   └── contact/page.tsx
    │   ├── api/contact/route.ts
    │   └── globals.css
    ├── components/
    │   ├── layout/
    │   │   ├── NavBar.tsx
    │   │   ├── MobileDrawer.tsx
    │   │   └── Footer.tsx
    │   ├── home/
    │   │   ├── HeroSection.tsx
    │   │   ├── WhoWeAreSection.tsx
    │   │   ├── ServicesSection.tsx
    │   │   ├── PortfolioHighlightSection.tsx
    │   │   ├── AwardsSection.tsx
    │   │   ├── WayOfWorkSection.tsx
    │   │   ├── FaqPreviewSection.tsx
    │   │   └── ContactFormSection.tsx
    │   └── shared/
    │       ├── ContactForm.tsx
    │       ├── ServiceCard.tsx
    │       ├── PortfolioCard.tsx
    │       ├── TeamCard.tsx
    │       ├── FaqItem.tsx
    │       └── LangToggle.tsx
    ├── i18n/
    │   ├── routing.ts
    │   └── request.ts
    ├── lib/
    │   ├── content.ts
    │   └── google-sheets.ts
    └── types/
        └── content.ts
```

---

## Task 1: Scaffold Next.js 15 project

**Files:**
- Create: `next.config.ts`, `package.json`, `tsconfig.json`, `src/app/globals.css`, all Next.js boilerplate

- [ ] **Step 1: Scaffold into existing repo**

```bash
cd /Users/bank/Documents/works/medream-site
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --yes
```

When asked about Turbopack, accept default (yes).

- [ ] **Step 2: Install additional dependencies**

```bash
npm install next-intl @tsparticles/react @tsparticles/slim googleapis
```

- [ ] **Step 3: Verify dev server starts**

```bash
npm run dev
```

Expected: `▲ Next.js 15.x.x` and `Local: http://localhost:3000` — no errors.

- [ ] **Step 4: Remove boilerplate**

Delete `src/app/page.tsx` contents (replace in Task 20). Delete `public/vercel.svg`, `public/next.svg`. Keep `src/app/layout.tsx` and `src/app/globals.css` — will overwrite in Task 2.

- [ ] **Step 5: Add .gitignore entries**

```bash
echo ".env.local" >> .gitignore
echo ".superpowers/" >> .gitignore
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js 15 project"
```

---

## Task 2: Brand foundation — fonts, CSS vars, Tailwind theme

**Files:**
- Modify: `src/app/globals.css`
- Create: `src/app/[locale]/` directory structure placeholder

- [ ] **Step 1: Write globals.css**

```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  /* Brand colors */
  --color-midnight: #060a14;
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
  --font-sans: "LINE Seed Sans TH", Arial, sans-serif;

  /* Breakpoints (matches spec: md=768, lg=1024, xl=1280) */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

@font-face {
  font-family: "LINE Seed Sans TH";
  src: url("/fonts/LINESeedSansTH_W_Th.woff2") format("woff2");
  font-weight: 100;
  font-display: swap;
}

@font-face {
  font-family: "LINE Seed Sans TH";
  src: url("/fonts/LINESeedSansTH_W_Rg.woff2") format("woff2");
  font-weight: 400;
  font-display: swap;
}

@font-face {
  font-family: "LINE Seed Sans TH";
  src: url("/fonts/LINESeedSansTH_W_Bd.woff2") format("woff2");
  font-weight: 700;
  font-display: swap;
}

@font-face {
  font-family: "LINE Seed Sans TH";
  src: url("/fonts/LINESeedSansTH_W_XBd.woff2") format("woff2");
  font-weight: 800;
  font-display: swap;
}

@font-face {
  font-family: "LINE Seed Sans TH";
  src: url("/fonts/LINESeedSansTH_W_He.woff2") format("woff2");
  font-weight: 900;
  font-display: swap;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: #060a14;
  color: #fbf4e0;
  font-family: var(--font-sans);
}
```

- [ ] **Step 2: Copy logo assets**

```bash
mkdir -p /Users/bank/Documents/works/medream-site/public/images/logo
cp "/Users/bank/Downloads/MeDream Website/images/image3.png" \
   /Users/bank/Documents/works/medream-site/public/images/logo/logo-color.png
cp "/Users/bank/Downloads/MeDream Website/images/image4.png" \
   /Users/bank/Documents/works/medream-site/public/images/logo/logo-black.png
cp "/Users/bank/Downloads/MeDream Website/images/image2.png" \
   /Users/bank/Documents/works/medream-site/public/images/logo/logo-white.png
```

- [ ] **Step 3: Create placeholder images**

```bash
mkdir -p public/images/portfolio public/images/team
# Download a simple placeholder (600x400 dark blue rectangle)
curl -sL "https://placehold.co/600x400/0d1a3e/3d6ee8.png" \
  -o public/images/portfolio/placeholder.png 2>/dev/null || \
  cp public/images/logo/logo-color.png public/images/portfolio/placeholder.png
cp public/images/portfolio/placeholder.png public/images/team/placeholder.png
```

- [ ] **Step 4: Verify font loads**

```bash
npm run dev
```

Open `http://localhost:3000` — body text should use LINE Seed Sans TH (check in DevTools > Network > Fonts).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: brand tokens, LINE Seed Sans TH font, logo assets"
```

---

## Task 3: TypeScript content types

**Files:**
- Create: `src/types/content.ts`

- [ ] **Step 1: Write content.ts**

```typescript
// src/types/content.ts

export interface NavItem {
  key: string
  href: string
  label_th: string
  label_en: string
}

export interface NavConfig {
  items: NavItem[]
}

export interface PipelineStep {
  label_th: string
  label_en: string
  icon: string
}

export interface SocialLink {
  platform: string
  url: string
  icon: string
}

export interface SiteConfig {
  name: string
  tagline_th: string
  tagline_en: string
  vision_th: string
  vision_en: string
  mission_th: string
  mission_en: string
  intro_th: string
  intro_en: string
  history_th: string
  history_en: string
  pipeline: PipelineStep[]
  socials: SocialLink[]
  email: string
  phone: string
  copyright_th: string
  copyright_en: string
}

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

export interface PortfolioItem {
  id: string
  title_th: string
  title_en: string
  type: 'own-ip' | 'client'
  featured: boolean
  image: string
  tags: string[]
  year: number
  desc_th: string
  desc_en: string
}

export interface TeamMember {
  name: string
  role_th: string
  role_en: string
  photo: string
  slug: string
}

export interface TeamMemberWork {
  title: string
  image: string
  desc_th: string
  desc_en: string
  year: number
}

export interface TeamMemberDetail {
  name: string
  role_th: string
  role_en: string
  photo: string
  bio_th: string
  bio_en: string
  skills: string[]
  works: TeamMemberWork[]
}

export interface FaqItem {
  question_th: string
  question_en: string
  answer_th: string
  answer_en: string
  featured: boolean
}

export interface BlogPost {
  slug: string
  title_th: string
  title_en: string
  date: string
  excerpt_th: string
  excerpt_en: string
  body_th: string
  body_en: string
  tags: string[]
  image: string
}

export interface Award {
  name_th: string
  name_en: string
  year: number
  event: string
  image: string
}

export interface CareerOpening {
  id: string
  title_th: string
  title_en: string
  type: 'full-time' | 'freelance' | 'intern'
  desc_th: string
  desc_en: string
  open: boolean
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/content.ts
git commit -m "feat: TypeScript content types"
```

---

## Task 4: Placeholder content JSON files

**Files:**
- Create: all files under `content/`

- [ ] **Step 1: content/nav.json**

```json
{
  "items": [
    { "key": "about",     "href": "/about",     "label_th": "เกี่ยวกับเรา", "label_en": "About" },
    { "key": "services",  "href": "/services",  "label_th": "บริการ",       "label_en": "Services" },
    { "key": "portfolio", "href": "/portfolio", "label_th": "ผลงาน",        "label_en": "Portfolio" },
    { "key": "team",      "href": "/team",      "label_th": "ทีมงาน",       "label_en": "Team" },
    { "key": "blog",      "href": "/blog",      "label_th": "บทความ",       "label_en": "Blog" },
    { "key": "faq",       "href": "/faq",       "label_th": "คำถาม",        "label_en": "FAQ" },
    { "key": "careers",   "href": "/careers",   "label_th": "ร่วมงาน",      "label_en": "Careers" },
    { "key": "contact",   "href": "/contact",   "label_th": "ติดต่อ",       "label_en": "Contact" }
  ]
}
```

- [ ] **Step 2: content/site.json**

```json
{
  "name": "MeDream Studio",
  "tagline_th": "เราทำให้ความฝันกลายเป็นประสบการณ์จริง",
  "tagline_en": "We turn dreams into real experiences",
  "vision_th": "เป็นสตูดิโอสร้างสรรค์ชั้นนำที่ทำให้แบรนด์มีชีวิต",
  "vision_en": "To be a leading creative studio that brings brands to life",
  "mission_th": "สร้างประสบการณ์ดิจิทัลที่น่าจดจำผ่านเกม แอนิเมชัน และ AR/VR",
  "mission_en": "Create memorable digital experiences through games, animation, and AR/VR",
  "intro_th": "MeDream Studio คือทีมสร้างสรรค์ที่รวมนักออกแบบ นักพัฒนา และนักเล่าเรื่องเข้าไว้ด้วยกัน",
  "intro_en": "MeDream Studio is a creative team combining designers, developers, and storytellers",
  "history_th": "ก่อตั้งขึ้นด้วยความหลงใหลในการสร้างสรรค์ประสบการณ์ที่ไม่เหมือนใคร",
  "history_en": "Founded with a passion for creating unique interactive experiences",
  "pipeline": [
    { "label_th": "รับ Requirements", "label_en": "Requirements",  "icon": "📋" },
    { "label_th": "Game Design",      "label_en": "Game Design",   "icon": "🎮" },
    { "label_th": "UX/UI",            "label_en": "UX/UI",         "icon": "🎨" },
    { "label_th": "Development",      "label_en": "Development",   "icon": "💻" },
    { "label_th": "Testing",          "label_en": "Testing",       "icon": "✅" }
  ],
  "socials": [
    { "platform": "Facebook", "url": "https://www.facebook.com/teammediadream", "icon": "facebook" },
    { "platform": "Twitter",  "url": "https://x.com/MeDreamStudio",             "icon": "twitter" },
    { "platform": "TikTok",   "url": "https://www.tiktok.com/@medream_studio",  "icon": "tiktok" },
    { "platform": "YouTube",  "url": "https://www.youtube.com/watch?v=ZrHFJijoiCs", "icon": "youtube" }
  ],
  "email": "contact@medream-studio.com",
  "phone": "",
  "copyright_th": "© 2025 MeDream Studio. สงวนลิขสิทธิ์",
  "copyright_en": "© 2025 MeDream Studio. All rights reserved."
}
```

- [ ] **Step 3: content/services.json**

```json
[
  {
    "id": "event-game",
    "icon": "🎮",
    "title_th": "เกม Event",
    "title_en": "Event Game",
    "desc_th": "เกมสำหรับงาน event เก็บข้อมูลผู้เล่น วิเคราะห์ผลใน dashboard",
    "desc_en": "Games for events — collects player data and delivers analytics dashboard",
    "cta_th": "สนใจบริการนี้",
    "cta_en": "Enquire about this"
  },
  {
    "id": "crm-game",
    "icon": "🏆",
    "title_th": "เกม CRM",
    "title_en": "CRM Game",
    "desc_th": "เกมสะสมแต้มและดึงดูดลูกค้าให้ผูกพันกับแบรนด์",
    "desc_en": "Loyalty and engagement games that keep customers connected to your brand",
    "cta_th": "สนใจบริการนี้",
    "cta_en": "Enquire about this"
  },
  {
    "id": "animation",
    "icon": "🎬",
    "title_th": "แอนิเมชัน 2D/3D",
    "title_en": "2D/3D Animation",
    "desc_th": "แอนิเมชันสำหรับโฆษณา สื่อการสอน และ interactive storytelling",
    "desc_en": "Animation for advertising, e-learning, and interactive storytelling",
    "cta_th": "สนใจบริการนี้",
    "cta_en": "Enquire about this"
  },
  {
    "id": "interactive-quiz",
    "icon": "❓",
    "title_th": "แบบสอบถาม Interactive",
    "title_en": "Interactive Quiz",
    "desc_th": "แบบทดสอบและแบบสอบถามแบบ interactive สำหรับการวิจัยและการตลาด",
    "desc_en": "Interactive quizzes and surveys for research and marketing",
    "cta_th": "สนใจบริการนี้",
    "cta_en": "Enquire about this"
  },
  {
    "id": "ar-vr",
    "icon": "🥽",
    "title_th": "AR / VR",
    "title_en": "AR / VR",
    "desc_th": "ประสบการณ์ Augmented และ Virtual Reality สำหรับแบรนด์และการศึกษา",
    "desc_en": "Augmented and Virtual Reality experiences for brands and education",
    "cta_th": "สนใจบริการนี้",
    "cta_en": "Enquire about this"
  },
  {
    "id": "pc-mobile-game",
    "icon": "📱",
    "title_th": "เกม PC / Mobile",
    "title_en": "PC / Mobile Game",
    "desc_th": "พัฒนาเกม PC และ Mobile ตั้งแต่ต้นจนเสร็จ ทั้ง casual และ serious game",
    "desc_en": "End-to-end PC and mobile game development — casual and serious games",
    "cta_th": "สนใจบริการนี้",
    "cta_en": "Enquire about this"
  },
  {
    "id": "elearning",
    "icon": "📚",
    "title_th": "สื่อการเรียนการสอน",
    "title_en": "E-Learning Media",
    "desc_th": "สื่อการเรียนรู้แบบ interactive ที่ทำให้การเรียนสนุกและมีประสิทธิภาพ",
    "desc_en": "Interactive learning media that makes education fun and effective",
    "cta_th": "สนใจบริการนี้",
    "cta_en": "Enquire about this"
  }
]
```

- [ ] **Step 4: content/portfolio.json**

```json
[
  {
    "id": "sumeeper",
    "title_th": "Sumeeper",
    "title_en": "Sumeeper",
    "type": "own-ip",
    "featured": true,
    "image": "/images/portfolio/placeholder.png",
    "tags": ["PC Game", "Puzzle"],
    "year": 2025,
    "desc_th": "เกม puzzle บน Steam ที่พัฒนาโดยทีม MeDream",
    "desc_en": "A puzzle game on Steam developed by the MeDream team"
  },
  {
    "id": "client-event-game-1",
    "title_th": "เกม Event สำหรับลูกค้า",
    "title_en": "Client Event Game",
    "type": "client",
    "featured": true,
    "image": "/images/portfolio/placeholder.png",
    "tags": ["Event Game", "Gamification"],
    "year": 2024,
    "desc_th": "เกม event สำหรับงานออกบูธ",
    "desc_en": "Event game for trade show booth"
  }
]
```

- [ ] **Step 5: content/team.json**

```json
[
  {
    "name": "Team Member",
    "role_th": "Game Developer",
    "role_en": "Game Developer",
    "photo": "/images/team/placeholder.png",
    "slug": "example-member"
  }
]
```

- [ ] **Step 6: content/team/example-member.json**

```bash
mkdir -p content/team
```

```json
{
  "name": "Team Member",
  "role_th": "Game Developer",
  "role_en": "Game Developer",
  "photo": "/images/team/placeholder.png",
  "bio_th": "นักพัฒนาเกมที่มีประสบการณ์หลายปี",
  "bio_en": "Game developer with years of experience",
  "skills": ["Unity", "C#", "Game Design"],
  "works": [
    {
      "title": "Sumeeper",
      "image": "/images/portfolio/placeholder.png",
      "desc_th": "เกม puzzle บน Steam",
      "desc_en": "Puzzle game on Steam",
      "year": 2025
    }
  ]
}
```

- [ ] **Step 7: content/faq.json**

```json
[
  {
    "question_th": "เริ่มทำเกมต้องมีขั้นตอนอะไรบ้าง?",
    "question_en": "What are the steps to start making a game?",
    "answer_th": "เราเริ่มจากรับ requirements → game design → UX/UI → development → testing ก่อนส่งมอบงาน",
    "answer_en": "We start with requirements → game design → UX/UI → development → testing before delivery",
    "featured": true
  },
  {
    "question_th": "ทำเกมประเภทไหนได้บ้าง?",
    "question_en": "What types of games can you make?",
    "answer_th": "เราทำได้ทั้ง event game, CRM game, PC/mobile game, AR/VR และ e-learning",
    "answer_en": "We can make event games, CRM games, PC/mobile games, AR/VR, and e-learning",
    "featured": true
  },
  {
    "question_th": "ราคาเริ่มต้นเท่าไหร่?",
    "question_en": "What is the starting price?",
    "answer_th": "ราคาขึ้นอยู่กับขอบเขตงาน กรุณาติดต่อเราเพื่อรับใบเสนอราคา",
    "answer_en": "Pricing depends on scope. Please contact us for a quote.",
    "featured": true
  },
  {
    "question_th": "ระยะเวลาในการทำเกมนานแค่ไหน?",
    "question_en": "How long does game development take?",
    "answer_th": "ขึ้นอยู่กับขนาดโปรเจกต์ ตั้งแต่ 1 เดือนสำหรับ mini game จนถึง 6+ เดือนสำหรับเกมเต็ม",
    "answer_en": "Depends on project size — from 1 month for mini games to 6+ months for full games",
    "featured": true
  },
  {
    "question_th": "ทำ AR/VR ได้ไหม?",
    "question_en": "Do you do AR/VR?",
    "answer_th": "ได้เลย เรามีทีมที่เชี่ยวชาญทั้ง AR และ VR สำหรับงาน event และการตลาด",
    "answer_en": "Yes — we have specialists in both AR and VR for events and marketing",
    "featured": true
  }
]
```

- [ ] **Step 8: content/blog.json, awards.json, careers.json**

```json
[]
```

(Save empty arrays to all three files — content added later via git.)

```bash
echo "[]" > content/blog.json
echo "[]" > content/awards.json
echo "[]" > content/careers.json
```

- [ ] **Step 9: Commit**

```bash
git add content/
git commit -m "feat: placeholder content JSON files"
```

---

## Task 5: Content loader library

**Files:**
- Create: `src/lib/content.ts`

- [ ] **Step 1: Write content.ts**

```typescript
// src/lib/content.ts
import fs from 'fs'
import path from 'path'
import type {
  NavConfig, SiteConfig, Service, PortfolioItem,
  TeamMember, TeamMemberDetail, FaqItem, BlogPost, Award, CareerOpening
} from '@/types/content'

function readJson<T>(relativePath: string): T {
  const filePath = path.join(process.cwd(), 'content', relativePath)
  const raw = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(raw) as T
}

export function getNavConfig(): NavConfig {
  return readJson<NavConfig>('nav.json')
}

export function getSiteConfig(): SiteConfig {
  return readJson<SiteConfig>('site.json')
}

export function getServices(): Service[] {
  return readJson<Service[]>('services.json')
}

export function getPortfolioItems(): PortfolioItem[] {
  return readJson<PortfolioItem[]>('portfolio.json')
}

export function getFeaturedPortfolio(): PortfolioItem[] {
  return getPortfolioItems().filter(p => p.featured)
}

export function getTeamMembers(): TeamMember[] {
  return readJson<TeamMember[]>('team.json')
}

export function getTeamMemberDetail(slug: string): TeamMemberDetail | null {
  const filePath = path.join(process.cwd(), 'content', 'team', `${slug}.json`)
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(raw) as TeamMemberDetail
}

export function getFaqItems(): FaqItem[] {
  return readJson<FaqItem[]>('faq.json')
}

export function getFeaturedFaq(): FaqItem[] {
  return getFaqItems().filter(f => f.featured).slice(0, 8)
}

export function getBlogPosts(): BlogPost[] {
  return readJson<BlogPost[]>('blog.json')
}

export function getBlogPost(slug: string): BlogPost | null {
  return getBlogPosts().find(p => p.slug === slug) ?? null
}

export function getAwards(): Award[] {
  return readJson<Award[]>('awards.json')
}

export function getCareerOpenings(): CareerOpening[] {
  return readJson<CareerOpening[]>('careers.json')
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/content.ts src/types/content.ts
git commit -m "feat: typed content loaders"
```

---

## Task 6: i18n setup — next-intl

**Files:**
- Create: `src/i18n/routing.ts`, `src/i18n/request.ts`, `src/middleware.ts`, `messages/th.json`, `messages/en.json`
- Modify: `next.config.ts`

- [ ] **Step 1: src/i18n/routing.ts**

```typescript
// src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['th', 'en'],
  defaultLocale: 'th',
})
```

- [ ] **Step 2: src/i18n/request.ts**

```typescript
// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  if (!locale || !(routing.locales as readonly string[]).includes(locale)) {
    locale = routing.defaultLocale
  }
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
```

- [ ] **Step 3: src/middleware.ts**

```typescript
// src/middleware.ts
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
```

- [ ] **Step 4: next.config.ts**

```typescript
// next.config.ts
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
}

export default withNextIntl(nextConfig)
```

- [ ] **Step 5: messages/th.json**

```json
{
  "nav": {
    "open_menu": "เปิดเมนู",
    "close_menu": "ปิดเมนู",
    "contact_cta": "ติดต่อเรา"
  },
  "hero": {
    "cta_portfolio": "ดูผลงาน",
    "cta_contact": "ติดต่อเรา"
  },
  "contact_form": {
    "title": "ติดต่อเรา",
    "name": "ชื่อ-นามสกุล",
    "email": "อีเมลติดต่อ",
    "phone": "เบอร์โทรศัพท์",
    "service": "บริการที่สนใจ",
    "service_placeholder": "เลือกบริการ",
    "budget": "งบประมาณโดยประมาณ",
    "budget_placeholder": "เลือกงบประมาณ",
    "budget_options": {
      "under_50k": "ต่ำกว่า 50,000 บาท",
      "50k_200k": "50,000 – 200,000 บาท",
      "200k_500k": "200,000 – 500,000 บาท",
      "over_500k": "มากกว่า 500,000 บาท"
    },
    "message": "ข้อความเพิ่มเติม",
    "submit": "ส่งข้อมูล",
    "submitting": "กำลังส่ง...",
    "success": "ส่งข้อมูลสำเร็จ! เราจะติดต่อกลับเร็วๆ นี้",
    "error": "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
    "required": "จำเป็น"
  },
  "portfolio": {
    "filter_all": "ทั้งหมด",
    "filter_own_ip": "ผลงานของเรา",
    "filter_client": "งานลูกค้า",
    "see_all": "ดูผลงานทั้งหมด"
  },
  "faq": {
    "see_all": "ดูคำถามทั้งหมด"
  },
  "team": {
    "view_portfolio": "ดูผลงาน"
  },
  "blog": {
    "read_more": "อ่านต่อ"
  },
  "careers": {
    "full_time": "งานประจำ",
    "freelance": "ฟรีแลนซ์",
    "intern": "ฝึกงาน",
    "no_openings": "ขณะนี้ยังไม่มีตำแหน่งที่เปิดรับ"
  },
  "common": {
    "see_all": "ดูทั้งหมด",
    "back": "กลับ"
  }
}
```

- [ ] **Step 6: messages/en.json**

```json
{
  "nav": {
    "open_menu": "Open menu",
    "close_menu": "Close menu",
    "contact_cta": "Contact Us"
  },
  "hero": {
    "cta_portfolio": "See Our Work",
    "cta_contact": "Contact Us"
  },
  "contact_form": {
    "title": "Contact Us",
    "name": "Full Name",
    "email": "Contact Email",
    "phone": "Phone Number",
    "service": "Service of Interest",
    "service_placeholder": "Select a service",
    "budget": "Estimated Budget",
    "budget_placeholder": "Select budget range",
    "budget_options": {
      "under_50k": "Under 50,000 THB",
      "50k_200k": "50,000 – 200,000 THB",
      "200k_500k": "200,000 – 500,000 THB",
      "over_500k": "Over 500,000 THB"
    },
    "message": "Additional message",
    "submit": "Send",
    "submitting": "Sending...",
    "success": "Sent successfully! We'll be in touch soon.",
    "error": "Something went wrong. Please try again.",
    "required": "Required"
  },
  "portfolio": {
    "filter_all": "All",
    "filter_own_ip": "Our IP",
    "filter_client": "Client Work",
    "see_all": "See All Work"
  },
  "faq": {
    "see_all": "See All FAQs"
  },
  "team": {
    "view_portfolio": "View Portfolio"
  },
  "blog": {
    "read_more": "Read more"
  },
  "careers": {
    "full_time": "Full-time",
    "freelance": "Freelance",
    "intern": "Internship",
    "no_openings": "No open positions at this time"
  },
  "common": {
    "see_all": "See All",
    "back": "Back"
  }
}
```

- [ ] **Step 7: Verify dev server still starts**

```bash
npm run dev
```

Expected: no errors. `http://localhost:3000` should redirect to `http://localhost:3000/th`.

- [ ] **Step 8: Commit**

```bash
git add src/i18n/ src/middleware.ts messages/ next.config.ts
git commit -m "feat: next-intl i18n setup (th/en)"
```

---

## Task 7: NavBar + MobileDrawer

**Files:**
- Create: `src/components/layout/NavBar.tsx`, `src/components/layout/MobileDrawer.tsx`, `src/components/shared/LangToggle.tsx`

- [ ] **Step 1: LangToggle.tsx**

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
    // Replace locale prefix in pathname
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
      className="px-3 py-1 rounded border border-horizon text-dream-cream text-sm font-bold hover:border-dawn-gold hover:text-dawn-gold transition-colors"
      aria-label="Toggle language"
    >
      {locale === 'th' ? 'EN' : 'TH'}
    </button>
  )
}
```

- [ ] **Step 2: MobileDrawer.tsx**

```tsx
// src/components/layout/MobileDrawer.tsx
'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import type { NavItem } from '@/types/content'
import { LangToggle } from '@/components/shared/LangToggle'

interface Props {
  items: NavItem[]
  open: boolean
  onClose: () => void
}

export function MobileDrawer({ items, open, onClose }: Props) {
  const locale = useLocale()
  const t = useTranslations('nav')

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-midnight/80 z-40 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Drawer */}
      <nav
        className="fixed top-0 right-0 h-full w-72 bg-deep-space z-50 flex flex-col p-6 shadow-2xl lg:hidden"
        aria-label={t('open_menu')}
      >
        <button
          onClick={onClose}
          className="self-end text-dream-cream hover:text-dawn-gold mb-8 text-2xl"
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
                className="text-dream-cream hover:text-dawn-gold text-lg font-bold block py-2 border-b border-nebula"
              >
                {locale === 'th' ? item.label_th : item.label_en}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <LangToggle />
        </div>
      </nav>
    </>
  )
}
```

- [ ] **Step 3: NavBar.tsx**

```tsx
// src/components/layout/NavBar.tsx
'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import type { NavItem } from '@/types/content'
import { LangToggle } from '@/components/shared/LangToggle'
import { MobileDrawer } from './MobileDrawer'

interface Props {
  items: NavItem[]
}

export function NavBar({ items }: Props) {
  const locale = useLocale()
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${
          scrolled ? 'bg-midnight/95 backdrop-blur shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <Image
              src="/images/logo/logo-color.png"
              alt="MeDream Studio"
              width={40}
              height={40}
              className="object-contain"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {items.map(item => (
              <Link
                key={item.key}
                href={`/${locale}${item.href}`}
                className="text-dream-cream hover:text-dawn-gold text-sm font-bold transition-colors"
              >
                {locale === 'th' ? item.label_th : item.label_en}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <LangToggle />
            {/* Hamburger — mobile only */}
            <button
              className="lg:hidden text-dream-cream hover:text-dawn-gold p-1"
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
        </div>
      </header>

      <MobileDrawer
        items={items}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/
git commit -m "feat: NavBar with sticky scroll, mobile drawer, lang toggle"
```

---

## Task 8: Footer

**Files:**
- Create: `src/components/layout/Footer.tsx`

- [ ] **Step 1: Footer.tsx**

```tsx
// src/components/layout/Footer.tsx
import Link from 'next/link'
import Image from 'next/image'
import type { SiteConfig, NavItem } from '@/types/content'

interface Props {
  site: SiteConfig
  navItems: NavItem[]
  locale: string
}

export function Footer({ site, navItems, locale }: Props) {
  const l = locale as 'th' | 'en'

  return (
    <footer className="bg-deep-space border-t border-nebula mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Image
              src="/images/logo/logo-color.png"
              alt="MeDream Studio"
              width={48}
              height={48}
              className="mb-3 object-contain"
            />
            <p className="text-horizon text-sm leading-relaxed">
              {l === 'th' ? site.tagline_th : site.tagline_en}
            </p>
          </div>

          {/* Quick nav */}
          <div>
            <h3 className="text-dawn-gold font-bold mb-3 text-sm uppercase tracking-wider">
              {l === 'th' ? 'เมนู' : 'Navigation'}
            </h3>
            <ul className="flex flex-col gap-2">
              {navItems.map(item => (
                <li key={item.key}>
                  <Link
                    href={`/${locale}${item.href}`}
                    className="text-horizon hover:text-dream-cream text-sm transition-colors"
                  >
                    {l === 'th' ? item.label_th : item.label_en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social + Contact */}
          <div>
            <h3 className="text-dawn-gold font-bold mb-3 text-sm uppercase tracking-wider">
              {l === 'th' ? 'ติดตามเรา' : 'Follow Us'}
            </h3>
            <ul className="flex flex-col gap-2">
              {site.socials.map(s => (
                <li key={s.platform}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-horizon hover:text-dream-cream text-sm transition-colors"
                  >
                    {s.platform}
                  </a>
                </li>
              ))}
            </ul>
            {site.email && (
              <p className="text-horizon text-sm mt-3">
                <a href={`mailto:${site.email}`} className="hover:text-dream-cream transition-colors">
                  {site.email}
                </a>
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-nebula pt-6 text-center">
          <p className="text-horizon text-xs">
            {l === 'th' ? site.copyright_th : site.copyright_en}
          </p>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/Footer.tsx
git commit -m "feat: Footer component"
```

---

## Task 9: Root layout

**Files:**
- Create: `src/app/[locale]/layout.tsx`
- Modify: `src/app/globals.css` (already done)
- Delete: `src/app/layout.tsx` (replaced by locale layout)

- [ ] **Step 1: Delete old layout**

```bash
rm src/app/layout.tsx
```

- [ ] **Step 2: src/app/[locale]/layout.tsx**

```tsx
// src/app/[locale]/layout.tsx
import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { getNavConfig, getSiteConfig } from '@/lib/content'
import { NavBar } from '@/components/layout/NavBar'
import { Footer } from '@/components/layout/Footer'
import '../globals.css'

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const site = getSiteConfig()
  return {
    title: {
      default: site.name,
      template: `%s | ${site.name}`,
    },
    description: locale === 'th' ? site.tagline_th : site.tagline_en,
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as 'th' | 'en')) {
    notFound()
  }

  const messages = await getMessages()
  const nav = getNavConfig()
  const site = getSiteConfig()

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <NavBar items={nav.items} />
          <main>{children}</main>
          <Footer site={site} navItems={nav.items} locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
npm run dev
```

Navigate to `http://localhost:3000` — should redirect to `/th`, show nav bar and footer (nav items, no page content yet is fine).

- [ ] **Step 4: Commit**

```bash
git add src/app/
git commit -m "feat: locale root layout with NavBar, Footer, NextIntlClientProvider"
```

---

## Task 10: Hero Section

**Files:**
- Create: `src/components/home/HeroSection.tsx`

- [ ] **Step 1: HeroSection.tsx**

```tsx
// src/components/home/HeroSection.tsx
'use client'
import { useEffect, useState, useCallback } from 'react'
import Particles from '@tsparticles/react'
import { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import type { Engine } from '@tsparticles/engine'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import type { SiteConfig } from '@/types/content'

interface Props {
  site: SiteConfig
}

export function HeroSection({ site }: Props) {
  const locale = useLocale()
  const t = useTranslations('hero')
  const [engineReady, setEngineReady] = useState(false)

  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine)
    }).then(() => setEngineReady(true))
  }, [])

  const particlesOptions = {
    background: { color: { value: 'transparent' } },
    fpsLimit: 60,
    particles: {
      number: { value: 60, density: { enable: true } },
      color: { value: ['#ECC842', '#3D6EE8', '#8FA8E8'] },
      opacity: {
        value: { min: 0.1, max: 0.5 },
        animation: { enable: true, speed: 0.5 },
      },
      size: { value: { min: 1, max: 3 } },
      move: {
        enable: true,
        speed: 0.4,
        direction: 'none' as const,
        random: true,
        outModes: { default: 'out' as const },
      },
      links: { enable: false },
    },
    detectRetina: true,
    responsive: [
      {
        maxWidth: 768,
        options: {
          particles: { number: { value: 30 } },
        },
      },
    ],
  }

  const l = locale as 'th' | 'en'

  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden bg-midnight">
      {/* Dawn glow from bottom */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 40% at 50% 110%, rgba(23,64,176,0.35) 0%, transparent 70%)',
        }}
      />

      {/* Particles */}
      {engineReady && (
        <Particles
          id="hero-particles"
          options={particlesOptions}
          className="absolute inset-0"
        />
      )}

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl xl:text-6xl font-black text-dream-cream mb-4 leading-tight">
          {l === 'th' ? site.tagline_th : site.tagline_en}
        </h1>
        <p className="text-horizon text-lg md:text-xl mb-10 font-light">
          {site.name}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/${locale}/portfolio`}
            className="px-8 py-3 bg-royal-blue hover:bg-electric text-white font-bold rounded transition-colors text-center"
          >
            {t('cta_portfolio')}
          </Link>
          <a
            href="#contact-form"
            className="px-8 py-3 border-2 border-dawn-gold text-dawn-gold hover:bg-dawn-gold hover:text-midnight font-bold rounded transition-colors text-center"
          >
            {t('cta_contact')}
          </a>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/home/HeroSection.tsx
git commit -m "feat: HeroSection with tsparticles, dawn glow, CTA buttons"
```

---

## Task 11: Who We Are, Services, Portfolio Highlight sections

**Files:**
- Create: `src/components/home/WhoWeAreSection.tsx`, `src/components/shared/ServiceCard.tsx`, `src/components/home/ServicesSection.tsx`, `src/components/shared/PortfolioCard.tsx`, `src/components/home/PortfolioHighlightSection.tsx`

- [ ] **Step 1: WhoWeAreSection.tsx**

```tsx
// src/components/home/WhoWeAreSection.tsx
import Link from 'next/link'
import type { SiteConfig } from '@/types/content'

interface Props {
  site: SiteConfig
  locale: string
}

export function WhoWeAreSection({ site, locale }: Props) {
  const l = locale as 'th' | 'en'
  return (
    <section className="py-20 px-4 max-w-4xl mx-auto text-center">
      <h2 className="text-3xl md:text-4xl font-black text-dawn-gold mb-6">
        {l === 'th' ? 'เราคือใคร' : 'Who We Are'}
      </h2>
      <p className="text-dream-cream text-lg leading-relaxed mb-4">
        {l === 'th' ? site.intro_th : site.intro_en}
      </p>
      {(site.vision_th || site.vision_en) && (
        <p className="text-horizon text-base leading-relaxed mb-8">
          {l === 'th' ? site.vision_th : site.vision_en}
        </p>
      )}
      <Link
        href={`/${locale}/team`}
        className="inline-block px-6 py-2 border border-electric text-electric hover:bg-electric hover:text-white font-bold rounded transition-colors"
      >
        {l === 'th' ? 'ดูทีมงาน' : 'Meet the Team'}
      </Link>
    </section>
  )
}
```

- [ ] **Step 2: ServiceCard.tsx**

```tsx
// src/components/shared/ServiceCard.tsx
import type { Service } from '@/types/content'

interface Props {
  service: Service
  locale: string
}

export function ServiceCard({ service, locale }: Props) {
  const l = locale as 'th' | 'en'
  const contactUrl = `/${locale}/contact?service=${service.id}`

  return (
    <div className="bg-deep-space border border-nebula rounded-xl p-6 flex flex-col gap-3 hover:border-electric transition-colors">
      <span className="text-4xl">{service.icon}</span>
      <h3 className="text-dream-cream font-bold text-lg">
        {l === 'th' ? service.title_th : service.title_en}
      </h3>
      <p className="text-horizon text-sm leading-relaxed flex-1">
        {l === 'th' ? service.desc_th : service.desc_en}
      </p>
      <a
        href={`#contact-form?service=${service.id}`}
        onClick={e => {
          e.preventDefault()
          const el = document.getElementById('contact-form')
          if (el) {
            const url = new URL(window.location.href)
            url.searchParams.set('service', service.id)
            window.history.replaceState({}, '', url.toString())
            el.scrollIntoView({ behavior: 'smooth' })
          }
        }}
        className="mt-auto inline-block px-4 py-2 bg-royal-blue hover:bg-electric text-white text-sm font-bold rounded transition-colors text-center"
      >
        {l === 'th' ? service.cta_th : service.cta_en}
      </a>
    </div>
  )
}
```

- [ ] **Step 3: ServicesSection.tsx**

```tsx
// src/components/home/ServicesSection.tsx
import type { Service } from '@/types/content'
import { ServiceCard } from '@/components/shared/ServiceCard'

interface Props {
  services: Service[]
  locale: string
}

export function ServicesSection({ services, locale }: Props) {
  const l = locale as 'th' | 'en'
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black text-dawn-gold mb-10 text-center">
          {l === 'th' ? 'บริการของเรา' : 'Our Services'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {services.map(service => (
            <ServiceCard key={service.id} service={service} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: PortfolioCard.tsx**

```tsx
// src/components/shared/PortfolioCard.tsx
import Image from 'next/image'
import type { PortfolioItem } from '@/types/content'

interface Props {
  item: PortfolioItem
  locale: string
}

export function PortfolioCard({ item, locale }: Props) {
  const l = locale as 'th' | 'en'
  return (
    <div className="bg-deep-space border border-nebula rounded-xl overflow-hidden hover:border-electric transition-colors group">
      <div className="relative h-48 bg-nebula overflow-hidden">
        <Image
          src={item.image}
          alt={l === 'th' ? item.title_th : item.title_en}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <div className="flex gap-2 mb-2 flex-wrap">
          {item.tags.map(tag => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded bg-nebula text-horizon"
            >
              {tag}
            </span>
          ))}
          <span className="text-xs px-2 py-0.5 rounded bg-royal-blue/30 text-electric">
            {item.year}
          </span>
        </div>
        <h3 className="text-dream-cream font-bold">
          {l === 'th' ? item.title_th : item.title_en}
        </h3>
        <p className="text-horizon text-sm mt-1 leading-relaxed">
          {l === 'th' ? item.desc_th : item.desc_en}
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: PortfolioHighlightSection.tsx**

```tsx
// src/components/home/PortfolioHighlightSection.tsx
import Link from 'next/link'
import type { PortfolioItem } from '@/types/content'
import { PortfolioCard } from '@/components/shared/PortfolioCard'

interface Props {
  items: PortfolioItem[]
  locale: string
}

export function PortfolioHighlightSection({ items, locale }: Props) {
  const l = locale as 'th' | 'en'
  return (
    <section className="py-20 px-4 bg-deep-space/30">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black text-dawn-gold mb-10 text-center">
          {l === 'th' ? 'ผลงานที่ผ่านมา' : 'Our Work'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
          {items.map(item => (
            <PortfolioCard key={item.id} item={item} locale={locale} />
          ))}
        </div>
        <div className="text-center">
          <Link
            href={`/${locale}/portfolio`}
            className="inline-block px-8 py-3 border-2 border-electric text-electric hover:bg-electric hover:text-white font-bold rounded transition-colors"
          >
            {l === 'th' ? 'ดูผลงานทั้งหมด' : 'See All Work'}
          </Link>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/
git commit -m "feat: WhoWeAre, Services, PortfolioHighlight sections"
```

---

## Task 12: Awards, Way of Work, FAQ Preview sections

**Files:**
- Create: `src/components/home/AwardsSection.tsx`, `src/components/home/WayOfWorkSection.tsx`, `src/components/shared/FaqItem.tsx`, `src/components/home/FaqPreviewSection.tsx`

- [ ] **Step 1: AwardsSection.tsx**

```tsx
// src/components/home/AwardsSection.tsx
import type { Award } from '@/types/content'

interface Props {
  awards: Award[]
  locale: string
}

export function AwardsSection({ awards, locale }: Props) {
  const l = locale as 'th' | 'en'
  if (awards.length === 0) return null
  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black text-dawn-gold mb-10 text-center">
          {l === 'th' ? 'รางวัลที่ได้รับ' : 'Awards & Recognition'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {awards.map((award, i) => (
            <div
              key={i}
              className="bg-deep-space border border-nebula rounded-xl p-4 text-center"
            >
              <p className="text-dawn-gold font-bold text-sm">
                {l === 'th' ? award.name_th : award.name_en}
              </p>
              <p className="text-horizon text-xs mt-1">{award.event}</p>
              <p className="text-horizon text-xs">{award.year}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: WayOfWorkSection.tsx**

```tsx
// src/components/home/WayOfWorkSection.tsx
import type { PipelineStep } from '@/types/content'

interface Props {
  steps: PipelineStep[]
  locale: string
}

export function WayOfWorkSection({ steps, locale }: Props) {
  const l = locale as 'th' | 'en'
  return (
    <section className="py-20 px-4 bg-deep-space/30">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black text-dawn-gold mb-10 text-center">
          {l === 'th' ? 'วิธีการทำงาน' : 'How We Work'}
        </h2>

        {/* Desktop: horizontal */}
        <div className="hidden md:flex items-center justify-between gap-2">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className="flex-1 text-center">
                <div className="w-14 h-14 rounded-full bg-royal-blue border-2 border-electric flex items-center justify-center text-2xl mx-auto mb-2">
                  {step.icon}
                </div>
                <p className="text-dream-cream text-sm font-bold">
                  {l === 'th' ? step.label_th : step.label_en}
                </p>
              </div>
              {i < steps.length - 1 && (
                <div className="w-8 h-0.5 bg-electric flex-shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* Mobile: vertical */}
        <div className="flex flex-col gap-4 md:hidden">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-royal-blue border-2 border-electric flex items-center justify-center text-xl flex-shrink-0">
                {step.icon}
              </div>
              <div>
                <p className="text-dream-cream font-bold">
                  {l === 'th' ? step.label_th : step.label_en}
                </p>
                {i < steps.length - 1 && (
                  <div className="w-0.5 h-4 bg-electric ml-6 mt-2" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: FaqItem.tsx**

```tsx
// src/components/shared/FaqItem.tsx
'use client'
import { useState } from 'react'
import type { FaqItem as FaqItemType } from '@/types/content'

interface Props {
  item: FaqItemType
  locale: string
}

export function FaqItem({ item, locale }: Props) {
  const [open, setOpen] = useState(false)
  const l = locale as 'th' | 'en'

  return (
    <div className="border-b border-nebula">
      <button
        className="w-full text-left py-4 flex justify-between items-center gap-4 text-dream-cream font-bold hover:text-dawn-gold transition-colors"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span>{l === 'th' ? item.question_th : item.question_en}</span>
        <span className="text-electric flex-shrink-0 text-xl">
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <p className="pb-4 text-horizon leading-relaxed text-sm">
          {l === 'th' ? item.answer_th : item.answer_en}
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 4: FaqPreviewSection.tsx**

```tsx
// src/components/home/FaqPreviewSection.tsx
import Link from 'next/link'
import type { FaqItem as FaqItemType } from '@/types/content'
import { FaqItem } from '@/components/shared/FaqItem'

interface Props {
  items: FaqItemType[]
  locale: string
}

export function FaqPreviewSection({ items, locale }: Props) {
  const l = locale as 'th' | 'en'
  return (
    <section className="py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black text-dawn-gold mb-10 text-center">
          {l === 'th' ? 'คำถามที่พบบ่อย' : 'FAQ'}
        </h2>
        <div>
          {items.map((item, i) => (
            <FaqItem key={i} item={item} locale={locale} />
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            href={`/${locale}/faq`}
            className="inline-block px-6 py-2 border border-electric text-electric hover:bg-electric hover:text-white font-bold rounded transition-colors"
          >
            {l === 'th' ? 'ดูคำถามทั้งหมด' : 'See All FAQs'}
          </Link>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/
git commit -m "feat: Awards, WayOfWork, FaqPreview sections"
```

---

## Task 13: ContactForm component + API route

**Files:**
- Create: `src/components/shared/ContactForm.tsx`, `src/components/home/ContactFormSection.tsx`, `src/lib/google-sheets.ts`, `src/app/api/contact/route.ts`, `.env.example`

- [ ] **Step 1: .env.example**

```bash
cat > .env.example << 'EOF'
# Google Sheets integration
# Base64-encoded service account JSON key
GOOGLE_SERVICE_ACCOUNT_KEY=
# The spreadsheet ID from the sheet URL
GOOGLE_SHEET_ID=
EOF
```

- [ ] **Step 2: src/lib/google-sheets.ts**

```typescript
// src/lib/google-sheets.ts
import { google } from 'googleapis'

export async function appendContactRow(row: {
  timestamp: string
  name: string
  email: string
  phone: string
  service: string
  budget: string
  message: string
  locale: string
}) {
  const keyJson = Buffer.from(
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY!,
    'base64'
  ).toString('utf-8')

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(keyJson),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  const sheets = google.sheets({ version: 'v4', auth })

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID!,
    range: 'Sheet1!A:H',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        row.timestamp,
        row.name,
        row.email,
        row.phone,
        row.service,
        row.budget,
        row.message,
        row.locale,
      ]],
    },
  })
}
```

- [ ] **Step 3: src/app/api/contact/route.ts**

```typescript
// src/app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { appendContactRow } from '@/lib/google-sheets'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, service, budget, message, locale } = body

    if (!name || !email) {
      return NextResponse.json({ error: 'name and email are required' }, { status: 400 })
    }

    await appendContactRow({
      timestamp: new Date().toISOString(),
      name,
      email,
      phone: phone ?? '',
      service: service ?? '',
      budget: budget ?? '',
      message: message ?? '',
      locale: locale ?? 'th',
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[contact]', err)
    return NextResponse.json({ error: 'internal error' }, { status: 500 })
  }
}
```

- [ ] **Step 4: ContactForm.tsx**

```tsx
// src/components/shared/ContactForm.tsx
'use client'
import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import type { Service } from '@/types/content'

interface Props {
  services: Service[]
}

export function ContactForm({ services }: Props) {
  const locale = useLocale()
  const t = useTranslations('contact_form')
  const searchParams = useSearchParams()

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    budget: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  useEffect(() => {
    const preService = searchParams.get('service')
    if (preService) setForm(f => ({ ...f, service: preService }))
  }, [searchParams])

  function set(key: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, locale }),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  const inputClass =
    'w-full bg-deep-space border border-nebula rounded px-4 py-2 text-dream-cream placeholder-horizon focus:outline-none focus:border-electric transition-colors'
  const labelClass = 'block text-sm font-bold text-horizon mb-1'

  if (status === 'success') {
    return (
      <div className="text-center py-12">
        <p className="text-dawn-gold text-xl font-bold">{t('success')}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-2xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>
            {t('name')} <span className="text-dawn-gold">*</span>
          </label>
          <input
            required
            type="text"
            value={form.name}
            onChange={set('name')}
            placeholder={t('name')}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            {t('email')} <span className="text-dawn-gold">*</span>
          </label>
          <input
            required
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder={t('email')}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>{t('phone')}</label>
        <input
          type="tel"
          value={form.phone}
          onChange={set('phone')}
          placeholder={t('phone')}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>{t('service')}</label>
          <select value={form.service} onChange={set('service')} className={inputClass}>
            <option value="">{t('service_placeholder')}</option>
            {services.map(s => (
              <option key={s.id} value={s.id}>
                {locale === 'th' ? s.title_th : s.title_en}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>{t('budget')}</label>
          <select value={form.budget} onChange={set('budget')} className={inputClass}>
            <option value="">{t('budget_placeholder')}</option>
            <option value="under_50k">{t('budget_options.under_50k')}</option>
            <option value="50k_200k">{t('budget_options.50k_200k')}</option>
            <option value="200k_500k">{t('budget_options.200k_500k')}</option>
            <option value="over_500k">{t('budget_options.over_500k')}</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>{t('message')}</label>
        <textarea
          rows={4}
          value={form.message}
          onChange={set('message')}
          placeholder={t('message')}
          className={`${inputClass} resize-none`}
        />
      </div>

      {status === 'error' && (
        <p className="text-red-400 text-sm">{t('error')}</p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="px-8 py-3 bg-royal-blue hover:bg-electric disabled:bg-nebula text-white font-bold rounded transition-colors"
      >
        {status === 'submitting' ? t('submitting') : t('submit')}
      </button>
    </form>
  )
}
```

- [ ] **Step 5: ContactFormSection.tsx**

```tsx
// src/components/home/ContactFormSection.tsx
import { Suspense } from 'react'
import type { Service } from '@/types/content'
import { ContactForm } from '@/components/shared/ContactForm'

interface Props {
  services: Service[]
  locale: string
}

export function ContactFormSection({ services, locale }: Props) {
  const l = locale as 'th' | 'en'
  return (
    <section id="contact-form" className="py-20 px-4 bg-deep-space/30">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black text-dawn-gold mb-3 text-center">
          {l === 'th' ? 'ติดต่อเรา' : 'Contact Us'}
        </h2>
        <p className="text-horizon text-center mb-10">
          {l === 'th'
            ? 'กรอกข้อมูลเพื่อให้เราติดต่อกลับ'
            : 'Fill in the form and we\'ll get back to you'}
        </p>
        <Suspense>
          <ContactForm services={services} />
        </Suspense>
      </div>
    </section>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add src/ .env.example
git commit -m "feat: ContactForm, Google Sheets API route, ContactFormSection"
```

---

## Task 14: Homepage — assemble all sections

**Files:**
- Create: `src/app/[locale]/page.tsx`

- [ ] **Step 1: page.tsx**

```tsx
// src/app/[locale]/page.tsx
import {
  getSiteConfig, getServices, getFeaturedPortfolio,
  getAwards, getFeaturedFaq,
} from '@/lib/content'
import { HeroSection } from '@/components/home/HeroSection'
import { WhoWeAreSection } from '@/components/home/WhoWeAreSection'
import { ServicesSection } from '@/components/home/ServicesSection'
import { PortfolioHighlightSection } from '@/components/home/PortfolioHighlightSection'
import { AwardsSection } from '@/components/home/AwardsSection'
import { WayOfWorkSection } from '@/components/home/WayOfWorkSection'
import { FaqPreviewSection } from '@/components/home/FaqPreviewSection'
import { ContactFormSection } from '@/components/home/ContactFormSection'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const site = getSiteConfig()
  const services = getServices()
  const portfolio = getFeaturedPortfolio()
  const awards = getAwards()
  const faq = getFeaturedFaq()

  return (
    <>
      <HeroSection site={site} />
      <WhoWeAreSection site={site} locale={locale} />
      <ServicesSection services={services} locale={locale} />
      <PortfolioHighlightSection items={portfolio} locale={locale} />
      <AwardsSection awards={awards} locale={locale} />
      <WayOfWorkSection steps={site.pipeline} locale={locale} />
      <FaqPreviewSection items={faq} locale={locale} />
      <ContactFormSection services={services} locale={locale} />
    </>
  )
}
```

- [ ] **Step 2: Verify homepage renders**

```bash
npm run dev
```

Open `http://localhost:3000/th` — all 8 homepage sections visible, particle hero animates, nav sticky, footer present.

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/page.tsx
git commit -m "feat: homepage — all 10 sections assembled"
```

---

## Task 15: About, Services, Portfolio pages

**Files:**
- Create: `src/app/[locale]/about/page.tsx`, `src/app/[locale]/services/page.tsx`, `src/app/[locale]/portfolio/page.tsx`

- [ ] **Step 1: about/page.tsx**

```tsx
// src/app/[locale]/about/page.tsx
import type { Metadata } from 'next'
import { getSiteConfig, getAwards } from '@/lib/content'
import { AwardsSection } from '@/components/home/AwardsSection'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return { title: locale === 'th' ? 'เกี่ยวกับเรา' : 'About Us' }
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const l = locale as 'th' | 'en'
  const site = getSiteConfig()
  const awards = getAwards()

  return (
    <div className="pt-16">
      <section className="py-20 px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-dawn-gold mb-8">
          {l === 'th' ? 'เกี่ยวกับเรา' : 'About Us'}
        </h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-dream-cream text-lg leading-relaxed mb-6">
            {l === 'th' ? site.history_th : site.history_en}
          </p>
          <p className="text-dream-cream text-lg leading-relaxed">
            {l === 'th' ? site.intro_th : site.intro_en}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-deep-space border border-nebula rounded-xl p-6">
            <h2 className="text-dawn-gold font-bold text-xl mb-3">
              {l === 'th' ? 'วิสัยทัศน์' : 'Vision'}
            </h2>
            <p className="text-horizon leading-relaxed">
              {l === 'th' ? site.vision_th : site.vision_en}
            </p>
          </div>
          <div className="bg-deep-space border border-nebula rounded-xl p-6">
            <h2 className="text-dawn-gold font-bold text-xl mb-3">
              {l === 'th' ? 'พันธกิจ' : 'Mission'}
            </h2>
            <p className="text-horizon leading-relaxed">
              {l === 'th' ? site.mission_th : site.mission_en}
            </p>
          </div>
        </div>
      </section>
      <AwardsSection awards={awards} locale={locale} />
    </div>
  )
}
```

- [ ] **Step 2: services/page.tsx**

```tsx
// src/app/[locale]/services/page.tsx
import type { Metadata } from 'next'
import { getServices } from '@/lib/content'
import { ServiceCard } from '@/components/shared/ServiceCard'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return { title: locale === 'th' ? 'บริการ' : 'Services' }
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const l = locale as 'th' | 'en'
  const services = getServices()

  return (
    <div className="pt-16">
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-dawn-gold mb-4">
            {l === 'th' ? 'บริการของเรา' : 'Our Services'}
          </h1>
          <p className="text-horizon text-lg mb-12">
            {l === 'th'
              ? 'เราพร้อมสร้างประสบการณ์ดิจิทัลที่เหมาะกับแบรนด์ของคุณ'
              : 'We create digital experiences tailored to your brand'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {services.map(service => (
              <ServiceCard key={service.id} service={service} locale={locale} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 3: portfolio/page.tsx**

```tsx
// src/app/[locale]/portfolio/page.tsx
'use client'
// Note: filter state needs client — fetch data via props
```

Actually, portfolio needs client-side filter. Use a server component for data + client component for UI:

```tsx
// src/app/[locale]/portfolio/page.tsx
import type { Metadata } from 'next'
import { getPortfolioItems } from '@/lib/content'
import { PortfolioGrid } from './PortfolioGrid'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return { title: locale === 'th' ? 'ผลงาน' : 'Portfolio' }
}

export default async function PortfolioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const items = getPortfolioItems()
  return (
    <div className="pt-16">
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-dawn-gold mb-12">
            {locale === 'th' ? 'ผลงาน' : 'Portfolio'}
          </h1>
          <PortfolioGrid items={items} locale={locale} />
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 4: src/app/[locale]/portfolio/PortfolioGrid.tsx**

```tsx
// src/app/[locale]/portfolio/PortfolioGrid.tsx
'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import type { PortfolioItem } from '@/types/content'
import { PortfolioCard } from '@/components/shared/PortfolioCard'

type Filter = 'all' | 'own-ip' | 'client'

interface Props {
  items: PortfolioItem[]
  locale: string
}

export function PortfolioGrid({ items, locale }: Props) {
  const t = useTranslations('portfolio')
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = filter === 'all' ? items : items.filter(i => i.type === filter)

  const btnClass = (active: boolean) =>
    `px-4 py-1.5 rounded font-bold text-sm transition-colors ${
      active
        ? 'bg-royal-blue text-white'
        : 'border border-nebula text-horizon hover:border-electric hover:text-electric'
    }`

  return (
    <>
      <div className="flex gap-3 mb-8 flex-wrap">
        <button className={btnClass(filter === 'all')} onClick={() => setFilter('all')}>
          {t('filter_all')}
        </button>
        <button className={btnClass(filter === 'own-ip')} onClick={() => setFilter('own-ip')}>
          {t('filter_own_ip')}
        </button>
        <button className={btnClass(filter === 'client')} onClick={() => setFilter('client')}>
          {t('filter_client')}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map(item => (
          <PortfolioCard key={item.id} item={item} locale={locale} />
        ))}
      </div>
    </>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/about src/app/[locale]/services src/app/[locale]/portfolio
git commit -m "feat: About, Services, Portfolio pages"
```

---

## Task 16: Team, Blog, FAQ, Careers, Contact pages

**Files:**
- Create: all remaining page files

- [ ] **Step 1: team/page.tsx**

```tsx
// src/app/[locale]/team/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getTeamMembers } from '@/lib/content'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return { title: locale === 'th' ? 'ทีมงาน' : 'Team' }
}

export default async function TeamPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const l = locale as 'th' | 'en'
  const members = getTeamMembers()

  return (
    <div className="pt-16">
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-dawn-gold mb-12">
            {l === 'th' ? 'ทีมงาน' : 'Our Team'}
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {members.map(member => (
              <div key={member.slug} className="bg-deep-space border border-nebula rounded-xl p-6 text-center">
                <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                  <Image src={member.photo} alt={member.name} fill className="object-cover" />
                </div>
                <h3 className="text-dream-cream font-bold text-lg">{member.name}</h3>
                <p className="text-horizon text-sm mb-4">
                  {l === 'th' ? member.role_th : member.role_en}
                </p>
                <Link
                  href={`/${locale}/team/${member.slug}`}
                  className="inline-block px-4 py-1.5 border border-electric text-electric hover:bg-electric hover:text-white text-sm font-bold rounded transition-colors"
                >
                  {l === 'th' ? 'ดูผลงาน' : 'View Portfolio'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 2: team/[slug]/page.tsx**

```tsx
// src/app/[locale]/team/[slug]/page.tsx
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getTeamMemberDetail } from '@/lib/content'
import { PortfolioCard } from '@/components/shared/PortfolioCard'
import type { PortfolioItem } from '@/types/content'

export default async function MemberPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const l = locale as 'th' | 'en'
  const member = getTeamMemberDetail(slug)
  if (!member) notFound()

  // Map member works to PortfolioItem shape for reuse
  const portfolioItems: PortfolioItem[] = member.works.map((w, i) => ({
    id: `${slug}-${i}`,
    title_th: w.title,
    title_en: w.title,
    type: 'own-ip',
    featured: false,
    image: w.image,
    tags: [],
    year: w.year,
    desc_th: w.desc_th,
    desc_en: w.desc_en,
  }))

  return (
    <div className="pt-16">
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
            <div className="relative w-32 h-32 rounded-full overflow-hidden flex-shrink-0">
              <Image src={member.photo} alt={member.name} fill className="object-cover" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-dawn-gold mb-1">{member.name}</h1>
              <p className="text-electric font-bold mb-4">
                {l === 'th' ? member.role_th : member.role_en}
              </p>
              <p className="text-horizon leading-relaxed">
                {l === 'th' ? member.bio_th : member.bio_en}
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {member.skills.map(skill => (
                  <span key={skill} className="px-3 py-1 bg-nebula text-dream-cream text-sm rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-black text-dawn-gold mb-6">
            {l === 'th' ? 'ผลงาน' : 'Works'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {portfolioItems.map(item => (
              <PortfolioCard key={item.id} item={item} locale={locale} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 3: blog/page.tsx**

```tsx
// src/app/[locale]/blog/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getBlogPosts } from '@/lib/content'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return { title: locale === 'th' ? 'บทความ' : 'Blog' }
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const l = locale as 'th' | 'en'
  const posts = getBlogPosts()

  return (
    <div className="pt-16">
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-dawn-gold mb-12">
            {l === 'th' ? 'บทความ' : 'Blog'}
          </h1>
          {posts.length === 0 ? (
            <p className="text-horizon text-lg">
              {l === 'th' ? 'ยังไม่มีบทความ' : 'No posts yet'}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map(post => (
                <Link
                  key={post.slug}
                  href={`/${locale}/blog/${post.slug}`}
                  className="bg-deep-space border border-nebula rounded-xl overflow-hidden hover:border-electric transition-colors group block"
                >
                  <div className="relative h-48">
                    <Image
                      src={post.image || '/images/portfolio/placeholder.png'}
                      alt={l === 'th' ? post.title_th : post.title_en}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-horizon text-xs mb-2">{post.date}</p>
                    <h2 className="text-dream-cream font-bold group-hover:text-dawn-gold transition-colors">
                      {l === 'th' ? post.title_th : post.title_en}
                    </h2>
                    <p className="text-horizon text-sm mt-2 leading-relaxed">
                      {l === 'th' ? post.excerpt_th : post.excerpt_en}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 4: blog/[slug]/page.tsx**

```tsx
// src/app/[locale]/blog/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { getBlogPost } from '@/lib/content'

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const l = locale as 'th' | 'en'
  const post = getBlogPost(slug)
  if (!post) notFound()

  return (
    <div className="pt-16">
      <article className="py-20 px-4 max-w-3xl mx-auto">
        <p className="text-horizon text-sm mb-2">{post.date}</p>
        <h1 className="text-3xl md:text-4xl font-black text-dawn-gold mb-8">
          {l === 'th' ? post.title_th : post.title_en}
        </h1>
        <div
          className="text-dream-cream leading-relaxed prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{
            __html: l === 'th' ? post.body_th : post.body_en,
          }}
        />
      </article>
    </div>
  )
}
```

- [ ] **Step 5: faq/page.tsx**

```tsx
// src/app/[locale]/faq/page.tsx
import type { Metadata } from 'next'
import { getFaqItems } from '@/lib/content'
import { FaqItem } from '@/components/shared/FaqItem'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return { title: locale === 'th' ? 'คำถามที่พบบ่อย' : 'FAQ' }
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const l = locale as 'th' | 'en'
  const items = getFaqItems()

  return (
    <div className="pt-16">
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-dawn-gold mb-12">
            {l === 'th' ? 'คำถามที่พบบ่อย' : 'FAQ'}
          </h1>
          <div>
            {items.map((item, i) => (
              <FaqItem key={i} item={item} locale={locale} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 6: careers/page.tsx**

```tsx
// src/app/[locale]/careers/page.tsx
import type { Metadata } from 'next'
import { getCareerOpenings } from '@/lib/content'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return { title: locale === 'th' ? 'ร่วมงานกับเรา' : 'Careers' }
}

export default async function CareersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const l = locale as 'th' | 'en'
  const openings = getCareerOpenings().filter(o => o.open)

  const typeLabel: Record<string, { th: string; en: string }> = {
    'full-time': { th: 'งานประจำ', en: 'Full-time' },
    freelance:   { th: 'ฟรีแลนซ์', en: 'Freelance' },
    intern:      { th: 'ฝึกงาน',   en: 'Internship' },
  }

  return (
    <div className="pt-16">
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-dawn-gold mb-12">
            {l === 'th' ? 'ร่วมงานกับเรา' : 'Work With Us'}
          </h1>
          {openings.length === 0 ? (
            <p className="text-horizon text-lg">
              {l === 'th' ? 'ขณะนี้ยังไม่มีตำแหน่งที่เปิดรับ' : 'No open positions at this time'}
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {openings.map(opening => (
                <div key={opening.id} className="bg-deep-space border border-nebula rounded-xl p-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h2 className="text-dream-cream font-bold text-xl">
                        {l === 'th' ? opening.title_th : opening.title_en}
                      </h2>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-royal-blue/30 text-electric text-xs rounded">
                        {typeLabel[opening.type]?.[l] ?? opening.type}
                      </span>
                    </div>
                  </div>
                  <p className="text-horizon text-sm mt-3 leading-relaxed">
                    {l === 'th' ? opening.desc_th : opening.desc_en}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 7: contact/page.tsx**

```tsx
// src/app/[locale]/contact/page.tsx
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getServices } from '@/lib/content'
import { ContactForm } from '@/components/shared/ContactForm'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return { title: locale === 'th' ? 'ติดต่อเรา' : 'Contact' }
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const l = locale as 'th' | 'en'
  const services = getServices()

  return (
    <div className="pt-16">
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-dawn-gold mb-4">
            {l === 'th' ? 'ติดต่อเรา' : 'Contact Us'}
          </h1>
          <p className="text-horizon mb-12">
            {l === 'th'
              ? 'กรอกข้อมูลเพื่อให้เราติดต่อกลับโดยเร็ว'
              : "Fill in the form and we'll get back to you shortly"}
          </p>
          <Suspense>
            <ContactForm services={services} />
          </Suspense>
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 8: Verify all pages**

```bash
npm run dev
```

Check each route:
- `http://localhost:3000/th/about` ✓
- `http://localhost:3000/th/services` ✓
- `http://localhost:3000/th/portfolio` ✓
- `http://localhost:3000/th/team` ✓
- `http://localhost:3000/th/team/example-member` ✓
- `http://localhost:3000/th/blog` ✓
- `http://localhost:3000/th/faq` ✓
- `http://localhost:3000/th/careers` ✓
- `http://localhost:3000/th/contact` ✓

- [ ] **Step 9: Commit**

```bash
git add src/app/[locale]/
git commit -m "feat: all inner pages (about, services, portfolio, team, blog, faq, careers, contact)"
```

---

## Task 17: SEO + sitemap + robots

**Files:**
- Modify: `next.config.ts`
- Create: `next-sitemap.config.js`, `src/app/[locale]/not-found.tsx`
- Run: `npx next-sitemap` (post-build)

- [ ] **Step 1: Install next-sitemap**

```bash
npm install next-sitemap
```

- [ ] **Step 2: next-sitemap.config.js**

```javascript
// next-sitemap.config.js
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://www.medream-studio.com',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    additionalSitemaps: [],
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/th/team/', '/en/team/'],
      },
    ],
  },
  exclude: [
    '/th/team/*',
    '/en/team/*',
    '*/team/*',
  ],
}
```

- [ ] **Step 3: Add postbuild script to package.json**

In `package.json`, add to `scripts`:
```json
"postbuild": "next-sitemap"
```

The full scripts block should be:
```json
"scripts": {
  "dev": "next dev --turbopack",
  "build": "next build",
  "postbuild": "next-sitemap",
  "start": "next start",
  "lint": "next lint"
}
```

- [ ] **Step 4: Add SITE_URL to .env.example**

```bash
echo "SITE_URL=https://www.medream-studio.com" >> .env.example
```

- [ ] **Step 5: not-found.tsx**

```tsx
// src/app/[locale]/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="pt-16 min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-black text-dawn-gold mb-4">404</h1>
        <p className="text-horizon text-lg mb-8">Page not found</p>
        <Link
          href="/"
          className="px-6 py-2 bg-royal-blue hover:bg-electric text-white font-bold rounded transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Verify build**

```bash
npm run build
```

Expected: build completes, `postbuild` runs `next-sitemap`, `public/sitemap.xml` and `public/robots.txt` generated.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: SEO, sitemap, robots.txt, 404 page"
```

---

## Task 18: Vercel deployment config

**Files:**
- Create: `vercel.json`, update `README.md`

- [ ] **Step 1: vercel.json**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

- [ ] **Step 2: README.md**

```markdown
# MeDream Studio Website

Next.js 15 · Tailwind CSS · next-intl (TH/EN) · Vercel

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Content Updates

Edit JSON files in `/content/`, commit, push → Vercel auto-redeploys.

## Environment Variables

Copy `.env.example` to `.env.local`:

```
GOOGLE_SERVICE_ACCOUNT_KEY=  # base64-encoded service account JSON
GOOGLE_SHEET_ID=              # spreadsheet ID from sheet URL
SITE_URL=https://www.medream-studio.com
```

### Google Sheets Setup

1. Create a Google Sheet with columns: Timestamp | Name | Email | Phone | Service | Budget | Message | Locale
2. Create a service account in Google Cloud Console
3. Enable Google Sheets API
4. Share the sheet with the service account email
5. Base64-encode the downloaded JSON key: `base64 -i key.json | tr -d '\n'`
6. Set `GOOGLE_SERVICE_ACCOUNT_KEY` to that string in Vercel dashboard
7. Set `GOOGLE_SHEET_ID` to the spreadsheet ID (from the sheet URL)

## Deploy

Push to `main` → Vercel deploys automatically.
```

- [ ] **Step 3: Final commit**

```bash
git add vercel.json README.md
git commit -m "feat: Vercel config and deployment README"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|---|---|
| Next.js 15, Tailwind, next-intl, tsparticles | Tasks 1, 2, 6, 10 |
| LINE Seed Sans TH self-hosted | Task 2 |
| Brand color tokens | Task 2 |
| JSON content model | Tasks 3, 4, 5 |
| NavBar sticky + hamburger + lang toggle | Task 7 |
| Footer | Task 8 |
| Hero — particles + dawn glow + CTA | Task 10 |
| All 10 homepage sections | Tasks 10–14 |
| All public pages | Tasks 15–16 |
| Hidden `/team/[slug]` | Task 16 |
| Contact form → Google Sheets | Task 13 |
| Service CTA pre-fills form | Task 11, 13 |
| Portfolio filterable | Task 15 |
| 4 responsive breakpoints | Throughout (Tailwind md/lg/xl) |
| Mobile hamburger nav | Task 7 |
| Pipeline vertical on mobile | Task 12 |
| SEO metadata per page | Task 17 |
| sitemap.xml excluding /team/[slug] | Task 17 |
| robots.txt | Task 17 |
| Logo 3 variants | Task 2 |
| Vercel deploy | Task 18 |

All spec requirements covered.
