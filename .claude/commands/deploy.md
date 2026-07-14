---
description: Build the static export and deploy the kanban skill landing page to Cloudflare Pages
---

Deploy the latest version of this site to Cloudflare Pages (Direct Upload — no Git).

Run all commands from the `web/` directory.

Steps:

1. Build the static export:
   ```bash
   cd web && npm run build
   ```
   This regenerates `web/out/`. If the build fails, stop and report the error — do not deploy.

2. Deploy `out/` to the `kanban-skill` Pages project:
   ```bash
   npx wrangler pages deploy out --project-name=kanban-skill --branch=main
   ```
   Report the deployment URL Wrangler prints.

3. Verify the live production site responds (`200`):
   ```bash
   printf "%s -> " "https://kanban-skill.pages.dev/"; curl -s -o /dev/null -w "%{http_code}\n" -L "https://kanban-skill.pages.dev/"
   ```

Notes:
- Requires a prior `npx wrangler login` (one-time). If Wrangler reports it's not authenticated, tell the user to run `! npx wrangler login`.
- The `package.json` `deploy` script runs steps 1–2 in one go: `npm run deploy`.
- This is a pure static export (`output: "export"` in `next.config.mjs`); there is no server/middleware.
- On a brand-new project, the `*.pages.dev` TLS certificate can take ~30s to provision after the first deploy — a transient `522`/`000` right after deploy is expected; retry.
