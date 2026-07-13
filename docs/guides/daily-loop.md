# The daily loop

Once the board exists, you drive it in plain language. Here's the rhythm.

## Pick what to work on

Ask **"what's next?"**. The skill:

1. Reads the board, `archive.md`, and `rejected.md` so it won't repeat work.
2. Scans a few of your planning sources that changed since the last loop (it tracks a
   watermark per source in `memory.md`).
3. Proposes **three new tasks** from real gaps — not a pick from the existing pile.

You approve, tweak, or drop each. Approved ones become cards.

## Add a task

Say **"add a task: <idea>"**. Before writing, the skill reviews the idea (business value,
feasibility, duplication) and checks `redesign.md` so it doesn't repeat a known design
mistake. Then it:

- allocates an id with `kanban.mjs create`,
- writes a self-contained card in plain language, split into checkable todos,
- adds it to `todo/README.md` under its track.

## Push a card forward

Say **"dive deeper on #4"**. The skill takes one card from vague to concrete — one stage
only, stopping before code-level detail — and writes the result back into the card. If it
hits a question only you can answer, it asks.

## Review the board

Say **"review the board"** (or "review #4"). The skill checks cards for plain language,
split todos, duplication, and whether any are already done or no longer worth it. It
archives finished ones and flags the rest.

## Finish a task

Say **"#4 is done"**. The skill compresses the card to a one-line note in `archive.md`
(what the user can now do, in plain words — no ids or code detail), then runs
`kanban.mjs archive 4` to remove the card and record the metric.

```bash
node .claude/skills/kanban/kanban.mjs archive 4
```

## Reject an idea

Say **"reject #4"** (rare). The skill adds a one-line "why not" to `rejected.md` and runs
`kanban.mjs reject 4`. Future loops won't re-propose it.

## Keep it lean

Over time `memory.md`, `archive.md`, `rejected.md`, and `redesign.md` grow. Ask the skill
to **prune** them — it compresses each to planning-useful summaries grouped by topic, so
scans stay cheap. The board itself stays small because finished work is a note, not a card.

## The commands, for reference

Only `kanban.mjs` allocates ids or touches metrics — never edit `next-id` or `metrics.csv`
by hand.

```bash
node .claude/skills/kanban/kanban.mjs create [--count N]   # allocate ids
node .claude/skills/kanban/kanban.mjs archive <id>         # finish a task
node .claude/skills/kanban/kanban.mjs reject  <id>         # drop an idea
node .claude/skills/kanban/kanban.mjs peek                 # next free id
node .claude/skills/kanban/kanban.mjs metrics              # the daily CSV
node .claude/skills/kanban/kanban.mjs help                 # full usage
```
