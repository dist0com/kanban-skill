---
title: Continue a run's conversation instead of copying its id
track: features
priority: med
roi: med
status: todo
blocked_by: []
related: []
modules: []
questions:
  - Does resume cross the 'no human-in-the-loop reply channel' line in rejected.md? That rejection was about replying mid-run; resume continues a finished run as a new run. Confirm this boundary is OK before building.
  - How much conversation UI do we build? Full Claude Code-style chat is high effort. An MVP could be one prompt box on a finished run that starts a new run with --resume, reusing the existing log view. Decide MVP vs full chat first.
  - Where does resume live — only the global runs panel, or also the card page's run view?
---

Let the user continue a finished run's conversation from the UI, instead of copying an id into a terminal.

## Today
- A finished run shows a "Copy ID" button (`HandoffButton` in `kanban-ui/components/agent-shared.tsx`).
- It copies the run's Claude Code session id. The user is meant to open a terminal and type `claude --resume <id>`.
- The button doesn't say any of that. To most users the id is just noise.

## How continuing works underneath
- Every run already keeps its session id.
- Continuing means starting a **new run** with `claude -p --resume <session-id>` plus the user's follow-up prompt.
- The new run is a normal run: it gets a log file and shows up in the global runs panel like any other.

## Two shapes (frontmatter question decides)
- **Small (MVP):** a finished run gets one prompt box. Submitting it starts a new run with `--resume`. The reply shows up in the existing run log view. No new views.
- **Full chat:** a turn-by-turn conversation view — transcript, prompt box, streaming replies. This means rebuilding a Claude Code chat UI inside the kanban UI. High effort.

## Rules either shape must follow
- Only a **finished** run can be continued. No replying mid-run — that channel is rejected in `docs/kanban/rejected.md`.
- Run logs stay in files and survive restarts, same as today.
- There is one global runs panel. This adds no per-card run history.
- "Copy ID" is replaced or removed when this ships. No leftover legacy button.

## Scope
- A run-start path that takes a session id and a follow-up prompt and runs `claude -p --resume <id>`.
- The continue control on finished runs, in whichever surfaces the frontmatter question settles on (runs panel, card page run view, or both).
- Remove the Copy ID handoff.

## Todo
- [ ] Get the three frontmatter questions answered first.
- [ ] Add a run-start path that takes a session id and a prompt and starts `claude -p --resume <id>`.
- [ ] Record the resumed run like any other run — log file, entry in the global runs panel.
- [ ] Build the chosen shape's UI on finished runs, in the chosen surfaces.
- [ ] Replace or remove the Copy ID button (`HandoffButton` in `kanban-ui/components/agent-shared.tsx`).
- [ ] Docs: add a short "continue a run" note to `kanban-ui/README.md` — it's a new user action, and no doc describes the runs panel today.
