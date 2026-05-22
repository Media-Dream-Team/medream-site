# MeDream Website — Design Spec

**Date:** 2026-05-22  
**Status:** Approved

---

## Overview

Public marketing website for MeDream Studio — a Thai creative studio producing gamification, animation, AR/VR, and interactive experiences. Primary goal: build credibility with potential B2B clients and capture leads via a contact form.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS + CSS custom properties for brand tokens |
| i18n | next-intl (`[locale]` route segment) |
| Hero animation | tsparticles (particle field, gold + blue dots, dawn glow) |
| Deployment | Vercel (push to `main` → auto-deploy) |
| Contact form backend | Next.js API route → Google Sheets API (service account) |
| Content management | JSON files in `/content/` committed to git |

No CMS. Technical team edits JSON → `git push` → Vercel redeploys.

---

## Brand Tokens

```css
--color-midnight:    #060A14;  /* dark background */
--color-deep-space:  #0D1A3E;  /* surface / card bg */
--color-nebula:      #1A2B5E;  /* border / divider */
--color-royal-blue:  #1740B0;  /* primary */
--color-electric:    #3D6EE8;  /* secondary */
--color-horizon:     #8FA8E8;  /* muted / disabled */
--color-dawn-gold:   #ECC842;  /* accent */
--color-soft-gold:   #F5D878;  /* accent light */
--color-morning-mist:#F0E8CC;  /* neutral mid */
--color-dream-cream: #FBF4E0;  /* neutral light */
```

Concept: night (Midnight) → transition (Royal/Electric Blue) → dawn (Dawn Gold). Animates the "dream becoming reality" metaphor.

**Typography:** LINE Seed Sans TH — self-hosted WOFF2 in `/public/fonts/`. Supports Thai + Latin.
- `LINESeedSansTH_W_Rg.woff2` — body text
- `LINESeedSansTH_W_Bd.woff2` — subheadings, UI labels
- `LINESeedSansTH_W_XBd.woff2` — headings
- `LINESeedSansTH_W_He.woff2` — hero display text
- `LINeSeedSansTH_W_Th.woff2` — captions, muted text

Fallback: Arial, sans-serif.

---

## i18n

- Two locales: `th` (default), `en`
- Route structure: `/th/...` and `/en/...`; root `/` redirects to browser locale preference, fallback `th`
- UI strings: `/messages/th.json` and `/messages/en.json`
- Structured content (services, portfolio, etc.): `title_th` / `title_en` fields per JSON item
- Language toggle in nav bar, persisted via cookie

---

## Pages

### Public (in nav)

| Route | Page | Notes |
|---|---|---|
| `/` | Homepage | Full scroll experience |
| `/about` | About Us | Company history, vision/mission, awards |
| `/services` | Services | All service cards with per-service CTA |
| `/portfolio` | Portfolio | Filterable: own IP + client work |
| `/team` | Team | Team overview cards linking to hidden member pages |
| `/blog` | Blog | Article list |
| `/blog/[slug]` | Blog Post | Single article |
| `/faq` | FAQ | All questions, expandable |
| `/careers` | Careers | Work with us |
| `/contact` | Contact | Standalone contact form page |

### Hidden (direct URL only, no nav link)

| Route | Page | Notes |
|---|---|---|
| `/team/[slug]` | Member Portfolio | Individual team member portfolio, unlisted |

---

## Navigation

Configured via `content/nav.json`. Array order = display order. Each item has `href`, `label_th`, `label_en`. Add/remove/reorder without touching code.

Nav bar: Logo (left) · nav links (center/right) · TH/EN toggle · sticky on scroll.

---

## Homepage Scroll Sections

1. **Nav bar** — sticky, logo + nav links + lang toggle
2. **Hero** — full-screen, tsparticles background (dark space, gold + blue floating dots, dawn glow rising from bottom), tagline, two CTA buttons: "ดูผลงาน / See Our Work" → `/portfolio`, "ติดต่อเรา / Contact Us" → `#contact-form`
3. **Who We Are** — short company intro, vision/mission (from `content/site.json`), Team button appears on scroll (links to `/team`)
4. **Services** — card grid from `content/services.json`, each card has a CTA that opens contact form pre-filled with that service
5. **Portfolio Highlight** — featured subset from `content/portfolio.json` (featured flag), "See All" → `/portfolio`
6. **Awards** — award badges/logos from `content/awards.json`
7. **Way of Work** — visual pipeline steps: Req → Game Design → UX/UI → Dev → Test (from `content/site.json` pipeline array)
8. **FAQ Preview** — top 5–8 questions from `content/faq.json` (featured flag), "See All FAQ" → `/faq`
9. **Contact Form** — inline form (`id="contact-form"`), submits to `/api/contact`
10. **Footer** — social links, quick nav, copyright (from `content/site.json`)

