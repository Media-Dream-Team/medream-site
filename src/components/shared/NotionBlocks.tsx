// src/components/shared/NotionBlocks.tsx
import { Fragment, type ReactNode } from 'react'
import type { RichTextItemResponse } from '@notionhq/client'
import type { NotionBlock } from '@/lib/notion'

const COLOR_CLASS: Record<string, string> = {
  gray: 'text-horizon',
  brown: 'text-soft-gold',
  orange: 'text-soft-gold',
  yellow: 'text-dawn-gold',
  green: 'text-emerald-400',
  blue: 'text-electric',
  purple: 'text-horizon',
  pink: 'text-soft-gold',
  red: 'text-red-400',
  gray_background: 'bg-deep-space',
  blue_background: 'bg-nebula',
  yellow_background: 'bg-dawn-gold/20',
}

function RichText({ items }: { items: RichTextItemResponse[] }) {
  return (
    <>
      {items.map((item, i) => {
        let node: ReactNode = item.plain_text
        const { bold, italic, strikethrough, underline, code, color } = item.annotations
        if (code) node = <code className="bg-nebula/60 px-1.5 py-0.5 rounded text-sm">{node}</code>
        if (bold) node = <strong>{node}</strong>
        if (italic) node = <em>{node}</em>
        if (strikethrough) node = <s>{node}</s>
        if (underline) node = <u>{node}</u>
        if (color !== 'default' && COLOR_CLASS[color]) node = <span className={COLOR_CLASS[color]}>{node}</span>
        if (item.href) {
          node = (
            <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-electric underline hover:text-dawn-gold transition-colors">
              {node}
            </a>
          )
        }
        return <Fragment key={i}>{node}</Fragment>
      })}
    </>
  )
}

function Block({ block }: { block: NotionBlock }) {
  switch (block.type) {
    case 'paragraph':
      if (block.paragraph.rich_text.length === 0) return null
      return (
        <p className="mb-4 leading-relaxed">
          <RichText items={block.paragraph.rich_text} />
        </p>
      )
    case 'heading_1':
      return (
        <h2 className="text-3xl font-black text-dawn-gold mt-10 mb-4">
          <RichText items={block.heading_1.rich_text} />
        </h2>
      )
    case 'heading_2':
      return (
        <h3 className="text-2xl font-bold text-dawn-gold mt-8 mb-3">
          <RichText items={block.heading_2.rich_text} />
        </h3>
      )
    case 'heading_3':
      return (
        <h4 className="text-xl font-bold text-dream-cream mt-6 mb-2">
          <RichText items={block.heading_3.rich_text} />
        </h4>
      )
    case 'bulleted_list_item':
      return (
        <li className="ml-6 list-disc mb-1">
          <RichText items={block.bulleted_list_item.rich_text} />
          {block.children && <NotionBlocks blocks={block.children} />}
        </li>
      )
    case 'numbered_list_item':
      return (
        <li className="ml-6 list-decimal mb-1">
          <RichText items={block.numbered_list_item.rich_text} />
          {block.children && <NotionBlocks blocks={block.children} />}
        </li>
      )
    case 'quote':
      return (
        <blockquote className="border-l-4 border-electric pl-4 italic text-horizon my-6">
          <RichText items={block.quote.rich_text} />
        </blockquote>
      )
    case 'callout':
      return (
        <div className="bg-deep-space border border-nebula rounded-xl p-4 my-6 flex gap-3">
          {block.callout.icon?.type === 'emoji' && <span>{block.callout.icon.emoji}</span>}
          <div>
            <RichText items={block.callout.rich_text} />
          </div>
        </div>
      )
    case 'code':
      return (
        <pre className="bg-midnight border border-nebula rounded-xl p-4 overflow-x-auto my-6 text-sm">
          <code>
            <RichText items={block.code.rich_text} />
          </code>
        </pre>
      )
    case 'divider':
      return <hr className="border-nebula my-8" />
    case 'image': {
      const image = block.image
      const src = image.type === 'external' ? image.external.url : image.file.url
      const caption = image.caption.length > 0 ? <RichText items={image.caption} /> : null
      return (
        <figure className="my-6">
          {/* Notion-hosted image URLs are signed and expire hourly, so next/image's
              cached optimizer would eventually serve a broken image — use a plain img. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="rounded-xl w-full" />
          {caption && <figcaption className="text-horizon text-sm mt-2 text-center">{caption}</figcaption>}
        </figure>
      )
    }
    case 'bookmark':
      return (
        <a
          href={block.bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block border border-nebula rounded-xl p-4 my-4 text-electric hover:border-electric transition-colors break-all"
        >
          {block.bookmark.url}
        </a>
      )
    case 'table':
      return (
        <div className="overflow-x-auto my-6">
          <table className="w-full border-collapse border border-nebula">
            <tbody>
              {block.children?.map(row =>
                row.type === 'table_row' ? (
                  <tr key={row.id}>
                    {row.table_row.cells.map((cell, i) => (
                      <td key={i} className="border border-nebula px-3 py-2">
                        <RichText items={cell} />
                      </td>
                    ))}
                  </tr>
                ) : null
              )}
            </tbody>
          </table>
        </div>
      )
    default:
      return null
  }
}

export function NotionBlocks({ blocks }: { blocks: NotionBlock[] }) {
  const nodes: React.ReactNode[] = []
  let i = 0
  while (i < blocks.length) {
    const block = blocks[i]
    if (block.type === 'bulleted_list_item' || block.type === 'numbered_list_item') {
      const listType = block.type
      const group: NotionBlock[] = []
      while (i < blocks.length && blocks[i].type === listType) {
        group.push(blocks[i])
        i++
      }
      const Tag = listType === 'bulleted_list_item' ? 'ul' : 'ol'
      nodes.push(
        <Tag key={group[0].id} className="my-4">
          {group.map(b => (
            <Block key={b.id} block={b} />
          ))}
        </Tag>
      )
    } else {
      nodes.push(<Block key={block.id} block={block} />)
      i++
    }
  }
  return <>{nodes}</>
}
