import { execFileSync, spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { agentArgv, type AgentRequest } from "./agent";
import { allCards, findCard } from "./board";
import { kanbanDir, repoRoot } from "./paths";
import { createStreamRenderer } from "./stream";
import type { AgentAction, CardStatus, RunView } from "./types";

// The server-side run registry. One local UI server = one process, so this
// in-memory map is shared by every browser tab: a tab that refreshes, or a
// second tab, re-reads the same runs. It gives the UI a single correct picture
// of what every agent is doing, holds the per-card and board-index locks, and
// survives a UI restart via a small gitignored file (each run's pid).
//
// Why globalThis: Next may evaluate this module more than once across its server
// bundles. Pinning the state to globalThis keeps it a true singleton so two
// bundles can't hold two registries (and two locks).

// create / archive / reject all rewrite shared files through the skill script
// (next-id, the README index, metrics.csv). Run two at once and they corrupt
// each other even on different cards — so these serialize behind one lock.
const INDEX_ACTIONS = new Set<AgentAction>(["create", "archive", "reject"]);

// Past-tense verb for the "already running" message, e.g. "#5 is already being
// implemented".
const VERB: Record<AgentAction, string> = {
  implement: "implemented",
  reject: "rejected",
  archive: "archived",
  edit: "edited",
  create: "created",
  nudge: "nudged",
  resolve: "resolved",
};

// A run's action maps to the saved stage it puts the card in while it runs.
// Only implement sets a status — the rest (edit/nudge/resolve refine the card,
// create/archive/reject touch no resting card) leave the stage alone.
const RUN_STATUS: Partial<Record<AgentAction, CardStatus>> = {
  implement: "implementing",
};

// The board script owns the `status` field, like every other frontmatter field,
// so the UI never hand-writes it — it shells out to `update <id> --status`. The
// script lives behind a symlink, so it needs `--preserve-symlinks-main` to
// resolve the repo root (same reason the agent prompts use it). Best-effort: if
// the card is gone (archived) or the script is missing, the write just no-ops.
function setCardStatus(cardId: number, status: CardStatus): void {
  const script = path.join(repoRoot(), ".claude", "skills", "kanban", "kanban.mjs");
  try {
    execFileSync(
      process.execPath,
      ["--preserve-symlinks-main", script, "update", String(cardId), "--status", status],
      { cwd: repoRoot(), stdio: "ignore" },
    );
  } catch {
    // card removed, or script not installed — leave the field as-is
  }
}

// When an implement run ends and its card still exists, restore the stage it had
// before the run — so a `ready` card is `ready` again, not knocked back to `todo`.
// Questions always win: if the run left the card with open questions, drop it to
// `todo` no matter the prior stage. If the run finished the task (archive/reject
// removed the card) this is a harmless no-op.
function clearRunStatus(run: Run): void {
  if (run.cardId === null || !RUN_STATUS[run.action]) return;
  const card = findCard(run.cardId);
  if (!card) return; // archived/rejected — nothing to restore
  const restore: CardStatus =
    card.questions.length > 0 ? "todo" : run.priorStatus ?? "todo";
  setCardStatus(run.cardId, restore);
}

const KEEP_LOGS = 20; // how many run logs to keep on disk
const KEEP_RUNS = 40; // how many finished runs to keep in memory
const TAIL_MAX = 8000; // chars of output kept per run (in memory)
const TAIL_BYTES = 16 * 1024; // last few KB of the log read from disk for the UI

interface Run {
  runId: string;
  cardId: number | null;
  action: AgentAction;
  status: "running" | "done" | "error";
  startedAt: number;
  endedAt?: number;
  pid?: number;
  ok?: boolean;
  code?: number | null;
  error?: string;
  tail: string;
  // The agent's final message, parsed out of its event stream at close. The
  // tail holds only the intermediate events then — the UI leads with this and
  // folds the tail away. Unset for a custom (non-streaming) command or a run
  // re-adopted after a restart; the tail is all there is in those cases.
  result?: string;
  logPath: string;
  // The card's saved stage the instant before this run overwrote it with
  // `implementing`. Restored when the run ends, so a run on a `ready` card leaves
  // it `ready` again instead of dropping it to `todo`. Only set for implement runs
  // (the only ones that touch the stage). Persisted so a run that ends after a UI
  // restart still restores the right stage.
  priorStatus?: CardStatus;
  // Re-adopted from disk after a UI restart. We are no longer its parent, so we
  // detect its exit by polling the pid instead of a 'close' event.
  adopted?: boolean;
}

interface RegistryState {
  runs: Map<string, Run>;
  // A promise chain that serializes INDEX_ACTIONS: each waits for the prior to
  // release before it spawns, and releases when its child closes.
  indexTail: Promise<void>;
}

function runsDir(): string {
  return path.join(kanbanDir(), ".runs");
}
function runsFile(): string {
  return path.join(kanbanDir(), ".runs.json");
}

function state(): RegistryState {
  const g = globalThis as unknown as { __kanbanRegistry?: RegistryState };
  if (!g.__kanbanRegistry) {
    g.__kanbanRegistry = { runs: new Map(), indexTail: Promise.resolve() };
    adoptFromDisk(g.__kanbanRegistry);
    reconcileStatuses(g.__kanbanRegistry);
  }
  return g.__kanbanRegistry;
}

// --- persistence: survive a UI restart --------------------------------------

// Signal 0 doesn't kill; it just asks "is this pid alive and can I signal it?".
// EPERM means alive but owned by someone else — still alive.
function pidAlive(pid?: number): boolean {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return (e as NodeJS.ErrnoException).code === "EPERM";
  }
}

