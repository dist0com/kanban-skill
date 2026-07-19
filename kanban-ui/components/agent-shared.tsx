"use client";

// Shared agent-run plumbing used by both the board (Create task) and the card
// page (per-card actions): the request/result shapes, the running + result
// overlays, and the input dialogs for each action.

import { useState } from "react";
import type { AgentAction, Card } from "@/lib/types";
import { Dialog } from "./Dialog";

export interface RunResult {
  ok: boolean;
  code: number | null;
  stdout: string;
  stderr: string;
  error?: string;
}

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
  | { kind: "review"; card: Card }
  | { kind: "reject"; card: Card }
  | { kind: "archive"; card: Card }
  | { kind: "edit"; card: Card }
  | { kind: "nudge"; card: Card }
  | { kind: "resolve"; card: Card }
  | { kind: "create" }
  | null;

// Blocking overlay while `claude -p` runs.
export function RunningOverlay({ label }: { label: string }) {
  return (
    <div className="nb-scrim" style={{ alignItems: "center" }}>
      <div className="nb-panel px-8 py-6 text-center" style={{ width: 360 }}>
        <div className="mb-2 text-[15px] font-[800]">Agent running…</div>
        <p className="text-[13px] text-nb-ink-soft">{label}</p>
        <p className="mt-3 text-[12px] text-nb-ink-soft">
          claude -p is working in the repo. The board refreshes when it finishes.
        </p>
      </div>
    </div>
  );
}

// The last agent's stdout/stderr, shown after a run finishes.
export function ResultOverlay({
  result,
  onClose,
}: {
  result: { label: string; res: RunResult };
  onClose: () => void;
}) {
  return (
    <div className="nb-scrim" style={{ alignItems: "center" }} onClick={onClose}>
      <div className="nb-panel" style={{ width: 620, maxWidth: "100%" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1.5px solid var(--color-nb-ink)" }}>
          <h2 className="text-[15px] font-[800]">
            {result.res.ok ? "✓ " : "✕ "}
            {result.label}
          </h2>
          <button aria-label="Close" className="text-[18px] text-nb-ink-soft hover:text-nb-ink" onClick={onClose}>×</button>
        </div>
        <div className="p-5">
          {result.res.error && (
            <p className="mb-2 text-[13px]" style={{ color: "var(--color-nb-accent-deep)" }}>{result.res.error}</p>
          )}
          <pre className="max-h-[320px] overflow-auto text-[12px]" style={{ whiteSpace: "pre-wrap", fontFamily: "var(--font-mono)" }}>
            {(result.res.stdout || "").trim() || (result.res.ok ? "(done)" : "")}
            {result.res.stderr ? "\n\n[stderr]\n" + result.res.stderr : ""}
          </pre>
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
    return (
      <Dialog title={`Implement #${dialog.card.id}`} onClose={onClose}>
        <p className="mb-2 text-[13px] text-nb-ink-soft">
          The agent reads the card, does the work, and checks off the todos.
        </p>
        <textarea className="nb-input" rows={4} placeholder="Optional extra notes for the agent…" value={text} onChange={(e) => setText(e.target.value)} />
        <DialogButtons
          onClose={onClose}
          confirmLabel="Run implement"
          onConfirm={() => onRun({ action: "implement", id: dialog.card.id, title: dialog.card.title, notes: text.trim() || undefined }, `Implement #${dialog.card.id}`)}
        />
      </Dialog>
    );
  }

  if (dialog.kind === "review") {
    return (
      <Dialog title={`Review #${dialog.card.id}`} onClose={onClose}>
        <p className="mb-2 text-[13px] text-nb-ink-soft">
          The agent checks whether the task is really done. Anything still owed by you is saved as
          open questions on the card — it won&apos;t implement or mark it done.
        </p>
        <DialogButtons
          onClose={onClose}
          confirmLabel="Run review"
          onConfirm={() => onRun({ action: "review", id: dialog.card.id, title: dialog.card.title }, `Review #${dialog.card.id}`)}
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
        <DialogButtons
          onClose={onClose}
          confirmLabel="Run archive"
          onConfirm={() => onRun({ action: "archive", id: dialog.card.id, title: dialog.card.title }, `Archive #${dialog.card.id}`)}
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
        <DialogButtons
          onClose={onClose}
          confirmLabel="Run nudge"
          onConfirm={() => onRun({ action: "nudge", id: dialog.card.id, title: dialog.card.title }, `Nudge #${dialog.card.id}`)}
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
        <DialogButtons
          onClose={onClose}
          confirmLabel="Run resolve"
          onConfirm={() => onRun({ action: "resolve", id: dialog.card.id, title: dialog.card.title }, `Resolve #${dialog.card.id}`)}
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
      <button className="nb-cta-ghost" onClick={onClose}>Cancel</button>
      <button className="nb-cta" disabled={disabled} onClick={onConfirm}>{confirmLabel}</button>
    </div>
  );
}
