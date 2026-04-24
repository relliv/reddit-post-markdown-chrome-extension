import TurndownService from 'turndown'

let cached: TurndownService | null = null

export function getTurndown(): TurndownService {
  if (cached) return cached

  const td = new TurndownService({
    headingStyle: 'atx',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    emDelimiter: '_',
  })

  td.addRule('emote-img', {
    filter: (node) =>
      node.nodeName === 'IMG' &&
      (node as HTMLImageElement).classList.contains('emoji'),
    replacement: (_content, node) =>
      (node as HTMLImageElement).getAttribute('alt') ?? '',
  })

  td.addRule('drop-svg', {
    filter: (node) => node.nodeName === 'svg' || node.nodeName === 'SVG',
    replacement: () => '',
  })

  td.addRule('drop-faceplate', {
    filter: (node) => node.nodeName.toLowerCase().startsWith('faceplate-'),
    replacement: () => '',
  })

  cached = td
  return td
}

export function htmlToMarkdown(html: string): string {
  if (!html.trim()) return ''
  const md = getTurndown().turndown(html)
  return md
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
