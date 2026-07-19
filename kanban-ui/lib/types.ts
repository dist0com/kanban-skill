// Shapes shared between the board reader (server) and the UI (client).

export type Level = "high" | "med" | "low";

export interface CardMeta {
  title: string;
  track: string;
  priority: string;
  roi: string;
  blocked_by: number[];
  related: number[];
  questions: string[];
}

export interface Card extends CardMeta {
  id: number;
  /** Path relative to docs/kanban/todo/, e.g. "ui/07-local-kanban-ui.md". */
  relPath: string;
  /** The card body below the frontmatter (markdown). */
  body: string;
  todos: { total: number; done: number };
}

export interface Column {
  /** Track folder name, or "blockers". */
  track: string;
  /** Heading to show above the column ("Blockers", or the track name). */
  title: string;
  cards: Card[];
}

export interface ArchiveGroup {
  /** The topic heading from archive.md (e.g. "Skill", "Board format"). */
  category: string;
  /** Raw markdown of the entries under that heading. */
  markdown: string;
}

export interface Board {
  columns: Column[];
  archive: ArchiveGroup[];
  /** Ids of every open card — used to linkify only #<id>s that still exist. */
  openIds: number[];
}

export type AgentAction =
  | "implement"
  | "review"
  | "reject"
  | "archive"
  | "edit"
  | "create";

/** Which agent runs the card actions. Shown read-only in the UI — the only
 *  supported agent today is Claude Code, so there is nothing to configure yet. */
export interface AgentInfo {
  /** Friendly name for the header badge, e.g. "Claude Code". */
  name: string;
  /** The resolved command every action runs, e.g. "claude -p". */
  command: string;
  /** True when using the built-in default (no agent.config.json override). */
  isDefault: boolean;
}
