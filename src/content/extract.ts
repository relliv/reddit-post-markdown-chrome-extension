export type Post = {
  title: string
  author: string
  subreddit: string
  score: number | null
  createdISO: string
  permalink: string
  bodyHtml: string
}

export type CommentNode = {
  kind: 'comment'
  id: string
  parentId: string
  depth: number
  author: string
  score: number | null
  createdISO: string
  permalink: string
  bodyHtml: string
}

export function extractPost(root: ParentNode = document): Post | null {
  const el = root.querySelector('shreddit-post')
  if (!el) return null

  const title =
    el.getAttribute('post-title') ??
    el.querySelector('h1[slot="title"]')?.textContent?.trim() ??
    ''

  const bodyEl = el.querySelector('div[slot="text-body"] div.md')
  const bodyHtml = bodyEl?.innerHTML ?? ''

  return {
    title,
    author: el.getAttribute('author') ?? '',
    subreddit:
      el.getAttribute('subreddit-prefixed-name') ??
      (el.getAttribute('subreddit-name')
        ? `r/${el.getAttribute('subreddit-name')}`
        : ''),
    score: parseIntOrNull(el.getAttribute('score')),
    createdISO: el.getAttribute('created-timestamp') ?? '',
    permalink: el.getAttribute('permalink') ?? '',
    bodyHtml,
  }
}

export function extractComments(root: ParentNode = document): CommentNode[] {
  const els = root.querySelectorAll('shreddit-comment-tree shreddit-comment')
  const out: CommentNode[] = []

  for (const el of Array.from(els)) {
    const bodyEl =
      el.querySelector('[slot="comment"].md') ??
      el.querySelector('div[slot="comment"] div.md') ??
      el.querySelector('[slot="comment"]')
    const bodyHtml = bodyEl?.innerHTML ?? ''
    if (!bodyHtml.trim()) continue

    const id = el.getAttribute('thingid') ?? ''
    if (!id) continue

    out.push({
      kind: 'comment',
      id,
      parentId: el.getAttribute('parentid') ?? '',
      depth: parseIntOrNull(el.getAttribute('depth')) ?? 0,
      author: el.getAttribute('author') ?? '',
      score: parseIntOrNull(el.getAttribute('score')),
      createdISO: el.getAttribute('created') ?? '',
      permalink: el.getAttribute('permalink') ?? '',
      bodyHtml,
    })
  }

  return out
}

function parseIntOrNull(value: string | null): number | null {
  if (value === null) return null
  const n = Number.parseInt(value, 10)
  return Number.isNaN(n) ? null : n
}
