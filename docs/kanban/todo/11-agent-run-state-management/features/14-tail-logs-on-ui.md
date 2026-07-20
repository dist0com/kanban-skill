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

Let the user find a card's most recent run log without catching it live — after the run ends, and after a UI restart. The log plumbing shipped with the run registry; what's left is making the last run's record durable. One run is enough: no run history list (see rejected.md).

## What already works

- While an agent runs on a card, the card page tails its log live and refreshes on its own. The board's running badge opens the same tail.
- The live tail shows the agent's steps as they happen — each tool call and message, not just the final answer. When the run ends, the steps fold away behind one "intermediate events" row and the log leads with the final message.
- After the run ends, a "Show last run log" button re-opens its output, read from the saved log file.
- Only the last few KB show in the view; the full log stays in its file.
- Live runs survive a UI restart.

## What's still broken

- Finished runs are remembered only in memory. Restart the UI and the "last run log" button is gone — the log file is still on disk, but nothing points to it.

## The plan

Keep the one "Show last run log" slot; make it durable.

- Save each card's last finished run (action, time, pass/fail, which log) to disk, the same way live runs are already saved, so the button comes back after a UI restart.
- A run that outlived a UI restart ends with no known result. Show it as finished without a pass/fail mark — don't guess.
- If the last run's log file was pruned (the disk keeps only the last 20 logs), drop its record too, so the button never opens onto nothing.
- Older runs get no UI. Their logs stay on disk under the 20-log cap for anyone who digs.
- Keep everything read-only, and keep the board badge opening the live tail.

## Todo

- [x] Show the agent's steps (tool calls, messages) in the live tail as they happen.
- [x] When a run ends, fold the steps away and lead with the final message.
- [ ] Save each card's last finished run to disk, so "Show last run log" survives a UI restart.
- [ ] Show a run that outlived a restart as finished, with no pass/fail mark.
- [ ] Drop the saved record when its log file is pruned, so the button never opens onto nothing.
- [ ] Check the board's running badge still opens the live tail.
- [ ] Update the local UI guide to mention the last-run log.
