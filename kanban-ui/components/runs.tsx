"use client";

// Shared client plumbing for the run registry (task #12). Both the board and the
// card page use it to: poll the server-side registry, know which cards have a
// live agent, start a run without blocking, and get told when a run they started
// finishes (to show its result and refresh). It also hosts the global runs panel
// (task #21) — the header's activity button and its two-pane history dialog.

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { FiActivity, FiX } from "react-icons/fi";
import { getRunAction, listRunsAction, startAgentAction } from "@/app/actions";
import type { RunView } from "@/lib/types";
import { type AgentReq, HandoffButton, RunLog } from "./agent-shared";

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
  // A kick() the effect installs, so start() and tab-focus can force an immediate
  // poll and wake the loop when it's dormant. See the effect below.
  const kickRef = useRef<() => void>(() => {});

  // The registry only changes when a run starts or finishes, and runs only start
  // from a user action — so a quiet board can't go stale on its own. Instead of
  // polling forever, we poll only while there's something to watch (a live run or
  // a run this tab just started) and go dormant otherwise, waking on tab focus to
  // catch anything another tab did. Idle traffic drops to zero.
  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let inFlight = false;

    const tick = async () => {
      if (!alive || inFlight) return;
      inFlight = true;
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
        // Keep polling only while a run is live or this tab is awaiting one; a
        // hidden tab stops entirely and resumes on focus.
        const busy =
          next.some((r) => r.status === "running") || mine.current.size > 0;
        clearTimeout(timer);
        if (busy && document.visibilityState === "visible") {
          timer = setTimeout(tick, POLL_MS);
        }
      } catch {
        // transient — retry only if we're still awaiting a run of our own
        if (alive && mine.current.size > 0 && document.visibilityState === "visible") {
          clearTimeout(timer);
          timer = setTimeout(tick, POLL_MS);
        }
      } finally {
        inFlight = false;
      }
    };

    kickRef.current = () => {
      if (!alive) return;
      clearTimeout(timer);
      tick();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") kickRef.current();
    };
    document.addEventListener("visibilitychange", onVisible);
    tick();

    return () => {
      alive = false;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  // Start a run. Returns the server's answer: ok with a runId, or a lock message.
  const start = useCallback(
    async (req: AgentReq, label: string, removes = false) => {
      const res = await startAgentAction(req);
      if (res.ok && res.runId) {
        mine.current.set(res.runId, { runId: res.runId, label, removes });
        kickRef.current(); // watch it immediately instead of waiting for a tick
      }
      return res;
    },
    [],
  );

  return { runs, start };
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

// --- the global runs panel (task #21) ---------------------------------------

// A tiny shared store so the header's Create button (a sibling component) can pop
// the runs panel open on the run it just started — without threading state
// through the server-rendered Header. One store per browser tab; the panel's
// open/selected state lives here so any header control can drive it.
type PanelState = { open: boolean; selected: string | null };
let panelState: PanelState = { open: false, selected: null };
const panelSubs = new Set<() => void>();
function setPanel(next: PanelState) {
  panelState = next;
  for (const fn of panelSubs) fn();
}
export const runsPanel = {
  // Open the panel; optionally select a run (e.g. the create just started). A
  // missing selection keeps whatever was selected, so the panel defaults to the
  // newest run (see RunsDialog).
  open(selected?: string | null) {
    setPanel({ open: true, selected: selected ?? panelState.selected });
  },
  close() {
    setPanel({ open: false, selected: panelState.selected });
  },
  toggle() {
    setPanel({ open: !panelState.open, selected: panelState.selected });
  },
  select(runId: string) {
    setPanel({ open: true, selected: runId });
  },
};
function usePanelState(): PanelState {
  return useSyncExternalStore(
    (fn) => {
      panelSubs.add(fn);
      return () => panelSubs.delete(fn);
    },
    () => panelState,
    () => panelState,
  );
}

// A relative "2m ago" for the run list; an absolute stamp for the detail header.
// Both read the clock at render — fine, the poll re-renders while runs are live.
function relTime(ts: number): string {
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 45) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}
function fullTime(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// The status dot shown against each run in the list: a pulsing ember while live,
// mint when it passed, peach when it failed, neutral when the outcome is unknown
// (a run that outlived a UI restart — see registry).
function RunDot({ run }: { run: RunView }) {
  if (run.status === "running") {
    return (
      <span
        className="size-[8px] shrink-0 rounded-full bg-nb-accent-deep animate-[nbPulse_1.1s_ease-in-out_infinite]"
        aria-hidden
      />
    );
  }
  const tone = run.outcomeUnknown ? "bg-nb-ink-soft" : run.ok ? "bg-nb-mint" : "bg-nb-peach";
  return <span className={`size-[8px] shrink-0 rounded-full ${tone}`} aria-hidden />;
}

// The header entry point to the run history (task #21): one activity-icon button.
// While any run is live it wears an iOS-style badge — a small ember circle with
// the count of running runs and a ping pulse. Clicking opens the two-pane dialog.
// The panel is GLOBAL: every run, every card and every action, newest first —
// the one place to browse across runs (a per-card page still shows only its own
// most recent run; see redesign.md).
export function Runs() {
  // Poll the shared registry for the picture every tab sees. This instance never
  // starts a run, so its onFinish never fires — pass a no-op.
  const { runs } = useAgentRuns(() => {});
  const panel = usePanelState();
  const runningCount = runs.reduce((n, r) => n + (r.status === "running" ? 1 : 0), 0);

  return (
    <>
      <button
        type="button"
        onClick={() => runsPanel.toggle()}
        title="run history"
        aria-label="Run history"
        // Ghost sticker button (design.md .nb-cta-ghost): paper fill, solid ink
        // border, hard offset shadow, press-down. Matched pair with the agent
        // badge; both are the quiet siblings of the accent Create-task CTA.
        className="relative grid h-9 w-9 cursor-pointer place-items-center rounded-[9px] border-[1.5px] border-nb-ink bg-nb-paper text-nb-ink shadow-[2px_2px_0_0_var(--color-nb-ink)] transition-[transform,box-shadow] duration-[120ms] hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_0_var(--color-nb-ink)] active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0_0_var(--color-nb-ink)]"
      >
        <FiActivity className="text-[17px]" aria-hidden />
        {runningCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
              style={{ background: "var(--color-nb-accent)" }}
              aria-hidden
            />
            <span
              className="relative inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-[800] leading-none text-white"
              style={{ background: "var(--color-nb-accent)" }}
            >
              {runningCount}
            </span>
          </span>
        )}
      </button>
      {panel.open && <RunsDialog runs={runs} />}
    </>
  );
}

