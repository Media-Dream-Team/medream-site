# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ Next.js Version Warning

This project runs **Next.js 16** — not 15 or 14. APIs, conventions, and file structure differ from training data. Before writing any code, read the relevant guide in `node_modules/next/dist/docs/`. Heed deprecation notices.

Key breaking pattern: `params` is a **Promise** in all route handlers and layouts:
```tsx
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
}
```

## Commands

```bash
npm run dev       # dev server with Turbopack at localhost:3000
npm run build     # production build (also runs next-sitemap postbuild)
npm run lint      # ESLint
npx tsc --noEmit  # TypeScript check
```

No test suite configured.

## Architecture

### i18n Routing

All pages live under `src/app/[locale]/` — Thai (`th`, default) and English (`en`). The middleware at `src/middleware.ts` handles locale detection and redirects. Locale messages are in `messages/th.json` and `messages/en.json`.

- `src/i18n/routing.ts` — defines `['th', 'en']` with `th` as default
- `src/i18n/request.ts` — `getRequestConfig` that loads messages per locale
- `next.config.ts` — wrapped with `createNextIntlPlugin`

### Content Model

All site content lives in `content/*.json` — **no database, no CMS**. Edit JSON and push; Vercel auto-redeploys. The content loaders in `src/lib/content.ts` read these files at request time with `fs.readFileSync`.

- `content/site.json` — name, tagline, vision, mission, pipeline steps, socials
- `content/services.json`, `portfolio.json`, `team.json`, `faq.json` — main data arrays
- `content/team/<slug>.json` — per-member detail pages (not linked from nav)
- `content/blog.json`, `awards.json`, `careers.json` — currently empty arrays

Types for all content are in `src/types/content.ts`.

### Component Pattern

Pages are **server components** that fetch content and pass it as props. Client interactivity is isolated to leaf components with `'use client'`:
- `NavBar`, `MobileDrawer`, `LangToggle` — scroll/drawer/routing state
- `ServiceCard` — smooth-scroll CTA that sets `?service=` query param
- `FaqItem` — accordion open/close
- `PortfolioGrid` — filter state (all/own-ip/client)
- `ContactForm` — form state, `useSearchParams` for service pre-fill

`ContactForm` must always be wrapped in `<Suspense>` because it calls `useSearchParams()`.

### Contact Form → Google Sheets

`POST /api/contact` → `src/lib/google-sheets.ts` → appends row to `Sheet1!A:H`.

Requires env vars:
- `GOOGLE_SERVICE_ACCOUNT_KEY` — base64-encoded service account JSON
- `GOOGLE_SHEET_ID` — spreadsheet ID from the sheet URL

### Tailwind v4

Custom brand tokens are defined via `@theme` in `src/app/globals.css` — no `tailwind.config.js`. Colors: `midnight`, `deep-space`, `nebula`, `royal-blue`, `electric`, `horizon`, `dawn-gold`, `dream-cream`. Usage: `bg-midnight`, `text-dawn-gold`, `border-electric`, etc.

### tsparticles

`HeroSection` uses `@tsparticles/react` v4 with `ParticlesProvider` + `Particles` pattern (not the `initParticlesEngine` API from v3).

### Hidden Pages

`/team/[slug]` pages are not linked from the nav and are excluded from sitemap/robots.txt. They're accessed directly by URL only.
