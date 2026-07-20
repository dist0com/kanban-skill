import Link from "next/link";
import type { AgentInfo } from "@/lib/types";
import { AgentBadge } from "./AgentBadge";
import { CreateTask } from "./CreateTask";

// Shared header for the board and the card detail page — identical on both: the
// brand links home (the board), and the Create-task action and agent badge sit
// on the right. Create task is self-contained (see CreateTask) so both pages get
// it without threading any run state through the header.
export function Header({ agent }: { agent: AgentInfo }) {
  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between px-6 py-3.5 backdrop-blur-sm"
      style={{
        background: "color-mix(in srgb, var(--color-nb-cream) 90%, transparent)",
        borderBottom: "1.5px solid color-mix(in srgb, var(--color-nb-ink) 14%, transparent)",
      }}
    >
      <div className="flex items-baseline gap-3">
        <Link
          href="/"
          className="text-[17px] font-[800] tracking-[-0.02em] hover:text-nb-accent-deep"
        >
          🗂️ Kanban
        </Link>
        <span className="text-[12px] text-nb-ink-soft">files in docs/kanban/ are the source of truth</span>
      </div>
      <div className="flex items-center gap-3">
        <AgentBadge info={agent} />
        <CreateTask />
      </div>
    </header>
  );
}
