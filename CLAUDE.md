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

(`AGENTS.md` carries the same warning for tools that read that file instead.)

## Commands

This repo uses **pnpm** (`packageManager: pnpm@9.15.0` in package.json), not npm — a dependency (`@tsparticles/*`) is pinned via the `workspace:^` protocol, which only pnpm understands. `npm install` fails with `EUNSUPPORTEDPROTOCOL`. Ignore the npm instructions in README.md.

```bash
pnpm install      # install dependencies
pnpm dev          # dev server with Turbopack at localhost:3000
pnpm build        # production build (also runs next-sitemap postbuild)
pnpm lint         # ESLint
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

- `content/nav.json` — nav bar items
- `content/site.json` — name, tagline, vision, mission, pipeline steps, socials
- `content/services.json`, `team.json`, `faq.json` — main data arrays
- `content/team/<slug>.json` — per-member detail pages (not linked from nav)
- `content/awards.json`, `careers.json` — currently empty arrays
- `content/*.example.json` — reference templates showing the shape for the empty arrays above; not read by the app

**Exceptions — Blog and Portfolio:** these sections don't follow this model. Blog reads from a Notion database instead of `content/blog.json` (that file no longer exists); Portfolio reads from a Notion database instead of `content/portfolio.json` (also no longer exists). See "Blog CMS (Notion)" and "Portfolio CMS (Notion)" below.

Types for all content are in `src/types/content.ts`.

Bilingual content fields are duplicated per-field with a `_th`/`_en` suffix (e.g. `title_th`/`title_en`, `label_th`/`label_en`), not routed through next-intl — pages pick the field matching the active `locale`. This is separate from `messages/th.json` and `messages/en.json`, which hold UI chrome strings (buttons, labels, form copy) via next-intl's `useTranslations`.

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

### Blog CMS (Notion)

Unlike the rest of the site, `/blog` and `/blog/[slug]` do not read `content/*.json` — they pull from a Notion database via `src/lib/notion.ts` (using `@notionhq/client`).

- **Database:** "Blog Posts" in the "Medream Studio" Notion workspace. One row per language per article (not one row per article) — a single post is two rows sharing the same `Slug` property, one with `Locale = th` and one with `Locale = en`. Only rows with `Status = Published` are shown; body content is the row's page content (native Notion blocks), not a property.
- **Env vars:** `NOTION_API_KEY` (internal integration token), `NOTION_BLOG_DATABASE_ID` (the database's page ID, from its Notion URL — `src/lib/notion.ts` resolves this to the data source ID the query API needs via `databases.retrieve`).
- **Rendering:** `src/components/shared/NotionBlocks.tsx` maps Notion blocks (headings, paragraphs, lists, images, tables, quotes, callouts, code, dividers, bookmarks) to JSX styled with the site's own brand tokens — it does not attempt to visually replicate Notion. Images render via a plain `<img>`, not `next/image`, because Notion's file URLs are signed and expire hourly.
- **Freshness:** both blog pages set `export const revalidate = 300` — edits in Notion appear on the site within 5 minutes, no redeploy needed.
- **Not yet wired up:** GA4 view/CTA-click tracking on blog pages (deferred, tracked separately — ask before assuming it's out of scope).

### Portfolio CMS (Notion)

Like Blog, `/portfolio` does not read `content/portfolio.json` (removed) — it pulls from a Notion database via `src/lib/notion.ts`.

- **Database:** "Portfolio" in the "Medream Studio" Notion workspace. Same row-per-locale convention as Blog: one row per (item, locale) pair, two rows sharing a `Slug`, one with `Locale = th` and one with `Locale = en`. Only `Status = Published` rows are shown. `getPortfolioItems()` merges each th/en pair back into one bilingual `PortfolioItem` (`src/types/content.ts`) so the rest of the app — `PortfolioCard`, `PortfolioGrid`, and the `/team/[slug]` reuse of `PortfolioCard` — is unaware the data is locale-split in Notion.
- **Env vars:** `NOTION_API_KEY` (shared with Blog), `NOTION_PORTFOLIO_DATABASE_ID` (the database's page ID, resolved the same way as `NOTION_BLOG_DATABASE_ID`).
- **Manual ordering:** an `Order` number property (same value on both rows of a pair) drives display order, ascending — Notion doesn't guarantee row order.
- **Images:** an `Image` Files property, uploaded directly in Notion. Same hourly-signed-URL caveat as Blog's `Cover` — rendered via a plain `<img>`, not `next/image`.
- **Freshness:** `/portfolio` sets `export const revalidate = 300`, same as Blog.

### Tailwind v4

Custom brand tokens are defined via `@theme` in `src/app/globals.css` — no `tailwind.config.js`. Colors: `midnight`, `deep-space`, `nebula`, `royal-blue`, `electric`, `horizon`, `dawn-gold`, `dream-cream`. Usage: `bg-midnight`, `text-dawn-gold`, `border-electric`, etc.

### tsparticles

`HeroSection` uses `@tsparticles/react` v4 with `ParticlesProvider` + `Particles` pattern (not the `initParticlesEngine` API from v3).

### Hidden Pages

`/team/[slug]` pages are not linked from the nav and are excluded from sitemap/robots.txt. They're accessed directly by URL only.

### SEO / Metadata Pattern

Every sub-page `generateMetadata` must include `description`, `keywords`, `alternates.languages` (hreflang), and `openGraph` with image. Canonical domain is `medream-studio.com` (no www) — `next.config.ts` 301-redirects `www.*` to bare domain.

```tsx
export async function generateMetadata({ params }) {
  const { locale } = await params
  const isTh = locale === 'th'
  const title = isTh ? 'Thai Title | MeDream Studio' : 'EN Title | MeDream Studio'
  const description = isTh ? '...' : '...'
  return {
    title,
    description,
    keywords: isTh ? ['...'] : ['...'],
    alternates: {
      canonical: `https://medream-studio.com/${locale}/page`,
      languages: { th: 'https://medream-studio.com/th/page', en: 'https://medream-studio.com/en/page' },
    },
    openGraph: {
      title, description,
      url: `https://medream-studio.com/${locale}/page`,
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'MeDream Studio' }],
    },
  }
}
```

### Sitemap — Two Systems

There are two sitemap mechanisms — keep them in sync:
- `src/app/sitemap.ts` — Next.js built-in, serves `/sitemap.xml` at runtime
- `next-sitemap.config.js` — runs postbuild via `next-sitemap`, generates `public/sitemap*.xml`

Both use `https://medream-studio.com` (no www). Both exclude `/*/team/*`. If adding new routes, update `staticRoutes` in `src/app/sitemap.ts`.

### Content vs Metadata

`content/*.json` = visible page text (what users and Google's crawler read).
`generateMetadata` keywords/description = `<head>` tags only (invisible to users, weak Google signal).

To improve real SEO ranking, edit `content/services.json`, `content/site.json` descriptions — not just metadata.
