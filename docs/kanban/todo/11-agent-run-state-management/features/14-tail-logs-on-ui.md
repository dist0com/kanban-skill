---
title: Tail the run log on the UI
track: features
priority: med
roi: med
blocked_by: [12]
related: [11]
questions: []
---

Show each run's log in the UI, so the user can watch what an agent is doing instead of a bare "running" label. #12 already writes each run's log to a file — this shows it.

## Why it matters

When an Implement or Review run takes a while, the user is blind: the UI shows only "running" and the final result. Showing the log builds trust and catches a wrong turn early. Because #12 writes each run's log to a file (`docs/kanban/.runs/<run-id>.log`), the UI just needs to read and display it per run.

## Scope

- Read a run's log from its file (#12 writes `docs/kanban/.runs/<run-id>.log`).
- Add a way for the UI to fetch the log's tail (poll a `getRun(runId)` server action; reuse the same channel as the run badges).
- Show the tail on the card page (and reachable from a run badge on the board) while the run is live. After the run ends, the log file stays, so the user can still open it — even after a UI restart.
- Show only the last few KB on the page, so a long log doesn't bloat it. The full log is in the file.
- Read-only: the user watches the run, they don't reply to it. Anything the agent needs from the user it raises as an open question on the card, not a live prompt.

## Open questions

- Poll the tail, or push it with SSE? Match whatever #12 picks for the run badges.

## Todo

- [ ] Expose a per-run log tail (a `getRun(runId)` server action that reads the log file).
- [ ] Fetch and refresh the tail while a run is live (reuse the run-badge channel).
- [ ] Show the tail on the card page and from a board run badge.
- [ ] Let the user open a finished run's log, including after a UI restart.
- [ ] Show only the last few KB on the page.