// The two-pane dialog: run list on the left, the selected run's input + log tail
// on the right. Portaled to <body> like Dialog/RunLogOverlay so the blurred,
// backdrop-filtered header can't become the scrim's containing block and trap it.
// Mounts only while open, so the selected run's log is tailed only when visible.
function RunsDialog({ runs }: { runs: RunView[] }) {
  const panel = usePanelState();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") runsPanel.close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Newest first. Default the selection to the newest run when none is set, so
  // the panel always opens on something.
  const ordered = [...runs].sort((a, b) => b.startedAt - a.startedAt);
  const selectedId = panel.selected ?? ordered[0]?.runId ?? null;
  const selected = ordered.find((r) => r.runId === selectedId) ?? null;
  // Tail the selected run's log from the file — live while running, one fetch
  // when done. The list entry carries the input and (for finished runs) the tail,
  // so the pane fills in before the tail loads.
  const log = useRunLog(selectedId);
  const input = (log?.input ?? selected?.input ?? "").trim();

  if (!mounted) return null;

  return createPortal(
    <div className="nb-scrim" style={{ alignItems: "center" }} onClick={() => runsPanel.close()}>
      <div
        // overflow-hidden clips the list column's edge-to-edge cream fill to the
        // panel radius — without it the square fill pokes past the rounded corner.
        className="nb-panel flex flex-col overflow-hidden"
        style={{ width: 880, maxWidth: "100%", height: "min(640px, calc(100vh - 5rem))" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b-[1.5px] border-nb-ink px-5 py-3">
          <h2 className="text-[15px] font-[800] tracking-[-0.02em]">Runs</h2>
          <button
            onClick={() => runsPanel.close()}
            aria-label="Close"
            className="-mr-1 grid h-7 w-7 cursor-pointer place-items-center rounded-[6px] text-nb-ink-soft transition-[transform,background-color,color] duration-100 hover:bg-nb-ink/5 hover:text-nb-ink active:scale-90 active:bg-nb-ink/10"
          >
            <FiX className="h-[18px] w-[18px]" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1">
          {/* left: the run list. A faint cream canvas behind the rows so the
              selected run — paper fill + ember edge, the vertical cousin of the
              tab strip's "bold ink + short ember underline" — reads as the one
              raised sheet. The divider is a soft ink hairline, not a full ink
              rule: 1.5px ink borders stay reserved for structural frames. */}
          <div className="w-[240px] shrink-0 overflow-y-auto border-r border-nb-ink/10 bg-nb-cream/70">
            {ordered.length === 0 ? (
              <p className="p-4 text-[12.5px] text-nb-ink-soft">No runs yet.</p>
            ) : (
              ordered.map((r) => {
                const active = r.runId === selectedId;
                return (
                  <button
                    key={r.runId}
                    type="button"
                    onClick={() => runsPanel.select(r.runId)}
                    className={`flex w-full cursor-pointer items-center gap-2.5 border-b border-nb-ink/8 px-3 py-2.5 text-left transition-colors ${
                      active
                        ? "bg-nb-paper shadow-[inset_2.5px_0_0_0_var(--color-nb-accent)]"
                        : "hover:bg-nb-wash/70"
                    }`}
                  >
                    <RunDot run={r} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline gap-1.5">
                        <span
                          className={`text-[12.5px] font-[700] capitalize ${active ? "text-nb-ink" : "text-nb-ink-soft"}`}
                        >
                          {r.action}
                        </span>
                        <span className="text-[11px] text-nb-ink-soft">
                          {r.cardId !== null ? `#${r.cardId}` : "—"}
                        </span>
                      </span>
                      <span className="block truncate text-[10.5px] text-nb-ink-soft">
                        {relTime(r.startedAt)}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* right: the selected run's input + log */}
          <div className="min-w-0 flex-1 overflow-y-auto p-4">
            {selected ? (
              <>
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-[14px] font-[800] capitalize tracking-[-0.02em]">
                    {selected.action}
                  </span>
                  {selected.cardId !== null && (
                    <span className="text-[12px] text-nb-ink-soft">#{selected.cardId}</span>
                  )}
                  <span className="text-[11px] text-nb-ink-soft">{fullTime(selected.startedAt)}</span>
                  {(log?.sessionId ?? selected.sessionId) && (
                    <span className="ml-auto">
                      <HandoffButton sessionId={(log?.sessionId ?? selected.sessionId) as string} />
                    </span>
                  )}
                </div>
                {/* The note is the optional free text the user typed when
                    starting the run (a create's description, a reject's reason,
                    else the notes field). Most runs are started without one — so
                    only show the section when there's actually a note, rather
                    than a "no note" placeholder on every run. */}
                {input && (
                  <div className="mb-3">
                    <div className="nb-tag mb-1.5">note</div>
                    <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-nb-ink">{input}</p>
                  </div>
                )}
                <RunLog run={log ?? selected} flush />
              </>
            ) : (
              <p className="text-[13px] text-nb-ink-soft">Select a run to see its input and log.</p>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
