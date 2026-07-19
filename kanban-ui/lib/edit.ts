import fs from "node:fs";
import path from "node:path";
import { parseFrontmatter, serializeFrontmatter } from "./frontmatter";
import { readmePath, todoDir } from "./paths";

const LEVELS = ["high", "med", "low"];

// Find a card file by id — a standalone `NN-slug.md` or a group `NN-slug/root.md`.
function locate(id: number): string | null {
  function walk(dir: string): string | null {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const m = entry.name.match(/^(\d+)-/);
        if (m && Number(m[1]) === id) {
          const root = path.join(full, "root.md");
          if (fs.existsSync(root)) return root;
        }
        const hit = walk(full);
        if (hit) return hit;
      } else if (entry.name.endsWith(".md") && entry.name !== "README.md") {
        const m = entry.name.match(/^(\d+)-/);
        if (m && Number(m[1]) === id) return full;
      }
    }
    return null;
  }
  return walk(todoDir());
}

// Rewrite the title in the README index bullet for this id, keeping its link.
function syncReadmeTitle(id: number, title: string): void {
  const rp = readmePath();
  if (!fs.existsSync(rp)) return;
  const src = fs.readFileSync(rp, "utf8");
  const re = new RegExp(`(\\-\\s*\\[#${id}\\s+)([^\\]]*)(\\]\\()`);
  if (!re.test(src)) return;
  fs.writeFileSync(rp, src.replace(re, `$1${title}$3`));
}

export interface CardPatch {
  title?: string;
  body?: string;
  priority?: string;
  roi?: string;
}

export interface PatchResult {
  ok: boolean;
  error?: string;
}

// Apply a direct edit to a card file. Only the four validated fields are
// writable here — everything else (track, id, links, questions) stays with the
// agents and the script. Frontmatter is re-serialized with the script's exact
// formatter so the diff is minimal and the script can still read the card.
export function patchCard(id: number, patch: CardPatch): PatchResult {
  if (!Number.isInteger(id)) return { ok: false, error: "bad id" };
  const file = locate(id);
  if (!file) return { ok: false, error: `no open card #${id}` };

  const { meta, body } = parseFrontmatter(fs.readFileSync(file, "utf8"));
  if (!meta) return { ok: false, error: `card #${id} has no frontmatter` };

  let titleChanged = false;
  if (patch.title !== undefined) {
    const t = patch.title.trim();
    if (!t) return { ok: false, error: "title must not be empty" };
    if (t !== meta.title) titleChanged = true;
    meta.title = t;
  }
  if (patch.priority !== undefined) {
    if (!LEVELS.includes(patch.priority))
      return { ok: false, error: `priority must be one of ${LEVELS.join(" | ")}` };
    meta.priority = patch.priority;
  }
  if (patch.roi !== undefined) {
    if (!LEVELS.includes(patch.roi))
      return { ok: false, error: `roi must be one of ${LEVELS.join(" | ")}` };
    meta.roi = patch.roi;
  }

  const newBody = patch.body !== undefined ? patch.body : body;
  const normalizedBody = newBody.replace(/^\n+/, "").replace(/\s+$/, "");
  fs.writeFileSync(file, serializeFrontmatter(meta) + "\n\n" + normalizedBody + "\n");

  if (titleChanged) syncReadmeTitle(id, meta.title);
  return { ok: true };
}