---

## Content Model

```
content/
├── nav.json              # nav items: href, label_th, label_en
├── site.json             # company info, social links, footer, vision, mission, pipeline steps
├── services.json         # service cards: id, icon, title_th, title_en, desc_th, desc_en, cta_th, cta_en
├── portfolio.json        # works: id, title_th, title_en, type (own-ip|client), featured, image, tags[], year
├── team.json             # team overview: name, role_th, role_en, photo, slug
├── team/
│   └── [slug].json       # member portfolio: name, bio_th, bio_en, works[], skills[]
├── faq.json              # items: question_th, question_en, answer_th, answer_en, featured
├── blog.json             # posts: slug, title_th, title_en, date, excerpt_th, excerpt_en, body_th, body_en, tags[]
├── awards.json           # award: name_th, name_en, year, event, image
└── careers.json          # openings: title_th, title_en, type (full-time|freelance|intern), desc_th, desc_en, open (bool)
```

**Logo assets** (copy from `~/Downloads/MeDream Website/images/` to `/public/images/logo/`):
- `image3.png` → `logo-color.png` (default, used on dark backgrounds)
- `image4.png` → `logo-black.png` (for light backgrounds if needed)
- `image2.png` → `logo-white.png` (for dark nav/footer)

Images stored in `/public/images/` organized by content type (`/public/images/portfolio/`, `/public/images/team/`, etc.). Placeholder images used at launch; swap by replacing files and updating JSON paths.

---

## Contact Form

**Fields:**
- Name + Lastname (required)
- Contact email (required)
- Phone number
- Service interested (dropdown, auto-populated from `services.json`)
- Budget range (dropdown: ต่ำกว่า 50k / 50k–200k / 200k–500k / 500k+)
- Message (optional)

**Flow:**
1. User submits → POST `/api/contact`
2. API route authenticates via Google service account (`GOOGLE_SERVICE_ACCOUNT_KEY` env var, base64-encoded JSON)
3. Appends row to configured Google Sheet (`GOOGLE_SHEET_ID` env var): timestamp, name, email, phone, service, budget, message, locale
4. Returns `200` → page shows success message (TH/EN)
5. Returns `500` → page shows error message, form stays filled

**Pre-fill via URL param:** Service cards link to `/#contact-form?service=event-game` — form JS reads param and pre-selects the dropdown.

---

## Responsive Design

Mobile-first. All pages must work on 3 breakpoints:

| Breakpoint | Width | Notes |
|---|---|---|
| Mobile | < 768px | Single column, hamburger nav, touch-friendly tap targets |
| Tablet | 768px–1024px | iPad mini → iPad Pro 11" portrait. 2-column grids where applicable |
| Tablet landscape | 1024px–1280px | iPad Pro 11" landscape, iPad Pro 12.9" portrait. Closer to desktop but nav stays tablet style |
| Desktop | > 1280px | Full layout as designed |

Key mobile behaviors:
- Nav collapses to hamburger menu (slide-in drawer)
- Hero particle density reduced on mobile (perf)
- Service/portfolio cards stack to single column
- Contact form full-width inputs
- Way of Work pipeline renders as vertical steps (not horizontal)

## SEO

- `metadata` export per page (Next.js App Router)
- `title`, `description`, `og:image` per page configured in page components
- Thai-language primary metadata, English alternate
- `sitemap.xml` generated via `next-sitemap`
- `robots.txt` excludes `/team/[slug]` routes

---

## Deployment

- Vercel project connected to GitHub repo
- Branch `main` → production
- Environment variables set in Vercel dashboard: `GOOGLE_SERVICE_ACCOUNT_KEY`, `GOOGLE_SHEET_ID`
- No staging environment (team is small, direct-to-prod with review before merge)
- `.superpowers/` added to `.gitignore`
