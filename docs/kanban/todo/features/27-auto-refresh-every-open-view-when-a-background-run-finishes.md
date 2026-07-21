---
title: Auto-refresh every open view when a background run finishes
track: features
priority: med
roi: high
status: todo
blocked_by: []
related: [22]
questions: []
---

When a background run finishes, every open view should show the new board state without the user pressing refresh.

## Context
Most of this already exists. Do not rebuild it:
- `kanban-ui/lib/registry.ts` is the global run manager. It tracks every run the UI spawned in an in-memory map, saves them to `docs/kanban/.runs.json`, and knows when each run finishes.
- The frontend polls it with `listRunsAction` via the `useAgentRuns` hook in `kanban-ui/components/runs.tsx`. It polls every 1.5s while a run is live, sleeps otherwise, and wakes when the tab gets focus.
- `kanban-ui/components/Board.tsx` already diffs the set of running ids each poll and re-fetches the board when a run finishes — even runs started in another tab.

Decision, already made: keep polling. No SSE, no WebSocket, no new push channel. This card is only about spreading the finish signal that `registry.ts` already has to all mounted views.

## Scope
- Fix the card page. `kanban-ui/components/CardPage.tsx` only refreshes for runs this tab started (its `mine` ref). A run from another tab or the board view can rewrite the card, and the open card page stays stale. Make it refresh when any run finishes, using the same running-set diff the board uses.
- Check the hidden-tab path. A hidden tab stops polling and only catches up on focus (`visibilitychange`). Verify that the wake-on-focus poll still detects a run that finished while the tab was hidden, in both Board and CardPage. Fix it if a finish can slip through — for example if the run also drops out of the kept-runs window before the tab wakes.

Out of scope: runs started outside the UI (plain `claude` in a terminal). The registry never sees those, so file changes go unnoticed. Do not add file watching for them.

## Decisions
- We do not track runs started outside the UI, and we won't. No file watching, no refresh trigger for them. Refresh only follows runs the UI spawned — the ones the registry already knows about. (Decided by the user, 2026-07-21.)

## Todo
- [ ] Make `CardPage.tsx` refresh when any run finishes, not just its own, reusing the running-set diff from `Board.tsx`
- [ ] Test the hidden-tab case: run finishes while the tab is hidden, tab regains focus, both Board and CardPage refresh
- [ ] Fix the wake-on-focus path if a finish can be missed (e.g. the run fell out of the kept-runs window while hidden)
- [ ] Confirm the `kanban-ui` README and local-ui reference need no wording change — the docs cover running agents from the UI, not refresh mechanics
