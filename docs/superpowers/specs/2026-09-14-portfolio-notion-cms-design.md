# Portfolio CMS on Notion — Design

## Goal

Move the `/portfolio` page's content source from the static `content/portfolio.json` file to a Notion database, mirroring the existing Blog CMS (`src/lib/notion.ts`), so portfolio items can be added/edited/reordered from Notion without a code change or redeploy.

## Background

- The Blog CMS already proved this pattern: a Notion database queried via `@notionhq/client`, `Status = Published` gating visibility, `revalidate = 300` for freshness, one row per (article, locale) pair sharing a `Slug`.
- Portfolio items are much shorter-lived data than blog posts — no long-form body, just a handful of fields (title, description, type, image, tags, year, url) already duplicated `_th`/`_en` in `PortfolioItem`.
- `PortfolioCard` (in `src/components/shared/PortfolioCard.tsx`) is shared between `/portfolio` and `/team/[slug]` (which maps `TeamMemberWork` → `PortfolioItem` locally, unrelated to Notion). Its prop type must stay a bilingual `PortfolioItem` so that reuse is untouched.

## Notion schema — "Portfolio" database

New database in the same Notion workspace as "Blog Posts", shared with the same integration. Two rows per item (one per locale), linked by `Slug`, matching the Blog CMS's row-per-locale convention:

| Property | Type | Notes |
|---|---|---|
| Title | title | per-locale title |
| Slug | rich_text | shared key linking the th/en row pair, e.g. `sumeeper` |
| Locale | select (`th` / `en`) | |
| Status | select (`Published` / `Draft`) | only `Published` rows are shown |
| Description | rich_text | per-locale description |
| Type | select (`own-ip` / `client`) | same value on both rows of a pair |
| Featured | checkbox | same value on both rows of a pair |
| Image | files | uploaded directly in Notion; same image on both rows |
| Tags | multi_select | same value on both rows of a pair |
| Year | number | same value on both rows of a pair |
| Order | number | manual sort key; same value on both rows of a pair; ascending |
| URL | url (optional) | same value on both rows of a pair |

Image URLs from Notion's Files property are signed and expire hourly — same caveat as the Blog `Cover` property. Rendered via a plain `<img>`, not `next/image`.

## Data layer — `src/lib/notion.ts`

1. **Generalize `getDataSourceId`.** Currently it closes over a single hardcoded `DATABASE_ID` and caches one promise. Change it to accept a database ID and cache per-ID (e.g. a `Map<string, Promise<string>>`), since the module now talks to two databases.
2. **New env var:** `NOTION_PORTFOLIO_DATABASE_ID` (same shape/resolution as `NOTION_BLOG_DATABASE_ID` — the page ID from the database's Notion URL, resolved to a data source ID via `databases.retrieve`). Reuses the existing `NOTION_API_KEY`.
3. **New function `getPortfolioItems(): Promise<PortfolioItem[]>`:**
   - Query the Portfolio data source filtered to `Status = Published` only (no `Locale` filter — both rows of every pair are needed).
   - Group the returned rows by `Slug`.
   - For each `Slug` group, merge the th/en row pair into one `PortfolioItem`:
     - `title_th`/`title_en` and `desc_th`/`desc_en` come from the row matching that locale.
     - `type`, `featured`, `image`, `tags`, `year`, `url`, and the sort `Order` are read from either row (values are expected to be identical across the pair; prefer the `th` row if both are present, fall back to whichever row exists).
   - Sort the merged items by `Order` ascending.
   - `id` on the resulting `PortfolioItem` is the `Slug`.
4. `PortfolioItem` (in `src/types/content.ts`) is unchanged — the merge step exists precisely so the rest of the app doesn't need to know rows are locale-split in Notion.

## Page wiring

- `src/app/[locale]/portfolio/page.tsx`:
  - Replace `import { getPortfolioItems } from '@/lib/content'` with `import { getPortfolioItems } from '@/lib/notion'`.
  - `const items = getPortfolioItems()` → `const items = await getPortfolioItems()`.
  - Add `export const revalidate = 300` (matches the Blog pages' 5-minute freshness window).
- `PortfolioGrid.tsx` and `PortfolioCard.tsx`: no changes — they already consume `PortfolioItem[]`.

## Removals

- Delete `content/portfolio.json` and `content/portfolio.example.json` (mirrors `content/blog.json` having been removed entirely when Blog moved to Notion).
- Remove `getPortfolioItems` from `src/lib/content.ts`.

## Docs

- `CLAUDE.md`:
  - Add a "Portfolio CMS (Notion)" section mirroring the existing "Blog CMS (Notion)" section (env vars, schema summary, row-per-locale/merge note, image caveat, revalidate).
  - Update the "Content Model" section's file list and its "Exception — Blog" callout to also cover Portfolio (two Notion-backed exceptions now, not one).

## Setup required outside the repo (not part of this implementation)

1. Create the "Portfolio" database in the "Medream Studio" Notion workspace with the schema above.
2. Share it with the existing internal integration (the one already used for the Blog database).
3. Set `NOTION_PORTFOLIO_DATABASE_ID` in Vercel's environment variables (production + preview).
4. Populate the two seed items currently in `content/portfolio.json` (Sumeeper, Client Event Game) as th/en row pairs so the page isn't empty after cutover.

## Testing

- `npx tsc --noEmit` and `pnpm lint` after the change.
- No test suite in this repo (per `CLAUDE.md`); manual verification: run `pnpm dev`, confirm `/th/portfolio` and `/en/portfolio` render items from Notion once the database is populated, and that `Draft` / non-matching-locale rows are correctly excluded/merged.
