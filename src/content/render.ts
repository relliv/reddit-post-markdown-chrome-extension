import type { Post } from './extract'
import type { TreeNode } from './tree'
import { htmlToMarkdown } from './html-to-md'

export function renderMarkdown(post: Post, tree: TreeNode[]): string {
  const lines: string[] = []

  lines.push(`# ${post.title}`)
  lines.push('')

  const meta = [
    post.subreddit ? `[${post.subreddit}](${subredditUrl(post.subreddit)})` : '',
    post.author ? `[u/${post.author}](${userUrl(post.author)})` : '',
    post.score !== null ? `${post.score} upvotes` : '',
    formatDate(post.createdISO),
  ]
    .filter(Boolean)
    .join(' · ')
  if (meta) lines.push(`> ${meta}`)
  if (post.permalink) lines.push(`> ${absoluteUrl(post.permalink)}`)
  lines.push('')

  const bodyMd = htmlToMarkdown(post.bodyHtml)
  if (bodyMd) {
    lines.push(bodyMd)
    lines.push('')
  }

  if (tree.length === 0) return lines.join('\n').trimEnd() + '\n'

  lines.push('---')
  lines.push('')
  lines.push('## Comments')
  lines.push('')
  for (const node of tree) walk(node, 0, lines)

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n'
}

function walk(node: TreeNode, depth: number, lines: string[]): void {
  const indent = '  '.repeat(depth)
  const childIndent = '  '.repeat(depth + 1)

  const c = node.comment
  const author = c.author
    ? `[**${escapeInline(c.author)}**](${userUrl(c.author)})`
    : '**[deleted]**'
  const meta = `${author} · ${c.score ?? 0} upvotes · ${formatDate(c.createdISO)}`

  const body = htmlToMarkdown(c.bodyHtml)
  const blocks = body.split(/\n{2,}/).filter((b) => b.length > 0)
  const first = blocks[0] ?? ''
  const restBlocks = blocks.slice(1)

  if (blocks.length === 0) {
    lines.push(`${indent}- ${meta}`)
  } else if (!isBlocky(first)) {
    const firstInline = first.replace(/\n+/g, ' ').trim()
    lines.push(`${indent}- ${meta}: ${firstInline}`)
    for (const b of restBlocks) {
      lines.push('')
      for (const ln of b.split('\n')) lines.push(childIndent + ln)
    }
  } else {
    lines.push(`${indent}- ${meta}`)
    for (const b of blocks) {
      lines.push('')
      for (const ln of b.split('\n')) lines.push(childIndent + ln)
    }
  }

  for (const child of node.children) walk(child, depth + 1, lines)
}

function isBlocky(block: string): boolean {
  return /^(```|>|[-*+] |\d+\.\s|#{1,6}\s)/.test(block)
}

function escapeInline(s: string): string {
  return s.replace(/([\\*_`])/g, '\\$1')
}

function formatDate(iso: string): string {
  if (!iso) return ''
  const m = iso.match(/^\d{4}-\d{2}-\d{2}/)
  return m ? m[0] : ''
}

function userUrl(author: string): string {
  return `https://www.reddit.com/user/${encodeURIComponent(author)}/`
}

function subredditUrl(subreddit: string): string {
  const name = subreddit.replace(/^r\//i, '')
  return `https://www.reddit.com/r/${encodeURIComponent(name)}/`
}

function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  return `https://www.reddit.com${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`
}
