"use client";

// Shared client plumbing for the run registry (task #12). Both the board and the
// card page use it to: poll the server-side registry, know which cards have a
// live agent, start a run without blocking, and get told when a run they started
// finishes (to show its result and refresh).

import { useCallback, useEffect, useRef, useState } from "react";
import { getRunAction, listRunsAction, startAgentAction } from "@/app/actions";
import type { RunView } from "@/lib/types";
import type { AgentReq, RunResult } from "./agent-shared";

const POLL_MS = 1500;
const LOG_POLL_MS = 1200; // how often the live log tail refreshes

// A run this tab started, remembered until it finishes so onFinish can fire once.
export interface StartedRun {
  runId: string;
  label: string;
  // reject/archive remove the card — on success we navigate home, not refresh.
  removes: boolean;
}

export function useAgentRuns(onFinish: (run: RunView, started: StartedRun) => void) {
  const [runs, setRuns] = useState<RunView[]>([]);
  const mine = useRef<Map<string, StartedRun>>(new Map());
  // Keep onFinish in a ref so the poll effect doesn't restart when the page
  // passes a fresh closure each render.
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      try {
        const next = await listRunsAction();
        if (!alive) return;
        // Fire onFinish for any run this tab started that just went terminal.
        for (const r of next) {
          const started = mine.current.get(r.runId);
          if (started && r.status !== "running") {
            mine.current.delete(r.runId);
            finishRef.current(r, started);
          }
        }
        setRuns(next);
      } catch {
        // transient — keep polling
      }
      if (alive) timer = setTimeout(tick, POLL_MS);
    };
    tick();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, []);

  // Start a run. Returns the server's answer: ok with a runId, or a lock message.
  const start = useCallback(
    async (req: AgentReq, label: string, removes = false) => {
      const res = await startAgentAction(req);
      if (res.ok && res.runId) {
        mine.current.set(res.runId, { runId: res.runId, label, removes });
      }
      return res;
    },
    [],
  );

  return { runs, start };
}

// Shape a finished run for the result overlay. The agent's final message when
// the event stream parsed one, else the raw tail (stdout+stderr were merged
// into one log); a spawn failure sets error.
export function runToResult(run: RunView): RunResult {
  return {
    ok: !!run.ok,
    code: run.code ?? null,
    stdout: run.result || run.tail || "",
    stderr: "",
    error: run.error,
  };
}

// Card ids that currently have a running agent (from any tab).
export function runningCardIds(runs: RunView[]): Set<number> {
  const ids = new Set<number>();
  for (const r of runs) {
    if (r.status === "running" && r.cardId !== null) ids.add(r.cardId);
  }
  return ids;
}

// The newest run (live or finished) that touched this card, so the card page can
// tail the live one and re-open the last finished one from the same slot.
export function latestRunForCard(runs: RunView[], cardId: number): RunView | undefined {
  let best: RunView | undefined;
  for (const r of runs) {
    if (r.cardId === cardId && (!best || r.startedAt > best.startedAt)) best = r;
  }
  return best;
}

// The live run on this card, if any (used to open its log from a board badge).
export function runningRunForCard(runs: RunView[], cardId: number): RunView | undefined {
  return runs.find((r) => r.status === "running" && r.cardId === cardId);
}

// Tail one run's log. Polls getRunAction while the run is live (task #14 reuses
// the poll channel — no SSE, matching the run badges), then fetches once more
// when it ends and stops. Pass null to watch nothing. Returns the run with its
// log tail, or null while it hasn't loaded / the run is unknown.
export function useRunLog(runId: string | null): RunView | null {
  const [log, setLog] = useState<RunView | null>(null);
  useEffect(() => {
    if (!runId) {
      setLog(null);
      return;
    }
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      try {
        const r = await getRunAction(runId);
        if (!alive) return;
        setLog(r);
        // Keep polling only while the run is live; a terminal run's tail is final.
        if (r && r.status === "running") timer = setTimeout(tick, LOG_POLL_MS);
      } catch {
        if (alive) timer = setTimeout(tick, LOG_POLL_MS);
      }
    };
    tick();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [runId]);
  return log;
}
