# Add a task

1. Read the board so you don't duplicate an existing card. Read
   `docs/kanban/redesign.md` and follow the design it tells you to use for this area —
   don't repeat a mistake it warns against.
2. Confirm it isn't already done:
   - a code change → search the codebase.
   - a doc / content change → search where that content lives (your reference docs in
     the skill's Configuration).
   - a research task → check where past research is written up.
3. Scaffold the card with the script — it writes the frontmatter, a body template, and the
   README entry:

   ```
   node .claude/skills/kanban/kanban.mjs create --title "..." --track <track> \
        [--priority high|med|low] [--roi high|med|low] [--blocked-by 1,2] [--related 3] \
        [--question "..."]
   ```

   It prints the id and the file path. For a broad task, use a folder instead (see "Broad
   tasks: root + subtasks").
4. Before writing, scan the board for tasks this one depends on or sits next to (see
   "Relationships"). If you didn't set them at create time, set them with
   `update <id> --blocked-by ... --related ...` — never hand-edit the frontmatter.
5. Write the **body** only (see "Card shape") — the summary line, `## Scope`, `## Todo`.
   Replace the template placeholders with Write/Edit. Leave the frontmatter to the script.
6. Fill in the todos (see "Break a task into todos").
7. The README entry and `next-id` are already handled by `create`. If a meta field is
   wrong, fix it with `update <id> --<field> ...`, not by editing the file.

## Card shape

A rough shape, not a strict form. Keep lines short and plain. The YAML frontmatter is
written by `create`/`update` (don't hand-edit it); you write the body — the summary,
scope, and todos. Add any section that helps; drop any that doesn't.

```
---
title: <one line>
track: <one of your tracks>
priority: <high|med|low>
roi: <high|med|low>
blocked_by: [<id>, <id>]   # [] for none
related: [<id>, <id>]      # [] for none
questions: []              # questions a human must decide; [] for none
---

<one short line: what to do and why it matters.>

## Scope
- <the concrete steps>

## Todo
- [ ] <one step you can check off>
- [ ] <…>
```

- **title** lives in the frontmatter — one source of truth, so no `#` H1 in the body.
- **blocked_by / related** are lists of ids (`[]` when none).
- **questions** — questions the board still needs a human to answer. A Review step
  writes them; clear them back to `[]` once answered. Empty for a normal new card.

**Todo** — split the scope into steps you can check off, in the order you'd do them.
Each one is a single line.

**Pushback** — add a `## Pushback` section only if something feels off: too much work
for the value, not worth doing now, or a risk to users. Skip it otherwise.

Add other sections freely when they help — open questions, links, examples, whatever.
This isn't a full plan, just enough to start.

## Don't split off near-duplicates

Before adding a card, check it against the task it builds on. If the new card is mostly
a tweak, reframe, or extra detail on an upstream card that **isn't built yet**, don't
make a new card — update the upstream card instead. A card earns its own id only when
it's genuinely separate work (a different file, system, or deliverable), not a minor
modification layered on top of another open task.

## Document a change

If the card ships something a user can see, it carries todos to update the docs it
touches, so the change isn't hidden after it ships. Follow `references/document-feature.md`.

## Relationships

Tasks connect to each other. Every card lists two kinds of connected tasks, by `#<id>`:

- **Blocked by** — tasks that must finish first. This one can't start, or can't be done
  right, until they're done. A card with an open blocker isn't ready to pick; say what
  blocks it when proposing what's next.
- **Related** — tasks about the same feature, page, or data. They don't block this one,
  but keep them in sync so they don't drift apart or repeat each other.