// Write the live runs (pid + identity) so a restart can find them again.
function persist(s: RegistryState): void {
  const data = [...s.runs.values()]
    .filter((r) => r.status === "running" && r.pid)
    .map((r) => ({
      runId: r.runId,
      cardId: r.cardId,
      action: r.action,
      pid: r.pid,
      startedAt: r.startedAt,
      logPath: r.logPath,
      priorStatus: r.priorStatus,
    }));
  try {
    fs.mkdirSync(kanbanDir(), { recursive: true });
    fs.writeFileSync(runsFile(), JSON.stringify(data, null, 2));
  } catch {
    // best-effort: a failed write just means a restart forgets a run
  }
}

// On start-up, re-read the saved runs. A pid still alive → put the run back so
// the card keeps its running badge and a second run can't start on it. A dead
// pid → drop it (task #13 will reset that card's stale stage).
function adoptFromDisk(s: RegistryState): void {
  let data: unknown;
  try {
    data = JSON.parse(fs.readFileSync(runsFile(), "utf8"));
  } catch {
    return;
  }
  if (!Array.isArray(data)) return;
  for (const d of data) {
    if (!d || typeof d.runId !== "string" || !pidAlive(d.pid)) continue;
    s.runs.set(d.runId, {
      runId: d.runId,
      cardId: typeof d.cardId === "number" ? d.cardId : null,
      action: d.action,
      status: "running",
      startedAt: d.startedAt || Date.now(),
      pid: d.pid,
      tail: "",
      logPath: d.logPath || path.join(runsDir(), `${d.runId}.log`),
      priorStatus: d.priorStatus,
      adopted: true,
    });
  }
  persist(s); // rewrite without the dead ones
}

// On start-up, fix a stale stage: a card saved as `implementing` whose run no
// longer exists (the UI crashed mid-run) is reset to `todo`, so the field never
// gets stuck. Runs still alive were re-adopted above, so they keep their stage.
// `ready` is a durable resting stage no run owns (nudge sets it), so it's left
// alone. Best-effort — a board that can't be read just skips this.
function reconcileStatuses(s: RegistryState): void {
  let cards;
  try {
    cards = allCards();
  } catch {
    return;
  }
  for (const c of cards) {
    const runDriven = c.status === "implementing";
    if (runDriven && !liveRunForCard(s, c.id)) {
      setCardStatus(c.id, "todo");
    }
  }
}

// Adopted runs have no 'close' event, so reap them by polling the pid. Called on
// every read so the UI's poll drives the check — no background timer needed.
function reapAdopted(s: RegistryState): void {
  let changed = false;
  for (const r of s.runs.values()) {
    if (r.status === "running" && r.adopted && !pidAlive(r.pid)) {
      r.status = "done";
      r.code = null; // exit code is unknown across a restart
      r.endedAt = Date.now();
      clearRunStatus(r);
      changed = true;
    }
  }
  if (changed) {
    persist(s);
    pruneMemory(s);
  }
}

// --- logs -------------------------------------------------------------------

