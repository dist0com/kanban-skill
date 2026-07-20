"use client";

// Shared agent-run plumbing used by both the board (Create task) and the card
// page (per-card actions): the request/result shapes, the running + result
// overlays, and the input dialogs for each action.

import { useEffect, useRef, useState } from "react";
import type { AgentAction, Card, RunView } from "@/lib/types";
import { Button } from "./button";
import { Dialog } from "./Dialog";
import { Markdown } from "./Markdown";

// Run-log chrome as Tailwind utilities, colocated with the markup that uses it.
// The pulse dot (shared by the running badge and the live title bar) references
// the nbPulse keyframe still defined in globals.css.
const PULSE_DOT =
  "size-[7px] rounded-full bg-nb-accent-deep animate-[nbPulse_1.1s_ease-in-out_infinite]";

export interface AgentReq {
  action: AgentAction;
  id?: number;
  notes?: string;
  reason?: string;
  description?: string;
  title?: string;
}

export type DialogState =
  | { kind: "implement"; card: Card }
  | { kind: "reject"; card: Card }
  | { kind: "archive"; card: Card }
  | { kind: "edit"; card: Card }
  | { kind: "nudge"; card: Card }
  | { kind: "resolve"; card: Card }
  | { kind: "create" }
  | null;

// A small inline "running" pill. Runs are non-blocking now (task #12): several
// agents can work at once and the user keeps using the UI, so instead of one
// full-screen overlay each running card shows this badge. Pass onClick to make
// it open the run's log (task #14) — e.g. from a card on the board.
export function RunningBadge({
  label,
  onClick,
}: {
  label?: string;
  onClick?: (e: React.MouseEvent) => void;
}) {
  return (
    <span
      className="nb-chip inline-flex items-center gap-1.5"
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      title={onClick ? "watch the run log" : label ? `${label} — running` : "agent running"}
      style={{
        background: "var(--color-nb-accent-soft)",
        color: "var(--color-nb-accent-deep)",
        cursor: onClick ? "pointer" : undefined,
      }}
    >
      <span className={PULSE_DOT} aria-hidden />
      {label ? label : "running"}
    </span>
  );
}

// Present-participle label for a live run, so the single mark a card shows while
// busy names WHICH action is in flight (implementing / nudging / resolving / …)
// instead of a generic "running". The badge always replaces the saved-stage pill
// (one mark per card, never both), so this is the one place the running action is
// read — nudge/resolve don't need their own saved status to be visible.
export const RUNNING_VERB: Record<AgentAction, string> = {
  implement: "implementing",
  edit: "editing",
  nudge: "nudging",
  resolve: "resolving",
  reject: "rejecting",
  archive: "archiving",
  create: "creating",
};

// The live tail is the agent's event stream — tool calls and turn text — so it
// reads mono. A finished run leads with the agent's final message (markdown)
// and folds the intermediate events away underneath.
const MONO_TEXT = {
  whiteSpace: "pre-wrap",
  fontFamily: "var(--font-mono)",
  fontSize: 12,
} as const;

