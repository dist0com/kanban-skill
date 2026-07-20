"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { FiHelpCircle, FiPlus } from "react-icons/fi";
import { getBoard } from "@/app/actions";
import type { AgentInfo, Board, RunView } from "@/lib/types";
import { AgentBadge } from "./AgentBadge";
import { Button } from "./button";
import {
  ActionDialog,
  type AgentReq,
  type DialogState,
  RunLogOverlay,
  RUNNING_VERB,
  RunningBadge,
} from "./agent-shared";
import { GroupChip, PriorityChip, RoiTag, StatusPill, TodoProgress } from "./chips";
import { runningRunForCard, useAgentRuns, useRunLog } from "./runs";

export function BoardView({
  initialBoard,
  initialError,
  agent,
}: {
  initialBoard: Board | null;
  initialError: string | null;
  agent: AgentInfo;
}) {
  const [board, setBoard] = useState<Board | null>(initialBoard);
  const [error, setError] = useState<string | null>(initialError);
  const [dialog, setDialog] = useState<DialogState>(null);
  // The run whose log is open in the overlay: opened from a running badge, or
  // auto-opened when a run this tab started finishes (so its final message and
  // any error stay visible — the board has no inline run log of its own).
  const [logRunId, setLogRunId] = useState<string | null>(null);
  const openLog = useRunLog(logRunId);

  const refresh = useCallback(async () => {
    try {
      setBoard(await getBoard());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  // A run this tab started just finished — open its log so the final message and
  // any error are shown. useRunLog fetches the terminal run once and stops.
  const onFinish = useCallback((run: RunView) => {
    setLogRunId(run.runId);
  }, []);

  const { runs, start } = useAgentRuns(onFinish);

  // Re-read the board whenever any run finishes (from this tab or another), so
  // created/archived/rejected cards appear or disappear without a manual reload.
  const prevRunning = useRef<Set<string>>(new Set());
  useEffect(() => {
    const now = new Set(runs.filter((r) => r.status === "running").map((r) => r.runId));
    let finished = false;
    for (const id of prevRunning.current) if (!now.has(id)) finished = true;
    prevRunning.current = now;
    if (finished) refresh();
  }, [runs, refresh]);

  const creating = runs.some((r) => r.status === "running" && r.action === "create");

  // Start a non-blocking run. A lock refusal comes back as an error message.
  const startRun = useCallback(
    async (req: AgentReq, label: string) => {
      setDialog(null);
      // Close any finished-run log still open from a previous run.
      setLogRunId(null);
      const res = await start(req, label);
      if (!res.ok) setError(res.error || "could not start the agent");
    },
    [start],
  );

  return (
    <div className="flex min-h-screen flex-col bg-nb-cream">
      {/* header */}
      <header
        className="sticky top-0 z-20 flex items-center justify-between px-6 py-3.5 backdrop-blur-sm"
        style={{
          background: "color-mix(in srgb, var(--color-nb-cream) 90%, transparent)",
          borderBottom: "1.5px solid color-mix(in srgb, var(--color-nb-ink) 14%, transparent)",
        }}
      >
        <div className="flex items-baseline gap-3">
          <span className="text-[17px] font-[800] tracking-[-0.02em]">🗂️ Kanban board</span>
          <span className="text-[12px] text-nb-ink-soft">files in docs/kanban/ are the source of truth</span>
        </div>
        <div className="flex items-center gap-3">
          {creating && <RunningBadge label="Creating task" />}
          <AgentBadge info={agent} />
          <Button
            className="gap-1.5"
            disabled={creating}
            onClick={() => setDialog({ kind: "create" })}
          >
            <FiPlus className="text-[16px]" aria-hidden />
            Create task
          </Button>
        </div>
      </header>

      {error && (
        <div className="mx-6 mt-4 nb-panel-sm p-3 text-[13px]" style={{ background: "var(--color-nb-peach-soft)" }}>
          {error}
        </div>
      )}

      {!board && !error && (
        <div className="p-10 text-nb-ink-soft">Reading the board…</div>
      )}

      {board && (
        <div className="flex flex-1 items-stretch gap-4 overflow-x-auto p-6">
          {board.columns.map((col) => (
            <section
              key={col.track}
              className="flex w-[300px] shrink-0 flex-col rounded-[14px] p-3"
              style={{ background: "var(--color-nb-wash)" }}
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="nb-tag">
                  <span style={{ color: "var(--color-nb-accent)" }}>●</span>
                  {col.title}
                </h2>
                <span className="text-[12px] text-nb-ink-soft">{col.cards.length}</span>
              </div>
              <div className="flex flex-1 flex-col gap-3">
                {col.cards.length === 0 && (
                  <p className="text-[12px] italic text-nb-ink-soft">no open cards</p>
                )}
                {col.cards.map((card) => {
                  // A group root's progress comes from its own todo checklist, not
                  // from counting subtask files: a finished subtask gets archived
                  // and its file removed, so the files on disk only cover the OPEN
                  // subtasks and would undercount done work. The root's `## Todo`
                  // stays accurate across archives, so it drives the bar.
                  const isGroup = (card.subtasks?.length ?? 0) > 0;
                  // The one live run on this card (any tab), if any. It drives the
                  // action-named badge that stands in for the saved-stage pill.
                  const liveRun = runningRunForCard(runs, card.id);
                  return (
                  <Link
                    key={card.id}
                    href={`/${card.id}`}
                    className="nb-panel-sm nb-press block cursor-pointer p-3.5 text-left"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-[12px] font-[800]" style={{ color: "var(--color-nb-accent-deep)" }}>
                        #{card.id}
                      </span>
                      <span className="flex items-center gap-2">
                        {isGroup && <GroupChip />}
                        {liveRun ? (
                          <RunningBadge
                            label={RUNNING_VERB[liveRun.action]}
                            onClick={(e) => {
                              // The card is a link; keep the click on the badge.
                              e.preventDefault();
                              e.stopPropagation();
                              setLogRunId(liveRun.runId);
                            }}
                          />
                        ) : (
                          <StatusPill status={card.status} />
                        )}
                        {card.questions.length > 0 && (
                          <span
                            tabIndex={0}
                            className="nb-tip inline-flex"
                            data-tip={`${card.questions.length} open question${card.questions.length === 1 ? "" : "s"} — resolve before nudging`}
                            style={{ color: "var(--color-nb-accent)" }}
                          >
                            <FiHelpCircle aria-hidden style={{ width: 14, height: 14 }} />
                          </span>
                        )}
                        {card.todos.total > 0 && (
                          <TodoProgress done={card.todos.done} total={card.todos.total} />
                        )}
                      </span>
                    </div>
                    <p className="mb-3 text-[14px] font-[700] leading-snug tracking-[-0.01em]">
                      {card.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <PriorityChip value={card.priority} />
                      <RoiTag value={card.roi} />
                    </div>
                  </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {logRunId && <RunLogOverlay run={openLog} onClose={() => setLogRunId(null)} />}

      {dialog && <ActionDialog dialog={dialog} onClose={() => setDialog(null)} onRun={startRun} />}
    </div>
  );
}
