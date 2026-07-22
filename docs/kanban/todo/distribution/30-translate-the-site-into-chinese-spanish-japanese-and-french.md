---
title: Translate the site into Chinese, Spanish, Japanese, and French
track: distribution
priority: med
roi: med
status: todo
blocked_by: []
related: [5]
questions:
  - Translate only the landing page, or also the comparison pages (vs-github-issues, vs-hermes-kanban) and the recipes pages?
  - When the English copy changes, how do the four translations stay in sync — a manual pass, or an agent/pre-deploy check that flags stale pages?
  - Should the site auto-redirect visitors by browser language, or only offer a visible language switcher?
---

Add Chinese, Spanish, Japanese, and French versions of the site, so people who don't read English can still get it.

## Scope
- The site lives in web/. It is a Next.js app built as static files and served on Cloudflare Pages.
- Static export means Next's built-in language routing does not work. Instead, each language gets its own path: /zh/, /es/, /ja/, /fr/. A `[locale]` route segment builds one copy of each page per language at build time.
- English stays at the root paths. No existing URL changes.
- Each language page needs the right SEO tags: hreflang links to its siblings, translated title and description, and an entry in the sitemap.
- Add a language switcher so visitors can change language by hand.
- The open questions in the frontmatter are not settled yet (which pages to translate, how translations stay fresh, redirect or not). This plan sticks to what holds either way: start with the landing page.

## Todo
- [ ] Pull the landing page text into one English copy file, so translations have one source
- [ ] Add a `[locale]` route that builds the landing page once per language; keep English at the root
- [ ] Add hreflang links and translated title/description to each language page
- [ ] Add the language pages to the sitemap
- [ ] Add a language switcher to the header or footer
- [ ] Translate the landing page copy: one pass each for Chinese, Spanish, Japanese, and French
- [ ] Review each translation with a fresh reader (agent or human) for tone and accuracy
- [ ] Update web/design.md if the switcher or new routes change what it describes
- [ ] Build the static export and check every language URL works on Cloudflare Pages
