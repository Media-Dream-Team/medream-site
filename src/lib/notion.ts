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
    cached = notion.databases
      .retrieve({ database_id: databaseId })
      .then(db => {
        const id = isFullDatabase(db) ? db.data_sources[0]?.id : undefined
        if (!id) throw new Error('Notion database has no data source')
        return id
      })
      .catch(err => {
        dataSourceIdCache.delete(databaseId)
        throw err
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
  if (!PORTFOLIO_DATABASE_ID) return []

  const data_source_id = await getDataSourceId(PORTFOLIO_DATABASE_ID)
  const pages: PageObjectResponse[] = []
  let cursor: string | undefined
  do {
    const res = await notion.dataSources.query({
      data_source_id,
      filter: { property: 'Status', select: { equals: 'Published' } },
      start_cursor: cursor,
    })
    pages.push(...res.results.filter(isFullPage))
    cursor = res.next_cursor ?? undefined
  } while (cursor)
  const rows = pages.map(toPortfolioRow)

  const bySlug = new Map<string, PortfolioRow[]>()
  for (const row of rows) {
    if (!row.slug) continue
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
        image: shared.image || '/images/portfolio/placeholder.png',
        tags: shared.tags,
        year: shared.year,
        url: shared.url,
      },
    })
  }
  merged.sort((a, b) => a.order - b.order)
  return merged.map(m => m.item)
}

export interface PortfolioDetail {
  slug: string
  title: string
  desc: string
  type: 'own-ip' | 'client'
  featured: boolean
  image: string
  tags: string[]
  year: number
  url?: string
  blocks: NotionBlock[]
}

export async function getPortfolioItem(slug: string, locale: 'th' | 'en'): Promise<PortfolioDetail | null> {
  if (!PORTFOLIO_DATABASE_ID) return null

  const data_source_id = await getDataSourceId(PORTFOLIO_DATABASE_ID)
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

  const row = toPortfolioRow(page)
  const blocks = await getBlocksRecursive(page.id)
  return {
    slug: row.slug,
    title: row.title,
    desc: row.desc,
    type: row.type,
    featured: row.featured,
    image: row.image || '/images/portfolio/placeholder.png',
    tags: row.tags,
    year: row.year,
    url: row.url,
    blocks,
  }
}
