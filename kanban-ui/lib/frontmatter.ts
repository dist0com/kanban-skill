// Frontmatter read/write, ported verbatim from skill/kanban.mjs so the UI's
// direct edits (title, priority, roi, body) serialize byte-for-byte the same way
// the script does. The script stays the ONLY writer for id-touching moves; the UI
// only rewrites these validated fields, and only for cards that already exist.

import type { CardMeta } from "./types";

export function yamlScalar(input: unknown): string {
  const s = String(input);
  if (s === "") return '""';
  if (
    /^[-?:,[\]{}#&*!|>'"%@`]/.test(s) ||
    /:\s/.test(s) ||
    /[\n"]/.test(s) ||
    /^\s|\s$/.test(s)
  ) {
    return JSON.stringify(s);
  }
  return s;
}

export function serializeFrontmatter(m: CardMeta): string {
  const out = ["---"];
  out.push(`title: ${yamlScalar(m.title)}`);
  out.push(`track: ${yamlScalar(m.track)}`);
  out.push(`priority: ${m.priority}`);
  out.push(`roi: ${m.roi}`);
  out.push(`blocked_by: [${(m.blocked_by || []).join(", ")}]`);
  out.push(`related: [${(m.related || []).join(", ")}]`);
  if (!m.questions || m.questions.length === 0) out.push("questions: []");
  else {
    out.push("questions:");
    for (const q of m.questions) out.push(`  - ${yamlScalar(q)}`);
  }
  out.push("---");
  return out.join("\n");
}

function unquote(v: string): string {
  v = String(v).trim();
  if (v.startsWith('"') && v.endsWith('"')) {
    try {
      return JSON.parse(v);
    } catch {
      return v.slice(1, -1);
    }
  }
  if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1);
  return v;
}

export interface ParsedCard {
  meta: CardMeta | null;
  body: string;
}

// Parse the leading `--- ... ---` block into a meta object; return the rest as body.
export function parseFrontmatter(text: string): ParsedCard {
  const lines = text.split("\n");
  if (lines[0]?.trim() !== "---") return { meta: null, body: text };
  let i = 1;
  const fm: string[] = [];
  while (i < lines.length && lines[i].trim() !== "---") {
    fm.push(lines[i]);
    i++;
  }
  if (i >= lines.length) return { meta: null, body: text };

  const meta: Record<string, unknown> = {};
  for (let j = 0; j < fm.length; j++) {
    const m = fm[j].match(/^([A-Za-z_]+):\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    const val = m[2];
    if (val === "") {
      const items: string[] = [];
      while (j + 1 < fm.length && /^\s*-\s+/.test(fm[j + 1])) {
        items.push(unquote(fm[j + 1].replace(/^\s*-\s+/, "")));
        j++;
      }
      meta[key] = items;
    } else if (val.startsWith("[")) {
      const inner = val.slice(1, val.lastIndexOf("]"));
      meta[key] = inner
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map(unquote);
    } else {
      meta[key] = unquote(val);
    }
  }
  for (const k of ["blocked_by", "related"]) {
    const arr = meta[k];
    if (Array.isArray(arr)) {
      meta[k] = arr
        .map((x) => Number(String(x).replace(/^#/, "")))
        .filter((n) => Number.isInteger(n));
    } else {
      meta[k] = [];
    }
  }
  if (!Array.isArray(meta.questions)) {
    meta.questions = meta.questions ? [meta.questions] : [];
  }

  const normalized: CardMeta = {
    title: String(meta.title ?? ""),
    track: String(meta.track ?? ""),
    priority: String(meta.priority ?? "med"),
    roi: String(meta.roi ?? "med"),
    blocked_by: (meta.blocked_by as number[]) ?? [],
    related: (meta.related as number[]) ?? [],
    questions: (meta.questions as string[]) ?? [],
  };
  return { meta: normalized, body: lines.slice(i + 1).join("\n") };
}
