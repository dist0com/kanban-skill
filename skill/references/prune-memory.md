# Prune the memory set

Prune every file in the memory set (see "The memory set" in `SKILL.md`) except
`goal.md` — user-owned, leave it alone. Prune whichever copy you're compressing: the
umbrella at `docs/kanban/` or a module's at `docs/kanban/memory/<module>/`.

One principle for all files: they exist to stop us re-proposing work, re-making a
design mistake, or re-asking a settled question. Rewrite each as **topics** — areas of
the product — with plain-language takeaways under each. Keep only what helps future
planning; drop code detail, dates, task ids, step-by-step stories, and the reasoning
behind settled decisions. Merge lines that say the same thing. Rewrite, don't just cut.

On top of that, per file:

- `rejected.md` — one line per idea: what not to propose and why. "Already done" is a
  shipped fact, not a rejection — it belongs in the published doc (or `readme.md` as a
  holding pen until a doc covers it), not here; drop it from `rejected.md`.
- `redesign.md` — one line per entry: the mistake, then the design to use. Drop an
  entry once that design is the obvious default.
- `readme.md` — keep watermarks (one line per source), open gaps (with task id), the
  last focus so the next loop rotates, and the **holding pen** — shipped user-facing
  behavior no published doc covers yet. Drop a gap whose task is done or rejected
  (`rejected.md` already holds a rejection). **Trim a holding-pen entry only after you
  have confirmed a published doc covers that behavior** — search the docs first. If the
  doc exists, drop the entry (the doc is the record). If no doc exists, keep it:
  `readme.md` is the only record of that behavior until we document it.
- `decisions.md` — one line per live decision: the question's gist, then the answer.
  Drop it once the question no longer arises or `redesign.md` states it as a rule.
