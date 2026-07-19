import fs from "node:fs";
import path from "node:path";
import { parseFrontmatter } from "./frontmatter";
import { archivePath, readmePath, todoDir } from "./paths";
import type { ArchiveGroup, Board, Card, Column } from "./types";

const idPrefix = (name: string): number | null => {
  const m = name.match(/^(\d+)-/);
  return m ? Number(m[1]) : null;
};

function countTodos(body: string): { total: number; done: number } {
  const matches = body.match(/^[ \t]*[-*]\s+\[( |x|X)\]/gm) || [];
  const done = matches.filter((l) => /\[[xX]\]/.test(l)).length;
  return { total: matches.length, done };
}

// Read one card file into a Card. Returns null if it has no id or no frontmatter.
function readCard(file: string, track: string, relFromTodo: string): Card | null {
  const id = idPrefix(path.basename(relFromTodo));
  if (id === null) {
    // group card: id lives on the folder, file is root.md
    const folderId = idPrefix(relFromTodo.split(path.sep)[relFromTodo.split(path.sep).length - 2] || "");
    if (folderId === null) return null;
    return buildCard(folderId, file, track, relFromTodo);
  }
  return buildCard(id, file, track, relFromTodo);
}

function buildCard(id: number, file: string, track: string, relFromTodo: string): Card | null {
  const { meta, body } = parseFrontmatter(fs.readFileSync(file, "utf8"));
  if (!meta) return null;
  return {
    id,
    relPath: relFromTodo.split(path.sep).join("/"),
    title: meta.title,
    track,
    priority: meta.priority,
    roi: meta.roi,
    blocked_by: meta.blocked_by,
    related: meta.related,
    questions: meta.questions,
    body: body.replace(/^\n+/, "").replace(/\s+$/, ""),
    todos: countTodos(body),
  };
}

// Collect the cards under one track folder: standalone `NN-slug.md` files and
// group folders `NN-slug/root.md`. Mirrors how kanban.mjs locates a task.
function cardsInTrack(track: string): Card[] {
  const dir = path.join(todoDir(), track);
  if (!fs.existsSync(dir)) return [];
  const cards: Card[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const root = path.join(dir, entry.name, "root.md");
      if (fs.existsSync(root)) {
        const c = readCard(root, track, path.join(track, entry.name, "root.md"));
        if (c) cards.push(c);
      }
    } else if (entry.name.endsWith(".md") && entry.name !== "README.md") {
      const c = readCard(path.join(dir, entry.name), track, path.join(track, entry.name));
      if (c) cards.push(c);
    }
  }
  return cards.sort((a, b) => a.id - b.id);
}

// Track folders present on disk (everything under todo/ except the index).
function trackFolders(): string[] {
  return fs
    .readdirSync(todoDir(), { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
}

// Column order follows the README's `## ` headings so the board matches the
// board file, with any track folder missing from the README appended after.
function orderedTracks(): { track: string; title: string }[] {
  const folders = new Set(trackFolders());
  const ordered: { track: string; title: string }[] = [];
  const seen = new Set<string>();

  if (fs.existsSync(readmePath())) {
    for (const line of fs.readFileSync(readmePath(), "utf8").split("\n")) {
      const m = line.match(/^##\s+(.+?)\s*$/);
      if (!m) continue;
      const heading = m[1];
      const track = heading.toLowerCase() === "blockers" ? "blockers" : heading;
      if (folders.has(track) && !seen.has(track)) {
        ordered.push({ track, title: track === "blockers" ? "Blockers" : heading });
        seen.add(track);
      }
    }
  }
  // blockers always first, even if the README didn't list it
  if (folders.has("blockers") && !seen.has("blockers")) {
    ordered.unshift({ track: "blockers", title: "Blockers" });
    seen.add("blockers");
  }
  for (const t of trackFolders()) {
    if (!seen.has(t)) ordered.push({ track: t, title: t });
  }
  return ordered;
}

// Parse archive.md into groups keyed by topic heading. Read-only, no ids.
function readArchive(): ArchiveGroup[] {
  if (!fs.existsSync(archivePath())) return [];
  const lines = fs.readFileSync(archivePath(), "utf8").split("\n");
  const groups: ArchiveGroup[] = [];
  let current: ArchiveGroup | null = null;
  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+?)\s*$/);
    if (h2) {
      current = { category: h2[1], markdown: "" };
      groups.push(current);
      continue;
    }
    if (/^#\s/.test(line)) continue; // skip the top "# Archive" title
    if (current) current.markdown += line + "\n";
  }
  return groups
    .map((g) => ({ ...g, markdown: g.markdown.trim() }))
    .filter((g) => g.markdown.length > 0);
}

export function readBoard(): Board {
  const columns: Column[] = orderedTracks().map(({ track, title }) => ({
    track,
    title,
    cards: cardsInTrack(track),
  }));
  const openIds = columns.flatMap((c) => c.cards.map((card) => card.id));
  return { columns, archive: readArchive(), openIds };
}
