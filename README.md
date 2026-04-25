# Reddit Post Markdown

A Chrome (Manifest V3) extension that copies a Reddit post and its full nested comment tree as structured Markdown.

Output shape:

```markdown
# Post Title

> [r/sub](…) · [u/author](…) · 18 upvotes · 2026-04-07
> https://www.reddit.com/r/sub/comments/…/

post body, with paragraphs / lists / code preserved

---

## Comments

- [**author**](…) · 5 upvotes · 2026-04-07: top-level comment text
  - [**replier**](…) · 2 upvotes · 2026-04-07: nested reply
    - [**deeper**](…) · 1 upvotes · 2026-04-07: even deeper
- [**next-author**](…) · 4 upvotes · 2026-04-07: ...
```

Subreddit and author handles are linked. Multi-paragraph comments stay attached to their bullet via 2-space indentation per nesting level.

## Requirements

- Node.js 20+
- pnpm 9+

## Install

```bash
pnpm install
```

## Develop

```bash
pnpm dev          # Vite dev server with HMR for the extension
pnpm typecheck    # tsc --noEmit
pnpm fixture      # render example-reddit-post.html → example-reddit-post.md
pnpm build        # production bundle to dist/
```

`pnpm fixture` is a quick offline smoke test that runs the extraction + render pipeline against `example-reddit-post.html` via jsdom and writes `example-reddit-post.md` for visual inspection.

## Load as an unpacked extension in your browser

1. Run `pnpm build`. The bundled extension is written to `dist/`.
2. Open `chrome://extensions` (or `brave://extensions`, `edge://extensions`, `arc://extensions`, or any Chromium-based browser's extensions page).
3. Toggle **Developer mode** on (top-right).
4. Click **Load unpacked**.
5. Select the `dist/` folder inside this repo.
6. Pin the extension from the puzzle-piece icon in the toolbar so the popup is one click away.

Open any Reddit post (e.g. `https://www.reddit.com/r/<sub>/comments/<id>/<slug>/`), click the extension's toolbar icon, then press **Copy as Markdown**. The Markdown is now on your clipboard.

For live development without rebuilding manually, run `pnpm dev` and load `dist/` the same way — Vite + `@crxjs/vite-plugin` will rebuild on file changes. After major manifest changes, click the extension's reload button on the `chrome://extensions` page.

## Project layout

```text
manifest.config.ts         MV3 manifest (typed, version pulled from package.json)
vite.config.ts             Vite + @crxjs/vite-plugin
scripts/fixture.ts         Offline render against example-reddit-post.html
src/
  background/index.ts      Service worker
  content/
    index.ts               Message handler, runs on *.reddit.com
    extract.ts             Reads <shreddit-post> + <shreddit-comment> attrs and bodies
    tree.ts                Builds nested tree from flat comment list
    html-to-md.ts          Turndown wrapper (drops svg / faceplate / emote chrome)
    render.ts              Walks the tree → final Markdown
  popup/
    index.html / .ts       Toolbar popup with Copy button
    popup.css
  shared/messages.ts       Typed runtime-message contracts
```

## How it works

- The page is **new Reddit** (shreddit web components). The content script reads `<shreddit-post>` and `<shreddit-comment>` element attributes (`thingid`, `parentid`, `depth`, `author`, `score`, `created`, `permalink`) plus the rendered body HTML in `div.md`.
- Comments are a flat list ordered by document position; the tree is rebuilt from `parentid`.
- Body HTML is converted to Markdown with [Turndown](https://github.com/mixmark-io/turndown).
- The renderer emits the post block, a `---` divider, and the comment list with 2-space-per-depth indentation so paragraphs render as continuations of the same Markdown list item.
