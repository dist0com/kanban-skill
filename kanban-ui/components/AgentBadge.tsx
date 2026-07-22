"use client";

// A read-only header badge naming the agent that runs every card action. We
// only support a Claude Code subscription right now, so there is nothing to
// configure — the badge just makes the underlying agent visible and, on click,
// explains it and shows the exact command.

import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import type { AgentInfo } from "@/lib/types";
import { Dialog } from "./Dialog";

// The official Claude sunburst mark (public/agents/claude.svg). alt="" because
// the agent name always sits right next to it.
function ClaudeMark({ size }: { size: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/agents/claude.svg" alt="" width={size} height={size} style={{ flex: "0 0 auto" }} />;
}

export function AgentBadge({ info }: { info: AgentInfo }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Ghost sticker button (design.md .nb-cta-ghost), a matched pair with the
          header's Sessions button: same 36px frame, solid ink border, hard offset
          shadow and press-down — the quiet siblings of the accent Create CTA. */}
      <button
        type="button"
        className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-[9px] border-[1.5px] border-nb-ink bg-nb-paper px-3 text-[13px] font-[600] text-nb-ink shadow-[2px_2px_0_0_var(--color-nb-ink)] transition-[transform,box-shadow] duration-[120ms] hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_0_var(--color-nb-ink)] active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0_0_var(--color-nb-ink)]"
        title="Which agent runs the work"
        onClick={() => setOpen(true)}
      >
        <ClaudeMark size={14} />
        {info.name}
      </button>

      {open && (
        <Dialog title="Agents" onClose={() => setOpen(false)}>
          {/* Active agent — the only row today. */}
          <div
            className="nb-outline flex items-center justify-between bg-nb-paper px-4 py-3"
            style={{ borderColor: "var(--color-nb-accent-deep)" }}
          >
            <div className="flex items-center gap-3">
              <span
                className="flex items-center justify-center rounded-[9px]"
                style={{ width: 34, height: 34, background: "var(--color-nb-accent-soft)" }}
              >
                <ClaudeMark size={19} />
              </span>
              <div>
                <div className="text-[14px] font-[800]">{info.name}</div>
                <div className="text-[12px] text-nb-ink-soft">Subscription plan</div>
              </div>
            </div>
            <span
              className="nb-chip"
              style={{ background: "var(--color-nb-accent-soft)", color: "var(--color-nb-accent-deep)" }}
            >
              <FiCheck aria-hidden style={{ width: 11, height: 11 }} />
              Active
            </span>
          </div>

          {/* Placeholder — more agents are on the way. */}
          <div
            className="mt-2 flex items-center justify-center rounded-[14px] px-4 py-3 text-[12px] font-[700] uppercase tracking-[0.06em] text-nb-ink-soft"
            style={{ border: "1.5px dashed color-mix(in srgb, var(--color-nb-ink) 22%, transparent)" }}
          >
            More agents are coming
          </div>
        </Dialog>
      )}
    </>
  );
}