// Read the tail of a run's log file — the durable source #14 shows. Bounded to
// the last few KB so a long run doesn't bloat the page; the full log stays in
// the file. Reading from the file (not the in-memory tail) is what makes a run
// re-adopted after a UI restart still show its output, and never grows unbounded.
function readLogTail(logPath: string, maxBytes = TAIL_BYTES): string | null {
  let fd: number | undefined;
  try {
    const size = fs.statSync(logPath).size;
    const start = Math.max(0, size - maxBytes);
    const len = size - start;
    if (len === 0) return "";
    fd = fs.openSync(logPath, "r");
    const buf = Buffer.alloc(len);
    fs.readSync(fd, buf, 0, len, start);
    let text = buf.toString("utf8");
    // We cut at a byte offset, so drop a partial first line if we didn't start
    // at the top — otherwise the view opens on half a line.
    if (start > 0) {
      const nl = text.indexOf("\n");
      if (nl >= 0) text = text.slice(nl + 1);
    }
    return text;
  } catch {
    return null; // no log file yet, or unreadable
  } finally {
    if (fd !== undefined) {
      try {
        fs.closeSync(fd);
      } catch {
        // ignore
      }
    }
  }
}

// Keep only the last KEEP_LOGS run logs on disk; delete older ones.
function pruneLogs(): void {
  try {
    const files = fs
      .readdirSync(runsDir())
      .filter((f) => f.endsWith(".log"))
      .map((f) => ({ f, t: fs.statSync(path.join(runsDir(), f)).mtimeMs }))
      .sort((a, b) => b.t - a.t);
    for (const { f } of files.slice(KEEP_LOGS)) {
      try {
        fs.unlinkSync(path.join(runsDir(), f));
      } catch {
        // ignore
      }
    }
  } catch {
    // no dir yet, nothing to prune
  }
}

// Bound the in-memory map: drop the oldest finished runs past KEEP_RUNS. Running
// runs are always kept.
function pruneMemory(s: RegistryState): void {
  const finished = [...s.runs.values()]
    .filter((r) => r.status !== "running")
    .sort((a, b) => (a.endedAt || 0) - (b.endedAt || 0));
  for (const r of finished.slice(0, Math.max(0, finished.length - KEEP_RUNS))) {
    s.runs.delete(r.runId);
  }
}

// --- the board-index lock ---------------------------------------------------

// Acquire the index lock: resolves once every prior index action has released,
// and returns the release for this one. Non-index actions never call this.
function acquireIndexLock(s: RegistryState): Promise<() => void> {
  let release!: () => void;
  const held = new Promise<void>((r) => (release = r));
  const prior = s.indexTail;
  s.indexTail = prior.then(() => held);
  return prior.then(() => release);
}

// --- starting a run ---------------------------------------------------------

export interface StartResult {
  ok: boolean;
  runId?: string;
  error?: string;
}

// Start an agent and return at once — the request never awaits the child. The
// run is recorded as `running`; the UI polls listRuns() and sees it flip to
// done/error on close. Enforces the per-card lock here (synchronously) so a
// double-click or a second tab can't start two runs on one card.
export function startRun(req: AgentRequest, prompt: string): StartResult {
  const s = state();
  reapAdopted(s);

  const cardId = Number.isInteger(req.id) ? (req.id as number) : null;
  if (cardId !== null) {
    const live = liveRunForCard(s, cardId);
    if (live) {
      return { ok: false, error: `#${cardId} is already being ${VERB[live.action]}` };
    }
  }

  const runId = randomUUID();
  const run: Run = {
    runId,
    cardId,
    action: req.action,
    status: "running",
    startedAt: Date.now(),
    tail: "",
    logPath: path.join(runsDir(), `${runId}.log`),
  };
  s.runs.set(runId, run);
  persist(s);

  void launch(s, run, prompt); // fire and forget
  return { ok: true, runId };
}

function liveRunForCard(s: RegistryState, cardId: number): Run | undefined {
  for (const r of s.runs.values()) {
    if (r.status === "running" && r.cardId === cardId) return r;
  }
  return undefined;
}

