---
title: Agent run state management
track: features
priority: high
roi: high
blocked_by: []
related: []
questions: []
---

Give the local UI one shared, correct picture of what every agent is doing. Today a run is synchronous, per-tab, and unlocked, so the user can't run more than one task, can't see or keep a task's stage, and two tabs can implement the same card and corrupt the board.

## Why it matters

The running state lives in one browser tab's memory (`CardPage.tsx` `useState`). So no other tab, and not even the same tab after a refresh, can see it. There is no server-side record and no lock. Fixing this once — a shared run registry the whole UI reads from — resolves all three complaints together: run many tasks at once, track each one's stage, and never let two runs collide on one card.

## When this is done

- The user can run agents on several cards at once. Starting a run returns right away.
- Every tab shows which cards have a running agent. Opening a card shows the agent's log.
- A card with a running agent refuses a second run, with a clear message
  ("#5 is already being implemented").
- After a UI restart, each card still shows its stage. A run that is still alive is
  picked up again; only a dead one gets its stage reset.
- The user can open the log of a past run, even after a restart.

## Rules for all three subtasks

- **One mark per card.** When an agent runs on a card, show the live state from the
  registry (#12). When none runs, show the saved `status` (#13). Never both.
- **A restart must not lose live runs.** The UI server can restart while an agent it
  started is still running. So #12 saves each run's pid to a small gitignored file.
  On start-up, check each pid: alive → put the run back in the registry; dead → let
  #13 reset the card's stage. Without this, a restart could start a second agent on a
  card the first agent is still editing.
- **Every run's log is saved.** #12 writes each run's full output to a gitignored file
  (`docs/kanban/.runs/<run-id>.log`); #14 shows it. The log survives a restart, so the
  user can audit past runs. Keep the last 20 runs' logs; delete older ones.

## The subtasks

#12 comes first — the other two read its registry. After it, #13 and #14 don't depend
on each other; do them in either order or in parallel.

- **#12 — Run registry + non-blocking runs + locks.** The core. A server-side registry of running agents (shared across tabs), fire-and-return instead of blocking, a per-card lock, and a board-index lock. Fixes multi-task and the duplicate-run race.
- **#13 — Durable status field.** A saved `status` in the card frontmatter (`todo` / `ready` / `implementing`) so a stage survives a UI restart. Blocked by #12 — it uses the registry to reset a stale stage.
- **#14 — Tail the run log on the UI.** Show each run's captured output in the UI so the user can watch it, not just a "running" label. Blocked by #12. Read-only — the user watches a run, they don't reply to it; the agent raises open questions on the card instead.

## Todo

- [x] #12 — run registry, non-blocking runs, per-card and board-index locks.
- [x] #13 — durable `status` field in the card format.
- [ ] #14 — tail the run log on the UI (log plumbing done; not yet findable / restart-durable).
