"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  FiArchive,
  FiArrowLeft,
  FiEdit2,
  FiEye,
  FiPlay,
  FiXCircle,
} from "react-icons/fi";
import { patchCardAction, runAgentAction } from "@/app/actions";
import type { CardPatch } from "@/lib/edit";
import type { Card } from "@/lib/types";
import {
  ActionDialog,
  type AgentReq,
  type DialogState,
  ResultOverlay,
  type RunResult,
  RunningOverlay,
} from "./agent-shared";
import { LevelSelect, TodoProgress, TrackChip } from "./chips";
import { Markdown } from "./Markdown";

const CAP = "text-[10px] font-[700] uppercase tracking-[0.08em] text-nb-ink-soft";

// One meta column: micro-caption stacked over its value. Columns flow
// horizontally and wrap, so the box stays one shallow band instead of a tall
// stack of full-width rows. Every value is chip-height, so rows self-align.
function MetaItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className={CAP}>{label}</span>
      <div className="flex flex-wrap items-center gap-1.5">{children}</div>
    </div>
  );
}

export function CardPage({ card, openIds }: { card: Card; openIds: number[] }) {
  const router = useRouter();
  const [dialog, setDialog] = useState<DialogState>(null);
  const [running, setRunning] = useState<string | null>(null);
  // `gone` marks a run that deleted this card (reject/archive) — on close we go
  // back to the board instead of refreshing into a 404.
  const [result, setResult] = useState<{ label: string; res: RunResult; gone: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const busy = running !== null;
  const { total, done } = card.todos;
  const allDone = total > 0 && done === total;

  // Fire an agent action, wait for it, then reconcile the page. Reject/archive
  // remove the card, so those navigate home; the rest re-read in place.
  const runAgent = async (req: AgentReq, label: string) => {
    setDialog(null);
    setResult(null);
    setRunning(label);
    const removes = req.action === "reject" || req.action === "archive";
    let res: RunResult;
    try {
      res = await runAgentAction(req);
    } catch (e) {
      res = { ok: false, code: null, stdout: "", stderr: "", error: e instanceof Error ? e.message : String(e) };
    }
    setRunning(null);
    const gone = removes && res.ok;
    setResult({ label, res, gone });
    if (!gone) router.refresh();
  };

  const patchCard = async (id: number, patch: CardPatch) => {
    try {
      const res = await patchCardAction(id, patch);
      if (!res.ok) {
        setError(res.error || "edit failed");
        return false;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return false;
    }
    router.refresh();
    return true;
  };

  const closeResult = () => {
    const gone = result?.gone;
    setResult(null);
    if (gone) router.push("/");
  };

  return (
    <div className="flex min-h-screen flex-col bg-nb-cream">
      {/* header — back to the board */}
      <header
        className="sticky top-0 z-20 flex items-center justify-between px-6 py-3.5 backdrop-blur-sm"
        style={{
          background: "color-mix(in srgb, var(--color-nb-cream) 90%, transparent)",
          borderBottom: "1.5px solid color-mix(in srgb, var(--color-nb-ink) 14%, transparent)",
        }}
      >
        <Link href="/" className="inline-flex items-center gap-2 text-[14px] font-[700] hover:text-nb-accent-deep">
          <FiArrowLeft className="text-[16px]" aria-hidden />
          Kanban board
        </Link>
      </header>

      <main className="mx-auto w-full max-w-[840px] px-6 py-6">
        {error && (
          <div className="nb-panel-sm mb-4 p-3 text-[13px]" style={{ background: "var(--color-nb-peach-soft)" }}>
            {error}
          </div>
        )}

        {/* title band */}
        <div className="mb-4 flex items-baseline gap-2.5">
          <span className="shrink-0 text-[20px] font-[800]" style={{ color: "var(--color-nb-accent-deep)" }}>
            #{card.id}
          </span>
          <h1 className="text-[20px] font-[800] tracking-[-0.02em] leading-tight">{card.title}</h1>
        </div>

        {/* toolbar */}
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <button className="nb-cta-sm" disabled={busy} onClick={() => setDialog({ kind: "implement", card })}>
            <FiPlay className="text-[15px]" aria-hidden />
            Implement
          </button>
          <button className="nb-cta-ghost-sm" disabled={busy} onClick={() => setDialog({ kind: "review", card })}>
            <FiEye className="text-[15px]" aria-hidden />
            Review
          </button>
          <button className="nb-cta-ghost-sm" disabled={busy} onClick={() => setDialog({ kind: "edit", card })}>
            <FiEdit2 className="text-[15px]" aria-hidden />
            Edit
          </button>
          {allDone && (
            <button className="nb-cta-ghost-sm" disabled={busy} onClick={() => setDialog({ kind: "archive", card })}>
              <FiArchive className="text-[15px]" aria-hidden />
              Archive
            </button>
          )}
          <button
            className="nb-cta-ghost-sm ml-auto"
            disabled={busy}
            style={{ color: "var(--color-nb-accent-deep)", borderColor: "var(--color-nb-accent-deep)" }}
            onClick={() => setDialog({ kind: "reject", card })}
          >
            <FiXCircle className="text-[15px]" aria-hidden />
            Reject
          </button>
        </div>

        {/* meta box — stacked label/value columns in a flat outlined band; no
            shadow, so it reads subordinate to the content panel below */}
        <div className="nb-outline mb-4 flex flex-wrap items-start gap-x-7 gap-y-3 bg-nb-paper px-4 py-3">
          <MetaItem label="Track">
            <TrackChip track={card.track} />
          </MetaItem>

          <MetaItem label="Priority">
            <LevelSelect value={card.priority} disabled={busy} onChange={(v) => patchCard(card.id, { priority: v })} />
          </MetaItem>

          <MetaItem label="ROI">
            <LevelSelect value={card.roi} disabled={busy} onChange={(v) => patchCard(card.id, { roi: v })} />
          </MetaItem>

          {total > 0 && (
            <MetaItem label="Todos">
              <TodoProgress done={done} total={total} width={90} />
            </MetaItem>
          )}

          {card.blocked_by.length > 0 && (
            <MetaItem label="Blocked by">
              {card.blocked_by.map((n) => (
                <Link
                  key={n}
                  href={`/${n}`}
                  className="nb-chip"
                  style={{ background: "var(--color-nb-peach-soft)", color: "var(--color-nb-peach-ink)" }}
                >
                  #{n}
                </Link>
              ))}
            </MetaItem>
          )}

          {card.related.length > 0 && (
            <MetaItem label="Related">
              {card.related.map((n) => (
                <Link
                  key={n}
                  href={`/${n}`}
                  className="nb-chip"
                  style={{ background: "var(--color-nb-wash)", color: "var(--color-nb-ink-soft)" }}
                >
                  #{n}
                </Link>
              ))}
            </MetaItem>
          )}
        </div>

        {card.questions.length > 0 && (
          <div className="nb-outline mb-3 p-3" style={{ background: "var(--color-nb-accent-soft)" }}>
            <div className="nb-tag mb-1">
              <span style={{ color: "var(--color-nb-accent)" }}>?</span> open questions
            </div>
            <ul className="list-disc pl-5 text-[13px]">
              {card.questions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="nb-panel-sm p-5">
          <Markdown body={card.body} openIds={openIds} />
        </div>
      </main>

      {running && <RunningOverlay label={running} />}
      {result && !running && <ResultOverlay result={result} onClose={closeResult} />}

      {dialog && <ActionDialog dialog={dialog} onClose={() => setDialog(null)} onRun={runAgent} onPatch={patchCard} />}
    </div>
  );
}