async function launch(s: RegistryState, run: Run, prompt: string): Promise<void> {
  // Serialize the shared-file rewrites; other actions spawn straight away.
  const release = INDEX_ACTIONS.has(run.action)
    ? await acquireIndexLock(s)
    : () => {};

  try {
    fs.mkdirSync(runsDir(), { recursive: true });
  } catch {
    // the write stream will surface the real error if the dir is unusable
  }
  const log = fs.createWriteStream(run.logPath, { flags: "a" });

  // Save the stage before the agent touches the card, so a restart mid-run finds
  // the card already reading `implementing`. Runs on a real card only.
  // Remember the stage it had first, so the end of the run can restore it (a
  // `ready` card stays `ready`) instead of always dropping to `todo`.
  const startStatus = run.cardId !== null ? RUN_STATUS[run.action] : undefined;
  if (run.cardId !== null && startStatus) {
    // Read the stage first (persisted with the run below, once the pid is set),
    // then overwrite it for the duration of the run.
    run.priorStatus = findCard(run.cardId)?.status ?? "todo";
    setCardStatus(run.cardId, startStatus);
  }

  const [cmd, ...args] = agentArgv();
  let child;
  try {
    child = spawn(cmd, [...args, prompt], {
      cwd: repoRoot(),
      env: process.env,
      shell: false,
      // `claude -p` waits ~3s on a piped stdin, then logs a "no stdin data"
      // warning into our log. Close stdin so the log is only agent output.
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (e) {
    log.end();
    finish(s, run, { ok: false, code: null, error: String(e) });
    release();
    return;
  }

  run.pid = child.pid;
  persist(s);

  // stdout is the agent's NDJSON event stream (see agentArgv) — render it to
  // readable lines as it arrives. stderr is plain text and passes through.
  const renderer = createStreamRenderer();
  const append = (str: string) => {
    if (!str) return;
    log.write(str);
    run.tail = (run.tail + str).slice(-TAIL_MAX);
  };
  child.stdout.on("data", (d: Buffer) => append(renderer.push(d.toString())));
  child.stderr.on("data", (d: Buffer) => append(d.toString()));
  child.on("error", (err) => {
    run.error = String(err);
    log.write(`\n[error] ${String(err)}`);
  });
  child.on("close", (code) => {
    append(renderer.flush());
    // The final message is kept off the tail (the UI shows it in its own
    // panel and folds the events away) but written to the log file, so the
    // file alone is the complete, durable record.
    const final = renderer.result();
    if (final) {
      run.result = final;
      log.write(`\n${final}\n`);
    }
    log.end();
    finish(s, run, { ok: code === 0, code });
    release();
  });
}

function finish(
  s: RegistryState,
  run: Run,
  res: { ok: boolean; code: number | null; error?: string },
): void {
  run.status = res.ok ? "done" : "error";
  run.ok = res.ok;
  run.code = res.code;
  if (res.error) run.error = res.error;
  run.endedAt = Date.now();
  clearRunStatus(run);
  persist(s);
  pruneLogs();
  pruneMemory(s);
}

// --- reading the registry (for the UI poll) ---------------------------------

function toView(r: Run, withTail: boolean): RunView {
  return {
    runId: r.runId,
    cardId: r.cardId,
    action: r.action,
    status: r.status,
    startedAt: r.startedAt,
    endedAt: r.endedAt,
    ok: r.ok,
    code: r.code,
    error: r.error,
    // The agent's final message — terminal runs only; a live run has none yet.
    result: r.status !== "running" ? r.result : undefined,
    // Only terminal runs carry their tail here (the result overlay reads it);
    // the live tail of a running agent is fetched per-run via getRun(), which
    // reads the log file, so the board-wide poll stays light.
    tail: withTail && r.status !== "running" ? r.tail : undefined,
  };
}

export function listRuns(): RunView[] {
  const s = state();
  reapAdopted(s);
  return [...s.runs.values()]
    .sort((a, b) => a.startedAt - b.startedAt)
    .map((r) => toView(r, true));
}

// One run's view with its log tail read from the file (task #14). Used to watch
// a live run and to re-open a finished run's log — the file outlives both the
// run and a UI restart. Returns null if the run isn't in the registry.
export function getRun(runId: string): RunView | null {
  const s = state();
  reapAdopted(s);
  const r = s.runs.get(runId);
  if (!r) return null;
  const view = toView(r, false);
  // A finished run whose final message we still hold: the tail is the
  // in-memory event text (bounded), which the UI folds under the message —
  // the file would repeat the message at the end. Otherwise — a live run, or
  // one re-adopted after a restart — the file is the source: durable,
  // bounded, and possibly the only copy left.
  if (r.status !== "running" && r.result) {
    view.tail = r.tail;
  } else {
    view.tail = readLogTail(r.logPath) ?? r.tail ?? "";
  }
  return view;
}
