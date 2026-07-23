---
title: Auto-refresh every open view when a background run finishes
track: features
priority: med
roi: high
status: ready
blocked_by: []
related: [22]
questions: []
---

When a background session finishes, every open view should show the new board state without the user pressing refresh.

## Context
Most of this already exists. Do not rebuild it:
- `kanban-ui/lib/registry.ts` is the global session manager. It tracks every session the UI spawned, saves them to `docs/kanban/.sessions.json`, knows when each finishes, and keeps the last 30.
- The frontend polls it with `listSessionsAction` via the `useAgentSessions` hook in `kanban-ui/components/sessions.tsx`. It polls every 1.5s while a session is live, goes dormant when nothing is live, and wakes on tab focus (`visibilitychange`).
- `kanban-ui/components/Board.tsx` already diffs the set of running session ids each poll and re-reads the board when any session finishes — even sessions started in another tab.

Decision, already made: keep polling. No SSE, no WebSocket, no new push channel. This card only spreads the finish signal the registry already has to every mounted view.

## Scope
- Fix the card page. `kanban-ui/components/CardPage.tsx` reacts only to sessions this tab started (its `onFinish` callback, backed by the `mine` map inside `useAgentSessions`). A session from another tab, or from the board view, can rewrite the card while its page is open, and the page stays stale. Give it the same running-set diff `Board.tsx` uses: when any session finishes, re-read the card. The own-session path stays as is — a reject or archive this tab started still navigates home.
- Make tab-wake reliable. A hidden tab stops polling and only catches up on focus. The running-set diff fires only on a running→finished change the view actually saw while it was polling. If a session both starts and finishes while the tab is hidden, the view never saw it run, so on focus the diff finds nothing and the view stays stale. Fix: on tab focus, re-read the view once, unconditionally — a fresh read is always correct and doesn't depend on having witnessed the transition. Do this in both Board and CardPage. (This also covers the case where the finished session was evicted from the kept-30 window before the tab woke.)

Out of scope: sessions started outside the UI (plain `claude` in a terminal). The registry never sees those, so their file changes go unnoticed. Do not add file watching for them.

## Decisions
- We do not track sessions started outside the UI, and we won't. No file watching, no refresh trigger for them. Refresh only follows sessions the UI spawned — the ones the registry already knows about. (Decided by the user, 2026-07-21.)
- No state library (SWR / React Query) for this. It would not cut polling: the hand-rolled `useAgentSessions` already goes fully dormant when nothing is live, so idle traffic is already zero — a fixed-interval library does not do that by default. The one thing a shared cache would genuinely help — folding the two or three `useAgentSessions` poll loops on one page into a single deduped request — is a separate refactor, not this card's goal. (Decided during refine, 2026-07-23.)

## Todo
- [ ] Give `CardPage.tsx` the running-set diff from `Board.tsx`: re-read the card when any session finishes, not only this tab's own
- [ ] On tab focus, re-read the view once, unconditionally, in both Board and CardPage — so a session that ran entirely while the tab was hidden can't leave the view stale
- [ ] Test: a session finishes in another tab while this card page is open → the page updates without a manual reload
- [ ] Test: a session starts and finishes while the tab is hidden → on focus, both Board and CardPage show the new state
- [ ] Confirm the `kanban-ui` README and local-ui reference need no wording change — the docs cover running agents from the UI, not refresh mechanics
