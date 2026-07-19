import fs from "node:fs";
import path from "node:path";

// The UI is normally launched from `kanban-ui/`, so the board sits one level up.
// Walk up from the current directory until we find the `docs/kanban/` board, so
// the app also works when started from the repo root. Files stay the single
// source of truth — we never keep a copy of the board's location anywhere else.
let cached: string | null = null;

export function repoRoot(): string {
  if (cached) return cached;
  let dir = process.cwd();
  for (let i = 0; i < 8; i++) {
    if (fs.existsSync(path.join(dir, "docs", "kanban", "todo"))) {
      cached = dir;
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error(
    "could not find docs/kanban/todo/ above " +
      process.cwd() +
      " — run the UI from inside the repo (kanban-ui/ or the repo root).",
  );
}

export function kanbanDir(): string {
  return path.join(repoRoot(), "docs", "kanban");
}
export function todoDir(): string {
  return path.join(kanbanDir(), "todo");
}
export function readmePath(): string {
  return path.join(todoDir(), "README.md");
}
export function archivePath(): string {
  return path.join(kanbanDir(), "archive.md");
}
