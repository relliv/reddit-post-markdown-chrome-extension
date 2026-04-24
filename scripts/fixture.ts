import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { JSDOM } from 'jsdom'
import { extractPost, extractComments } from '../src/content/extract'
import { buildTree } from '../src/content/tree'
import { renderMarkdown } from '../src/content/render'

const root = resolve(import.meta.dirname, '..')
const fixturePath = resolve(root, 'example-reddit-post.html')
const outputPath = resolve(root, 'example-reddit-post.md')

const html = readFileSync(fixturePath, 'utf8')
const dom = new JSDOM(`<!doctype html><html><body>${html}</body></html>`)
const doc = dom.window.document

// Bridge globals jsdom doesn't auto-install for our extract code.
;(globalThis as unknown as { document: Document }).document = doc as unknown as Document

const post = extractPost(doc as unknown as ParentNode)
if (!post) {
  console.error('No <shreddit-post> found in fixture.')
  process.exit(1)
}

const flat = extractComments(doc as unknown as ParentNode)
const tree = buildTree(flat)
const md = renderMarkdown(post, tree)

writeFileSync(outputPath, md, 'utf8')
console.log(`Wrote ${outputPath}`)
console.log(`Post: ${post.title}`)
console.log(`Comments: ${flat.length} flat, ${tree.length} top-level`)
