# Prune archive, rejected and redesign

These files exist to stop us re-proposing work or re-making a design mistake. Rewrite them
as a list of **topics** — areas of the product — not a list of tasks. Under each topic sit
the plain-language takeaways. Drop code detail (file names, function names, columns,
migrations), dates, task ids, and the step-by-step story — we don't track work at that
level here. Keep only what helps future planning.

## archive.md — what we've shipped

read docs/kanban/archive.md.
- Group finished work by topic (an area of your product). Under each topic, one or two
  plain lines on what the user can now do.
- Summarize the product direction we've moved toward, and the gap that still remains
  between the goal and today.
- Prune details that don't help future planning. Write short, clear, plain.

## rejected.md — what not to propose

read docs/kanban/rejected.md.
- Group turned-down ideas by topic. Under each topic, one line per idea: what not to
  propose and why.
- Keep it short — this file is a guardrail, not a record. Write plain language.
- Only keep ideas we chose **not** to build. If an entry says "already done" or
  "already exists", it's a shipped fact, not a rejection — move it to archive.md or
  just drop it.

## redesign.md — design mistakes not to repeat

read docs/kanban/redesign.md.
- Group entries by topic. Under each topic, one line per entry: the mistake to avoid, then
  the design we actually want.
- Keep it short — this file is a guide, not a record. Write the design to use, not the
  story of what went wrong. Plain language.
- Merge lines that say the same thing. Drop an entry once the design is the obvious
  default — the point is to catch what we'd otherwise get wrong, not to restate the norm.

## memory.md — notes we carry to the next loop

read docs/kanban/memory.md.

memory.md is the notes we carry to the next loop. keep only what still helps us plan.
write short, plain lines.

keep:
- **watermarks** — one line per source with the date last reviewed. keep all.
- **product direction** — durable decisions (what the MVP is, what we won't build,
  risks we accept). one or two lines each.
- **open gaps** — where the goal and the shipped product still differ. keep the task id.
- **don't re-card / don't re-propose** — the short list that stops us re-suggesting
  shipped or rejected work.

prune:
- a gap whose task is now done, rejected, or shipped. drop the line — archive.md and
  rejected.md already hold it.
- old loop notes, dates, and the reasoning behind a decision we already wrote down.
  keep the decision, drop the story.
- file names, function names, columns — unless it's the only way to find the gap.
- lines that say the same thing. merge them.
- "next loop" items that already happened.

rewrite, don't just cut. when a task changes state, move its line out of open gaps
into the don't-re-card list, or delete it if that list already covers it.
