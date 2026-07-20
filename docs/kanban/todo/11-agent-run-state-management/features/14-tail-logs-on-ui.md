---
title: Tail the run log on the UI
track: features
priority: med
roi: med
status: ready
blocked_by: []
related: [11]
questions: []
---

Give each card a "Runs" area that is always there, so the user can find a run's log without catching it live. The log plumbing shipped with the run registry; what's left is making logs findable and the list durable.

## What already works

- While an agent runs on a card, the card page tails its log live and refreshes on its own. The board's running badge opens the same tail.
- The live tail shows the agent's steps as they happen — each tool call and message, not just the final answer. When the run ends, the steps fold away behind one "intermediate events" row and the log leads with the final message.
- After the run ends, a "Show last run log" button re-opens its output, read from the saved log file.
- Only the last few KB show in the view; the full log stays in its file.
- Live runs survive a UI restart.

## What's still broken

- Finished runs are remembered only in memory. Restart the UI and the "last run log" button is gone — the log file is still on disk, but nothing points to it.
- A card shows only its single newest run. Older logs are on disk but unreachable.
- A card that never ran shows nothing, so a first-time user has no hint that logs exist.

## The plan

Turn the one "last run log" slot into an always-visible **Runs** area on every card page.

- The area is always there. A card with no runs shows one plain line: "No runs yet. A run's log will show here."
- A live run tails at the top, as today.
- Under it, the card's past runs, newest first: what each did (Implement, Nudge, …), when, and pass or fail. Click one to read its saved log.
- Save each finished run's record (action, time, result, which log) the same way live runs are already saved, so the list comes back after a UI restart.
- Follow the existing disk rule: only the last 20 runs keep logs. A run whose log was deleted drops off the list, so every listed run opens.
- Keep everything read-only, and keep the board badge opening the live tail.

## Todo

- [x] Show the agent's steps (tool calls, messages) in the live tail as they happen.
- [x] When a run ends, fold the steps away and lead with the final message.
- [ ] Show the Runs area on every card page, always — with the "No runs yet" line when the card has none.
- [ ] List the card's past runs (action, time, pass/fail) under the live tail, newest first.
- [ ] Open any listed run to read its saved log.
- [ ] Save finished-run records like live ones, so the list survives a UI restart.
- [ ] Drop a run from the list when its log file is pruned, so every listed run opens.
- [ ] Check the board's running badge still opens the live tail.
- [ ] Update the local UI guide to mention the Runs area.