// A tailing view of one run's captured output (task #14). Shows the last few KB;
// auto-scrolls to the newest line unless the user has scrolled up to read back.
// Once the run ends with a parsed final message, the view leads with that
// message and the intermediate events fold into a collapsed row above it.
// `run` is the polled RunView (see useRunLog); null renders nothing.
export function RunLog({
  run,
  collapsed = false,
  onToggle,
  openIds,
}: {
  run: RunView | null;
  collapsed?: boolean;
  onToggle?: () => void;
  openIds?: number[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);
  const tail = (run?.tail || "").trim();
  const result = (run?.result || "").trim();

  useEffect(() => {
    const el = ref.current;
    if (el && pinned.current) el.scrollTop = el.scrollHeight;
  }, [tail]);

  if (!run) return null;
  const running = run.status === "running";
  // A run that outlived a UI restart finished out of our sight: show it as done
  // with no pass/fail mark — don't guess an outcome we never saw.
  const unknown = !running && run.outcomeUnknown;
  // No word while running — the pulse dot already signals progress.
  const state = running ? "" : unknown ? "finished" : run.ok ? "done" : `exited ${run.code ?? "?"}`;

  return (
    <div className="nb-outline bg-nb-paper">
      <div
        className={`flex items-center gap-2.5 px-3 py-1 rounded-t-[12.5px] bg-[linear-gradient(var(--color-nb-cream),color-mix(in_srgb,var(--color-nb-ink)_9%,var(--color-nb-cream)))]${collapsed ? " rounded-b-[12.5px]" : " border-b-[1.5px] border-nb-ink"}${onToggle ? " cursor-pointer select-none" : ""}`}
        role={onToggle ? "button" : undefined}
        aria-expanded={onToggle ? !collapsed : undefined}
        aria-label={onToggle ? (collapsed ? "Expand run log" : "Collapse run log") : undefined}
        onClick={onToggle}
      >
        <span className="nb-tag">run log</span>
        <span className="ml-auto flex items-center gap-1.5">
          {running ? (
            <span className={PULSE_DOT} aria-hidden />
          ) : unknown ? (
            // Neutral dot — finished, but outcome unknown, so no ✓/✕.
            <span aria-hidden style={{ color: "var(--color-nb-ink-soft)" }}>•</span>
          ) : (
            <span aria-hidden style={{ color: "var(--color-nb-accent-deep)" }}>{run.ok ? "✓" : "✕"}</span>
          )}
          {state && <span className="text-[11px] text-nb-ink-soft">{state}</span>}
        </span>
      </div>
      {!collapsed && (
        <div
          ref={ref}
          onScroll={(e) => {
            const el = e.currentTarget;
            pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
          }}
          className="max-h-[50vh] overflow-auto px-4 py-3 bg-nb-wash rounded-b-[12.5px] shadow-[inset_0_1px_3px_color-mix(in_srgb,var(--color-nb-ink)_8%,transparent)]"
        >
          {running ? (
            // A live tail is streaming events, not markdown — keep the raw
            // terminal look so partial lines don't get mangled mid-render.
            <pre className="m-0 text-nb-ink-soft" style={MONO_TEXT}>
              {tail || "…"}
            </pre>
          ) : result ? (
            // The final message leads; the event lines it streamed on the way
            // fold into one collapsed row above it.
            <>
              {tail && (
                <details className="mb-2">
                  <summary className="cursor-pointer select-none text-[10px] font-[700] uppercase tracking-[0.08em] text-nb-ink-soft hover:text-nb-ink">
                    intermediate events
                  </summary>
                  <pre className="m-0 mt-2 text-nb-ink-soft" style={MONO_TEXT}>
                    {tail}
                  </pre>
                </details>
              )}
              <Markdown body={result} openIds={openIds} className="nb-runlog-md" />
            </>
          ) : tail ? (
            // No parsed final message (custom agent command, or a run re-adopted
            // after a restart) — the tail is all there is.
            <Markdown body={tail} openIds={openIds} className="nb-runlog-md" />
          ) : (
            <pre className="m-0 text-nb-ink-soft" style={MONO_TEXT}>
              (no output)
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

// The run log in a modal, opened from a running badge on the board.
export function RunLogOverlay({ run, onClose }: { run: RunView | null; onClose: () => void }) {
  const title = run ? `#${run.cardId ?? "?"} — ${run.action}` : "run log";
  return (
    <div className="nb-scrim" style={{ alignItems: "center" }} onClick={onClose}>
      <div className="nb-panel" style={{ width: 620, maxWidth: "100%" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1.5px solid var(--color-nb-ink)" }}>
          <h2 className="text-[15px] font-[800]">{title}</h2>
          <button aria-label="Close" className="text-[18px] text-nb-ink-soft hover:text-nb-ink" onClick={onClose}>×</button>
        </div>
        <div className="p-4">
          <RunLog run={run} />
        </div>
      </div>
    </div>
  );
}

// --- the input dialogs for each action --------------------------------------

export function ActionDialog({
  dialog,
  onClose,
  onRun,
}: {
  dialog: Exclude<DialogState, null>;
  onClose: () => void;
  onRun: (req: AgentReq, label: string) => void;
}) {
  const [text, setText] = useState("");

  if (dialog.kind === "implement") {
    // Warn but allow: `ready` means the plan is vetted and safe to build. On any
    // other stage the card may still be vague, so nudge it a warning — the user
    // can still go ahead.
    const notReady = dialog.card.status !== "ready";
    return (
      <Dialog title={`Implement #${dialog.card.id}`} onClose={onClose}>
        <p className="mb-2 text-[13px] text-nb-ink-soft">
          The agent reads the card, does the work, and checks off the todos.
        </p>
        {notReady && (
          <p
            className="mb-2 text-[13px]"
            style={{ color: "var(--color-nb-accent-deep)" }}
          >
            This card isn&apos;t marked <strong>ready</strong> yet — its plan may still be
            rough. Nudge it to ready first, or implement anyway.
          </p>
        )}
        <textarea className="nb-input" rows={4} placeholder="Optional extra notes for the agent…" value={text} onChange={(e) => setText(e.target.value)} />
        <DialogButtons
          onClose={onClose}
          confirmLabel={notReady ? "Implement anyway" : "Run implement"}
          onConfirm={() => onRun({ action: "implement", id: dialog.card.id, title: dialog.card.title, notes: text.trim() || undefined }, `Implement #${dialog.card.id}`)}
        />
      </Dialog>
    );
  }

  if (dialog.kind === "reject") {
    return (
      <Dialog title={`Reject #${dialog.card.id}`} onClose={onClose}>
        <p className="mb-2 text-[13px] text-nb-ink-soft">
          The agent adds a one-line note to rejected.md and removes the card.
        </p>
        <textarea className="nb-input" rows={3} placeholder="Why are you rejecting this?" value={text} onChange={(e) => setText(e.target.value)} />
        <DialogButtons
          onClose={onClose}
          confirmLabel="Run reject"
          disabled={!text.trim()}
          onConfirm={() => onRun({ action: "reject", id: dialog.card.id, title: dialog.card.title, reason: text.trim() }, `Reject #${dialog.card.id}`)}
        />
      </Dialog>
    );
  }

  if (dialog.kind === "archive") {
    return (
      <Dialog title={`Archive #${dialog.card.id}`} onClose={onClose}>
        <p className="mb-2 text-[13px] text-nb-ink-soft">
          All todos are done. The agent writes the &ldquo;what you can now do&rdquo; note into archive.md and removes the card.
        </p>
        <textarea className="nb-input" rows={3} placeholder="Optional note for the agent…" value={text} onChange={(e) => setText(e.target.value)} />
        <DialogButtons
          onClose={onClose}
          confirmLabel="Run archive"
          onConfirm={() => onRun({ action: "archive", id: dialog.card.id, title: dialog.card.title, notes: text.trim() || undefined }, `Archive #${dialog.card.id}`)}
        />
      </Dialog>
    );
  }

  if (dialog.kind === "edit") {
    return (
      <Dialog title={`Edit #${dialog.card.id}`} onClose={onClose}>
        <p className="mb-2 text-[13px] text-nb-ink-soft">
          Tell the agent how to change this task. It re-reads the card and rewrites the plan —
          summary, scope, and todos — to match. The card body is only ever edited by the agent.
        </p>
        <textarea
          className="nb-input"
          rows={4}
          placeholder="What should change about this task? e.g. narrow the scope to…, add a todo for…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <DialogButtons
          onClose={onClose}
          confirmLabel="Run edit"
          disabled={!text.trim()}
          onConfirm={() => onRun({ action: "edit", id: dialog.card.id, title: dialog.card.title, notes: text.trim() }, `Edit #${dialog.card.id}`)}
        />
      </Dialog>
    );
  }

  if (dialog.kind === "nudge") {
    return (
      <Dialog title={`Nudge #${dialog.card.id}`} onClose={onClose}>
        <p className="mb-2 text-[13px] text-nb-ink-soft">
          The agent moves the card one step forward: it reviews the plan, then rewrites it one
          stage — no further. Anything it can&apos;t decide is saved as an open question for you.
        </p>
        <textarea className="nb-input" rows={3} placeholder="Optional note to steer the nudge…" value={text} onChange={(e) => setText(e.target.value)} />
        <DialogButtons
          onClose={onClose}
          confirmLabel="Run nudge"
          onConfirm={() => onRun({ action: "nudge", id: dialog.card.id, title: dialog.card.title, notes: text.trim() || undefined }, `Nudge #${dialog.card.id}`)}
        />
      </Dialog>
    );
  }

  if (dialog.kind === "resolve") {
    return (
      <Dialog title={`Resolve #${dialog.card.id}`} onClose={onClose}>
        <p className="mb-2 text-[13px] text-nb-ink-soft">
          The card is waiting on open questions. The agent researches each one and decides what the
          evidence settles, writing the answers into the card. Real judgment calls stay as open
          questions for you to answer later.
        </p>
        <textarea className="nb-input" rows={3} placeholder="Optional note to steer the resolve…" value={text} onChange={(e) => setText(e.target.value)} />
        <DialogButtons
          onClose={onClose}
          confirmLabel="Run resolve"
          onConfirm={() => onRun({ action: "resolve", id: dialog.card.id, title: dialog.card.title, notes: text.trim() || undefined }, `Resolve #${dialog.card.id}`)}
        />
      </Dialog>
    );
  }

  // create
  return (
    <Dialog title="Create task" onClose={onClose} width={600}>
      <p className="mb-2 text-[13px] text-nb-ink-soft">
        Describe what you want. The agent turns it into one or more cards using the add-task flow.
      </p>
      <textarea className="nb-input" rows={5} placeholder="What do you want to happen?" value={text} onChange={(e) => setText(e.target.value)} />
      <DialogButtons
        onClose={onClose}
        confirmLabel="Run create"
        disabled={!text.trim()}
        onConfirm={() => onRun({ action: "create", description: text.trim() }, "Create task")}
      />
    </Dialog>
  );
}

export function DialogButtons({
  onClose,
  onConfirm,
  confirmLabel,
  disabled,
}: {
  onClose: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  disabled?: boolean;
}) {
  return (
    <div className="mt-4 flex justify-end gap-2.5">
      <Button variant="ghost" onClick={onClose}>Cancel</Button>
      <Button disabled={disabled} onClick={onConfirm}>{confirmLabel}</Button>
    </div>
  );
}
