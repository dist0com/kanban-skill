---
title: Run registry, non-blocking runs, and per-card and board-index locks
track: features
priority: high
roi: high
blocked_by: []
related: [11]
questions: []
---

Add a server-side registry of running agents and lock it by card, so the UI can run several tasks at once and two runs can never touch the same card. This is the core of the group — the other two subtasks read this registry.

## Why it matters

Today `runAgent` awaits the child inside a Server Action, the only "running" mark is one tab's React state, and nothing server-side stops a second run. So the user can't multi-task, other tabs see nothing, and two tabs can implement the same card and corrupt the board. A shared registry with a lock fixes all of that.

## Scope

- Add a **server-side run registry** — an in-memory map of `{ runId, cardId, action, status, startedAt }`. The UI is one local server, so this map is shared by every tab; a refreshed tab re-reads it and sees the same runs.
- Make runs **non-blocking**: start the agent, record the run as `running`, return `runId` at once; flip to `done`/`error` on child close. Don't await the child in the request.
- Add a **per-card lock**: refuse a new run when that card already has a live run in the registry. Because the check is server-side it holds across tabs and across a double-click. Return a clear message ("#5 is already being implemented").
- Add a **board-index lock**: serialize `create` / `archive` / `reject`, which all rewrite shared files (`next-id`, the README index, `metrics.csv`) through the script and would corrupt each other even on different cards. `implement` and `edit` (one card body plus code) still run at the same time on different cards.
- Replace the single blocking overlay with a **poll of the registry** so the board and card pages show a live badge per running card — several at once.
- **Save each run to a small gitignored file** (`docs/kanban/.runs.json`: run id, card id, pid, start time). On start-up, check each pid: alive → put the run back in the registry; dead → drop it so #13 can reset the card's stage. Without this, a restart would forget a still-running agent and could start a second one on the same card.
- **Save each run's full output to a log file** (gitignored `docs/kanban/.runs/<run-id>.log`). The log survives a restart, and past runs can be audited. Keep only the last 20 runs' logs; delete older ones. #14 shows these logs on the UI.

## Open questions

- Poll the registry, or push with SSE? Start with polling; leave room for SSE (shared with #14).
- ~~Should the registry survive a UI restart?~~ Yes — settled in #11. Save each run's pid so a restart can tell a live run from a dead one.

## Todo

- [ ] Add the in-memory run registry (keyed by `runId`, indexed by `cardId`).
- [ ] Make the agent run non-blocking: start, record, return `runId`; update on close.
- [ ] Add the per-card lock and a clear "already running" response.
- [ ] Add the board-index lock so `create` / `archive` / `reject` serialize.
- [ ] Poll the registry from the board and card pages; show a live badge per running card.
- [ ] Write the on-disk run record; on start-up, re-adopt live pids and drop dead ones.
- [ ] Write each run's output to `docs/kanban/.runs/<run-id>.log`; keep the last 20, delete older.
- [ ] Update `references/local-ui.md` to describe concurrent runs and the locks.
