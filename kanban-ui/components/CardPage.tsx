"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  FiArchive,
  FiArrowLeft,
  FiChevronRight,
  FiCornerLeftUp,
  FiEdit2,
  FiHelpCircle,
  FiPlay,
  FiTrendingUp,
  FiXCircle,
} from "react-icons/fi";
import { patchCardAction } from "@/app/actions";
import type { CardPatch } from "@/lib/edit";
import type { AgentInfo, Card, RunView } from "@/lib/types";
import { AgentBadge } from "./AgentBadge";
import { Button } from "./button";
import {
  ActionDialog,
  type AgentReq,
  type DialogState,
  ResultOverlay,
  RunLog,
  RUNNING_VERB,
  type RunResult,
  RunningBadge,
} from "./agent-shared";
import { LevelSelect, StatusPill, TodoProgress, TrackChip } from "./chips";
import { Markdown } from "./Markdown";
import { latestRunForCard, runningCardIds, runningRunForCard, runToResult, type StartedRun, useAgentRuns, useRunLog } from "./runs";

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

export function CardPage({ card, openIds, agent }: { card: Card; openIds: number[]; agent: AgentInfo }) {
  const router = useRouter();
  const [dialog, setDialog] = useState<DialogState>(null);
  // `gone` marks a run that deleted this card (reject/archive) — on close we go
  // back to the board instead of refreshing into a 404.
  const [result, setResult] = useState<{ label: string; res: RunResult; gone: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // A run this tab started just finished. Reject/archive remove the card, so we
  // navigate home on close; the rest re-read the card in place.
  const onFinish = useCallback(
    (run: RunView, started: StartedRun) => {
      const gone = started.removes && !!run.ok;
      setResult({ label: started.label, res: runToResult(run), gone });
      if (!gone) router.refresh();
    },
    [router],
  );

  const { runs, start } = useAgentRuns(onFinish);

  // A live run on this card (from any tab) blocks a second run and shows a badge.
  const busy = runningCardIds(runs).has(card.id);
  // The run itself, so the badge can name the action in flight (nudging, etc.).
  const liveRun = runningRunForCard(runs, card.id);
  const { total, done } = card.todos;
  const allDone = total > 0 && done === total;

  // Tail the newest run on this card: live while it runs, and re-openable once
  // it's done so the user can read back what the agent did (task #14).
  const latestRun = latestRunForCard(runs, card.id);
  const runLog = useRunLog(latestRun?.runId ?? null);
  const [showLog, setShowLog] = useState(false);
  // A run just started on this card — open the log so the user watches it live.
  useEffect(() => {
    if (busy) setShowLog(true);
  }, [busy]);

  // Start a non-blocking run. The per-card lock refusal comes back as an error.
  const runAgent = async (req: AgentReq, label: string) => {
    setDialog(null);
    setResult(null);
    const removes = req.action === "reject" || req.action === "archive";
    const res = await start(req, label, removes);
    if (!res.ok) setError(res.error || "could not start the agent");
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
        <AgentBadge info={agent} />
      </header>

      <main className="mx-auto w-full max-w-[840px] px-6 py-6">
        {error && (
          <div className="nb-panel-sm mb-4 p-3 text-[13px]" style={{ background: "var(--color-nb-peach-soft)" }}>
            {error}
          </div>
        )}

        {/* part of a group — link up to the tracking root */}
        {card.parent && (
          <Link
            href={`/${card.parent.id}`}
            className="mb-2 inline-flex items-center gap-1.5 text-[12px] font-[700] text-nb-ink-soft hover:text-nb-accent-deep"
          >
            <FiCornerLeftUp className="text-[13px]" aria-hidden />
            Part of #{card.parent.id} {card.parent.title}
          </Link>
        )}

        {/* title band — the card's one mark rides beside the title: a live run's
            badge while busy, otherwise the saved stage (nothing while `todo`).
            Never both. */}
        <div className="mb-4 flex flex-wrap items-center gap-x-2.5 gap-y-2">
          <span className="shrink-0 text-[20px] font-[800]" style={{ color: "var(--color-nb-accent-deep)" }}>
            #{card.id}
          </span>
          <h1 className="text-[20px] font-[800] tracking-[-0.02em] leading-tight">{card.title}</h1>
          {busy ? (
            <RunningBadge label={liveRun ? `${RUNNING_VERB[liveRun.action]} this card…` : "working…"} />
          ) : (
            card.status !== "todo" && <StatusPill status={card.status} detailed />
          )}
        </div>

        {/* toolbar */}
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <Button size="sm" disabled={busy} onClick={() => setDialog({ kind: "implement", card })}>
            <FiPlay className="text-[15px]" aria-hidden />
            Implement
          </Button>
          <Button variant="ghost" size="sm" disabled={busy} onClick={() => setDialog({ kind: "edit", card })}>
            <FiEdit2 className="text-[15px]" aria-hidden />
            Edit
          </Button>
          {/* One slot: Resolve while the card has open questions (a nudge is
              blocked until they're cleared), otherwise Nudge. Never both. */}
          {card.questions.length > 0 ? (
            <Button variant="ghost" size="sm" disabled={busy} onClick={() => setDialog({ kind: "resolve", card })}>
              <FiHelpCircle className="text-[15px]" aria-hidden />
              Resolve
            </Button>
          ) : (
            <Button variant="ghost" size="sm" disabled={busy} onClick={() => setDialog({ kind: "nudge", card })}>
              <FiTrendingUp className="text-[15px]" aria-hidden />
              Nudge
            </Button>
          )}
          {allDone && (
            <Button variant="ghost" size="sm" disabled={busy} onClick={() => setDialog({ kind: "archive", card })}>
              <FiArchive className="text-[15px]" aria-hidden />
              Archive
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            disabled={busy}
            style={{ color: "var(--color-nb-accent-deep)", borderColor: "var(--color-nb-accent-deep)" }}
            onClick={() => setDialog({ kind: "reject", card })}
          >
            <FiXCircle className="text-[15px]" aria-hidden />
            Reject
          </Button>
        </div>

        {/* Run log: the live tail while an agent works, and a re-openable view of
            the last run's output afterwards. The full log stays in its file. */}
        {latestRun && (
          <div className="mb-4">
            <RunLog
              run={runLog}
              openIds={openIds}
              collapsed={!busy && !showLog}
              onToggle={busy ? undefined : () => setShowLog((v) => !v)}
            />
          </div>
        )}

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

        {card.subtasks && card.subtasks.length > 0 && (
          <div className="nb-outline mb-4 bg-nb-paper p-3">
            <div className="nb-tag mb-2">
              <span style={{ color: "var(--color-nb-accent)" }}>●</span>
              subtasks
            </div>
            <ul className="flex flex-col gap-1.5">
              {card.subtasks.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/${s.id}`}
                    className="nb-press flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 hover:bg-nb-wash"
                  >
                    <span className="shrink-0 text-[12px] font-[800]" style={{ color: "var(--color-nb-accent-deep)" }}>
                      #{s.id}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13.5px] font-[700] leading-snug">{s.title}</span>
                    {s.todos.total > 0 && <TodoProgress done={s.todos.done} total={s.todos.total} />}
                    <FiChevronRight className="shrink-0 text-[14px] text-nb-ink-soft" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

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

      {result && <ResultOverlay result={result} onClose={closeResult} />}

      {dialog && <ActionDialog dialog={dialog} onClose={() => setDialog(null)} onRun={runAgent} />}
    </div>
  );
}
