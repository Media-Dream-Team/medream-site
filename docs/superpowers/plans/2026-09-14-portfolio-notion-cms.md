# Portfolio Notion CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move `/portfolio` off `content/portfolio.json` onto a Notion database, so portfolio items can be managed entirely from Notion — mirroring the existing Blog CMS pattern in `src/lib/notion.ts`.

**Architecture:** `src/lib/notion.ts` gains a second Notion database (Portfolio) alongside the existing Blog one. Each portfolio item is two Notion rows (one per locale, sharing a `Slug`), which `getPortfolioItems()` queries and merges back into a single bilingual `PortfolioItem` — the shape the rest of the app (`PortfolioCard`, `PortfolioGrid`, and the `/team/[slug]` reuse of `PortfolioCard`) already expects, so nothing downstream of the fetch changes.

**Tech Stack:** Next.js 16 (App Router, server components), `@notionhq/client` (already a dependency), TypeScript.

**Spec:** `docs/superpowers/specs/2026-09-14-portfolio-notion-cms-design.md`

## Global Constraints

- `params` is a `Promise` in route handlers/layouts (Next.js 16) — already respected by the existing `PortfolioPage`, no change needed there.
- No test suite is configured in this repo (per `CLAUDE.md`) — verification is `npx tsc --noEmit` and `pnpm lint` after each task, not automated unit tests.
- The live Notion "Portfolio" database does not exist yet — creating it, sharing it with the integration, and setting `NOTION_PORTFOLIO_DATABASE_ID` on Vercel are manual steps outside this plan (see spec's "Setup required outside the repo" section). This plan's tasks are code-only and cannot be end-to-end verified against real data until that setup happens.
- Bilingual content fields use the `_th`/`_en` suffix convention (`title_th`/`title_en`, `desc_th`/`desc_en`) — already the shape of `PortfolioItem` in `src/types/content.ts`; do not change that type.

---

### Task 1: Generalize `src/lib/notion.ts` for multiple databases and add `getPortfolioItems()`

**Files:**
- Modify: `src/lib/notion.ts` (full rewrite of the module body — see below)

**Interfaces:**
- Consumes: `PortfolioItem` type from `src/types/content.ts` (fields: `id, title_th, title_en, type: 'own-ip'|'client', featured, image, tags, year, desc_th, desc_en, url?`).
- Produces: `export async function getPortfolioItems(): Promise<PortfolioItem[]>` — Task 2 imports this from `@/lib/notion`. Existing exports `getBlogPosts`, `getBlogPost`, `NotionBlock`, `BlogPostSummary`, `BlogPostDetail` keep their exact current signatures (no breaking changes for the Blog pages that already consume them).

This task replaces the whole file. The `getDataSourceId` function currently closes over one hardcoded `DATABASE_ID` and caches a single promise — it needs to accept a database ID and cache per-ID now that there are two databases. A new `fileUrl` helper is extracted from the existing `coverUrl` logic and reused for the Portfolio `Image` property (both are Notion `files` properties with the same shape). A `PortfolioRow` type and `toPortfolioRow` mapper read one Notion row (one locale) into a plain object; `getPortfolioItems` queries all `Status = Published` rows (both locales, no `Locale` filter), groups them by `Slug`, and merges each th/en pair into one `PortfolioItem`, sorted by the `Order` property ascending.

- [ ] **Step 1: Replace the contents of `src/lib/notion.ts`**

```ts
// src/lib/notion.ts
import { Client, isFullBlock, isFullDatabase, isFullPage } from '@notionhq/client'
import type { BlockObjectResponse, PageObjectResponse, RichTextItemResponse } from '@notionhq/client'
import type { PortfolioItem } from '@/types/content'

const notion = new Client({ auth: process.env.NOTION_API_KEY })
const BLOG_DATABASE_ID = process.env.NOTION_BLOG_DATABASE_ID ?? ''
const PORTFOLIO_DATABASE_ID = process.env.NOTION_PORTFOLIO_DATABASE_ID ?? ''

export type NotionBlock = BlockObjectResponse & { children?: NotionBlock[] }

export interface BlogPostSummary {
  slug: string
  title: string
  excerpt: string
  cover: string | null
  tags: string[]
  date: string
}

export interface BlogPostDetail extends BlogPostSummary {
  blocks: NotionBlock[]
}

type PageProperty = PageObjectResponse['properties'][string]

const dataSourceIdCache = new Map<string, Promise<string>>()

// The env var holds the database ID visible in the Notion URL; databases.retrieve
// resolves it to the data source ID the query API actually needs (Notion API 2025-09-03+).
function getDataSourceId(databaseId: string): Promise<string> {
  let cached = dataSourceIdCache.get(databaseId)
  if (!cached) {
    cached = notion.databases.retrieve({ database_id: databaseId }).then(db => {
      const id = isFullDatabase(db) ? db.data_sources[0]?.id : undefined
      if (!id) throw new Error('Notion database has no data source')
      return id
    })
    dataSourceIdCache.set(databaseId, cached)
  }
  return cached
}

function plainText(richText: RichTextItemResponse[] | undefined): string {
  return (richText ?? []).map(t => t.plain_text).join('')
}

function fileUrl(prop: PageProperty | undefined): string | null {
  if (prop?.type !== 'files' || prop.files.length === 0) return null
  const file = prop.files[0]
  return file.type === 'external' ? file.external.url : file.type === 'file' ? file.file.url : null
}

function toSummary(page: PageObjectResponse): BlogPostSummary {
  const { Slug, Title, Excerpt, Tags, Date: DateProp } = page.properties
  return {
    slug: Slug?.type === 'rich_text' ? plainText(Slug.rich_text) : '',
    title: Title?.type === 'title' ? plainText(Title.title) : '',
    excerpt: Excerpt?.type === 'rich_text' ? plainText(Excerpt.rich_text) : '',
    cover: fileUrl(page.properties.Cover),
    tags: Tags?.type === 'multi_select' ? Tags.multi_select.map(t => t.name) : [],
    date: DateProp?.type === 'date' ? (DateProp.date?.start ?? '') : '',
  }
}

export async function getBlogPosts(locale: 'th' | 'en'): Promise<BlogPostSummary[]> {
  const data_source_id = await getDataSourceId(BLOG_DATABASE_ID)
  const res = await notion.dataSources.query({
    data_source_id,
    filter: {
      and: [
        { property: 'Locale', select: { equals: locale } },
        { property: 'Status', select: { equals: 'Published' } },
      ],
    },
    sorts: [{ property: 'Date', direction: 'descending' }],
  })
  return res.results.filter(isFullPage).map(toSummary)
}

export async function getBlogPost(slug: string, locale: 'th' | 'en'): Promise<BlogPostDetail | null> {
  const data_source_id = await getDataSourceId(BLOG_DATABASE_ID)
  const res = await notion.dataSources.query({
    data_source_id,
    filter: {
      and: [
        { property: 'Slug', rich_text: { equals: slug } },
        { property: 'Locale', select: { equals: locale } },
        { property: 'Status', select: { equals: 'Published' } },
      ],
    },
    page_size: 1,
  })
  const page = res.results.find(isFullPage)
  if (!page) return null

  const blocks = await getBlocksRecursive(page.id)
  return { ...toSummary(page), blocks }
}

async function getBlocksRecursive(blockId: string): Promise<NotionBlock[]> {
  const blocks: NotionBlock[] = []
  let cursor: string | undefined
  do {
    const res = await notion.blocks.children.list({ block_id: blockId, start_cursor: cursor })
    for (const raw of res.results) {
      if (!isFullBlock(raw)) continue
      const block: NotionBlock = raw
      if (block.has_children) {
        block.children = await getBlocksRecursive(block.id)
      }
      blocks.push(block)
    }
    cursor = res.next_cursor ?? undefined
  } while (cursor)
  return blocks
}

interface PortfolioRow {
  slug: string
  locale: 'th' | 'en'
  title: string
  desc: string
  type: 'own-ip' | 'client'
  featured: boolean
  image: string
  tags: string[]
  year: number
  order: number
  url?: string
}

function toPortfolioRow(page: PageObjectResponse): PortfolioRow {
  const { Slug, Locale, Title, Description, Type, Featured, Image, Tags, Year, Order, URL } = page.properties
  return {
    slug: Slug?.type === 'rich_text' ? plainText(Slug.rich_text) : '',
    locale: Locale?.type === 'select' && Locale.select?.name === 'en' ? 'en' : 'th',
    title: Title?.type === 'title' ? plainText(Title.title) : '',
    desc: Description?.type === 'rich_text' ? plainText(Description.rich_text) : '',
    type: Type?.type === 'select' && Type.select?.name === 'client' ? 'client' : 'own-ip',
    featured: Featured?.type === 'checkbox' ? Featured.checkbox : false,
    image: fileUrl(Image) ?? '',
    tags: Tags?.type === 'multi_select' ? Tags.multi_select.map(t => t.name) : [],
    year: Year?.type === 'number' ? (Year.number ?? 0) : 0,
    order: Order?.type === 'number' ? (Order.number ?? 0) : 0,
    url: URL?.type === 'url' ? (URL.url ?? undefined) : undefined,
  }
}

export async function getPortfolioItems(): Promise<PortfolioItem[]> {
  const data_source_id = await getDataSourceId(PORTFOLIO_DATABASE_ID)
  const res = await notion.dataSources.query({
    data_source_id,
    filter: { property: 'Status', select: { equals: 'Published' } },
  })
  const rows = res.results.filter(isFullPage).map(toPortfolioRow)

  const bySlug = new Map<string, PortfolioRow[]>()
  for (const row of rows) {
    const group = bySlug.get(row.slug) ?? []
    group.push(row)
    bySlug.set(row.slug, group)
  }

  const merged: { item: PortfolioItem; order: number }[] = []
  for (const group of bySlug.values()) {
    const th = group.find(r => r.locale === 'th')
    const en = group.find(r => r.locale === 'en')
    const shared = th ?? en
    if (!shared) continue
    merged.push({
      order: shared.order,
      item: {
        id: shared.slug,
        title_th: th?.title ?? '',
        title_en: en?.title ?? '',
        desc_th: th?.desc ?? '',
        desc_en: en?.desc ?? '',
        type: shared.type,
        featured: shared.featured,
        image: shared.image,
        tags: shared.tags,
        year: shared.year,
        url: shared.url,
      },
    })
  }
  merged.sort((a, b) => a.order - b.order)
  return merged.map(m => m.item)
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Lint**

Run: `pnpm lint`
Expected: no errors in `src/lib/notion.ts`.

- [ ] **Step 4: Commit**

```bash
git add src/lib/notion.ts
git commit -m "$(cat <<'EOF'
Add Notion-backed getPortfolioItems alongside existing blog CMS

Generalizes getDataSourceId to cache per-database-id now that
notion.ts talks to two Notion databases, and merges each item's
th/en row pair back into one bilingual PortfolioItem.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Wire `/portfolio` to Notion and remove the JSON content path

**Files:**
- Modify: `src/app/[locale]/portfolio/page.tsx:1-5,35` (import and data fetch)
- Modify: `src/lib/content.ts:35-37` (remove `getPortfolioItems`)
- Modify: `.env.example` (document the new env var)
- Delete: `content/portfolio.json`
- Delete: `content/portfolio.example.json`

**Interfaces:**
- Consumes: `getPortfolioItems(): Promise<PortfolioItem[]>` from `@/lib/notion` (produced in Task 1).
- Produces: nothing new for later tasks — this is the last code change; Task 3 is docs-only.

- [ ] **Step 1: Update `src/app/[locale]/portfolio/page.tsx`**

Replace line 4:
```ts
import { getPortfolioItems } from '@/lib/content'
```
with:
```ts
import { getPortfolioItems } from '@/lib/notion'
```

Add a `revalidate` export after the imports (after line 5, before `generateMetadata`):
```ts
export const revalidate = 300
```

Replace line 35:
```ts
  const items = getPortfolioItems()
```
with:
```ts
  const items = await getPortfolioItems()
```

- [ ] **Step 2: Remove the JSON-backed loader from `src/lib/content.ts`**

Delete these lines (currently 35-37):
```ts
export function getPortfolioItems(): PortfolioItem[] {
  return readJson<PortfolioItem[]>('portfolio.json')
}

```
Also remove `PortfolioItem` from the type import list at the top of the file (line 5-6) since it's no longer used in this file:
```ts
import type {
  NavConfig, SiteConfig, ServicesContent, PortfolioItem,
  TeamMember, TeamMemberDetail, FaqItem, Award, Milestone, CareerOpening, HomeContent, AboutContent
} from '@/types/content'
```
becomes:
```ts
import type {
  NavConfig, SiteConfig, ServicesContent,
  TeamMember, TeamMemberDetail, FaqItem, Award, Milestone, CareerOpening, HomeContent, AboutContent
} from '@/types/content'
```

- [ ] **Step 3: Delete the now-unused content files**

```bash
git rm content/portfolio.json content/portfolio.example.json
```

- [ ] **Step 4: Document the new env var in `.env.example`**

Find the existing Notion block:
```
# Notion CMS (blog)
# Internal integration token, from the Notion integration created for this site
NOTION_API_KEY=
# Database ID for "Blog Posts", from its Notion URL — /p/<this-id>
NOTION_BLOG_DATABASE_ID=
```
Replace it with:
```
# Notion CMS (blog + portfolio)
# Internal integration token, from the Notion integration created for this site
NOTION_API_KEY=
# Database ID for "Blog Posts", from its Notion URL — /p/<this-id>
NOTION_BLOG_DATABASE_ID=
# Database ID for "Portfolio", from its Notion URL — /p/<this-id>
NOTION_PORTFOLIO_DATABASE_ID=
```

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors (confirms `PortfolioItem` removal from `content.ts` didn't break other imports, and that no other file still imports `getPortfolioItems` from `@/lib/content`).

- [ ] **Step 6: Lint**

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 7: Confirm no remaining references to the deleted JSON files**

Run: `grep -rn "portfolio.json" src/ content/ 2>/dev/null`
Expected: no output.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
Move /portfolio from content/portfolio.json to Notion

Portfolio now follows the same Notion-CMS pattern as Blog: the
static JSON file and its loader are removed, and the page fetches
from getPortfolioItems() in src/lib/notion.ts instead.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

**Note for the executor:** `npx tsc --noEmit` and `pnpm lint` verify the code compiles and follows lint rules, but do not exercise the Notion API. `pnpm dev` / `pnpm build` will fail to render `/portfolio` until a real "Portfolio" Notion database exists and `NOTION_PORTFOLIO_DATABASE_ID` is set (see the spec's "Setup required outside the repo" section) — that is expected and is not a regression in this task.

---

### Task 3: Update `CLAUDE.md` documentation

**Files:**
- Modify: `CLAUDE.md` (Content Model section + new Portfolio CMS section)

**Interfaces:**
- Consumes: nothing (docs only).
- Produces: nothing (terminal task).

- [ ] **Step 1: Update the Content Model section's file list and exception callout**

Find:
```markdown
- `content/services.json`, `portfolio.json`, `team.json`, `faq.json` — main data arrays
- `content/team/<slug>.json` — per-member detail pages (not linked from nav)
- `content/awards.json`, `careers.json` — currently empty arrays
- `content/*.example.json` — reference templates showing the shape for the empty arrays above; not read by the app

**Exception — Blog:** the Blog section does not follow this model. It reads from a Notion database instead of `content/blog.json` (that file no longer exists). See "Blog CMS (Notion)" below.
```
Replace with:
```markdown
- `content/services.json`, `team.json`, `faq.json` — main data arrays
- `content/team/<slug>.json` — per-member detail pages (not linked from nav)
- `content/awards.json`, `careers.json` — currently empty arrays
- `content/*.example.json` — reference templates showing the shape for the empty arrays above; not read by the app

**Exceptions — Blog and Portfolio:** these sections don't follow this model. Blog reads from a Notion database instead of `content/blog.json` (that file no longer exists); Portfolio reads from a Notion database instead of `content/portfolio.json` (also no longer exists). See "Blog CMS (Notion)" and "Portfolio CMS (Notion)" below.
```

- [ ] **Step 2: Add a "Portfolio CMS (Notion)" section right after "Blog CMS (Notion)"**

Find the end of the Blog CMS (Notion) section — the line:
```markdown
- **Not yet wired up:** GA4 view/CTA-click tracking on blog pages (deferred, tracked separately — ask before assuming it's out of scope).
```
Insert immediately after it (before the next `### Tailwind v4` heading):
```markdown

### Portfolio CMS (Notion)

Like Blog, `/portfolio` does not read `content/portfolio.json` (removed) — it pulls from a Notion database via `src/lib/notion.ts`.

- **Database:** "Portfolio" in the "Medream Studio" Notion workspace. Same row-per-locale convention as Blog: one row per (item, locale) pair, two rows sharing a `Slug`, one with `Locale = th` and one with `Locale = en`. Only `Status = Published` rows are shown. `getPortfolioItems()` merges each th/en pair back into one bilingual `PortfolioItem` (`src/types/content.ts`) so the rest of the app — `PortfolioCard`, `PortfolioGrid`, and the `/team/[slug]` reuse of `PortfolioCard` — is unaware the data is locale-split in Notion.
- **Env vars:** `NOTION_API_KEY` (shared with Blog), `NOTION_PORTFOLIO_DATABASE_ID` (the database's page ID, resolved the same way as `NOTION_BLOG_DATABASE_ID`).
- **Manual ordering:** an `Order` number property (same value on both rows of a pair) drives display order, ascending — Notion doesn't guarantee row order.
- **Images:** an `Image` Files property, uploaded directly in Notion. Same hourly-signed-URL caveat as Blog's `Cover` — rendered via a plain `<img>`, not `next/image`.
- **Freshness:** `/portfolio` sets `export const revalidate = 300`, same as Blog.
```

- [ ] **Step 3: Verify the doc reads correctly**

Run: `grep -n "Portfolio CMS\|Exceptions — Blog and Portfolio" CLAUDE.md`
Expected: both lines found, in the right order (Content Model exception callout, then the new section heading further down).

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "$(cat <<'EOF'
Document Portfolio CMS (Notion) in CLAUDE.md

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```
