# web/ — landing page

Landing page for the kanban skill, built with **Next.js (App Router) + React + Tailwind
CSS v4** and shipped as a **static export**. `next build` emits a fully static site into
`out/`, ready to deploy to **Cloudflare Pages** (no Node server required).

## Stack

- Next.js 15 App Router, `output: 'export'` (see `next.config.mjs`)
- React 19 + TypeScript
- Tailwind CSS v4 via `@tailwindcss/postcss` (theme defined in `app/globals.css`)

## Structure

```
app/
  layout.tsx      # <html>, metadata, global CSS
  page.tsx        # composes the sections
  globals.css     # @import "tailwindcss" + @theme tokens
components/        # Header, Hero, Features, Install, BoardTable, Footer, content.ts
public/
  assets/quickview.jpg
  _headers        # Cloudflare Pages caching + security headers
```

## Develop

```bash
cd web
npm install
npm run dev        # http://localhost:3000
```

## Build (static export)

```bash
npm run build      # -> out/
```

Because of `output: 'export'`, `next/image` runs with `images.unoptimized` and
`trailingSlash: true` emits `path/index.html` for clean URLs on static hosts.

## Deploy to Cloudflare Pages

**Via Wrangler (direct upload):**

```bash
npm run deploy
# = next build && wrangler pages deploy out --project-name kanban-skill
```

**Via the dashboard (git-connected):**

- Root directory: `web`
- Build command: `npm run build`
- Build output directory: `out`
