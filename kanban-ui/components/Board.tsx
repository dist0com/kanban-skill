"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { getBoard, patchCardAction, runAgentAction } from "@/app/actions";
import type { CardPatch } from "@/lib/edit";
import type { Board } from "@/lib/types";
import {
  ActionDialog,
  type AgentReq,
  type DialogState,
  ResultOverlay,
  type RunResult,
  RunningOverlay,
} from "./agent-shared";
import { PriorityChip, RoiTag, TodoProgress } from "./chips";

export function BoardView({
  initialBoard,
  initialError,
}: {
  initialBoard: Board | null;
  initialError: string | null;
}) {
  const [board, setBoard] = useState<Board | null>(initialBoard);
  const [error, setError] = useState<string | null>(initialError);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [running, setRunning] = useState<string | null>(null);
  const [result, setResult] = useState<{ label: string; res: RunResult } | null>(null);

  const refresh = useCallback(async () => {
    try {
      setBoard(await getBoard());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  // Fire an agent action, wait for it, then refresh the board. No streaming.
  const runAgent = useCallback(
    async (req: AgentReq, label: string) => {
      setDialog(null);
      setResult(null);
      setRunning(label);
      try {
        const res = await runAgentAction(req);
        setResult({ label, res });
      } catch (e) {
        setResult({ label, res: { ok: false, code: null, stdout: "", stderr: "", error: e instanceof Error ? e.message : String(e) } });
      } finally {
        setRunning(null);
        await refresh();
      }
    },
    [refresh],
  );

  // Only reached by the edit dialog; the board itself has no per-card edits.
  const patchCard = useCallback(
    async (id: number, patch: CardPatch) => {
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
      await refresh();
      return true;
    },
    [refresh],
  );

  const busy = running !== null;

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
        <button className="nb-cta inline-flex items-center gap-1.5" disabled={busy} onClick={() => setDialog({ kind: "create" })}>
          <FiPlus className="text-[16px]" aria-hidden />
          Create task
        </button>
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
                {col.cards.map((card) => (
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
                        {card.questions.length > 0 && (
                          <span title="open questions" className="text-[13px] font-[800]" style={{ color: "var(--color-nb-accent)" }}>?</span>
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
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {running && <RunningOverlay label={running} />}
      {result && !running && <ResultOverlay result={result} onClose={() => setResult(null)} />}

      {dialog && <ActionDialog dialog={dialog} onClose={() => setDialog(null)} onRun={runAgent} onPatch={patchCard} />}
    </div>
  );
}
