// src/lib/notion.ts
import { Client, isFullBlock, isFullDatabase, isFullPage } from '@notionhq/client'
import type { BlockObjectResponse, PageObjectResponse, RichTextItemResponse } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_API_KEY })
const DATABASE_ID = process.env.NOTION_BLOG_DATABASE_ID ?? ''

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

let dataSourceIdPromise: Promise<string> | null = null

// The env var holds the database ID visible in the Notion URL; databases.retrieve
// resolves it to the data source ID the query API actually needs (Notion API 2025-09-03+).
function getDataSourceId(): Promise<string> {
  if (!dataSourceIdPromise) {
    dataSourceIdPromise = notion.databases.retrieve({ database_id: DATABASE_ID }).then(db => {
      const id = isFullDatabase(db) ? db.data_sources[0]?.id : undefined
      if (!id) throw new Error('Notion database has no data source')
      return id
    })
  }
  return dataSourceIdPromise
}

function plainText(richText: RichTextItemResponse[] | undefined): string {
  return (richText ?? []).map(t => t.plain_text).join('')
}

function coverUrl(page: PageObjectResponse): string | null {
  const prop = page.properties.Cover
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
    cover: coverUrl(page),
    tags: Tags?.type === 'multi_select' ? Tags.multi_select.map(t => t.name) : [],
    date: DateProp?.type === 'date' ? (DateProp.date?.start ?? '') : '',
  }
}

export async function getBlogPosts(locale: 'th' | 'en'): Promise<BlogPostSummary[]> {
  const data_source_id = await getDataSourceId()
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
  const data_source_id = await getDataSourceId()
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
