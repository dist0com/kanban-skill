import type { MetadataRoute } from "next";
import fs from "node:fs";
import path from "node:path";
import { recipes } from "@/components/recipes/recipes-content";
import { BASE_URL } from "@/lib/site";

// Required for `output: export` — emit sitemap.xml at build time.
export const dynamic = "force-static";

// Discover every comparison route by scanning `app/` for `vs-*` directories
// that hold a `page.tsx`. New comparison pages are picked up automatically at
// build time — e.g. `app/vs-linear/page.tsx` → `/vs-linear`.
function vsRoutes(): string[] {
  const appDir = path.join(process.cwd(), "app");
  const routes: string[] = [];

  for (const entry of fs.readdirSync(appDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.startsWith("vs-")) continue;
    if (fs.existsSync(path.join(appDir, entry.name, "page.tsx"))) {
      routes.push(`/${entry.name}`);
    }
  }

  return routes;
}

// Recipe routes: the index plus one page per card in the catalog.
function recipeRoutes(): string[] {
  return ["/recipes", ...recipes.map((r) => `/recipes/${r.slug}`)];
}

// Markdown mirrors of the landing routes — a plain-Markdown twin of each page,
// served as a static file from `public/` (`/` → `/index.md`, `/vs-x` →
// `/vs-x.md`). Listed so AI crawlers and llms.txt consumers can discover them.
function markdownMirrors(): string[] {
  return ["/index.md", ...vsRoutes().map((r) => `${r}.md`)];
}

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["/", ...recipeRoutes(), ...vsRoutes(), ...markdownMirrors()];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    changeFrequency: "monthly",
    priority: route === "/" ? 1 : 0.8,
  }));
}
